import { safeTextEqual } from './ops-auth.js';

// Cloudflare Workers currently supports PBKDF2 iteration counts up to 100,000.
const PASSWORD_ITERATIONS = 100000;

function encodeBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeBase64Url(value) {
  const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export function randomSecret(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return encodeBase64Url(bytes);
}

export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export function isValidEmail(value) {
  const email = normalizeEmail(value);
  return email.length >= 5 && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function passwordPolicyError(password) {
  const value = String(password || '');
  if (!value) return 'password_required';
  return '';
}

async function derivePasswordHash(password, salt, iterations) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(String(password || '')),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: decodeBase64Url(salt),
      iterations: Number(iterations)
    },
    key,
    256
  );
  return encodeBase64Url(new Uint8Array(bits));
}

export async function createPasswordRecord(password) {
  const salt = randomSecret(16);
  return {
    password_hash: await derivePasswordHash(password, salt, PASSWORD_ITERATIONS),
    password_salt: salt,
    password_iterations: PASSWORD_ITERATIONS
  };
}

export async function verifyPassword(password, account) {
  if (!account || !account.password_hash || !account.password_salt) return false;
  const iterations = Number(account.password_iterations);
  if (!Number.isInteger(iterations) || iterations < 100000 || iterations > 100000) return false;
  try {
    const candidate = await derivePasswordHash(password, account.password_salt, iterations);
    return safeTextEqual(candidate, account.password_hash);
  } catch {
    return false;
  }
}

export async function getAdminAccount(db) {
  return db.prepare(`
    SELECT
      id,
      email,
      password_hash,
      password_salt,
      password_iterations,
      session_secret,
      session_version,
      created_at,
      updated_at,
      last_login_at
    FROM ops_admin_account
    WHERE id = 1
  `).first();
}
