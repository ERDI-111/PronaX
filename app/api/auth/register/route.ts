import { NextRequest, NextResponse } from 'next/server';
import { UserStore } from '@/lib/auth/user-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      emri,
      mbiemri,
      email,
      telefoni,
      password,
      role = 'user',
      emriAgjencise,
      licencaArbk,
      komuna,
    } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Ju lutem shënoni një adresë të vlefshme email-i.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Fjalëkalimi duhet të ketë të paktën 8 karaktere.' },
        { status: 400 }
      );
    }

    if (!emri || !mbiemri) {
      return NextResponse.json(
        { error: 'Emri dhe mbiemri janë të detyrueshëm.' },
        { status: 400 }
      );
    }

    const fullName = `${emri} ${mbiemri}`.trim();

    // 1. Save in local UserStore
    const result = UserStore.createUser({
      email,
      password,
      fullName,
      phone: telefoni || '',
      role: role === 'agjenci' ? 'agency' : 'user',
      agencyName: emriAgjencise,
      arbkLicense: licencaArbk,
      municipality: komuna,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // 2. Also attempt Supabase signup if Supabase is connected
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.auth.signUp({
          email: email.toLowerCase().trim(),
          password,
          options: {
            data: {
              full_name: fullName,
              phone: telefoni,
              user_role: role,
            },
          },
        });
      } catch {
        // Fallback to UserStore
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Llogaria juaj u krijua me sukses! Tani mund të kyçeni në PronaX.',
      user: {
        id: result.user?.id,
        email: result.user?.email,
        fullName: result.user?.fullName,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Dështoi regjistrimi.' }, { status: 500 });
  }
}
