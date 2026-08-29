import { hasValidSession } from '../../_lib/ops-auth.js';
import { getAdminAccount } from '../../_lib/ops-admin.js';
import { hasTrustedOrigin, json, readSmallJson } from '../../_lib/ops-http.js';
import { upsertPost } from '../../_lib/blog-content.js';

export async function onRequestPost({ request, env }) {
  if (!env.ANALYTICS_DB) return json(503, { error: 'dashboard_not_configured' });
  if (!hasTrustedOrigin(request)) return json(403, { error: 'invalid_origin' });
  const account = await getAdminAccount(env.ANALYTICS_DB);
  if (!account || !(await hasValidSession(request, account.session_secret, Number(account.session_version)))) {
    return json(401, { error: 'invalid_session' });
  }
  const input = await readSmallJson(request, 262144);
  if (!input || typeof input !== 'object' || Array.isArray(input)) return json(400, { error: 'invalid_request' });
  const saved = await upsertPost(env.ANALYTICS_DB, input, account.email);
  return json(200, { ok: true, ...saved });
}
