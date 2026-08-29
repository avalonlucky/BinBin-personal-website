import { json } from '../../_lib/ops-http.js';
import { listMeta } from '../../_lib/blog-content.js';

export async function onRequestGet({ request, env }) {
  if (!env.ANALYTICS_DB) return json(503, { error: 'content_not_configured' });
  return json(200, { ok: true, ...(await listMeta(env.ANALYTICS_DB)) });
}
