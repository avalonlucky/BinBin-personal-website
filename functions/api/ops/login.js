import {
  createSessionToken,
  requestIpHash,
  safePasswordMatches,
  safeTextEqual,
  sessionCookie
} from '../../_lib/ops-auth.js';
import {
  createPasswordRecord,
  getAdminAccount,
  isValidEmail,
  normalizeEmail,
  randomSecret,
  verifyPassword
} from '../../_lib/ops-admin.js';
import { hasTrustedOrigin, json, readSmallJson } from '../../_lib/ops-http.js';
import {
  BLOCK_SECONDS,
  MAX_ATTEMPTS,
  clearFailures,
  getRateLimit,
  recordFailure,
  scheduleFailureCleanup
} from '../../_lib/ops-rate-limit.js';

async function rejectCredentials(db, ipHash, current, now) {
  const failure = await recordFailure(db, ipHash, current, now);
  if (failure.blockedUntil) {
    return json(429, { error: 'too_many_attempts', retry_after: BLOCK_SECONDS }, { 'Retry-After': String(BLOCK_SECONDS) });
  }
  return json(401, { error: 'invalid_credentials', remaining_attempts: MAX_ATTEMPTS - failure.attempts });
}

async function handleLogin(context) {
  const { request, env } = context;
  if (!env.ANALYTICS_DB) return json(503, { error: 'dashboard_not_configured' });
  if (!hasTrustedOrigin(request)) return json(403, { error: 'invalid_origin' });

  const now = Math.floor(Date.now() / 1000);
  const ipHash = await requestIpHash(request);
  const rateLimit = await getRateLimit(env.ANALYTICS_DB, ipHash, now);
  if (rateLimit.retryAfter) {
    return json(429, { error: 'too_many_attempts', retry_after: rateLimit.retryAfter }, { 'Retry-After': String(rateLimit.retryAfter) });
  }

  const input = await readSmallJson(request);
  if (!input || typeof input.email !== 'string' || typeof input.password !== 'string') {
    return json(400, { error: 'invalid_request' });
  }
  const email = normalizeEmail(input.email);
  const password = input.password;
  if (!isValidEmail(email) || !password) {
    return json(400, { error: 'invalid_input' });
  }

  let account = await getAdminAccount(env.ANALYTICS_DB);
  let setupCompleted = false;

  if (account) {
    const [emailMatches, passwordMatches] = await Promise.all([
      Promise.resolve(safeTextEqual(email, normalizeEmail(account.email))),
      verifyPassword(password, account)
    ]);
    if (!emailMatches || !passwordMatches) {
      return rejectCredentials(env.ANALYTICS_DB, ipHash, rateLimit.current, now);
    }
    await env.ANALYTICS_DB.prepare('UPDATE ops_admin_account SET last_login_at = ? WHERE id = 1').bind(now).run();
  } else {
    if (!env.OPS_PASSWORD) return json(503, { error: 'dashboard_not_configured' });
    if (!(await safePasswordMatches(password, env.OPS_PASSWORD))) {
      return rejectCredentials(env.ANALYTICS_DB, ipHash, rateLimit.current, now);
    }

    const passwordRecord = await createPasswordRecord(password);
    const sessionSecret = randomSecret();
    try {
      await env.ANALYTICS_DB.prepare(`
        INSERT INTO ops_admin_account (
          id, email, password_hash, password_salt, password_iterations,
          session_secret, session_version, created_at, updated_at, last_login_at
        ) VALUES (1, ?, ?, ?, ?, ?, 1, ?, ?, ?)
      `).bind(
        email,
        passwordRecord.password_hash,
        passwordRecord.password_salt,
        passwordRecord.password_iterations,
        sessionSecret,
        now,
        now,
        now
      ).run();
    } catch (error) {
      if (await getAdminAccount(env.ANALYTICS_DB)) return json(409, { error: 'setup_already_completed' });
      throw error;
    }
    account = {
      email,
      session_secret: sessionSecret,
      session_version: 1
    };
    setupCompleted = true;
  }

  await clearFailures(env.ANALYTICS_DB, ipHash);
  scheduleFailureCleanup(context, env.ANALYTICS_DB, now);
  const token = await createSessionToken(account.session_secret, Number(account.session_version), now);
  return json(200, {
    ok: true,
    email: account.email,
    setup_completed: setupCompleted,
    expires_in: 12 * 60 * 60
  }, { 'Set-Cookie': sessionCookie(token) });
}

export async function onRequestPost(context) {
  try {
    return await handleLogin(context);
  } catch (error) {
    console.error(JSON.stringify({
      message: 'admin_login_failed',
      error: error instanceof Error ? error.message : String(error),
      path: new URL(context.request.url).pathname
    }));
    return json(500, { error: 'internal_error' });
  }
}
