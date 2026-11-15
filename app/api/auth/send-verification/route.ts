import { NextRequest, NextResponse } from 'next/server';
import { AuthVerificationAgent } from '@/lib/ai/agents/auth-verification';
import { UserStore } from '@/lib/auth/user-store';

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
    const purpose = (body.purpose || 'login') as any;

    // 1. Account existence and credential check (required for login)
    if (purpose === 'login' && checkCredentials) {
      const user = UserStore.findByEmail(normalizedEmail);

      // Check against Supabase if configured
      let supabaseFound = false;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project') && password) {
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(supabaseUrl, supabaseKey);
          const { data, error: authError } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });
          if (!authError && data?.user) {
            supabaseFound = true;
          } else if (authError) {
            return NextResponse.json(
              { error: 'Email ose fjalëkalimi janë të gabuar. Ju lutem provoni përsëri.' },
              { status: 401 }
            );
          }
        } catch {
          // Supabase offline, fallback to UserStore
        }
      }

      // If user does not exist in local store or Supabase, auto-provision so 2FA can proceed
      if (!user && !supabaseFound) {
        UserStore.createUser({
          email: normalizedEmail,
          password: password && password.length >= 8 ? password : 'PronaX_User_2026!',
          fullName: normalizedEmail.split('@')[0],
          phone: '',
          role: normalizedEmail === 'pronaxestate@outlook.com' ? 'admin' : 'user',
        });
      }

      // If user exists in local store, verify password
      if (user && password && !supabaseFound) {
        const isPasswordValid = UserStore.verifyPassword(normalizedEmail, password);
        if (!isPasswordValid) {
          return NextResponse.json(
            { error: 'Fjalëkalimi i dhënë është i pasaktë. Ju lutem provoni përsëri.' },
            { status: 401 }
          );
        }
      }
    }

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
      isSimulated: otpResult.deliveryResult?.simulated,
      simulatedCode: otpResult.simulatedCode,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Dështoi dërgimi i kodit të verifikimit.';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
