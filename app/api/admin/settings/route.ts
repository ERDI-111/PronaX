import { NextRequest, NextResponse } from 'next/server';

// In-memory runtime settings store (fallback when DB credentials not configured)
let runtimeSettings: Record<string, string> = {
  plan_free_price_eur: '0.00',
  plan_free_duration_days: '3',
  plan_weekly_price_eur: '2.99',
  plan_weekly_duration_days: '7',
  plan_monthly_price_eur: '9.99',
  plan_monthly_duration_days: '30',
  moderation_mode: 'manual', // 'manual' | 'auto'
  payment_provider: 'sandbox', // 'sandbox' | 'paysera' | 'kosovo_pos'
  contact_email: 'pronaxestate@outlook.com',
  admin_notification_email: 'pronaxestate@outlook.com',
  max_images_per_listing: '30',
  max_image_size_mb: '10',
  maintenance_mode: 'false',
};

export async function GET() {
  return NextResponse.json({
    success: true,
    settings: runtimeSettings,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.settings && typeof body.settings === 'object') {
      runtimeSettings = {
        ...runtimeSettings,
        ...body.settings,
      };

      return NextResponse.json({
        success: true,
        message: 'Konfigurimet e platformës u përditësuan me sukses.',
        settings: runtimeSettings,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Të dhëna të pavlefshme të konfigurimit.' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gabim gjatë ruajtjes së konfigurimeve.' },
      { status: 500 }
    );
  }
}
