import { NextRequest, NextResponse } from 'next/server';
import { PaymentStore } from '@/lib/payments/store';
import { PropertySummary } from '@/lib/payments/types';
import { SecuritySanitizer } from '@/lib/security/sanitize';
import { AdminNotificationAgent } from '@/lib/ai/agents/admin-notification';
import { UserStore } from '@/lib/auth/user-store';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params = {
      q: searchParams.get('q') || undefined,
      tipi: (searchParams.get('tipi') as any) || undefined,
      kategoria: searchParams.get('kategoria') || undefined,
      komuna: searchParams.get('komuna') || undefined,
      vendbanimi: searchParams.get('vendbanimi') || undefined,
      cmimi_min: searchParams.get('cmimi_min') ? Number(searchParams.get('cmimi_min')) : undefined,
      cmimi_max: searchParams.get('cmimi_max') ? Number(searchParams.get('cmimi_max')) : undefined,
      siperfaqja_min: searchParams.get('siperfaqja_min') ? Number(searchParams.get('siperfaqja_min')) : undefined,
      dhoma: searchParams.get('dhoma') ? Number(searchParams.get('dhoma')) : undefined,
      sort: (searchParams.get('sort') as any) || 'newest',
      page: Number(searchParams.get('page') || '1'),
      per_page: Math.min(Number(searchParams.get('per_page') || '12'), 48),
      includePending: searchParams.get('includePending') === 'true',
    };

    const result = await PaymentStore.searchProperties(params);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Gabim gjatë kërkimit të pronave.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || !body.price || !body.municipality_id) {
      return NextResponse.json(
        { error: 'Titulli, çmimi dhe komuna janë fusha të detyrueshme.' },
        { status: 400 }
      );
    }

    // Require registered account to publish property
    const cookieUser = req.cookies.get('pronax_verified_login')?.value;
    const sellerEmail = (body.seller_email || cookieUser || '').toLowerCase().trim();
    const registeredUser = UserStore.findByEmail(sellerEmail);

    if (!cookieUser && !registeredUser && sellerEmail !== 'pronaxestate@outlook.com') {
      return NextResponse.json(
        { error: 'Duhet të keni një llogari të vlefshme në PronaX për të publikuar shpallje. Ju lutem kyçuni ose regjistrohuni.' },
        { status: 401 }
      );
    }

    const id = `prop-ks-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const cleanTitle = SecuritySanitizer.sanitizeString(body.title);
    const slug = `${slugify(cleanTitle)}-${id}`;
    const planId = (body.planId || 'free') as 'free' | 'weekly' | 'monthly';

    const images: string[] = Array.isArray(body.images) ? body.images : [];
    const coverIndex = typeof body.cover_image_index === 'number' ? body.cover_image_index : 0;
    const coverImage = images[coverIndex] || images[0] || '';

    // If Free plan (0€ - 3 ditë), activate immediately so property is visible on site
    const isFree = planId === 'free';
    const durationDays = isFree ? 3 : (planId === 'weekly' ? 7 : 30);
    const expiresAt = isFree
      ? new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString()
      : null;
    const status = isFree ? 'published' : 'pending_payment';

    const property: PropertySummary = {
      id,
      title: cleanTitle,
      slug,
      description: SecuritySanitizer.sanitizeString(body.description || ''),
      price: Number(body.price) || 0,
      currency: body.currency || 'EUR',
      property_type: body.property_type || 'Banesë',
      listing_type: body.listing_type || 'shitje',
      municipality_id: body.municipality_id || 'Prishtinë',
      settlement_id: body.settlement_id || '',
      address: SecuritySanitizer.sanitizeString(body.address || ''),
      area_m2: Number(body.area_m2) || 0,
      bedrooms: body.bedrooms ? Number(body.bedrooms) : null,
      bathrooms: body.bathrooms ? Number(body.bathrooms) : null,
      living_rooms: body.living_rooms ? Number(body.living_rooms) : null,
      floor: body.floor || null,
      total_floors: body.total_floors || null,
      year_built: body.year_built || null,
      furnished: body.furnished || null,
      heating_type: body.heating_type || null,
      has_balcony: Boolean(body.balcony),
      has_parking: Boolean(body.parking),
      has_elevator: Boolean(body.elevator),
      has_ac: Boolean(body.air_conditioning),
      cover_image: coverImage,
      images,
      video_url: body.video_url || '',
      video_file_url: body.video_file_url || '',
      status,
      plan_id: planId,
      published_at: isFree ? now.toISOString() : null,
      expires_at: expiresAt,
      renewal_count: 0,
      owner_id: body.owner_id || 'user-erdis-001',
      owner_name: SecuritySanitizer.sanitizeString(body.seller_name || 'Pronari'),
      owner_phone: SecuritySanitizer.sanitizeString(body.seller_phone || ''),
      owner_email: SecuritySanitizer.sanitizeString(body.seller_email || ''),
      owner_type: body.seller_role === 'agency' ? 'agjenci' : 'privat',
      views: 0,
      lat: body.lat ? Number(body.lat) : 42.6629,
      lng: body.lng ? Number(body.lng) : 21.1655,
      created_at: now.toISOString(),
    };

    const saved = await PaymentStore.createProperty(property);

    // Notify Administrator via Agent 10 (Email Management & Admin Notification Agent)
    AdminNotificationAgent.notifyNewPropertySubmitted(saved, {
      requiresModeration: (status as string) === 'pending_moderation',
    }).catch(err => console.warn('[Agent 10] Property notification warning:', err));

    // If Free plan, record payment event for audit
    if (isFree) {
      await PaymentStore.createPayment({
        id: `pay-free-${id}`,
        property_id: id,
        user_id: property.owner_id,
        amount_cents: 0,
        currency: 'EUR',
        purpose: 'new_listing',
        provider: 'free_plan',
        plan_id: 'free',
        duration_days: 3,
        status: 'successful',
        payment_method: 'free_tier',
        idempotency_key: `free-${id}-${now.getTime()}`,
        metadata: {
          propertyTitle: property.title,
          planName: 'Plani Falas (3 Ditë)',
        },
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      });
    }

    // Determine redirect
    const redirectUrl = isFree
      ? `/pagesa/sukses?paymentId=pay-free-${id}&propertyId=${id}&plan=free`
      : `/pagesa/${id}?purpose=new_listing&plan=${planId}`;

    return NextResponse.json({
      success: true,
      property: saved,
      propertyId: id,
      status,
      redirectUrl,
    });
  } catch (error: any) {
    console.error('Gabim gjatë ruajtjes së pronës:', error);
    return NextResponse.json(
      { error: error?.message || 'Dështoi ruajtja e pronës.' },
      { status: 500 }
    );
  }
}
