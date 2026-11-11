import { NextRequest, NextResponse } from 'next/server';

// Active properties with coordinates across Kosovo municipalities
const FALLBACK_ACTIVE_PROPERTIES = [
  {
    id: 'prop-ks-101',
    title: 'Banesë moderne në lagjen Marigona Hill',
    slug: 'banesa-moderne-marigona-hill-pristine',
    listing_type: 'shitje',
    property_type: 'Banesë',
    municipality_name: 'Prishtinë',
    settlement_name: 'Veternik',
    price: 135000,
    currency: 'EUR',
    area_m2: 96,
    bedrooms: 3,
    cover_image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    published_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    expires_at: new Date(Date.now() + 28 * 86400000).toISOString(),
    lat: 42.6350,
    lng: 21.1720,
  },
  {
    id: 'prop-ks-102',
    title: 'Shtëpi komode me oborr të rregulluar',
    slug: 'shtepi-komode-oborr-prizren',
    listing_type: 'shitje',
    property_type: 'Shtëpi',
    municipality_name: 'Prizren',
    settlement_name: 'Ortakoll',
    price: 185000,
    currency: 'EUR',
    area_m2: 220,
    bedrooms: 5,
    cover_image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    published_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    expires_at: new Date(Date.now() + 25 * 86400000).toISOString(),
    lat: 42.2210,
    lng: 20.7380,
  },
  {
    id: 'prop-ks-103',
    title: 'Lokal afarist modern në qendër të Pejës',
    slug: 'lokal-afarist-qender-peje',
    listing_type: 'qira',
    property_type: 'Lokal afarist',
    municipality_name: 'Pejë',
    settlement_name: 'Qendër',
    price: 750,
    currency: 'EUR',
    area_m2: 110,
    bedrooms: null,
    cover_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    published_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    expires_at: new Date(Date.now() + 29 * 86400000).toISOString(),
    lat: 42.6590,
    lng: 20.2920,
  },
  {
    id: 'prop-ks-104',
    title: 'Vilë luksoze me pamje malore në Brezovicë',
    slug: 'vile-luksoze-brezovice',
    listing_type: 'shitje',
    property_type: 'Vilë',
    municipality_name: 'Shtërpcë',
    settlement_name: 'Brezovicë',
    price: 240000,
    currency: 'EUR',
    area_m2: 260,
    bedrooms: 4,
    cover_image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    published_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    expires_at: new Date(Date.now() + 27 * 86400000).toISOString(),
    lat: 42.2150,
    lng: 21.0020,
  },
  {
    id: 'prop-ks-105',
    title: 'Truall për ndërtim në Zonën Industriale',
    slug: 'truall-ndertim-fushe-kosove',
    listing_type: 'shitje',
    property_type: 'Truall',
    municipality_name: 'Fushë Kosovë',
    settlement_name: 'Zona Industriale',
    price: 68000,
    currency: 'EUR',
    area_m2: 1500,
    bedrooms: null,
    cover_image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    published_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    expires_at: new Date(Date.now() + 26 * 86400000).toISOString(),
    lat: 42.6320,
    lng: 21.1150,
  },
  {
    id: 'prop-ks-106',
    title: 'Banesë 2+1 me pamje nga qyteti në Dardani',
    slug: 'banese-2-1-dardani-prishtine',
    listing_type: 'shitje',
    property_type: 'Banesë',
    municipality_name: 'Prishtinë',
    settlement_name: 'Dardania',
    price: 98000,
    currency: 'EUR',
    area_m2: 74,
    bedrooms: 2,
    cover_image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    published_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    expires_at: new Date(Date.now() + 29 * 86400000).toISOString(),
    lat: 42.6520,
    lng: 21.1550,
  },
  {
    id: 'prop-ks-107',
    title: 'Banesë luksoze me qira në Lakrishtë (Prishtina City Center)',
    slug: 'banese-luksoze-qira-lakrishte',
    listing_type: 'qira',
    property_type: 'Banesë',
    municipality_name: 'Prishtinë',
    settlement_name: 'Lakrishtë',
    price: 850,
    currency: 'EUR',
    area_m2: 110,
    bedrooms: 3,
    cover_image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    published_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    expires_at: new Date(Date.now() + 24 * 86400000).toISOString(),
    lat: 42.6580,
    lng: 21.1510,
  },
  {
    id: 'prop-ks-108',
    title: 'Shtëpi e re me pishinë në Ferizaj',
    slug: 'shtepi-pishine-ferizaj',
    listing_type: 'shitje',
    property_type: 'Shtëpi',
    municipality_name: 'Ferizaj',
    settlement_name: 'Qendër',
    price: 215000,
    currency: 'EUR',
    area_m2: 280,
    bedrooms: 5,
    cover_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    published_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    expires_at: new Date(Date.now() + 28 * 86400000).toISOString(),
    lat: 42.3700,
    lng: 21.1500,
  },
  {
    id: 'prop-ks-109',
    title: 'Zyre afariste moderne në Gjilan',
    slug: 'zyre-afariste-gjilan',
    listing_type: 'qira',
    property_type: 'Lokal afarist',
    municipality_name: 'Gjilan',
    settlement_name: 'Qendër',
    price: 500,
    currency: 'EUR',
    area_m2: 85,
    bedrooms: null,
    cover_image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    published_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    expires_at: new Date(Date.now() + 27 * 86400000).toISOString(),
    lat: 42.4635,
    lng: 21.4694,
  },
  {
    id: 'prop-ks-110',
    title: 'Vilë familjare tradicionale në Gjakovë (Çarshia e Madhe)',
    slug: 'vile-familjare-gjakove',
    listing_type: 'shitje',
    property_type: 'Shtëpi',
    municipality_name: 'Gjakovë',
    settlement_name: 'Çarshia e Madhe',
    price: 165000,
    currency: 'EUR',
    area_m2: 190,
    bedrooms: 4,
    cover_image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    published_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    expires_at: new Date(Date.now() + 26 * 86400000).toISOString(),
    lat: 42.3844,
    lng: 20.4285,
  },
  {
    id: 'prop-ks-111',
    title: 'Banesë me pamje nga Ibri në Mitrovicë',
    slug: 'banese-iber-mitrovice',
    listing_type: 'shitje',
    property_type: 'Banesë',
    municipality_name: 'Mitrovicë e Jugut',
    settlement_name: 'Qendër',
    price: 78000,
    currency: 'EUR',
    area_m2: 82,
    bedrooms: 2,
    cover_image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    published_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    expires_at: new Date(Date.now() + 23 * 86400000).toISOString(),
    lat: 42.8914,
    lng: 20.8660,
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const komuna = searchParams.get('komuna') || '';
    const kategoria = searchParams.get('kategoria') || '';
    const tipi = searchParams.get('tipi') || '';
    const q = (searchParams.get('q') || '').toLowerCase().trim();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    let propertiesList = FALLBACK_ACTIVE_PROPERTIES;

    // Check if Supabase is connected
    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);

        let query = supabase
          .from('properties')
          .select(`
            id,
            title,
            slug,
            listing_type,
            property_type,
            municipality_name,
            settlement_name,
            price,
            currency,
            area_m2,
            bedrooms,
            cover_image,
            status,
            published_at,
            expires_at,
            lat,
            lng
          `)
          .eq('status', 'active')
          .gt('expires_at', new Date().toISOString())
          .not('lat', 'is', null)
          .not('lng', 'is', null);

        if (komuna) query = query.eq('municipality_name', komuna);
        if (kategoria) query = query.eq('property_type', kategoria);
        if (tipi) query = query.eq('listing_type', tipi);
        if (q) query = query.ilike('title', `%${q}%`);

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          propertiesList = data as any[];
        }
      } catch (dbErr) {
        console.warn('Database query failed, falling back to local dataset:', dbErr);
      }
    }

    // Filter properties (strictly active, non-expired, valid coordinates)
    const now = new Date();
    const filtered = propertiesList.filter((p: any) => {
      // Must be active
      if (p.status !== 'active') return false;

      // Must not be expired
      if (p.expires_at && new Date(p.expires_at) <= now) return false;

      // Must have valid lat and lng
      if (typeof p.lat !== 'number' || typeof p.lng !== 'number' || isNaN(p.lat) || isNaN(p.lng)) {
        return false;
      }

      // Municipality filter
      if (komuna && p.municipality_name !== komuna) return false;

      // Category filter
      if (kategoria && p.property_type !== kategoria) return false;

      // Purpose filter
      if (tipi && p.listing_type !== tipi) return false;

      // Text search
      if (q) {
        const textToSearch = `${p.title} ${p.municipality_name} ${p.settlement_name}`.toLowerCase();
        if (!textToSearch.includes(q)) return false;
      }

      return true;
    });

    return NextResponse.json({
      success: true,
      count: filtered.length,
      properties: filtered,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Gabim gjatë ngarkimit të hartës.' },
      { status: 500 }
    );
  }
}
