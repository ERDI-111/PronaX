export type EmailTemplateType =
  // Standard user templates
  | 'welcome'
  | 'email_verification'
  | 'password_reset'
  | 'payment_success'
  | 'listing_published'
  | 'listing_rejected'
  | 'expiring_3d'
  | 'expiring_1d'
  | 'expired'
  | 'renewed'
  | 'new_message'
  | 'saved_search_match'
  // Agent 9: Authentication & OTP Verification templates
  | 'registration_otp'
  | 'login_otp'
  | 'password_reset_otp'
  | 'email_verify_otp'
  | 'security_alert'
  // Agent 10: Email Management & Admin Notification templates
  | 'admin_contact_form'
  | 'admin_support_request'
  | 'admin_new_property'
  | 'admin_payment_event'
  | 'admin_security_alert'
  | 'admin_platform_digest'
  | 'admin_test_email';

export type EmailProviderType = 'microsoft_graph' | 'smtp' | 'resend' | 'simulated';

export type EmailPriority = 'critical' | 'high' | 'normal';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  templateType: EmailTemplateType;
  priority?: EmailPriority;
  idempotencyKey?: string;
  metadata?: Record<string, any>;
}

export interface EmailDeliveryResult {
  success: boolean;
  messageId?: string;
  provider?: EmailProviderType;
  simulated: boolean;
  error?: string;
  timestamp: string;
}

export interface LoggedEmail {
  id: string;
  to: string;
  subject: string;
  templateType: EmailTemplateType;
  html: string;
  sentAt: string;
  simulated: boolean;
  provider: EmailProviderType;
  status: 'delivered' | 'simulated' | 'failed' | 'queued';
  error?: string;
  retryCount?: number;
}

export interface AdminNotificationPreferences {
  contactForms: boolean;
  supportRequests: boolean;
  newProperties: boolean;
  payments: boolean;
  securityAlerts: boolean;
  propertyExpirations: boolean;
}

export interface EmailQueueItem {
  id: string;
  payload: EmailPayload;
  status: 'queued' | 'delivered' | 'failed' | 'simulated';
  attempts: number;
  maxAttempts: number;
  nextRetryAt: number;
  createdAt: string;
  updatedAt: string;
  lastError?: string;
}
