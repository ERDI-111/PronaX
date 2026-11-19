import { NextRequest, NextResponse } from 'next/server';
import { UserStore } from '@/lib/auth/user-store';
import { getPublicBaseUrl } from '@/lib/utils/url';
import type { GoogleAuthErrorCode } from '@/lib/auth/google-errors';
import {
  DEFAULT_AFTER_LOGIN,
  GoogleOAuthError,
  clearPendingFlowCookie,
  exchangeCodeForAccessToken,
  fetchGoogleProfile,
  getGoogleOAuthConfig,
  loginErrorRedirect,
  readPendingFlow,
  statesMatch,
} from '@/lib/auth/google-oauth';
import {
  LOGIN_COOKIE,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
} from '@/lib/auth/session';

/** JSON that is safe to place inside an inline <script> block. */
function scriptJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * The rest of the app reads the signed-in person from localStorage, so the
 * callback answers with a tiny page that stores it and moves on.
 */
function renderBridgePage(userPayload: Record<string, unknown>, destination: string): string {
  return `<!DOCTYPE html>
<html lang="sq">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <meta name="referrer" content="no-referrer" />
  <title>Duke u kyçur me Google...</title>
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #0B192C; color: #ffffff; text-align: center; padding: 24px; box-sizing: border-box; }
    .spinner { width: 48px; height: 48px; border: 4px solid #10B981; border-top-color: transparent; border-radius: 50%; margin: 0 auto 16px; animation: spin 1s linear infinite; }
    h1 { font-size: 20px; margin: 0 0 12px; }
    a { color: #34D399; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div>
    <div class="spinner"></div>
    <h1>Kyçja me Google u krye. Duke ju ridrejtuar në PronaX...</h1>
    <p><a href="${escapeHtml(destination)}">Vazhdo në PronaX</a></p>
  </div>
  <script>
    (function () {
      try {
        localStorage.setItem('pronax_user', JSON.stringify(${scriptJson(userPayload)}));
      } catch (e) {}
      window.location.replace(${scriptJson(destination)});
    })();
  </script>
</body>
</html>`;
}

/** Google sends the visitor back here after the consent screen. */
export async function GET(req: NextRequest) {
  const baseUrl = getPublicBaseUrl(req);
  const { searchParams } = new URL(req.url);
  const flow = readPendingFlow(req);
  const redirectTo = flow?.redirectTo ?? DEFAULT_AFTER_LOGIN;

  const fail = (code: GoogleAuthErrorCode, detail: string) => {
    console.warn(`[google-auth] Sign-in stopped (${code}): ${detail}`);
    const response = loginErrorRedirect(baseUrl, code, redirectTo);
    clearPendingFlowCookie(response);
    return response;
  };

  const googleError = searchParams.get('error');
  if (googleError) {
    const cancelled = googleError === 'access_denied';
    return fail(cancelled ? 'google_cancelled' : 'google_failed', `Google returned "${googleError.slice(0, 80)}"`);
  }

  if (!flow) {
    return fail('google_session_expired', 'the sign-in cookie is missing or expired');
  }
  if (!statesMatch(searchParams.get('state'), flow.state)) {
    return fail('google_session_expired', 'the state value does not match');
  }

  const code = searchParams.get('code');
  if (!code) {
    return fail('google_failed', 'Google did not return an authorization code');
  }

  const config = getGoogleOAuthConfig();
  if (!config.ok) {
    return fail(config.error, config.problems.join(' '));
  }

  try {
    const accessToken = await exchangeCodeForAccessToken({
      code,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      flow,
    });
    const profile = await fetchGoogleProfile(accessToken);

    if (!profile.emailVerified) {
      return fail('google_email_unverified', 'the Google account email is not verified');
    }

    // Creates the PronaX account on first sign-in, otherwise reuses the existing one.
    const user = UserStore.upsertOAuthUser({
      email: profile.email,
      fullName: profile.name,
      avatarUrl: profile.picture ?? undefined,
      provider: 'google',
    });

    const destination =
      user.role === 'admin' && redirectTo === DEFAULT_AFTER_LOGIN ? '/admin/dashboard' : redirectTo;

    const html = renderBridgePage(
      {
        email: user.email,
        fullName: user.fullName || profile.name,
        role: user.role,
        avatarUrl: profile.picture,
        authProvider: 'google',
        verifiedAt: new Date().toISOString(),
      },
      destination
    );

    const response = new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    });

    const secure = baseUrl.startsWith('https://');

    response.cookies.set(LOGIN_COOKIE, user.email, {
      httpOnly: false, // read by the header and the publish page
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    const sessionToken = await createSessionToken({
      email: user.email,
      role: user.role,
      name: user.fullName,
    });
    if (sessionToken) {
      response.cookies.set(SESSION_COOKIE, sessionToken, {
        httpOnly: true,
        secure,
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_MAX_AGE_SECONDS,
      });
    }

    clearPendingFlowCookie(response);
    return response;
  } catch (err) {
    if (err instanceof GoogleOAuthError) {
      return fail(err.code, err.message);
    }
    return fail('google_failed', err instanceof Error ? err.message : String(err));
  }
}
