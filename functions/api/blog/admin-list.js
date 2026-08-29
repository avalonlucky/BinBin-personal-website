import { hasValidSession } from '../../_lib/ops-auth.js';
import { getAdminAccount } from '../../_lib/ops-admin.js';
import { json } from '../../_lib/ops-http.js';
import { listAllPosts } from '../../_lib/blog-content.js';

export async function onRequestGet({ request, env }) {
  if (!env.ANALYTICS_DB) return json(503, { error: 'dashboard_not_configured' });
  const account = await getAdminAccount(env.ANALYTICS_DB);
  if (!account || !(await hasValidSession(request, account.session_secret, Number(account.session_version)))) {
    return json(401, { error: 'invalid_session' });
  }
  const posts = await listAllPosts(env.ANALYTICS_DB);
  return json(200, { ok: true, posts });
}
