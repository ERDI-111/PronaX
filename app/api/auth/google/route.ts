import { NextRequest, NextResponse } from 'next/server';
import { getPublicBaseUrl } from '@/lib/utils/url';
import {
  buildGoogleAuthUrl,
  createPendingFlow,
  getGoogleOAuthConfig,
  isPrefetchRequest,
  loginErrorRedirect,
  sanitizeRedirectPath,
  setPendingFlowCookie,
} from '@/lib/auth/google-oauth';

/**
 * Starts "Sign in with Google": sends the browser to Google's consent screen.
 * Google then returns the visitor to /api/auth/callback/google.
 */
export async function GET(req: NextRequest) {
  const baseUrl = getPublicBaseUrl(req);

  if (isPrefetchRequest(req)) {
    return new NextResponse(null, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }

  const redirectTo = sanitizeRedirectPath(new URL(req.url).searchParams.get('redirectTo'));

  const config = getGoogleOAuthConfig();
  if (!config.ok) {
    console.warn(`[google-auth] Sign-in is unavailable: ${config.problems.join(' ')}`);
    return loginErrorRedirect(baseUrl, config.error, redirectTo);
  }

  const flow = createPendingFlow(baseUrl, redirectTo);
  const response = NextResponse.redirect(buildGoogleAuthUrl(config.clientId, flow));
  setPendingFlowCookie(response, flow);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
