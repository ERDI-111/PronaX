import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/properties/featured
 * Returns up to 4 real published and verified properties for homepage display.
 * Returns empty array when no real data exists (no demo data ever returned).
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Attempt to fetch real published properties from Supabase
    const { data, error } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        price,
        listing_type,
        category,
        municipality_id,
        settlement,
        area_m2,
        rooms,
        photos,
        expires_at
      `)
      .eq('status', 'published')
      .gte('expires_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(4);

    if (error || !data) {
      // Supabase not configured yet — return empty (no demo data)
      return NextResponse.json({ properties: [] });
    }

    const properties = data.map(p => ({
      id: p.id,
      title: p.title,
      price: p.price,
      type: p.listing_type,
      category: p.category,
      municipality: p.municipality_id,
      settlement: p.settlement || '',
      area_m2: p.area_m2,
      rooms: p.rooms,
      badge: null,
      image: Array.isArray(p.photos) && p.photos.length > 0
        ? p.photos[0]
        : null,
    })).filter(p => p.image); // Only show properties with real photos

    return NextResponse.json({ properties });
  } catch {
    // Any error → return empty (never expose demo data)
    return NextResponse.json({ properties: [] });
  }
}
