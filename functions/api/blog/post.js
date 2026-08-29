import { json } from '../../_lib/ops-http.js';
import { getPostBySlug, getAdjacent } from '../../_lib/blog-content.js';

export async function onRequestGet({ request, env }) {
  if (!env.ANALYTICS_DB) return json(503, { error: 'content_not_configured' });
  const url = new URL(request.url);
  const slug = (url.searchParams.get('slug') || '').slice(0, 200);
  if (!slug) return json(400, { error: 'missing_slug' });
  const post = await getPostBySlug(env.ANALYTICS_DB, slug, true);
  if (!post) return json(404, { error: 'not_found' });
  const adjacent = await getAdjacent(env.ANALYTICS_DB, slug, true);
  return json(200, { ok: true, post, adjacent });
}
