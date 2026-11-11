import { NextRequest, NextResponse } from 'next/server';
import { VerificationService } from '@/lib/auth/verification';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code, password } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Ju lutem shënoni një adresë të vlefshme email-i.' },
        { status: 400 }
      );
    }

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Ju lutem shënoni kodin 6-shifror të verifikimit.' },
        { status: 400 }
      );
    }

    const cleanCode = code.replace(/\D/g, '').trim();

    if (cleanCode.length !== 6) {
      return NextResponse.json(
        { error: 'Kodi duhet të përmbajë saktësisht 6 shifra numerike.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Verify code against stored hash, expiry, and attempt limits
    const result = await VerificationService.verifyCode(normalizedEmail, cleanCode);

    if (!result.success) {
      const statusCode = result.expired ? 410 : 400;
      return NextResponse.json(
        {
          error: result.error,
          remainingAttempts: result.remainingAttempts,
          expired: result.expired,
        },
        { status: statusCode }
      );
    }

    // 2. Code is valid! Attempt Supabase session completion if credentials provided
    let supabaseSession = null;
    if (password) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(supabaseUrl, supabaseKey);
          const { data } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });
          supabaseSession = data?.session || null;
        } catch {
          // Fall through to success
        }
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Verifikimi u krye me sukses! Po ridrejtoheni...',
      email: normalizedEmail,
      sessionCreated: !!supabaseSession,
    });

    // Set a lightweight verification cookie to confirm 2FA completed
    response.cookies.set('pronax_verified_login', normalizedEmail, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Dështoi verifikimi i kodit.';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
