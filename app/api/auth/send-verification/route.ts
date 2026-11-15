import { NextRequest, NextResponse } from 'next/server';
import { AuthVerificationAgent } from '@/lib/ai/agents/auth-verification';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, checkCredentials = true } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Ju lutem shënoni një adresë të vlefshme email-i.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Optional Credential Check against Supabase if password is provided
    if (checkCredentials && password) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(supabaseUrl, supabaseKey);
          const { error: authError } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });

          if (authError) {
            return NextResponse.json(
              { error: 'Email ose fjalëkalimi janë të gabuar. Ju lutem provoni përsëri.' },
              { status: 401 }
            );
          }
        } catch {
          // If Supabase auth fails to connect, proceed with verification code
        }
      }
    }

    const purpose = (body.purpose || 'login') as any;
    const lang = (body.language || 'sq') as 'sq' | 'en';
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

    // 2. Delegate to Agent 9 (Auth & 2FA Verification Agent)
    const otpResult = await AuthVerificationAgent.sendVerificationOtp(normalizedEmail, purpose, lang, {
      ipAddress: clientIp,
      deviceInfo: req.headers.get('user-agent') || undefined,
    });

    if (!otpResult.success) {
      return NextResponse.json(
        {
          error: otpResult.error || otpResult.message,
          waitSeconds: otpResult.waitSeconds,
        },
        { status: otpResult.waitSeconds ? 429 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: otpResult.message,
      cooldownSeconds: 60,
      deliveryResult: otpResult.deliveryResult,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Dështoi dërgimi i kodit të verifikimit.';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
