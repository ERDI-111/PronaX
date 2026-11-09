import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payments/service';
import { RateLimiter } from '@/lib/security/rate-limiter';
import { SecuritySanitizer } from '@/lib/security/sanitize';

export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

    // 1. Rate Limiting Protection (Max 15 checkout attempts per minute per IP)
    const rateCheck = RateLimiter.check(`checkout:${clientIp}`, 15, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { 
          error: `Shumë kërkesa nga kjo adresë. Ju lutem prisni ${rateCheck.resetInSeconds} sekonda para se të provoni sërish.` 
        },
        { status: 429, headers: { 'Retry-After': String(rateCheck.resetInSeconds) } }
      );
    }

    const body = await req.json();
    const { propertyId, purpose = 'new_listing', preferredProvider } = body;

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Parametri "propertyId" është i detyrueshëm.' },
        { status: 400 }
      );
    }

    const cleanPropertyId = SecuritySanitizer.sanitizeString(propertyId);
    const userId = SecuritySanitizer.sanitizeString(body.userId || 'user-erdis-001');
    const userEmail = SecuritySanitizer.sanitizeString(body.userEmail || 'pronaxestate@gmail.com');
    const userName = SecuritySanitizer.sanitizeString(body.userName || 'Përdorues PronaX');

    const originUrl = req.nextUrl.origin;

    const session = await PaymentService.initiatePayment({
      propertyId: cleanPropertyId,
      userId,
      userEmail,
      userName,
      purpose,
      preferredProvider,
      originUrl,
    });

    return NextResponse.json({
      success: true,
      paymentId: session.paymentId,
      checkoutUrl: session.checkoutUrl,
      amount: '7.00',
      currency: 'EUR',
      durationDays: 30,
    });
  } catch (error: any) {
    console.error('Gabim gjatë krijimit të pagesës:', error);
    return NextResponse.json(
      { error: error?.message || 'Ndodhi një gabim i papritur gjatë krijimit të pagesës.' },
      { status: 400 }
    );
  }
}
