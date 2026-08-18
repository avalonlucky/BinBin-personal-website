export const BLOCK_SECONDS = 10 * 60;
export const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 10 * 60;

export async function getRateLimit(db, ipHash, now) {
  const current = await db.prepare(`
    SELECT attempts, window_start, blocked_until
    FROM ops_login_attempts
    WHERE ip_hash = ?
  `).bind(ipHash).first();
  const retryAfter = current && Number(current.blocked_until) > now
    ? Number(current.blocked_until) - now
    : 0;
  return { current, retryAfter };
}

export async function recordFailure(db, ipHash, current, now) {
  const sameWindow = current && now - Number(current.window_start) < WINDOW_SECONDS;
  const attempts = sameWindow ? Number(current.attempts) + 1 : 1;
  const windowStart = sameWindow ? Number(current.window_start) : now;
  const blockedUntil = attempts >= MAX_ATTEMPTS ? now + BLOCK_SECONDS : 0;
  await db.prepare(`
    INSERT INTO ops_login_attempts (ip_hash, attempts, window_start, blocked_until)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(ip_hash) DO UPDATE SET
      attempts = excluded.attempts,
      window_start = excluded.window_start,
      blocked_until = excluded.blocked_until
  `).bind(ipHash, attempts, windowStart, blockedUntil).run();
  return { attempts, blockedUntil };
}

export async function clearFailures(db, ipHash) {
  await db.prepare('DELETE FROM ops_login_attempts WHERE ip_hash = ?').bind(ipHash).run();
}

export function scheduleFailureCleanup(context, db, now) {
  if (typeof context.waitUntil !== 'function') return;
  context.waitUntil(
    db.prepare('DELETE FROM ops_login_attempts WHERE window_start < ?').bind(now - 86400).run().catch(() => {})
  );
}
