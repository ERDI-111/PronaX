import { NextRequest, NextResponse } from 'next/server';

// Individual property fetch — Supabase-first with mock fallback
const MOCK_PROPERTIES: Record<string, object> = {
  'prop-ks-101': {
    id: 'prop-ks-101', title: 'Banesë moderne në lagjen Marigona Hill',
    listing_type: 'shitje', property_type: 'Banesë',
    municipality_name: 'Prishtinë', settlement_name: 'Veternik',
    price: 135000, currency: 'EUR', area_m2: 96, bedrooms: 3, bathrooms: 2,
    floor: 4, total_floors: 7, year_built: 2021, furnished: 'i mobiluar',
    heating: 'Ngrohje qendrore', parking: true, elevator: true, balcony: true,
    description: 'Banesë e re luksoze në lagjen e preferuar Marigona Hill, me pamje të jashtëzakonshme nga qyteti dhe malet. Ndërtesë e vitit 2021 me materiale të cilësisë së lartë, sistem ngrohjeje qendrore dhe ashensor. Pozicion ideal afër qendrës tregtare dhe shkollave ndërkombëtare.',
    cover_image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    ],
    lat: 42.635, lng: 21.172, address_public: 'Lagja Marigona Hill, Prishtinë',
    status: 'active', published_at: '2026-10-10T10:00:00Z', expires_at: '2026-11-09T10:00:00Z',
    is_featured: true, views: 847,
    owner_name: 'Agim Berisha', owner_phone: '+383 44 123 456', owner_email: 'agim@test.com',
    owner_type: 'privat', show_phone: true, whatsapp: true,
  },
  'prop-ks-102': {
    id: 'prop-ks-102', title: 'Shtëpi komode me oborr të rregulluar',
    listing_type: 'shitje', property_type: 'Shtëpi',
    municipality_name: 'Prizren', settlement_name: 'Ortakoll',
    price: 185000, currency: 'EUR', area_m2: 220, bedrooms: 5, bathrooms: 3,
    floor: null, total_floors: 2, year_built: 2018, furnished: 'i mobiluar',
    heating: 'Ngrohje me gaz', parking: true, elevator: false, balcony: true,
    description: 'Shtëpi private individuale me oborr 350m² të rregulluar me ambiente të gjelbëra. Dizajn modern, hapësira të gjera dhe cilësi e lartë ndërtimi. Afër shkollës dhe spitalit.',
    cover_image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    ],
    lat: 42.221, lng: 20.738, address_public: 'Ortakoll, Prizren',
    status: 'active', published_at: '2026-10-15T09:00:00Z', expires_at: '2026-11-14T09:00:00Z',
    is_featured: true, views: 523,
    owner_name: 'Luljeta Berisha', owner_phone: '+383 49 222 333', owner_email: 'luljeta@test.com',
    owner_type: 'agjenci', show_phone: true, whatsapp: true,
  },
  'prop-ks-103': {
    id: 'prop-ks-103', title: 'Lokal afarist modern në qendër të Pejës',
    listing_type: 'qira', property_type: 'Lokal afarist',
    municipality_name: 'Pejë', settlement_name: 'Qendër',
    price: 750, currency: 'EUR', area_m2: 110, bedrooms: null, bathrooms: 1,
    floor: 0, total_floors: 4, year_built: 2016, furnished: 'i mobiluar',
    heating: 'Ndarëse', parking: false, elevator: true, balcony: false,
    description: 'Lokal modern në katin përdhes të një ndërtese kryesore në sheshin qendror të Pejës. Vitrina e madhe, pamje direkte tek sheshi, frekuentim i lartë nga këmbësorët. Ideal për dyqan, restorant, zyrë ose shërbime.',
    cover_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    ],
    lat: 42.659, lng: 20.292, address_public: 'Sheshi Shaban Polluzha, Pejë',
    status: 'active', published_at: '2026-10-20T12:00:00Z', expires_at: '2026-11-19T12:00:00Z',
    is_featured: false, views: 312,
    owner_name: 'Dardania Real Estate', owner_phone: '+383 44 100 200', owner_email: 'info@dardania.ks',
    owner_type: 'agjenci', show_phone: true, whatsapp: false,
  },
  'prop-ks-104': {
    id: 'prop-ks-104', title: 'Vilë luksoze me pamje malore në Brezovicë',
    listing_type: 'shitje', property_type: 'Vilë',
    municipality_name: 'Shtërpcë', settlement_name: 'Brezovicë',
    price: 240000, currency: 'EUR', area_m2: 260, bedrooms: 6, bathrooms: 4,
    floor: null, total_floors: 3, year_built: 2020, furnished: 'i mobiluar',
    heating: 'Ngrohje me pompa nxehtësie', parking: true, elevator: false, balcony: true,
    description: 'Vilë rezidenciale luksoze me pamje panoramike nga Sharri. E ndërtuar me materiale premium nga Italia dhe Gjermana. Pishina private, oborr i mbyllur 800m², shtëpi gjahu dhe garazh dyfish. Investim i rrallë në destinacionin turistik kryesor të Kosovës.',
    cover_image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80',
    ],
    lat: 42.215, lng: 21.002, address_public: 'Brezovicë, Shtërpcë',
    status: 'active', published_at: '2026-10-25T08:00:00Z', expires_at: '2026-11-24T08:00:00Z',
    is_featured: true, views: 1204,
    owner_name: 'Ramiz Gashi', owner_phone: '+383 44 999 888', owner_email: 'ramiz@prime.ks',
    owner_type: 'agjenci', show_phone: true, whatsapp: true,
  },
  'prop-ks-105': {
    id: 'prop-ks-105', title: 'Truall ndërtimor 1500m² me leje ndërtimi',
    listing_type: 'shitje', property_type: 'Truall',
    municipality_name: 'Fushë Kosovë', settlement_name: 'Zona Industriale',
    price: 68000, currency: 'EUR', area_m2: 1500, bedrooms: null, bathrooms: null,
    floor: null, total_floors: null, year_built: null, furnished: null,
    heating: null, parking: false, elevator: false, balcony: false,
    description: 'Truall ndërtimor 1500m² me leje ndërtimi të rregullta në Zonën Industriale të Fushë Kosovës. Rrugë e asfaltuar, ujë, rrymë dhe kanalizim të lidhura. Ideal për pallat, magazinë ose kompleks biznesi. Dokumentet 100% të rregulluara.',
    cover_image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    ],
    lat: 42.632, lng: 21.115, address_public: 'Zona Industriale, Fushë Kosovë',
    status: 'active', published_at: '2026-11-01T14:00:00Z', expires_at: '2026-12-01T14:00:00Z',
    is_featured: false, views: 189,
    owner_name: 'Besim Krasniqi', owner_phone: '+383 45 777 666', owner_email: 'besim@test.com',
    owner_type: 'privat', show_phone: false, whatsapp: true,
  },
};

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
    } catch {}
  }

  // Mock fallback
  const property = MOCK_PROPERTIES[id];
  if (!property) {
    return NextResponse.json({ error: 'Prona nuk u gjet.' }, { status: 404 });
  }

  return NextResponse.json({ property, source: 'mock' });
}
