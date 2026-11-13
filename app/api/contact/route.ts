import { NextRequest, NextResponse } from 'next/server';
import { SecuritySanitizer } from '@/lib/security/sanitize';
import { RateLimiter } from '@/lib/security/rate-limiter';
import { MessageStore } from '@/lib/messages/store';
import { EmailService } from '@/lib/email/service';

const ADMIN_EMAIL = 'pronaxestate@outlook.com';

export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

    // Rate Limiting Protection (Max 10 messages per minute per IP)
    const rateCheck = RateLimiter.check(`contact:${clientIp}`, 10, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Shumë mesazhe të dërguara. Ju lutem prisni ${rateCheck.resetInSeconds} sekonda para se të provoni sërish.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, phone, subject, message, propertyId, propertyTitle, recipientEmail } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Emri, email-i dhe mesazhi janë fusha të detyrueshme.' },
        { status: 400 }
      );
    }

    const cleanName = SecuritySanitizer.sanitizeString(name);
    const cleanEmail = SecuritySanitizer.sanitizeString(email);
    const cleanPhone = phone ? SecuritySanitizer.sanitizeString(phone) : '';
    const cleanSubject = subject ? SecuritySanitizer.sanitizeString(subject) : (propertyTitle ? `Pyetje për pronën: ${propertyTitle}` : 'Mesazh i ri nga forma e kontaktit');
    const cleanMessage = SecuritySanitizer.sanitizeString(message);
    const cleanPropertyId = propertyId ? SecuritySanitizer.sanitizeString(propertyId) : undefined;
    const cleanPropertyTitle = propertyTitle ? SecuritySanitizer.sanitizeString(propertyTitle) : undefined;
    const targetRecipient = recipientEmail ? SecuritySanitizer.sanitizeString(recipientEmail) : ADMIN_EMAIL;

    // 1. Store message in Database / MessageStore
    const savedRecord = await MessageStore.addMessage({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      subject: cleanSubject,
      message: cleanMessage,
      property_id: cleanPropertyId,
      property_title: cleanPropertyTitle,
      recipient_email: targetRecipient,
    });

    // 2. Send Email Notification to Admin (pronaxestate@outlook.com)
    try {
      await EmailService.sendNewMessageEmail({
        to: ADMIN_EMAIL,
        propertyTitle: cleanPropertyTitle || cleanSubject,
        senderName: `${cleanName} (${cleanEmail}${cleanPhone ? `, Tel: ${cleanPhone}` : ''})`,
        messagePreview: cleanMessage,
      });

      // If this is an inquiry for a property owner different from admin, also send to owner
      if (targetRecipient && targetRecipient !== ADMIN_EMAIL) {
        await EmailService.sendNewMessageEmail({
          to: targetRecipient,
          propertyTitle: cleanPropertyTitle || 'Prona juaj në PronaX',
          senderName: `${cleanName} (${cleanEmail})`,
          messagePreview: cleanMessage,
        });
      }
    } catch (emailErr) {
      console.warn('Email delivery failed or in preview mode:', emailErr);
    }

    return NextResponse.json({
      success: true,
      messageId: savedRecord.id,
      message: 'Mesazhi juaj u dërgua me sukses! Do t\'ju kontaktojmë së shpejti.',
    });
  } catch (error: any) {
    console.error('Gabim gjatë dërgimit të mesazhit:', error);
    return NextResponse.json(
      { error: error?.message || 'Ndodhi një gabim gjatë dërgimit të mesazhit.' },
      { status: 500 }
    );
  }
}
