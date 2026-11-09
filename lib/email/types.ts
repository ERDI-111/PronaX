export type EmailTemplateType =
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
  | 'saved_search_match';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  templateType: EmailTemplateType;
  metadata?: Record<string, any>;
}

export interface EmailDeliveryResult {
  success: boolean;
  messageId?: string;
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
  status: 'delivered' | 'simulated' | 'failed';
}
