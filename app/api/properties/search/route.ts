import { NextRequest, NextResponse } from 'next/server';

// --- Types ---
export interface PropertySearchParams {
  q?: string;
  tipi?: 'shitje' | 'qira';
  kategoria?: string;
  komuna?: string;
  vendbanimi?: string;
  cmimi_min?: number;
  cmimi_max?: number;
  siperfaqja_min?: number;
  siperfaqja_max?: number;
  dhoma?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'area_desc';
  page?: number;
  per_page?: number;
}

// --- Fallback kur Supabase nuk është i konfiguruar ---
// Kthen listë bosh me mesazh të qartë që DB nuk është aktive.
// Në prodhim (Supabase i konfiguruar) kjo degë nuk ekzekutohet kurrë.
const EMPTY_FALLBACK = {
  properties: [] as object[],
  total: 0,
  page: 1,
  per_page: 12,
  total_pages: 0,
  source: 'offline' as const,
  message: 'Baza e të dhënave nuk është e konfiguruar. Prona do të shfaqen pasi të konfigurohet Supabase.',
};

type SortKey = 'newest' | 'price_asc' | 'price_desc' | 'area_desc';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const params: PropertySearchParams = {
    q: searchParams.get('q') || undefined,
    tipi: (searchParams.get('tipi') as PropertySearchParams['tipi']) || undefined,
    kategoria: searchParams.get('kategoria') || undefined,
    komuna: searchParams.get('komuna') || undefined,
    cmimi_min: searchParams.get('cmimi_min') ? Number(searchParams.get('cmimi_min')) : undefined,
    cmimi_max: searchParams.get('cmimi_max') ? Number(searchParams.get('cmimi_max')) : undefined,
    siperfaqja_min: searchParams.get('siperfaqja_min') ? Number(searchParams.get('siperfaqja_min')) : undefined,
    sort: (searchParams.get('sort') as PropertySearchParams['sort']) || 'newest',
    page: Number(searchParams.get('page') || '1'),
    per_page: Math.min(Number(searchParams.get('per_page') || '12'), 48),
  };

  // Try Supabase if credentials exist
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);

      let query = supabase
        .from('properties')
        .select('*', { count: 'exact' })
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString());

      if (params.q) query = query.ilike('title', `%${params.q}%`);
      if (params.tipi) query = query.eq('listing_type', params.tipi);
      if (params.kategoria) query = query.eq('property_type', params.kategoria);
      if (params.komuna) query = query.eq('municipality_name', params.komuna);
      if (params.cmimi_min) query = query.gte('price', params.cmimi_min);
      if (params.cmimi_max) query = query.lte('price', params.cmimi_max);
      if (params.siperfaqja_min) query = query.gte('area_m2', params.siperfaqja_min);

      const sortMap: Record<string, { column: string; ascending: boolean }> = {
        newest: { column: 'published_at', ascending: false },
        price_asc: { column: 'price', ascending: true },
        price_desc: { column: 'price', ascending: false },
        area_desc: { column: 'area_m2', ascending: false },
      };
      const sortConfig = sortMap[params.sort || 'newest'];
      query = query.order(sortConfig.column, { ascending: sortConfig.ascending });

      const offset = ((params.page || 1) - 1) * (params.per_page || 12);
      query = query.range(offset, offset + (params.per_page || 12) - 1);

      const { data, count, error } = await query;
      if (!error && data) {
        return NextResponse.json({
          properties: data,
          total: count || 0,
          page: params.page,
          per_page: params.per_page,
          total_pages: Math.ceil((count || 0) / (params.per_page || 12)),
          source: 'supabase',
        });
      }
    } catch {
      // Fall through to empty fallback
    }
  }

  // --- Offline fallback: Supabase nuk është i konfiguruar ---
  // Kthen gjendje bosh me mesazh informues (jo të dhëna demo si reale).
  return NextResponse.json({
    ...EMPTY_FALLBACK,
    page: params.page || 1,
    per_page: params.per_page || 12,
  });
}
