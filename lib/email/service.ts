import { EmailPayload, EmailDeliveryResult, LoggedEmail } from './types';
import { EmailTemplateRenderer } from './templates';
import { EmailTransporter } from './transporter';

export class EmailService {
  public static readonly SENDER = EmailTransporter.DEFAULT_SENDER;
  public static readonly ADMIN_EMAIL = EmailTransporter.ADMIN_EMAIL;

  /**
   * Sends an email via the active transporter (Microsoft Graph, SMTP, Resend, or Simulation).
   */
  static async sendEmail(payload: EmailPayload): Promise<EmailDeliveryResult> {
    return EmailTransporter.send(payload);
  }

  // ==============================================================================
  // AGENT 9: AUTHENTICATION, 2FA AND EMAIL VERIFICATION METHODS
  // ==============================================================================

  static async sendRegistrationOtp(to: string, code: string, lang: 'sq' | 'en' = 'sq') {
    const { subject, html } = EmailTemplateRenderer.render('registration_otp', { code, language: lang });
    return this.sendEmail({ to, subject, html, templateType: 'registration_otp', priority: 'critical' });
  }

  static async sendLoginOtp(to: string, code: string, lang: 'sq' | 'en' = 'sq', metadata?: Record<string, any>) {
    const { subject, html } = EmailTemplateRenderer.render('login_otp', { code, language: lang, ...metadata });
    return this.sendEmail({ to, subject, html, templateType: 'login_otp', priority: 'critical' });
  }

  static async sendPasswordResetOtp(to: string, code: string, lang: 'sq' | 'en' = 'sq') {
    const { subject, html } = EmailTemplateRenderer.render('password_reset_otp', { code, language: lang });
    return this.sendEmail({ to, subject, html, templateType: 'password_reset_otp', priority: 'critical' });
  }

  static async sendEmailVerifyOtp(to: string, code: string, lang: 'sq' | 'en' = 'sq') {
    const { subject, html } = EmailTemplateRenderer.render('email_verify_otp', { code, language: lang });
    return this.sendEmail({ to, subject, html, templateType: 'email_verify_otp', priority: 'critical' });
  }

  static async sendSecurityAlert(to: string, details: Record<string, any>, lang: 'sq' | 'en' = 'sq') {
    const { subject, html } = EmailTemplateRenderer.render('security_alert', { ...details, language: lang });
    return this.sendEmail({ to, subject, html, templateType: 'security_alert', priority: 'high' });
  }

  // ==============================================================================
  // AGENT 10: EMAIL MANAGEMENT AND ADMIN NOTIFICATION METHODS (pronaxestate@outlook.com)
  // ==============================================================================

  static async sendAdminContactNotification(data: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    propertyId?: string;
    propertyTitle?: string;
  }) {
    const { subject, html } = EmailTemplateRenderer.render('admin_contact_form', {
      ...data,
      timestamp: new Date().toLocaleString('sq-AL'),
    });
    return this.sendEmail({
      to: this.ADMIN_EMAIL,
      subject,
      html,
      templateType: 'admin_contact_form',
      priority: 'high',
      idempotencyKey: `contact-${data.email}-${Date.now().toString().slice(0, 8)}`,
    });
  }

  static async sendAdminSupportNotification(data: {
    name: string;
    email: string;
    category: string;
    request: string;
    urgency?: string;
    referenceId?: string;
  }) {
    const ref = data.referenceId || `REF-${Date.now().toString().slice(-6)}`;
    const { subject, html } = EmailTemplateRenderer.render('admin_support_request', {
      ...data,
      referenceId: ref,
      timestamp: new Date().toLocaleString('sq-AL'),
    });
    return this.sendEmail({
      to: this.ADMIN_EMAIL,
      subject,
      html,
      templateType: 'admin_support_request',
      priority: 'high',
      idempotencyKey: `support-${ref}`,
    });
  }

  static async sendAdminNewPropertyNotification(data: {
    title: string;
    category: string;
    municipality: string;
    price: number;
    ownerEmail: string;
    ownerPhone?: string;
    planId: string;
    planName?: string;
    listingType?: string;
    requiresModeration?: boolean;
    propertyId?: string;
  }) {
    const { subject, html } = EmailTemplateRenderer.render('admin_new_property', {
      ...data,
      timestamp: new Date().toLocaleString('sq-AL'),
    });
    return this.sendEmail({
      to: this.ADMIN_EMAIL,
      subject,
      html,
      templateType: 'admin_new_property',
      priority: 'high',
      idempotencyKey: `new-prop-${data.propertyId || data.title}`,
    });
  }

  static async sendAdminPaymentNotification(data: {
    paymentId: string;
    amount: string;
    currency?: string;
    plan: string;
    planName?: string;
    durationDays?: number;
    propertyTitle?: string;
    propertyId?: string;
    userEmail?: string;
    provider?: string;
    status: string;
  }) {
    const { subject, html } = EmailTemplateRenderer.render('admin_payment_event', {
      ...data,
      timestamp: new Date().toLocaleString('sq-AL'),
    });
    return this.sendEmail({
      to: this.ADMIN_EMAIL,
      subject,
      html,
      templateType: 'admin_payment_event',
      priority: 'high',
      idempotencyKey: `pay-${data.paymentId}-${data.status}`,
    });
  }

  static async sendAdminSecurityAlert(data: {
    title: string;
    severity?: string;
    details: string;
    affectedEmail?: string;
    ip?: string;
  }) {
    const { subject, html } = EmailTemplateRenderer.render('admin_security_alert', {
      ...data,
      timestamp: new Date().toLocaleString('sq-AL'),
    });
    return this.sendEmail({
      to: this.ADMIN_EMAIL,
      subject,
      html,
      templateType: 'admin_security_alert',
      priority: 'critical',
    });
  }

  static async sendAdminTestEmail(adminEmail: string = this.ADMIN_EMAIL) {
    const provider = EmailTransporter.getActiveProvider();
    const { subject, html } = EmailTemplateRenderer.render('admin_test_email', {
      adminEmail,
      provider,
    });
    return this.sendEmail({
      to: adminEmail,
      subject,
      html,
      templateType: 'admin_test_email',
      priority: 'high',
    });
  }

  // ==============================================================================
  // USER NOTIFICATIONS (EXISTING PLATFORM LIFECYCLE)
  // ==============================================================================

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
    isUrgent: boolean;
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
    return EmailTransporter.getLogs();
  }
}
