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

// --- Mock dataset (replaces Supabase when DB credentials absent) ---
const MOCK_PROPERTIES = [
  {
    id: 'prop-ks-101',
    title: 'Banesë moderne në lagjen Marigona Hill',
    slug: 'banesa-moderne-marigona-hill-pristine',
    listing_type: 'shitje',
    property_type: 'Banesë',
    municipality_id: 'pristine',
    municipality_name: 'Prishtinë',
    settlement_id: 'veternik',
    settlement_name: 'Veternik',
    price: 135000,
    currency: 'EUR',
    area_m2: 96,
    bedrooms: 3,
    bathrooms: 2,
    floor: 4,
    year_built: 2021,
    furnished: 'i mobiluar',
    cover_image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    published_at: '2026-10-10T10:00:00Z',
    expires_at: '2026-11-09T10:00:00Z',
    is_featured: true,
    lat: 42.635, lng: 21.172,
    owner_name: 'Agim Berisha',
    owner_phone: '+383 44 123 456',
    owner_type: 'privat',
    views: 847,
  },
  {
    id: 'prop-ks-102',
    title: 'Shtëpi komode me oborr të rregulluar',
    slug: 'shtepi-komode-oborr-prizren',
    listing_type: 'shitje',
    property_type: 'Shtëpi',
    municipality_id: 'prizren',
    municipality_name: 'Prizren',
    settlement_id: 'ortakoll',
    settlement_name: 'Ortakoll',
    price: 185000,
    currency: 'EUR',
    area_m2: 220,
    bedrooms: 5,
    bathrooms: 3,
    floor: null,
    year_built: 2018,
    furnished: 'i mobiluar',
    cover_image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    published_at: '2026-10-15T09:00:00Z',
    expires_at: '2026-11-14T09:00:00Z',
    is_featured: true,
    lat: 42.221, lng: 20.738,
    owner_name: 'Luljeta Berisha',
    owner_phone: '+383 49 222 333',
    owner_type: 'agjenci',
    views: 523,
  },
  {
    id: 'prop-ks-103',
    title: 'Lokal afarist modern në qendër të Pejës',
    slug: 'lokal-afarist-qender-peje',
    listing_type: 'qira',
    property_type: 'Lokal afarist',
    municipality_id: 'peje',
    municipality_name: 'Pejë',
    settlement_id: 'qender-peje',
    settlement_name: 'Qendër',
    price: 750,
    currency: 'EUR',
    area_m2: 110,
    bedrooms: null,
    bathrooms: 1,
    floor: 0,
    year_built: 2016,
    furnished: 'i mobiluar',
    cover_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    published_at: '2026-10-20T12:00:00Z',
    expires_at: '2026-11-19T12:00:00Z',
    is_featured: false,
    lat: 42.659, lng: 20.292,
    owner_name: 'Dardania Real Estate',
    owner_phone: '+383 44 123 456',
    owner_type: 'agjenci',
    views: 312,
  },
  {
    id: 'prop-ks-104',
    title: 'Vilë luksoze me pamje malore në Brezovicë',
    slug: 'vile-luksoze-brezovice',
    listing_type: 'shitje',
    property_type: 'Vilë',
    municipality_id: 'shterpc',
    municipality_name: 'Shtërpcë',
    settlement_id: 'brezovice',
    settlement_name: 'Brezovicë',
    price: 240000,
    currency: 'EUR',
    area_m2: 260,
    bedrooms: 6,
    bathrooms: 4,
    floor: null,
    year_built: 2020,
    furnished: 'i mobiluar',
    cover_image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    published_at: '2026-10-25T08:00:00Z',
    expires_at: '2026-11-24T08:00:00Z',
    is_featured: true,
    lat: 42.215, lng: 21.002,
    owner_name: 'Ramiz Gashi',
    owner_phone: '+383 44 999 888',
    owner_type: 'agjenci',
    views: 1204,
  },
  {
    id: 'prop-ks-105',
    title: 'Truall ndërtimor 1500m² me leje ndërtimi',
    slug: 'truall-ndertimorr-fushe-kosove',
    listing_type: 'shitje',
    property_type: 'Truall',
    municipality_id: 'fushe-kosove',
    municipality_name: 'Fushë Kosovë',
    settlement_id: 'zona-industriale-fk',
    settlement_name: 'Zona Industriale',
    price: 68000,
    currency: 'EUR',
    area_m2: 1500,
    bedrooms: null,
    bathrooms: null,
    floor: null,
    year_built: null,
    furnished: null,
    cover_image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    published_at: '2026-11-01T14:00:00Z',
    expires_at: '2026-12-01T14:00:00Z',
    is_featured: false,
    lat: 42.632, lng: 21.115,
    owner_name: 'Besim Krasniqi',
    owner_phone: '+383 45 777 666',
    owner_type: 'privat',
    views: 189,
  },
  {
    id: 'prop-ks-106',
    title: 'Banesë 2+1 me ballkon të madh — Ferizaj Qendër',
    slug: 'banesa-2plus1-ballkon-ferizaj',
    listing_type: 'shitje',
    property_type: 'Banesë',
    municipality_id: 'ferizaj',
    municipality_name: 'Ferizaj',
    settlement_id: 'qender-ferizaj',
    settlement_name: 'Qendër',
    price: 72000,
    currency: 'EUR',
    area_m2: 78,
    bedrooms: 2,
    bathrooms: 1,
    floor: 3,
    year_built: 2019,
    furnished: 'i pamobiluar',
    cover_image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    published_at: '2026-11-05T10:00:00Z',
    expires_at: '2026-12-05T10:00:00Z',
    is_featured: false,
    lat: 42.370, lng: 21.148,
    owner_name: 'Vjosa Musa',
    owner_phone: '+383 49 555 444',
    owner_type: 'privat',
    views: 95,
  },
];

type SortKey = 'newest' | 'price_asc' | 'price_desc' | 'area_desc';

function sortProperties(props: typeof MOCK_PROPERTIES, sort: SortKey) {
  return [...props].sort((a, b) => {
    if (sort === 'price_asc') return a.price - b.price;
    if (sort === 'price_desc') return b.price - a.price;
    if (sort === 'area_desc') return b.area_m2 - a.area_m2;
    // newest
    return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
  });
}

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
      // Fall through to mock data
    }
  }

  // --- Mock fallback ---
  let results = MOCK_PROPERTIES.filter(p => p.status === 'active');

  if (params.q) {
    const q = params.q.toLowerCase();
    results = results.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.municipality_name.toLowerCase().includes(q) ||
      p.settlement_name.toLowerCase().includes(q)
    );
  }
  if (params.tipi) results = results.filter(p => p.listing_type === params.tipi);
  if (params.kategoria) results = results.filter(p => p.property_type === params.kategoria);
  if (params.komuna) results = results.filter(p => p.municipality_name === params.komuna);
  if (params.cmimi_min) results = results.filter(p => p.price >= params.cmimi_min!);
  if (params.cmimi_max) results = results.filter(p => p.price <= params.cmimi_max!);
  if (params.siperfaqja_min) results = results.filter(p => p.area_m2 >= params.siperfaqja_min!);

  results = sortProperties(results, (params.sort as SortKey) || 'newest');

  const total = results.length;
  const page = params.page || 1;
  const perPage = params.per_page || 12;
  const offset = (page - 1) * perPage;
  const paged = results.slice(offset, offset + perPage);

  return NextResponse.json({
    properties: paged,
    total,
    page,
    per_page: perPage,
    total_pages: Math.ceil(total / perPage),
    source: 'mock',
  });
}
