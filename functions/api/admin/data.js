import { hasValidSession } from '../../_lib/ops-auth.js';
import { getAdminAccount } from '../../_lib/ops-admin.js';
import { json } from '../../_lib/ops-http.js';
import { readSiteContent } from '../../_lib/os63-content.js';

export async function onRequestGet({ request, env }) {
  if (!env.ANALYTICS_DB) return json(503, { error: 'dashboard_not_configured' });
  const account = await getAdminAccount(env.ANALYTICS_DB);
  if (!account || !(await hasValidSession(request, account.session_secret, Number(account.session_version)))) {
    return json(401, { error: 'invalid_session' });
  }
  const content = await readSiteContent(env.ANALYTICS_DB);
  return json(200, { ...content.data, _meta: { updated_at: content.updated_at, updated_by: content.updated_by } });
}
