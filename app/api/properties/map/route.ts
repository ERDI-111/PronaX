import { NextRequest, NextResponse } from 'next/server';

// Active properties with coordinates across Kosovo municipalities
// In production mode, returns strictly verified and active listings from the database
const FALLBACK_ACTIVE_PROPERTIES: any[] = [];

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
        console.warn('Database query failed:', dbErr);
      }
    }

    // Filter properties (strictly active, non-expired, valid coordinates)
    const now = new Date();
    const filtered = propertiesList.filter((p: any) => {
      // Must be active
      if (p.status !== 'active' && p.status !== 'published') return false;

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
