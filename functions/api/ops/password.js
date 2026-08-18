import {
  createSessionToken,
  hasValidSession,
  requestIpHash,
  sessionCookie
} from '../../_lib/ops-auth.js';
import {
  createPasswordRecord,
  getAdminAccount,
  passwordPolicyError,
  randomSecret,
  verifyPassword
} from '../../_lib/ops-admin.js';
import { hasTrustedOrigin, json, readSmallJson } from '../../_lib/ops-http.js';
import {
  BLOCK_SECONDS,
  MAX_ATTEMPTS,
  clearFailures,
  getRateLimit,
  recordFailure
} from '../../_lib/ops-rate-limit.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.ANALYTICS_DB) return json(503, { error: 'dashboard_not_configured' });
  if (!hasTrustedOrigin(request)) return json(403, { error: 'invalid_origin' });

  const account = await getAdminAccount(env.ANALYTICS_DB);
  if (!account || !(await hasValidSession(request, account.session_secret, Number(account.session_version)))) {
    return json(401, { error: 'invalid_session' });
  }

  const input = await readSmallJson(request);
  if (!input || typeof input.current_password !== 'string' || typeof input.new_password !== 'string') {
    return json(400, { error: 'invalid_request' });
  }
  const policyError = passwordPolicyError(input.new_password);
  if (policyError) return json(400, { error: policyError });
  if (input.current_password === input.new_password) return json(400, { error: 'password_reused' });

  const now = Math.floor(Date.now() / 1000);
  const ipHash = await requestIpHash(request);
  const rateLimit = await getRateLimit(env.ANALYTICS_DB, ipHash, now);
  if (rateLimit.retryAfter) {
    return json(429, { error: 'too_many_attempts', retry_after: rateLimit.retryAfter }, { 'Retry-After': String(rateLimit.retryAfter) });
  }
  if (!(await verifyPassword(input.current_password, account))) {
    const failure = await recordFailure(env.ANALYTICS_DB, ipHash, rateLimit.current, now);
    if (failure.blockedUntil) {
      return json(429, { error: 'too_many_attempts', retry_after: BLOCK_SECONDS }, { 'Retry-After': String(BLOCK_SECONDS) });
    }
    return json(400, { error: 'invalid_current_password', remaining_attempts: MAX_ATTEMPTS - failure.attempts });
  }

  const passwordRecord = await createPasswordRecord(input.new_password);
  const nextSessionVersion = Number(account.session_version) + 1;
  const nextSessionSecret = randomSecret();
  const update = await env.ANALYTICS_DB.prepare(`
    UPDATE ops_admin_account
    SET
      password_hash = ?,
      password_salt = ?,
      password_iterations = ?,
      session_secret = ?,
      session_version = ?,
      updated_at = ?
    WHERE id = 1 AND session_version = ?
  `).bind(
    passwordRecord.password_hash,
    passwordRecord.password_salt,
    passwordRecord.password_iterations,
    nextSessionSecret,
    nextSessionVersion,
    now,
    Number(account.session_version)
  ).run();
  if (!update || !update.meta || Number(update.meta.changes) !== 1) {
    return json(409, { error: 'session_changed' });
  }
  await clearFailures(env.ANALYTICS_DB, ipHash);

  const token = await createSessionToken(nextSessionSecret, nextSessionVersion, now);
  return json(200, {
    ok: true,
    email: account.email,
    expires_in: 12 * 60 * 60
  }, { 'Set-Cookie': sessionCookie(token) });
}
