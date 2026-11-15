import { NextRequest, NextResponse } from 'next/server';
import { UserStore } from '@/lib/auth/user-store';
import { getPublicBaseUrl } from '@/lib/utils/url';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const stateRaw = searchParams.get('state');
  const baseUrl = getPublicBaseUrl(req);

  let redirectTo = '/';
  if (stateRaw) {
    try {
      const stateObj = JSON.parse(Buffer.from(stateRaw, 'base64url').toString('utf8'));
      if (stateObj.redirectTo) redirectTo = stateObj.redirectTo;
    } catch {}
  }

  if (!code) {
    const errTarget = new URL('/kycu', baseUrl);
    errTarget.searchParams.set('error', 'Autorizimi me Google u refuzua ose u anulua.');
    return NextResponse.redirect(errTarget.toString());
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    const errTarget = new URL('/kycu', baseUrl);
    errTarget.searchParams.set('error', 'Mungon GOOGLE_CLIENT_ID ose GOOGLE_CLIENT_SECRET në konfigurim.');
    return NextResponse.redirect(errTarget.toString());
  }

  try {
    const redirectUri = `${baseUrl}/api/auth/callback/google`;

    // 1. Exchange auth code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Google token exchange error:', tokenData);
      const errTarget = new URL('/kycu', baseUrl);
      errTarget.searchParams.set('error', 'Dështoi vërtetimi i kodit me Google.');
      return NextResponse.redirect(errTarget.toString());
    }

    // 2. Fetch Google profile
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await userRes.json();

    if (!profile.email) {
      const errTarget = new URL('/kycu', baseUrl);
      errTarget.searchParams.set('error', 'Google nuk ktheu adresë email të vlefshme.');
      return NextResponse.redirect(errTarget.toString());
    }

    // 3. Upsert user in UserStore
    const user = UserStore.upsertOAuthUser({
      email: profile.email,
      fullName: profile.name || profile.given_name || profile.email.split('@')[0],
      avatarUrl: profile.picture,
      provider: 'google',
    });

    // 4. Return HTML bridge that populates localStorage and cookie, then redirects
    const finalDestination = redirectTo.startsWith('/') ? redirectTo : '/';
    const userPayload = JSON.stringify({
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      avatarUrl: profile.picture || null,
      authProvider: 'google',
      verifiedAt: new Date().toISOString(),
    });

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Duke u kyçur me Google...</title>
</head>
<body style="font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #0B192C; color: white;">
  <div style="text-align: center;">
    <div style="width: 48px; height: 48px; border: 4px solid #10B981; border-top-color: transparent; border-radius: 50%; margin: 0 auto 16px; animation: spin 1s linear infinite;"></div>
    <h2>Sukses! Duke ju ridrejtuar në PronaX...</h2>
  </div>
  <style>
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
  <script>
    try {
      localStorage.setItem('pronax_user', JSON.stringify(${userPayload}));
    } catch (e) {
      console.error(e);
    }
    window.location.replace('${finalDestination}');
  </script>
</body>
</html>`;

    const response = new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });

    response.cookies.set('pronax_verified_login', user.email, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (err: any) {
    console.error('Google callback error:', err);
    const errTarget = new URL('/kycu', baseUrl);
    errTarget.searchParams.set('error', err.message || 'Ndodhi një gabim gjatë kyçjes me Google.');
    return NextResponse.redirect(errTarget.toString());
  }
}
