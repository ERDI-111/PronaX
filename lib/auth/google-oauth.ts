import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import type { GoogleAuthErrorCode } from '@/lib/auth/google-errors';

/**
 * Server-side Google sign-in (OAuth 2.0 authorization code flow with PKCE).
 *
 * Setup: create an OAuth client of type "Web application" in Google Cloud
 * Console, register `<site origin>/api/auth/callback/google` as an authorized
 * redirect URI, and set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.
 */

export const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
export const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
export const GOOGLE_USERINFO_ENDPOINT = 'https://openidconnect.googleapis.com/v1/userinfo';
export const GOOGLE_CALLBACK_PATH = '/api/auth/callback/google';
export const GOOGLE_SCOPES = 'openid email profile';

export const LOGIN_PATH = '/kycu';
export const DEFAULT_AFTER_LOGIN = '/dashboard/pronat';

const FLOW_COOKIE = 'pronax_google_oauth';
const FLOW_COOKIE_PATH = '/api/auth';
const FLOW_MAX_AGE_SECONDS = 10 * 60;
const GOOGLE_REQUEST_TIMEOUT_MS = 10_000;

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export type GoogleOAuthConfig =
  | { ok: true; clientId: string; clientSecret: string }
  | { ok: false; error: 'google_not_configured' | 'google_config_invalid'; problems: string[] };

function cleanEnv(value: string | undefined): string {
  return (value || '').trim().replace(/^['"]|['"]$/g, '').trim();
}

// Template values such as "your-client-id"; written so that a real random secret cannot match by accident
const PLACEHOLDER = /^your[-_ ]|changeme|placeholder|example|x{8,}/i;

export function getGoogleOAuthConfig(): GoogleOAuthConfig {
  const clientId = cleanEnv(process.env.GOOGLE_CLIENT_ID);
  const clientSecret = cleanEnv(process.env.GOOGLE_CLIENT_SECRET);

  const missing: string[] = [];
  if (!clientId || PLACEHOLDER.test(clientId)) missing.push('GOOGLE_CLIENT_ID is not set.');
  if (!clientSecret || PLACEHOLDER.test(clientSecret)) missing.push('GOOGLE_CLIENT_SECRET is not set.');
  if (missing.length > 0) return { ok: false, error: 'google_not_configured', problems: missing };

  if (!clientId.endsWith('.apps.googleusercontent.com')) {
    return {
      ok: false,
      error: 'google_config_invalid',
      problems: ['GOOGLE_CLIENT_ID must be the OAuth client ID ending in .apps.googleusercontent.com.'],
    };
  }

  return { ok: true, clientId, clientSecret };
}

// ---------------------------------------------------------------------------
// Redirect targets
// ---------------------------------------------------------------------------

/** Accepts only same-site page paths, so the flow can never redirect to another website. */
export function sanitizeRedirectPath(value: string | null | undefined, fallback = DEFAULT_AFTER_LOGIN): string {
  if (!value || value.length > 512) return fallback;
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;
  if (/[\u0000-\u001f\u007f]/.test(value)) return fallback;

  try {
    const base = 'http://pronax.internal';
    const parsed = new URL(value, base);
    if (parsed.origin !== base) return fallback;
    const path = parsed.pathname;
    if (path.startsWith('/api/') || path === LOGIN_PATH || path === '/regjistrohu') return fallback;
    return path + parsed.search + parsed.hash;
  } catch {
    return fallback;
  }
}

export function loginErrorRedirect(
  baseUrl: string,
  error: GoogleAuthErrorCode,
  redirectTo?: string
): NextResponse {
  const target = new URL(LOGIN_PATH, baseUrl);
  target.searchParams.set('error', error);
  if (redirectTo && redirectTo !== DEFAULT_AFTER_LOGIN) target.searchParams.set('redirectTo', redirectTo);
  const response = NextResponse.redirect(target.toString());
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

/** Link prefetches must never start a sign-in or touch cookies. */
export function isPrefetchRequest(req: NextRequest): boolean {
  const purpose = `${req.headers.get('purpose') || ''} ${req.headers.get('sec-purpose') || ''}`.toLowerCase();
  return (
    purpose.includes('prefetch') ||
    req.headers.has('next-router-prefetch') ||
    req.headers.has('next-router-segment-prefetch') ||
    req.headers.get('rsc') === '1'
  );
}

// ---------------------------------------------------------------------------
// Pending sign-in (state + PKCE verifier kept in a short-lived httpOnly cookie)
// ---------------------------------------------------------------------------

export interface PendingGoogleFlow {
  state: string;
  verifier: string;
  redirectTo: string;
  redirectUri: string;
}

function randomToken(): string {
  return randomBytes(32).toString('base64url');
}

export function createPendingFlow(baseUrl: string, redirectTo: string): PendingGoogleFlow {
  return {
    state: randomToken(),
    verifier: randomToken(),
    redirectTo,
    redirectUri: `${baseUrl}${GOOGLE_CALLBACK_PATH}`,
  };
}

export function buildGoogleAuthUrl(clientId: string, flow: PendingGoogleFlow): string {
  const url = new URL(GOOGLE_AUTH_ENDPOINT);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', flow.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', GOOGLE_SCOPES);
  url.searchParams.set('state', flow.state);
  url.searchParams.set('code_challenge', createHash('sha256').update(flow.verifier).digest('base64url'));
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('access_type', 'online');
  url.searchParams.set('prompt', 'select_account');
  return url.toString();
}

export function setPendingFlowCookie(response: NextResponse, flow: PendingGoogleFlow): void {
  response.cookies.set(FLOW_COOKIE, Buffer.from(JSON.stringify(flow), 'utf8').toString('base64url'), {
    httpOnly: true,
    secure: flow.redirectUri.startsWith('https://'),
    sameSite: 'lax',
    path: FLOW_COOKIE_PATH,
    maxAge: FLOW_MAX_AGE_SECONDS,
  });
}

export function clearPendingFlowCookie(response: NextResponse): void {
  response.cookies.set(FLOW_COOKIE, '', { httpOnly: true, sameSite: 'lax', path: FLOW_COOKIE_PATH, maxAge: 0 });
}

export function readPendingFlow(req: NextRequest): PendingGoogleFlow | null {
  const raw = req.cookies.get(FLOW_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    if (
      typeof parsed?.state !== 'string' ||
      typeof parsed?.verifier !== 'string' ||
      typeof parsed?.redirectTo !== 'string' ||
      typeof parsed?.redirectUri !== 'string'
    ) {
      return null;
    }
    return {
      state: parsed.state,
      verifier: parsed.verifier,
      redirectTo: sanitizeRedirectPath(parsed.redirectTo),
      redirectUri: parsed.redirectUri,
    };
  } catch {
    return null;
  }
}

export function statesMatch(received: string | null, expected: string): boolean {
  if (!received) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// ---------------------------------------------------------------------------
// Calls to Google
// ---------------------------------------------------------------------------

export class GoogleOAuthError extends Error {
  constructor(
    public readonly code: GoogleAuthErrorCode,
    detail: string
  ) {
    super(detail);
    this.name = 'GoogleOAuthError';
  }
}

interface GoogleResponse {
  status: number;
  ok: boolean;
  data: Record<string, unknown> | null;
}

async function fetchJson(url: string, init: RequestInit): Promise<GoogleResponse> {
  const response = await fetch(url, {
    ...init,
    cache: 'no-store',
    signal: AbortSignal.timeout(GOOGLE_REQUEST_TIMEOUT_MS),
  });
  let data: Record<string, unknown> | null = null;
  try {
    const parsed: unknown = await response.json();
    if (parsed && typeof parsed === 'object') data = parsed as Record<string, unknown>;
  } catch {
    data = null;
  }
  return { status: response.status, ok: response.ok, data };
}

/** Exchanges the authorization code for an access token. */
export async function exchangeCodeForAccessToken(params: {
  code: string;
  clientId: string;
  clientSecret: string;
  flow: PendingGoogleFlow;
}): Promise<string> {
  let result: GoogleResponse;
  try {
    result = await fetchJson(GOOGLE_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: new URLSearchParams({
        code: params.code,
        client_id: params.clientId,
        client_secret: params.clientSecret,
        redirect_uri: params.flow.redirectUri,
        grant_type: 'authorization_code',
        code_verifier: params.flow.verifier,
      }),
    });
  } catch (err) {
    throw new GoogleOAuthError('google_failed', `Token request did not complete: ${String(err)}`);
  }

  const accessToken = result.data?.access_token;
  if (!result.ok || typeof accessToken !== 'string' || !accessToken) {
    const reason = `${result.data?.error || `HTTP ${result.status}`}: ${result.data?.error_description || 'no description'}`;
    const rejected = result.data?.error === 'invalid_client' || result.data?.error === 'unauthorized_client';
    throw new GoogleOAuthError(rejected ? 'google_credentials_rejected' : 'google_failed', `Token exchange failed (${reason})`);
  }
  return accessToken;
}

export interface GoogleProfile {
  email: string;
  emailVerified: boolean;
  name: string;
  picture: string | null;
}

/** Reads the signed-in person's verified email, name and photo from Google. */
export async function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile> {
  let result: GoogleResponse;
  try {
    result = await fetchJson(GOOGLE_USERINFO_ENDPOINT, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
    });
  } catch (err) {
    throw new GoogleOAuthError('google_failed', `Profile request did not complete: ${String(err)}`);
  }

  const data = result.data;
  const rawEmail = data?.email;
  if (!result.ok || !data || typeof rawEmail !== 'string' || !rawEmail.includes('@')) {
    throw new GoogleOAuthError('google_failed', `Profile request failed (HTTP ${result.status})`);
  }

  const email = rawEmail.toLowerCase().trim();
  const verified = data.email_verified ?? data.verified_email;
  const picture = typeof data.picture === 'string' && data.picture.startsWith('https://') ? data.picture : null;
  const name =
    (typeof data.name === 'string' && data.name.trim()) ||
    (typeof data.given_name === 'string' && data.given_name.trim()) ||
    email.split('@')[0];

  return { email, emailVerified: verified === true || verified === 'true', name, picture };
}
