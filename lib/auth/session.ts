/**
 * Signed session cookie issued after a successful Google sign-in.
 *
 * The token is `<base64url(JSON payload)>.<base64url(HMAC-SHA256)>`. It uses
 * Web Crypto only, so the same code runs in route handlers and in middleware.
 * The signing key is AUTH_SECRET when set, otherwise it is derived from
 * GOOGLE_CLIENT_SECRET, which is always present when Google sign-in works.
 */

export const SESSION_COOKIE = 'pronax_session';
/** Readable login cookie the rest of the app already relies on. */
export const LOGIN_COOKIE = 'pronax_verified_login';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export interface SessionPayload {
  email: string;
  role: string;
  name?: string;
  provider: 'google';
  iat: number;
  exp: number;
}

function cleanEnv(value: string | undefined): string {
  return (value || '').trim().replace(/^['"]|['"]$/g, '').trim();
}

function getSigningSecret(): string | null {
  const explicit = cleanEnv(process.env.AUTH_SECRET);
  if (explicit) return explicit;
  const googleSecret = cleanEnv(process.env.GOOGLE_CLIENT_SECRET);
  return googleSecret ? `pronax-session:${googleSecret}` : null;
}

/*
 * Bytes are always handed to Web Crypto as Uint8Array views, never as bare
 * ArrayBuffers: middleware runs in a separate JavaScript realm, and there
 * Node's Web Crypto rejects an ArrayBuffer created inside that realm.
 */
function utf8(text: string): Uint8Array<ArrayBuffer> {
  const encoded = new TextEncoder().encode(text);
  const bytes = new Uint8Array(encoded.length);
  bytes.set(encoded);
  return bytes;
}

function toBase64Url(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> {
  const base64 = text.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (text.length % 4)) % 4);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', utf8(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

export async function createSessionToken(user: {
  email: string;
  role: string;
  name?: string;
}): Promise<string | null> {
  const secret = getSigningSecret();
  if (!secret) return null;

  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    email: user.email.toLowerCase().trim(),
    role: user.role,
    name: user.name,
    provider: 'google',
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS,
  };

  const body = toBase64Url(utf8(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign('HMAC', await importKey(secret), utf8(body));
  return `${body}.${toBase64Url(signature)}`;
}

export async function verifySessionToken(token: string | null | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  const secret = getSigningSecret();
  if (!secret) return null;

  const parts = token.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;

  try {
    const valid = await crypto.subtle.verify(
      'HMAC',
      await importKey(secret),
      fromBase64Url(parts[1]),
      utf8(parts[0])
    );
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(parts[0]))) as SessionPayload;
    if (!payload || typeof payload.email !== 'string' || typeof payload.exp !== 'number') return null;
    if (payload.exp * 1000 <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
