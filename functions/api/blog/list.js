import { json } from '../../_lib/ops-http.js';
import { listPosts, publicPostSummary } from '../../_lib/blog-content.js';

export async function onRequestGet({ request, env }) {
  if (!env.ANALYTICS_DB) return json(503, { error: 'content_not_configured' });
  const url = new URL(request.url);
  const query = (url.searchParams.get('q') || '').slice(0, 120);
  const tag = (url.searchParams.get('tag') || '').slice(0, 60);
  const limit = Number(url.searchParams.get('limit') || 50);
  const offset = Number(url.searchParams.get('offset') || 0);
  const result = await listPosts(env.ANALYTICS_DB, { publishedOnly: true, query, tag, limit, offset });
  return json(200, { ok: true, items: result.items.map(publicPostSummary), total: result.total, limit, offset });
}
