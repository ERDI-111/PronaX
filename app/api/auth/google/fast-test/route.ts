import { NextRequest, NextResponse } from 'next/server';
import { UserStore } from '@/lib/auth/user-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || '').toLowerCase().trim();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Adresë email e pavlefshme.' }, { status: 400 });
    }

    const user = UserStore.upsertOAuthUser({
      email,
      fullName: body.fullName || email.split('@')[0],
      provider: 'google',
    });

    const userPayload = {
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      authProvider: 'google',
      verifiedAt: new Date().toISOString(),
    };

    const response = NextResponse.json({
      success: true,
      user: userPayload,
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
    return NextResponse.json({ error: err.message || 'Dështoi kyçja.' }, { status: 500 });
  }
}
