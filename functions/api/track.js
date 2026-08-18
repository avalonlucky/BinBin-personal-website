const ALLOWED_EVENTS = new Set([
  'page_view',
  'work_open',
  'case_depth_50',
  'case_depth_90',
  'contact_click',
  'email_copy',
  'phone_copy',
  'external_click',
  'ai_prompt_click',
  'web_vital',
  'page_engagement',
  'section_engagement',
  'element_click'
]);

const BOT_PATTERN = /bot|crawler|spider|slurp|headless|lighthouse|pagespeed/i;
const MAX_BATCH_SIZE = 24;
const IP_RETENTION_SECONDS = 30 * 86400;
const EVENT_RETENTION_SECONDS = 365 * 86400;

function cleanText(value, maxLength, fallback = '') {
  if (typeof value !== 'string') return fallback;
  return value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, maxLength) || fallback;
}

function cleanUnitNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= 1 ? number : null;
}

function normalizeIp(value) {
  const candidate = cleanText(value, 45);
  if (!candidate || !/^[0-9a-f:.]+$/i.test(candidate)) return '';
  if (candidate.includes('.')) {
    const parts = candidate.split('.');
    if (parts.length !== 4 || parts.some((part) => !/^\d{1,3}$/.test(part) || Number(part) > 255)) return '';
    return parts.map((part) => String(Number(part))).join('.');
  }
  if (!candidate.includes(':') || candidate.split(':').length < 3) return '';
  return candidate.toLowerCase();
}

function classifyUserAgent(userAgent) {
  const ua = userAgent || '';
  let device = '桌面端';
  if (/ipad|tablet|playbook|silk/i.test(ua)) device = '平板';
  else if (/mobile|iphone|ipod|android/i.test(ua)) device = '移动端';

  let browser = '其他';
  if (/edg\//i.test(ua)) browser = 'Edge';
  else if (/opr\//i.test(ua)) browser = 'Opera';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua) && !/chrome|crios|android/i.test(ua)) browser = 'Safari';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';

  let os = '其他';
  if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/mac os x|macintosh/i.test(ua)) os = 'macOS';
  else if (/windows/i.test(ua)) os = 'Windows';
  else if (/linux/i.test(ua)) os = 'Linux';

  return { device, browser, os };
}

function getExternalReferrer(referrer, requestHost) {
  if (!referrer) return '';
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    return host && host !== requestHost.toLowerCase() ? host.slice(0, 160) : '';
  } catch {
    return '';
  }
}

function response(status = 204, body = null) {
  return new Response(body ? JSON.stringify(body) : null, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

function validateEvent(data, common) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return { error: 'invalid_event_payload' };
  const eventName = cleanText(data.event, 40);
  if (!ALLOWED_EVENTS.has(eventName)) return { error: 'invalid_event' };

  const path = cleanText(data.path, 240, '/');
  if (path.startsWith('/ops')) return { skip: true };

  const sessionId = cleanText(data.session_id, 80);
  const visitorId = cleanText(data.visitor_id, 80);
  if (!sessionId || !visitorId) return { error: 'missing_identity' };

  const metricName = eventName === 'web_vital' ? cleanText(data.metric_name, 12).toUpperCase() : '';
  const rawMetricValue = Number(data.metric_value);
  const metricValue = Number.isFinite(rawMetricValue) && rawMetricValue >= 0 && rawMetricValue < 1_000_000
    ? rawMetricValue
    : null;
  if (eventName === 'web_vital' && !['LCP', 'INP', 'CLS', 'LOAD'].includes(metricName)) {
    return { error: 'invalid_metric' };
  }
  if (['page_engagement', 'section_engagement'].includes(eventName) && metricValue === null) {
    return { error: 'invalid_engagement' };
  }

  return {
    row: {
      occurredAt: common.occurredAt,
      eventName,
      path,
      sessionId,
      visitorId,
      referrerHost: getExternalReferrer(cleanText(data.referrer, 500), common.requestHost),
      country: common.country,
      device: common.device,
      browser: common.browser,
      os: common.os,
      target: cleanText(data.target, 240),
      pageTitle: cleanText(data.page_title, 160),
      sectionName: cleanText(data.section_name, 120),
      positionX: eventName === 'element_click' ? cleanUnitNumber(data.position_x) : null,
      positionY: eventName === 'element_click' ? cleanUnitNumber(data.position_y) : null,
      clientIp: eventName === 'page_view' ? common.clientIp : '',
      metricName: metricName || null,
      metricValue
    }
  };
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.ANALYTICS_DB) return response(503, { error: 'analytics_not_configured' });

  const contentLength = Number(request.headers.get('Content-Length') || 0);
  if (contentLength > 32768) return response(413, { error: 'payload_too_large' });

  const origin = request.headers.get('Origin');
  const requestUrl = new URL(request.url);
  if (origin) {
    try {
      if (new URL(origin).host !== requestUrl.host) return response(403, { error: 'invalid_origin' });
    } catch {
      return response(403, { error: 'invalid_origin' });
    }
  }

  const userAgent = request.headers.get('User-Agent') || '';
  if (BOT_PATTERN.test(userAgent)) return response();

  let input;
  try {
    input = await request.json();
  } catch {
    return response(400, { error: 'invalid_json' });
  }

  const items = Array.isArray(input) ? input : [input];
  if (!items.length || items.length > MAX_BATCH_SIZE) return response(400, { error: 'invalid_batch_size' });

  const { device, browser, os } = classifyUserAgent(userAgent);
  const common = {
    occurredAt: Math.floor(Date.now() / 1000),
    requestHost: requestUrl.hostname,
    country: cleanText(request.cf && request.cf.country, 12, '未知'),
    device,
    browser,
    os,
    clientIp: normalizeIp(request.headers.get('CF-Connecting-IP') || '')
  };

  const rows = [];
  for (const item of items) {
    const result = validateEvent(item, common);
    if (result.error) return response(400, { error: result.error });
    if (!result.skip) rows.push(result.row);
  }
  if (!rows.length) return response();

  const statements = rows.map((row) => env.ANALYTICS_DB.prepare(`
    INSERT INTO analytics_events (
      occurred_at, event_name, path, session_id, visitor_id,
      referrer_host, country, device, browser, os, target,
      page_title, section_name, position_x, position_y, client_ip,
      metric_name, metric_value
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    row.occurredAt,
    row.eventName,
    row.path,
    row.sessionId,
    row.visitorId,
    row.referrerHost,
    row.country,
    row.device,
    row.browser,
    row.os,
    row.target,
    row.pageTitle,
    row.sectionName,
    row.positionX,
    row.positionY,
    row.clientIp || null,
    row.metricName,
    row.metricValue
  ));
  await env.ANALYTICS_DB.batch(statements);

  if (Math.random() < 0.02 && typeof context.waitUntil === 'function') {
    const now = common.occurredAt;
    const cleanup = env.ANALYTICS_DB.batch([
      env.ANALYTICS_DB.prepare('UPDATE analytics_events SET client_ip = NULL WHERE client_ip IS NOT NULL AND occurred_at < ?').bind(now - IP_RETENTION_SECONDS),
      env.ANALYTICS_DB.prepare('DELETE FROM analytics_events WHERE occurred_at < ?').bind(now - EVENT_RETENTION_SECONDS)
    ]).catch(() => {});
    context.waitUntil(cleanup);
  }

  return response();
}

export function onRequestOptions() {
  return response();
}
