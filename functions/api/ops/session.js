import { hasValidSession } from '../../_lib/ops-auth.js';
import { getAdminAccount } from '../../_lib/ops-admin.js';

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

export async function onRequestGet({ request, env }) {
  if (!env.ANALYTICS_DB) return json(503, { error: 'dashboard_not_configured' });
  const account = await getAdminAccount(env.ANALYTICS_DB);
  if (!account) return json(200, { authenticated: false, setup_required: true });
  const authenticated = await hasValidSession(request, account.session_secret, Number(account.session_version));
  return json(200, {
    authenticated,
    setup_required: false,
    email: authenticated ? account.email : undefined
  });
}
