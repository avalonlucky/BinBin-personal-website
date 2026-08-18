import { hasValidSession } from '../../_lib/ops-auth.js';
import { getAdminAccount } from '../../_lib/ops-admin.js';

const RANGE_DAYS = new Set([1, 7, 30]);

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=utf-8',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeSummary(row) {
  const pageViews = toNumber(row && row.page_views);
  const visits = toNumber(row && row.visits);
  const visitors = toNumber(row && row.visitors);
  const conversions = toNumber(row && row.conversions);
  const workVisits = toNumber(row && row.work_visits);
  return {
    visitors,
    visits,
    page_views: pageViews,
    conversions,
    work_visits: workVisits,
    pages_per_visit: visits ? pageViews / visits : 0,
    conversion_rate: visits ? conversions / visits : 0,
    latest_event: toNumber(row && row.latest_event)
  };
}

function percentile75(values) {
  if (!values.length) return null;
  const sorted = values.slice().sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil(sorted.length * 0.75) - 1)];
}

function buildVitals(rows) {
  const groups = { LCP: [], INP: [], CLS: [], LOAD: [] };
  for (const row of rows) {
    const metric = row.metric_name;
    const value = Number(row.metric_value);
    if (groups[metric] && Number.isFinite(value)) groups[metric].push(value);
  }
  return Object.fromEntries(Object.entries(groups).map(([metric, values]) => [metric, {
    value: percentile75(values),
    samples: values.length
  }]));
}

async function getSummary(db, start, end) {
  const row = await db.prepare(`
    SELECT
      SUM(CASE WHEN event_name = 'page_view' THEN 1 ELSE 0 END) AS page_views,
      COUNT(DISTINCT CASE WHEN event_name = 'page_view' THEN session_id END) AS visits,
      COUNT(DISTINCT CASE WHEN event_name = 'page_view' THEN visitor_id END) AS visitors,
      COUNT(DISTINCT CASE WHEN event_name IN ('contact_click', 'email_copy', 'phone_copy') THEN session_id END) AS conversions,
      COUNT(DISTINCT CASE WHEN event_name = 'work_open' OR (event_name = 'page_view' AND path LIKE '/work/%') THEN session_id END) AS work_visits,
      MAX(occurred_at) AS latest_event
    FROM analytics_events
    WHERE occurred_at >= ? AND occurred_at < ?
  `).bind(start, end).first();
  return normalizeSummary(row || {});
}

function resultRows(result) {
  return result && Array.isArray(result.results) ? result.results : [];
}

export async function onRequestGet({ request, env }) {
  if (!env.ANALYTICS_DB) return json(503, { error: 'dashboard_not_configured' });

  const account = await getAdminAccount(env.ANALYTICS_DB);
  if (!account || !(await hasValidSession(request, account.session_secret, Number(account.session_version)))) {
    return json(401, { error: 'invalid_session' });
  }

  const url = new URL(request.url);
  const requestedRange = Number(url.searchParams.get('range') || 7);
  const range = RANGE_DAYS.has(requestedRange) ? requestedRange : 7;
  const now = Math.floor(Date.now() / 1000);
  const seconds = range * 86400;
  const start = now - seconds;
  const previousStart = start - seconds;
  const bucketExpression = range === 1
    ? "strftime('%H:00', occurred_at, 'unixepoch', '+8 hours')"
    : "strftime('%m-%d', occurred_at, 'unixepoch', '+8 hours')";

  const [
    summary,
    previous,
    seriesResult,
    pagesResult,
    sourcesResult,
    countriesResult,
    devicesResult,
    eventsResult,
    vitalsResult,
    totalRows,
    behaviorSummary,
    worksResult,
    sectionsResult,
    clickTargetsResult,
    clickPointsResult,
    visitorsResult,
    ipsResult
  ] = await Promise.all([
    getSummary(env.ANALYTICS_DB, start, now),
    getSummary(env.ANALYTICS_DB, previousStart, start),
    env.ANALYTICS_DB.prepare(`
      SELECT ${bucketExpression} AS bucket, COUNT(*) AS value
      FROM analytics_events
      WHERE event_name = 'page_view' AND occurred_at >= ? AND occurred_at < ?
      GROUP BY bucket ORDER BY MIN(occurred_at) ASC
    `).bind(start, now).all(),
    env.ANALYTICS_DB.prepare(`
      SELECT path AS name, COUNT(*) AS value, COUNT(DISTINCT session_id) AS visits
      FROM analytics_events
      WHERE event_name = 'page_view' AND occurred_at >= ? AND occurred_at < ?
      GROUP BY path ORDER BY value DESC LIMIT 8
    `).bind(start, now).all(),
    env.ANALYTICS_DB.prepare(`
      SELECT COALESCE(NULLIF(referrer_host, ''), 'direct') AS name, COUNT(*) AS value
      FROM analytics_events
      WHERE event_name = 'page_view' AND occurred_at >= ? AND occurred_at < ?
      GROUP BY name ORDER BY value DESC LIMIT 8
    `).bind(start, now).all(),
    env.ANALYTICS_DB.prepare(`
      SELECT country AS name, COUNT(DISTINCT session_id) AS value
      FROM analytics_events
      WHERE event_name = 'page_view' AND occurred_at >= ? AND occurred_at < ?
      GROUP BY country ORDER BY value DESC LIMIT 8
    `).bind(start, now).all(),
    env.ANALYTICS_DB.prepare(`
      SELECT device AS name, COUNT(DISTINCT session_id) AS value
      FROM analytics_events
      WHERE event_name = 'page_view' AND occurred_at >= ? AND occurred_at < ?
      GROUP BY device ORDER BY value DESC
    `).bind(start, now).all(),
    env.ANALYTICS_DB.prepare(`
      SELECT event_name AS name, COUNT(*) AS value
      FROM analytics_events
      WHERE event_name IN ('work_open', 'case_depth_50', 'case_depth_90', 'contact_click', 'email_copy', 'phone_copy', 'external_click', 'ai_prompt_click', 'element_click')
        AND occurred_at >= ? AND occurred_at < ?
      GROUP BY event_name ORDER BY value DESC
    `).bind(start, now).all(),
    env.ANALYTICS_DB.prepare(`
      SELECT metric_name, metric_value
      FROM analytics_events
      WHERE event_name = 'web_vital' AND occurred_at >= ? AND occurred_at < ?
      ORDER BY occurred_at DESC LIMIT 2000
    `).bind(start, now).all(),
    env.ANALYTICS_DB.prepare('SELECT COUNT(*) AS value FROM analytics_events').first(),
    env.ANALYTICS_DB.prepare(`
      WITH session_behavior AS (
        SELECT
          session_id,
          visitor_id,
          SUM(CASE WHEN event_name = 'page_engagement' AND path LIKE '/work/%' THEN metric_value ELSE 0 END) AS work_ms,
          SUM(CASE WHEN event_name = 'element_click' THEN 1 ELSE 0 END) AS clicks,
          MAX(CASE WHEN event_name IN ('contact_click', 'email_copy', 'phone_copy') THEN 1 ELSE 0 END) AS contacted
        FROM analytics_events
        WHERE occurred_at >= ? AND occurred_at < ?
        GROUP BY session_id, visitor_id
      )
      SELECT
        SUM(work_ms) / 1000.0 AS total_work_seconds,
        COUNT(DISTINCT CASE WHEN work_ms > 0 THEN session_id END) AS engaged_work_sessions,
        COUNT(DISTINCT CASE WHEN work_ms >= 60000 OR clicks >= 3 OR contacted = 1 THEN visitor_id END) AS deep_visitors,
        SUM(clicks) AS clicks
      FROM session_behavior
    `).bind(start, now).first(),
    env.ANALYTICS_DB.prepare(`
      SELECT
        path,
        COUNT(DISTINCT visitor_id) AS visitors,
        COUNT(DISTINCT session_id) AS sessions,
        SUM(metric_value) / 1000.0 AS total_seconds,
        SUM(metric_value) / 1000.0 / COUNT(DISTINCT session_id) AS avg_seconds
      FROM analytics_events
      WHERE event_name = 'page_engagement' AND path LIKE '/work/%' AND occurred_at >= ? AND occurred_at < ?
      GROUP BY path ORDER BY avg_seconds DESC
    `).bind(start, now).all(),
    env.ANALYTICS_DB.prepare(`
      SELECT
        path,
        section_name AS section,
        COUNT(DISTINCT visitor_id) AS visitors,
        COUNT(DISTINCT session_id) AS sessions,
        SUM(metric_value) / 1000.0 AS total_seconds,
        SUM(metric_value) / 1000.0 / COUNT(DISTINCT session_id) AS avg_seconds
      FROM analytics_events
      WHERE event_name = 'section_engagement' AND section_name IS NOT NULL AND section_name != ''
        AND occurred_at >= ? AND occurred_at < ?
      GROUP BY path, section_name ORDER BY path, avg_seconds DESC
    `).bind(start, now).all(),
    env.ANALYTICS_DB.prepare(`
      SELECT
        path,
        COALESCE(NULLIF(section_name, ''), '未归类') AS section,
        COALESCE(NULLIF(target, ''), '未命名点击') AS target,
        COUNT(*) AS clicks,
        COUNT(DISTINCT visitor_id) AS visitors
      FROM analytics_events
      WHERE event_name = 'element_click' AND occurred_at >= ? AND occurred_at < ?
      GROUP BY path, section, target ORDER BY clicks DESC LIMIT 80
    `).bind(start, now).all(),
    env.ANALYTICS_DB.prepare(`
      SELECT
        path,
        CAST(position_x * 20 AS INTEGER) / 20.0 AS x,
        CAST(position_y * 40 AS INTEGER) / 40.0 AS y,
        COUNT(*) AS clicks
      FROM analytics_events
      WHERE event_name = 'element_click' AND position_x IS NOT NULL AND position_y IS NOT NULL
        AND occurred_at >= ? AND occurred_at < ?
      GROUP BY path, x, y ORDER BY clicks DESC LIMIT 500
    `).bind(start, now).all(),
    env.ANALYTICS_DB.prepare(`
      SELECT
        visitor_id,
        path AS work_path,
        MAX(occurred_at) AS last_seen,
        COUNT(DISTINCT CASE WHEN event_name = 'page_view' THEN session_id END) AS visits,
        SUM(CASE WHEN event_name = 'page_engagement' THEN metric_value ELSE 0 END) / 1000.0 AS work_seconds,
        SUM(CASE WHEN event_name = 'element_click' THEN 1 ELSE 0 END) AS clicks,
        SUM(CASE WHEN event_name IN ('contact_click', 'email_copy', 'phone_copy') THEN 1 ELSE 0 END) AS contacts,
        MAX(device) AS device,
        MAX(country) AS country
      FROM analytics_events
      WHERE path LIKE '/work/%' AND occurred_at >= ? AND occurred_at < ?
      GROUP BY visitor_id, path
      HAVING work_seconds > 0 OR clicks > 0 OR contacts > 0
      ORDER BY work_seconds DESC, contacts DESC, clicks DESC LIMIT 40
    `).bind(start, now).all(),
    env.ANALYTICS_DB.prepare(`
      WITH ip_map AS (
        SELECT session_id, MAX(client_ip) AS ip
        FROM analytics_events
        WHERE event_name = 'page_view' AND client_ip IS NOT NULL AND client_ip != ''
          AND occurred_at >= ? AND occurred_at < ?
        GROUP BY session_id
      )
      SELECT
        ip_map.ip,
        COUNT(DISTINCT CASE WHEN events.event_name = 'page_view' THEN events.session_id END) AS visits,
        SUM(CASE WHEN events.event_name = 'page_view' THEN 1 ELSE 0 END) AS page_views,
        COUNT(DISTINCT events.visitor_id) AS visitors,
        SUM(CASE WHEN events.event_name = 'page_engagement' AND events.path LIKE '/work/%' THEN events.metric_value ELSE 0 END) / 1000.0 AS work_seconds,
        SUM(CASE WHEN events.event_name = 'element_click' THEN 1 ELSE 0 END) AS clicks,
        MAX(events.occurred_at) AS last_seen,
        MAX(events.country) AS country,
        GROUP_CONCAT(DISTINCT CASE WHEN events.path LIKE '/work/%' THEN events.path END) AS works
      FROM analytics_events AS events
      JOIN ip_map ON ip_map.session_id = events.session_id
      WHERE events.occurred_at >= ? AND events.occurred_at < ?
      GROUP BY ip_map.ip
      ORDER BY visits DESC, last_seen DESC LIMIT 50
    `).bind(start, now, start, now).all()
  ]);

  const behaviorRow = behaviorSummary || {};
  const totalWorkSeconds = toNumber(behaviorRow.total_work_seconds);
  const engagedWorkSessions = toNumber(behaviorRow.engaged_work_sessions);

  return json(200, {
    range,
    generated_at: now,
    summary,
    previous,
    series: resultRows(seriesResult).map((row) => ({ label: row.bucket, value: toNumber(row.value) })),
    pages: resultRows(pagesResult).map((row) => ({ name: row.name, value: toNumber(row.value), visits: toNumber(row.visits) })),
    sources: resultRows(sourcesResult).map((row) => ({ name: row.name, value: toNumber(row.value) })),
    countries: resultRows(countriesResult).map((row) => ({ name: row.name, value: toNumber(row.value) })),
    devices: resultRows(devicesResult).map((row) => ({ name: row.name, value: toNumber(row.value) })),
    events: resultRows(eventsResult).map((row) => ({ name: row.name, value: toNumber(row.value) })),
    vitals: buildVitals(resultRows(vitalsResult)),
    behavior: {
      summary: {
        total_work_seconds: totalWorkSeconds,
        engaged_work_sessions: engagedWorkSessions,
        avg_work_seconds: engagedWorkSessions ? totalWorkSeconds / engagedWorkSessions : 0,
        deep_visitors: toNumber(behaviorRow.deep_visitors),
        clicks: toNumber(behaviorRow.clicks)
      },
      works: resultRows(worksResult).map((row) => ({
        path: row.path,
        visitors: toNumber(row.visitors),
        sessions: toNumber(row.sessions),
        total_seconds: toNumber(row.total_seconds),
        avg_seconds: toNumber(row.avg_seconds)
      })),
      sections: resultRows(sectionsResult).map((row) => ({
        path: row.path,
        section: row.section,
        visitors: toNumber(row.visitors),
        sessions: toNumber(row.sessions),
        total_seconds: toNumber(row.total_seconds),
        avg_seconds: toNumber(row.avg_seconds)
      })),
      click_targets: resultRows(clickTargetsResult).map((row) => ({
        path: row.path,
        section: row.section,
        target: row.target,
        clicks: toNumber(row.clicks),
        visitors: toNumber(row.visitors)
      })),
      click_points: resultRows(clickPointsResult).map((row) => ({
        path: row.path,
        x: toNumber(row.x),
        y: toNumber(row.y),
        clicks: toNumber(row.clicks)
      })),
      visitors: resultRows(visitorsResult).map((row) => ({
        visitor_id: row.visitor_id,
        work_path: row.work_path,
        last_seen: toNumber(row.last_seen),
        visits: toNumber(row.visits),
        work_seconds: toNumber(row.work_seconds),
        clicks: toNumber(row.clicks),
        contacts: toNumber(row.contacts),
        device: row.device,
        country: row.country
      })),
      ips: resultRows(ipsResult).map((row) => ({
        ip: row.ip,
        visits: toNumber(row.visits),
        page_views: toNumber(row.page_views),
        visitors: toNumber(row.visitors),
        work_seconds: toNumber(row.work_seconds),
        clicks: toNumber(row.clicks),
        last_seen: toNumber(row.last_seen),
        country: row.country,
        works: row.works || ''
      }))
    },
    system: {
      database: 'online',
      collection: summary.latest_event ? 'active' : 'waiting',
      total_records: toNumber(totalRows && totalRows.value),
      ip_retention_days: 30,
      event_retention_days: 365
    }
  });
}
