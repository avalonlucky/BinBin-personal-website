const COOKIE_NAME = '__Host-maridian_ops_session';
const SESSION_SECONDS = 12 * 60 * 60;

function encodeBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function hmac(secret, value) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return encodeBase64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value))));
}

export async function safeTextEqual(left, right) {
  const encoder = new TextEncoder();
  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(String(left || ''))),
    crypto.subtle.digest('SHA-256', encoder.encode(String(right || '')))
  ]);
  if (typeof crypto.subtle.timingSafeEqual === 'function') {
    return crypto.subtle.timingSafeEqual(leftHash, rightHash);
  }
  const a = new Uint8Array(leftHash);
  const b = new Uint8Array(rightHash);
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) mismatch |= a[index] ^ b[index];
  return mismatch === 0;
}

export async function safePasswordMatches(candidate, expected) {
  if (!candidate || !expected) return false;
  const [left, right] = await Promise.all([hmac(expected, candidate), hmac(expected, expected)]);
  return safeTextEqual(left, right);
}

function readCookie(request, name) {
  const cookie = request.headers.get('Cookie') || '';
  for (const part of cookie.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() === name) return part.slice(separator + 1).trim();
  }
  return '';
}

export async function createSessionToken(secret, sessionVersion, now = Math.floor(Date.now() / 1000)) {
  const expiresAt = now + SESSION_SECONDS;
  const payload = `${expiresAt}.${Number(sessionVersion)}`;
  return `${payload}.${await hmac(secret, payload)}`;
}

export async function hasValidSession(request, secret, expectedVersion) {
  if (!secret || !Number.isInteger(Number(expectedVersion))) return false;
  const token = readCookie(request, COOKIE_NAME);
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const expiresAt = parts[0];
  const sessionVersion = parts[1];
  const payload = `${expiresAt}.${sessionVersion}`;
  const signature = parts[2];
  if (!/^\d{10}$/.test(expiresAt) || !/^\d+$/.test(sessionVersion)) return false;
  if (Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false;
  if (Number(sessionVersion) !== Number(expectedVersion)) return false;
  return safeTextEqual(signature, await hmac(secret, payload));
}

export function sessionCookie(token) {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export async function requestIpHash(request) {
  const ip = (request.headers.get('CF-Connecting-IP') || 'unknown').slice(0, 64);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
