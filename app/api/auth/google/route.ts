import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const redirectTo = searchParams.get('redirectTo') || '/';

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(
      new URL(
        `/kycu?error=${encodeURIComponent(
          'Google OAuth kërkon GOOGLE_CLIENT_ID te Variablat e Mjedisit në Render. Ndiqni udhëzuesin te Paneli Admin.'
        )}`,
        req.url
      )
    );
  }

  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/callback/google`;
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
