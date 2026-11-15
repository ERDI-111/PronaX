import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email/service';
import { EmailTransporter } from '@/lib/email/transporter';
import { EmailTemplateRenderer } from '@/lib/email/templates';
import { EmailTemplateType } from '@/lib/email/types';
import { AdminNotificationAgent } from '@/lib/ai/agents/admin-notification';

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
      otp: '482915',
      expiresMinutes: 5,
      language: 'sq',
      adminEmail: 'pronaxestate@outlook.com',
      provider: EmailTransporter.getActiveProvider(),
      email: 'klient@shembull.com',
      message: 'Pyetje rreth procesit të blerjes në PronaX.',
      title: 'Vërejtje sigurie',
      details: 'Disa tentativa hyrjeje të pasuksesshme.',
    });

    return NextResponse.json({ success: true, preview });
  }

  const stats = EmailTransporter.getStats();
  const logs = EmailTransporter.getLogs();
  const queue = EmailTransporter.getQueue();

  return NextResponse.json({
    success: true,
    adminEmail: AdminNotificationAgent.ADMIN_EMAIL,
    activeProvider: stats.activeProvider,
    stats: {
      totalSent: stats.total,
      delivered: stats.delivered,
      simulated: stats.simulated,
      failed: stats.failed,
      pendingQueue: queue.length,
    },
    queue,
    logs: logs.slice(0, 100),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // Action 1: Send Admin Test Email to pronaxestate@outlook.com
    if (action === 'send_test') {
      const targetEmail = body.to || AdminNotificationAgent.ADMIN_EMAIL;
      const res = await EmailService.sendAdminTestEmail(targetEmail);
      return NextResponse.json({
        success: res.success,
        provider: res.provider,
        simulated: res.simulated,
        messageId: res.messageId,
        error: res.error,
        sentTo: targetEmail,
      });
    }

    // Action 2: Retry Failed Email
    if (action === 'retry') {
      const emailId = body.emailId;
      if (!emailId) {
        return NextResponse.json({ error: 'Mungon emailId për ripërpjekje.' }, { status: 400 });
      }
      const retried = await EmailTransporter.retryFailedEmail(emailId);
      return NextResponse.json({ success: retried });
    }

    // Action 3: Inbound Email Analysis (Agent 10)
    if (action === 'analyze_inbound') {
      const { from = 'klient@shembull.com', subject = '', body: emailBody = '' } = body;
      const analysis = AdminNotificationAgent.analyzeInboundEmail({
        from,
        subject,
        body: emailBody,
      });
      return NextResponse.json({ success: true, analysis });
    }

    // Fallback: Legacy test send
    const { templateType = 'admin_test_email', to = AdminNotificationAgent.ADMIN_EMAIL } = body;
    let res;
    if (templateType === 'admin_test_email') {
      res = await EmailService.sendAdminTestEmail(to);
    } else if (templateType === 'payment_success') {
      res = await EmailService.sendPaymentSuccessEmail({
        to,
        paymentId: 'pay_test_700',
        propertyTitle: 'Banesë në Prishtinë',
        amount: '0.00',
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
    } else {
      res = await EmailService.sendWelcomeEmail(to, 'Përdorues i Nderuar');
    }

    return NextResponse.json({ success: true, result: res });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
