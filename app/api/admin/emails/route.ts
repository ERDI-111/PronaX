import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email/service';
import { EmailTemplateRenderer } from '@/lib/email/templates';
import { EmailTemplateType } from '@/lib/email/types';

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('template') as EmailTemplateType | null;

  if (type) {
    // Generate preview for selected template
    const preview = EmailTemplateRenderer.render(type, {
      name: 'Erdis',
      propertyTitle: 'Banesë moderne me 2 dhoma në Prishtinë (Bregu i Diellit)',
      propertyId: 'prop-ks-101',
      paymentId: 'pay_ks_demo_700',
      price: 95000,
      areaM2: 78,
      propertyType: 'Banesë',
      municipality: 'Prishtinë',
      publishedAt: '09/11/2026',
      expiresAt: '09/12/2026',
      newExpiresAt: '09/01/2027',
      renewalCount: 1,
      senderName: 'Flamur Krasniqi',
      messagePreview: 'Përshëndetje! Jam i interesuar për këtë banesë. A mund ta vizitoj nesër pasdite?',
      reason: 'Ju lutem ngarkoni fotografi me cilësi më të lartë dhe përcaktoni katin e saktë të ndërtesës.',
    });

    return NextResponse.json({ success: true, preview });
  }

  const loggedEmails = EmailService.getLoggedEmails();
  return NextResponse.json({
    success: true,
    totalLogged: loggedEmails.length,
    isLiveConfigured: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith('re_')),
    emails: loggedEmails,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { templateType = 'welcome', to = 'pronaxestate@outlook.com' } = body;

    let res;
    if (templateType === 'payment_success') {
      res = await EmailService.sendPaymentSuccessEmail({
        to,
        paymentId: 'pay_test_700',
        propertyTitle: 'Banesë në Prishtinë',
        amount: '7.00',
        purpose: 'new_listing',
      });
    } else if (templateType === 'expiring_3d') {
      res = await EmailService.sendExpiringWarningEmail({
        to,
        propertyId: 'prop-ks-101',
        propertyTitle: 'Banesë në Bregu i Diellit',
        expiresAt: '12/11/2026',
        isUrgent: false,
      });
    } else if (templateType === 'expired') {
      res = await EmailService.sendExpiredEmail({
        to,
        propertyId: 'prop-ks-102',
        propertyTitle: 'Shtëpi luksoze në Prizren',
      });
    } else {
      res = await EmailService.sendWelcomeEmail(to, 'Përdorues i Nderuar');
    }

    return NextResponse.json({ success: true, result: res });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
