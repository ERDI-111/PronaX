import crypto from 'crypto';
import { PaymentAdapterFactory } from './factory';
import { PaymentStore } from './store';
import { 
  PaymentPurpose, 
  PaymentRecord, 
  PaymentSessionResult, 
  FinancialReport,
  PropertySummary 
} from './types';

export class PaymentService {
  // Constant fixed price: 7.00 EUR (700 cents)
  static readonly LISTING_FEE_CENTS = 700;
  static readonly LISTING_DURATION_DAYS = 30;

  /**
   * Initiates payment for a property (new publication or manual renewal).
   * Enforces server-side 7.00 EUR fee and property status verification.
   */
  static async initiatePayment(params: {
    propertyId: string;
    userId: string;
    userEmail: string;
    userName?: string;
    purpose?: PaymentPurpose;
    preferredProvider?: string;
    originUrl?: string;
  }): Promise<PaymentSessionResult> {
    const { propertyId, userId, userEmail, userName, purpose = 'new_listing', preferredProvider } = params;
    
    // 1. Verify property existence and eligibility
    const property = await PaymentStore.getProperty(propertyId);
    if (!property) {
      throw new Error(`Prona me ID "${propertyId}" nuk u gjet.`);
    }

    if (purpose === 'new_listing') {
      if (property.status !== 'pending_payment' && property.status !== 'draft') {
        throw new Error(`Prona nuk është në pritje të pagesës. Statusi aktual: ${property.status}`);
      }
    } else if (purpose === 'renewal') {
      // Must be expired or nearing expiration
      if (property.status !== 'expired' && property.status !== 'published') {
        throw new Error(`Kjo pronë nuk plotëson kriteret për rinovim. Statusi: ${property.status}`);
      }
    }

    // 2. Select Payment Adapter
    const adapter = PaymentAdapterFactory.getAdapter(preferredProvider);
    const paymentId = `pay_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const idempotencyKey = `idemp_${propertyId}_${purpose}_${Date.now()}`;

    const baseUrl = params.originUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/pagesa/sukses?paymentId=${paymentId}&propertyId=${propertyId}`;
    const cancelUrl = `${baseUrl}/pagesa/deshtuar?paymentId=${paymentId}&propertyId=${propertyId}`;
    const callbackUrl = `${baseUrl}/api/payments/webhook/${adapter.name}`;

    // 3. Save pending payment record in database
    const paymentRecord: PaymentRecord = {
      id: paymentId,
      property_id: propertyId,
      user_id: userId,
      amount_cents: this.LISTING_FEE_CENTS, // 700 cents = 7.00 EUR
      currency: 'EUR',
      purpose,
      provider: adapter.name,
      status: 'pending',
      payment_method: 'card',
      idempotency_key: idempotencyKey,
      metadata: {
        propertyTitle: property.title,
        propertyType: property.property_type,
        municipality: property.municipality_id,
        userEmail,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await PaymentStore.createPayment(paymentRecord);

    // 4. Audit Log
    await PaymentStore.recordEvent({
      payment_id: paymentId,
      event_type: 'payment_initiated',
      provider: adapter.name,
      raw_payload: {
        propertyId,
        purpose,
        amountCents: this.LISTING_FEE_CENTS,
        adapterName: adapter.name,
      },
    });

    // 5. Create session via chosen provider adapter
    const session = await adapter.createSession({
      paymentId,
      propertyId,
      propertyTitle: property.title,
      userId,
      userEmail,
      userName,
      amountCents: this.LISTING_FEE_CENTS,
      currency: 'EUR',
      purpose,
      returnUrl,
      cancelUrl,
      callbackUrl,
    });

    return session;
  }

  /**
   * Secure Webhook Handler
   * Validates cryptographic signature, idempotency, updates payment state,
   * activates property publication or performs manual 30-day renewal.
   */
  static async handleWebhook(
    providerName: string, 
    headers: Headers, 
    rawBody: any, 
    clientIp?: string
  ): Promise<{ success: boolean; message: string; paymentId?: string }> {
    const adapter = PaymentAdapterFactory.getAdapter(providerName);

    // 1. Audit incoming webhook raw payload
    await PaymentStore.recordEvent({
      payment_id: rawBody?.paymentId || rawBody?.orderid || rawBody?.oid || null,
      event_type: 'webhook_received',
      provider: providerName,
      raw_payload: rawBody,
      ip_address: clientIp,
    });

    // 2. Verify signature & payload via Adapter
    const verification = await adapter.verifyWebhook(headers, rawBody);
    if (!verification.isValid) {
      await PaymentStore.recordEvent({
        payment_id: verification.paymentId,
        event_type: 'webhook_verification_failed',
        provider: providerName,
        raw_payload: { error: verification.errorMessage },
      });
      return { 
        success: false, 
        message: verification.errorMessage || 'Verifikimi i nënshkrimit të pagesës dështoi.' 
      };
    }

    // 3. Fetch payment record
    const payment = await PaymentStore.getPayment(verification.paymentId);
    if (!payment) {
      return { 
        success: false, 
        message: `Transaksioni me ID "${verification.paymentId}" nuk ekziston në sistem.` 
      };
    }

    // 4. Idempotency Check: Prevent duplicate processing if already successful
    if (payment.status === 'successful') {
      return { 
        success: true, 
        message: 'Transaksioni tashmë është procesuar më parë me sukses (Idempotent).',
        paymentId: payment.id,
      };
    }

    // 5. Update payment status
    await PaymentStore.updatePayment(payment.id, {
      status: verification.status,
      provider_transaction_id: verification.providerTransactionId,
      provider_fee_cents: verification.providerFeeCents || 0,
      updated_at: new Date().toISOString(),
    });

    // 6. If payment is successful, execute business lifecycle
    if (verification.status === 'successful') {
      const property = await PaymentStore.getProperty(payment.property_id);
      if (!property) {
        throw new Error(`Prona e lidhur me pagesën nuk ekziston: ${payment.property_id}`);
      }

      // Check moderation setting (Default: true for platform safety)
      const requireModeration = process.env.REQUIRE_ADMIN_MODERATION !== 'false';
      const now = new Date();
      const expirationDate = new Date(now.getTime() + this.LISTING_DURATION_DAYS * 24 * 60 * 60 * 1000);

      if (payment.purpose === 'new_listing') {
        const nextStatus = requireModeration ? 'pending_moderation' : 'published';
        
        await PaymentStore.updatePropertyStatus(property.id, nextStatus, {
          published_at: requireModeration ? undefined : now.toISOString(),
          expires_at: requireModeration ? undefined : expirationDate.toISOString(),
        });

        await PaymentStore.recordEvent({
          payment_id: payment.id,
          event_type: 'listing_activated_after_payment',
          provider: providerName,
          raw_payload: {
            newStatus: nextStatus,
            publishedAt: now.toISOString(),
            expiresAt: expirationDate.toISOString(),
            requireModeration,
          },
        });
      } else if (payment.purpose === 'renewal') {
        // Manual 30-day renewal
        const prevExpires = property.expires_at ? new Date(property.expires_at) : now;
        // If already expired, start 30 days from now; if still active, extend by 30 days
        const baseDate = prevExpires > now ? prevExpires : now;
        const newExpires = new Date(baseDate.getTime() + this.LISTING_DURATION_DAYS * 24 * 60 * 60 * 1000);

        await PaymentStore.updatePropertyStatus(property.id, 'published', {
          expires_at: newExpires.toISOString(),
          incrementRenewal: true,
        });

        await PaymentStore.recordRenewal({
          property_id: property.id,
          payment_id: payment.id,
          previous_expires_at: property.expires_at,
          new_expires_at: newExpires.toISOString(),
        });

        await PaymentStore.recordEvent({
          payment_id: payment.id,
          event_type: 'listing_renewed_30_days',
          provider: providerName,
          raw_payload: {
            previousExpiresAt: property.expires_at,
            newExpiresAt: newExpires.toISOString(),
          },
        });
      }
    }

    return { 
      success: true, 
      message: `Pagesa u procesua me sukses. Statusi: ${verification.status}`,
      paymentId: payment.id,
    };
  }

  /**
   * Verifies payment status for client redirect return page.
   */
  static async verifyPaymentForClient(paymentId: string) {
    const payment = await PaymentStore.getPayment(paymentId);
    if (!payment) return null;

    const property = await PaymentStore.getProperty(payment.property_id);

    return {
      payment,
      property,
    };
  }

  /**
   * Generates financial metrics for Admin Dashboard.
   * Displays gross revenue, provider fees, and estimated net settlements.
   * Clarifies that gross ≠ immediate bank balance.
   */
  static async getFinancialReport(): Promise<FinancialReport> {
    const allPayments = await PaymentStore.listAllPayments();

    let totalGrossCents = 0;
    let estimatedFeesCents = 0;
    let totalSuccessful = 0;
    let totalFailed = 0;
    let totalPending = 0;
    let totalRefunded = 0;

    for (const p of allPayments) {
      if (p.status === 'successful') {
        totalGrossCents += p.amount_cents;
        estimatedFeesCents += p.provider_fee_cents || 0;
        totalSuccessful++;
      } else if (p.status === 'failed' || p.status === 'cancelled') {
        totalFailed++;
      } else if (p.status === 'pending' || p.status === 'processing') {
        totalPending++;
      } else if (p.status === 'refunded') {
        totalRefunded++;
      }
    }

    const estimatedNetCents = Math.max(0, totalGrossCents - estimatedFeesCents);

    return {
      totalGrossCents,
      estimatedFeesCents,
      estimatedNetCents,
      totalSuccessfulTransactions: totalSuccessful,
      totalFailedTransactions: totalFailed,
      totalPendingTransactions: totalPending,
      totalRefundedTransactions: totalRefunded,
      currency: 'EUR',
      disclaimer: 'Vërejtje financiare: Shumat bruto paraqesin pagesat e autorizuara të suksesshme në portal. Zbritjet e komisioneve të ofruesit (Paysera / Bank Virtual POS) dhe periudha e kleringut bankar (T+1 ose T+2 ditë pune) përcaktojnë transferin përfundimtar në llogarinë rrjedhëse.',
    };
  }
}
