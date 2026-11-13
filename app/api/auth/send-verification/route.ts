import { NextRequest, NextResponse } from 'next/server';
import { VerificationService } from '@/lib/auth/verification';
import { EmailService } from '@/lib/email/service';
import { EmailTemplateRenderer } from '@/lib/email/templates';

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

    // 2. Generate 6-digit code with 5-minute expiry & rate limit
    const codeResult = await VerificationService.createCode(normalizedEmail);

    if (!codeResult.success) {
      return NextResponse.json(
        {
          error: codeResult.error,
          waitSeconds: codeResult.waitSeconds,
        },
        { status: 429 }
      );
    }

    const code = codeResult.code!;

    // 3. Render and send verification email
    const template = EmailTemplateRenderer.render('email_verification', {
      code,
      email: normalizedEmail,
    });

    const sendResult = await EmailService.sendEmail({
      to: normalizedEmail,
      subject: template.subject,
      html: template.html,
      templateType: 'email_verification',
      metadata: { purpose: 'login_verification' },
    });

    return NextResponse.json({
      success: true,
      message: 'Kodi 6-shifror i verifikimit u dërgua me sukses në email-in tuaj.',
      cooldownSeconds: 60,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Dështoi dërgimi i kodit të verifikimit.';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
