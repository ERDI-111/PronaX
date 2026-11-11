import { NextRequest, NextResponse } from 'next/server';

// Individual property fetch — Supabase-first with 404 fallback
// Kur Supabase nuk është i konfiguruar, kthen 404 (jo të dhëna demo si reale).

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Try Supabase first
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        // Increment view counter (non-blocking)
        supabase.rpc('increment_property_views', { prop_id: id }).then(() => {});
        return NextResponse.json({ property: data, source: 'supabase' });
      }

      if (error?.code === 'PGRST116') {
        // Not found in DB
        return NextResponse.json(
          { error: 'Prona nuk u gjet.' },
          { status: 404 }
        );
      }
    } catch {}
  }

  // Supabase nuk është i konfiguruar — kthen 404 me mesazh të qartë
  return NextResponse.json(
    {
      error: 'Prona nuk u gjet.',
      info: 'Baza e të dhënave nuk është e konfiguruar. Lidhu me Supabase për të aksesuar prona reale.',
    },
    { status: 404 }
  );
}
