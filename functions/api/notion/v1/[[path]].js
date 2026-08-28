import { json } from '../../../_lib/ops-http.js';
import { buildNotionResponse, notionDatasetForId, readSiteContent } from '../../../_lib/os63-content.js';

export async function onRequest({ request, env }) {
  if (!env.ANALYTICS_DB) return json(503, { error: 'content_not_configured' });
  const pathname = new URL(request.url).pathname;
  const match = pathname.match(/\/api\/notion\/v1\/databases\/([a-f0-9]{32})(?:\/query)?\/?$/i);
  if (!match) return json(200, { object: 'list', results: [], has_more: false, next_cursor: null });
  const target = notionDatasetForId(match[1]);
  if (!target) return json(200, { object: 'list', results: [], has_more: false, next_cursor: null });
  const content = await readSiteContent(env.ANALYTICS_DB);
  return json(200, buildNotionResponse(target.dataset, content.data));
}
