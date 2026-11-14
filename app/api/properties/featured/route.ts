import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PaymentStore } from '@/lib/payments/store';

/**
 * GET /api/properties/featured
 * Returns up to 6 real published properties for homepage display.
 * Returns empty array when no real data exists (no demo data ever returned).
 */
export async function GET() {
  try {
    // 1. Attempt to fetch real published properties from Supabase
    try {
      const supabase = await createClient();
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
        .limit(6);

      if (!error && data && data.length > 0) {
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
        })).filter(p => p.image);

        if (properties.length > 0) {
          return NextResponse.json({ properties });
        }
      }
    } catch {}

    // 2. Fallback to PaymentStore (persistent local store)
    const storeProps = await PaymentStore.getPublicProperties();
    const properties = storeProps
      .slice(0, 6)
      .map(p => ({
        id: p.id,
        title: p.title,
        price: p.price,
        type: p.listing_type,
        category: p.property_type,
        municipality: p.municipality_id,
        settlement: p.settlement_id || '',
        area_m2: p.area_m2 || 0,
        rooms: p.bedrooms || null,
        badge: p.plan_id === 'monthly' ? '⭐ Premium' : null,
        image: p.cover_image || (p.images && p.images[0]) || null,
      }))
      .filter(p => p.image);

    return NextResponse.json({ properties });
  } catch {
    return NextResponse.json({ properties: [] });
  }
}
