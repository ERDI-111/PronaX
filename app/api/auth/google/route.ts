import { NextRequest, NextResponse } from 'next/server';
import { getPublicBaseUrl } from '@/lib/utils/url';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const redirectTo = searchParams.get('redirectTo') || '/';
  const baseUrl = getPublicBaseUrl(req);

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    // Redirect cleanly to /kycu on the PUBLIC baseUrl (never localhost:10000!)
    const target = new URL('/kycu', baseUrl);
    target.searchParams.set('google_setup', 'true');
    target.searchParams.set('redirectTo', redirectTo);
    return NextResponse.redirect(target.toString());
  }

  const redirectUri = `${baseUrl}/api/auth/callback/google`;
  const state = Buffer.from(JSON.stringify({ redirectTo, ts: Date.now() })).toString('base64url');

  const googleUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleUrl.searchParams.set('client_id', clientId);
  googleUrl.searchParams.set('redirect_uri', redirectUri);
  googleUrl.searchParams.set('response_type', 'code');
  googleUrl.searchParams.set('scope', 'openid email profile');
  googleUrl.searchParams.set('state', state);
  googleUrl.searchParams.set('access_type', 'online');
  googleUrl.searchParams.set('prompt', 'select_account');

  return NextResponse.redirect(googleUrl.toString());
}
