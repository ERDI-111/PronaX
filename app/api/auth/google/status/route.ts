import { NextRequest, NextResponse } from 'next/server';
import { getPublicBaseUrl } from '@/lib/utils/url';
import { GOOGLE_CALLBACK_PATH, getGoogleOAuthConfig } from '@/lib/auth/google-oauth';

/**
 * Setup check for Google sign-in. Shows whether the credentials are present and
 * the exact values to enter in Google Cloud Console. It never returns secrets.
 */
export async function GET(req: NextRequest) {
  const baseUrl = getPublicBaseUrl(req);
  const config = getGoogleOAuthConfig();

  return NextResponse.json(
    {
      configured: config.ok,
      problems: config.ok ? [] : config.problems,
      authorizedRedirectUri: `${baseUrl}${GOOGLE_CALLBACK_PATH}`,
      authorizedJavaScriptOrigin: baseUrl,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
