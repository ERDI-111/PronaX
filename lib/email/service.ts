import { EmailPayload, EmailDeliveryResult, LoggedEmail, EmailTemplateType } from './types';
import { EmailTemplateRenderer } from './templates';
import { PaymentStore } from '../payments/store';

// In-memory logged emails store for development & admin preview
const loggedEmails: LoggedEmail[] = [];

export class EmailService {
  private static readonly RESEND_API_URL = 'https://api.resend.com/emails';
  private static readonly SENDER = process.env.EMAIL_FROM || 'PronaX Kosovë <njoftime@pronax-ks.com>';
  private static readonly ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'pronaxestate@gmail.com';

  /**
   * Sends an email via Resend or logs it in simulation mode.
   */
  static async sendEmail(payload: EmailPayload): Promise<EmailDeliveryResult> {
    const apiKey = process.env.RESEND_API_KEY;
    const now = new Date().toISOString();

    // 1. If Resend API Key is configured, make real API request
    if (apiKey && apiKey.startsWith('re_')) {
      try {
        const response = await fetch(this.RESEND_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            from: this.SENDER,
            to: payload.to,
            subject: payload.subject,
            html: payload.html,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Dështoi dërgimi i email-it përmes Resend.');
        }

        const logRecord: LoggedEmail = {
          id: data.id || `msg_${Date.now()}`,
          to: payload.to,
          subject: payload.subject,
          templateType: payload.templateType,
          html: payload.html,
          sentAt: now,
          simulated: false,
          status: 'delivered',
        };
        loggedEmails.unshift(logRecord);

        return {
          success: true,
          messageId: data.id,
          simulated: false,
          timestamp: now,
        };
      } catch (err: any) {
        console.error('Gabim gjatë dërgimit me Resend:', err);
        return {
          success: false,
          error: err.message,
          simulated: false,
          timestamp: now,
        };
      }
    }

    // 2. Simulation & Preview Mode (When Resend is not configured yet)
    // Logs the email with full HTML preview so developers & admins can inspect it immediately
    const simId = `sim_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const logRecord: LoggedEmail = {
      id: simId,
      to: payload.to,
      subject: payload.subject,
      templateType: payload.templateType,
      html: payload.html,
      sentAt: now,
      simulated: true,
      status: 'simulated',
    };
    loggedEmails.unshift(logRecord);

    await PaymentStore.recordEvent({
      payment_id: null,
      event_type: `email_${payload.templateType}_simulated`,
      provider: 'email_service',
      raw_payload: {
        to: payload.to,
        subject: payload.subject,
        simulated: true,
      },
    });

    return {
      success: true,
      messageId: simId,
      simulated: true,
      timestamp: now,
    };
  }

  // --- High-level trigger methods ---

  static async sendWelcomeEmail(to: string, name?: string) {
    const { subject, html } = EmailTemplateRenderer.render('welcome', { name });
    return this.sendEmail({ to, subject, html, templateType: 'welcome' });
  }

  static async sendVerificationEmail(to: string, verificationUrl: string) {
    const { subject, html } = EmailTemplateRenderer.render('email_verification', { verificationUrl });
    return this.sendEmail({ to, subject, html, templateType: 'email_verification' });
  }

  static async sendPasswordResetEmail(to: string, resetUrl: string) {
    const { subject, html } = EmailTemplateRenderer.render('password_reset', { resetUrl });
    return this.sendEmail({ to, subject, html, templateType: 'password_reset' });
  }

  static async sendPaymentSuccessEmail(params: {
    to: string;
    paymentId: string;
    propertyTitle: string;
    amount: string;
    purpose: 'new_listing' | 'renewal';
  }) {
    const { subject, html } = EmailTemplateRenderer.render('payment_success', params);
    return this.sendEmail({ to: params.to, subject, html, templateType: 'payment_success' });
  }

  static async sendListingPublishedEmail(params: {
    to: string;
    propertyTitle: string;
    publishedAt: string;
    expiresAt: string;
  }) {
    const { subject, html } = EmailTemplateRenderer.render('listing_published', params);
    return this.sendEmail({ to: params.to, subject, html, templateType: 'listing_published' });
  }

  static async sendListingRejectedEmail(params: {
    to: string;
    propertyTitle: string;
    reason: string;
  }) {
    const { subject, html } = EmailTemplateRenderer.render('listing_rejected', params);
    return this.sendEmail({ to: params.to, subject, html, templateType: 'listing_rejected' });
  }

  static async sendExpiringWarningEmail(params: {
    to: string;
    propertyId: string;
    propertyTitle: string;
    expiresAt: string;
    isUrgent: boolean; // true if 1 day, false if 3 days
  }) {
    const type = params.isUrgent ? 'expiring_1d' : 'expiring_3d';
    const { subject, html } = EmailTemplateRenderer.render(type, params);
    return this.sendEmail({ to: params.to, subject, html, templateType: type });
  }

  static async sendExpiredEmail(params: {
    to: string;
    propertyId: string;
    propertyTitle: string;
  }) {
    const { subject, html } = EmailTemplateRenderer.render('expired', params);
    return this.sendEmail({ to: params.to, subject, html, templateType: 'expired' });
  }

  static async sendRenewedEmail(params: {
    to: string;
    propertyTitle: string;
    newExpiresAt: string;
    renewalCount: number;
  }) {
    const { subject, html } = EmailTemplateRenderer.render('renewed', params);
    return this.sendEmail({ to: params.to, subject, html, templateType: 'renewed' });
  }

  static async sendNewMessageEmail(params: {
    to: string;
    propertyTitle: string;
    senderName: string;
    messagePreview: string;
  }) {
    const { subject, html } = EmailTemplateRenderer.render('new_message', params);
    return this.sendEmail({ to: params.to, subject, html, templateType: 'new_message' });
  }

  static async sendSavedSearchMatchEmail(params: {
    to: string;
    propertyId: string;
    propertySlug?: string;
    propertyTitle: string;
    price: number;
    propertyType: string;
    areaM2: number;
    municipality: string;
  }) {
    const { subject, html } = EmailTemplateRenderer.render('saved_search_match', params);
    return this.sendEmail({ to: params.to, subject, html, templateType: 'saved_search_match' });
  }

  static getLoggedEmails(): LoggedEmail[] {
    return loggedEmails;
  }
}
