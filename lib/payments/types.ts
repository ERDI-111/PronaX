export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'successful'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export type PaymentPurpose = 'new_listing' | 'renewal';

export type PaymentProvider = 'paysera' | 'procredit_pos' | 'nlb_pos' | 'sandbox' | 'free_plan';

export interface PaymentRecord {
  id: string;
  property_id: string;
  user_id: string;
  amount_cents: number; // 0 for Free, 299 for Weekly (2.99 €), 999 for Monthly (9.99 €)
  currency: string;     // 'EUR'
  purpose: PaymentPurpose;
  provider: PaymentProvider;
  plan_id?: 'free' | 'weekly' | 'monthly';
  duration_days?: number;
  provider_transaction_id?: string | null;
  provider_fee_cents?: number | null;
  status: PaymentStatus;
  payment_method: string;
  idempotency_key: string;
  metadata?: Record<string, any>;
  error_message?: string | null;
  refund_reason?: string | null;
  refunded_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentEventRecord {
  id: string;
  payment_id?: string | null;
  event_type: string;
  provider: string;
  raw_payload: any;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

export interface ListingRenewalRecord {
  id: string;
  property_id: string;
  payment_id: string;
  previous_expires_at?: string | null;
  new_expires_at: string;
  created_at: string;
}

export interface PropertySummary {
  id: string;
  title: string;
  slug?: string;
  price: number;
  currency: string;
  property_type: string;
  listing_type: string; // 'shitje' | 'qira'
  municipality_id: string;
  settlement_id?: string;
  address?: string;
  status: 'draft' | 'pending_payment' | 'pending_moderation' | 'published' | 'expired' | 'rejected' | 'archived';
  published_at?: string | null;
  expires_at?: string | null;
  expiration_warning_3d_sent_at?: string | null;
  expiration_warning_1d_sent_at?: string | null;
  expired_notification_sent_at?: string | null;
  renewal_count: number;
  owner_id: string;
}

export interface CreatePaymentSessionParams {
  paymentId: string;
  propertyId: string;
  propertyTitle: string;
  userId: string;
  userEmail: string;
  userName?: string;
  amountCents: number; // 299 for 2.99 EUR or 999 for 9.99 EUR
  currency: string;    // Must be EUR
  planId?: 'free' | 'weekly' | 'monthly';
  durationDays?: number;
  purpose: PaymentPurpose;
  returnUrl: string;
  cancelUrl: string;
  callbackUrl: string;
}

export interface PaymentSessionResult {
  paymentId: string;
  checkoutUrl: string;
  providerTransactionId?: string;
  metadata?: Record<string, any>;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  paymentId: string;
  providerTransactionId?: string;
  status: PaymentStatus;
  amountCents: number;
  currency: string;
  providerFeeCents?: number;
  rawPayload: any;
  errorMessage?: string;
}

export interface PaymentAdapter {
  name: PaymentProvider;
  createSession(params: CreatePaymentSessionParams): Promise<PaymentSessionResult>;
  verifyWebhook(headers: Headers, body: any): Promise<WebhookVerificationResult>;
  refund?(transactionId: string, amountCents: number, reason?: string): Promise<{ success: boolean; error?: string }>;
}

export interface FinancialReport {
  totalGrossCents: number;
  estimatedFeesCents: number;
  estimatedNetCents: number;
  totalSuccessfulTransactions: number;
  totalFailedTransactions: number;
  totalPendingTransactions: number;
  totalRefundedTransactions: number;
  currency: string;
  disclaimer: string;
}
