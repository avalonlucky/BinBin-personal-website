import { clearSessionCookie } from '../../_lib/ops-auth.js';
import { hasTrustedOrigin, json } from '../../_lib/ops-http.js';

export function onRequestPost({ request }) {
  if (!hasTrustedOrigin(request)) return json(403, { error: 'invalid_origin' });
  return json(200, { ok: true }, { 'Set-Cookie': clearSessionCookie() });
}
