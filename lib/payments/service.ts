import crypto from 'crypto';
import { PaymentAdapterFactory } from './factory';
import { PaymentStore } from './store';
import { 
  PricingPlanId, 
  PRONAX_PRICING_PLANS, 
  getPlanById 
} from './plans';
import { 
  PaymentPurpose, 
  PaymentRecord, 
  PaymentSessionResult, 
  FinancialReport,
  PropertySummary 
} from './types';

export class PaymentService {
  static readonly LISTING_DURATION_DAYS = 30;
  static readonly LISTING_FEE_CENTS = 999;

  /**
   * Initiates payment or direct activation for a property (new publication or manual renewal).
   * Supports 3 distinct plans:
   * 1. Free: 0 € for 3 days (no payment gateway, direct activation/moderation)
   * 2. Weekly: 2.99 € for 7 days (one-time card payment)
   * 3. Monthly: 9.99 € for 30 days (one-time card payment)
   */
  static async initiatePayment(params: {
    propertyId: string;
    userId: string;
    userEmail: string;
    userName?: string;
    planId?: PricingPlanId;
    purpose?: PaymentPurpose;
    preferredProvider?: string;
    originUrl?: string;
  }): Promise<PaymentSessionResult> {
    const { 
      propertyId, 
      userId, 
      userEmail, 
      userName, 
      planId = 'monthly',
      purpose = 'new_listing', 
      preferredProvider 
    } = params;
    
    // Selected Plan configuration
    const plan = getPlanById(planId);

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

    const paymentId = `pay_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const idempotencyKey = `idemp_${propertyId}_${purpose}_${plan.id}_${Date.now()}`;
    const baseUrl = params.originUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/pagesa/sukses?paymentId=${paymentId}&propertyId=${propertyId}&plan=${plan.id}`;
    const cancelUrl = `${baseUrl}/pagesa/deshtuar?paymentId=${paymentId}&propertyId=${propertyId}`;

    // --- CASE A: FREE PLAN (3 DAYS - NO PAYMENT GATEWAY) ---
    if (plan.priceCents === 0) {
      const now = new Date();
      const expirationDate = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
      const requireModeration = process.env.REQUIRE_ADMIN_MODERATION !== 'false';
      const nextStatus = requireModeration ? 'pending_moderation' : 'published';

      const freePaymentRecord: PaymentRecord = {
        id: paymentId,
        property_id: propertyId,
        user_id: userId,
        amount_cents: 0,
        currency: 'EUR',
        purpose,
        provider: 'free_plan',
        plan_id: 'free',
        duration_days: plan.durationDays,
        status: 'successful',
        payment_method: 'free_tier',
        idempotency_key: idempotencyKey,
        metadata: {
          propertyTitle: property.title,
          propertyType: property.property_type,
          municipality: property.municipality_id,
          userEmail,
          planName: plan.name,
          durationDays: plan.durationDays,
        },
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };

      await PaymentStore.createPayment(freePaymentRecord);

      // Update property publication lifecycle
      if (purpose === 'new_listing') {
        await PaymentStore.updatePropertyStatus(property.id, nextStatus, {
          published_at: requireModeration ? undefined : now.toISOString(),
          expires_at: requireModeration ? undefined : expirationDate.toISOString(),
        });
      } else {
        // Free Renewal: extends by 3 days
        const prevExpires = property.expires_at ? new Date(property.expires_at) : now;
        const baseDate = prevExpires > now ? prevExpires : now;
        const newExpires = new Date(baseDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

        await PaymentStore.updatePropertyStatus(property.id, 'published', {
          expires_at: newExpires.toISOString(),
          incrementRenewal: true,
        });

        await PaymentStore.recordRenewal({
          property_id: property.id,
          payment_id: paymentId,
          previous_expires_at: property.expires_at,
          new_expires_at: newExpires.toISOString(),
        });
      }

      await PaymentStore.recordEvent({
        payment_id: paymentId,
        event_type: 'free_plan_activated',
        provider: 'free_plan',
        raw_payload: {
          propertyId,
          planId: plan.id,
          durationDays: plan.durationDays,
          expiresAt: expirationDate.toISOString(),
          status: nextStatus,
        },
      });

      return {
        paymentId,
        checkoutUrl: returnUrl,
        metadata: { isFree: true, planId: plan.id, durationDays: plan.durationDays },
      };
    }

    // --- CASE B: PAID PLANS (WEEKLY 2.99 € OR MONTHLY 9.99 €) ---
    const adapter = PaymentAdapterFactory.getAdapter(preferredProvider);
    const callbackUrl = `${baseUrl}/api/payments/webhook/${adapter.name}`;

    const paymentRecord: PaymentRecord = {
      id: paymentId,
      property_id: propertyId,
      user_id: userId,
      amount_cents: plan.priceCents,
      currency: 'EUR',
      purpose,
      provider: adapter.name,
      plan_id: plan.id,
      duration_days: plan.durationDays,
      status: 'pending',
      payment_method: 'card',
      idempotency_key: idempotencyKey,
      metadata: {
        propertyTitle: property.title,
        propertyType: property.property_type,
        municipality: property.municipality_id,
        userEmail,
        planId: plan.id,
        planName: plan.name,
        durationDays: plan.durationDays,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await PaymentStore.createPayment(paymentRecord);

    await PaymentStore.recordEvent({
      payment_id: paymentId,
      event_type: 'payment_initiated',
      provider: adapter.name,
      raw_payload: {
        propertyId,
        purpose,
        planId: plan.id,
        amountCents: plan.priceCents,
        durationDays: plan.durationDays,
        adapterName: adapter.name,
      },
    });

    const session = await adapter.createSession({
      paymentId,
      propertyId,
      propertyTitle: property.title,
      userId,
      userEmail,
      userName,
      amountCents: plan.priceCents,
      currency: 'EUR',
      purpose,
      planId: plan.id,
      durationDays: plan.durationDays,
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

      // Determine duration days from selected plan (Free: 3 days, Weekly: 7 days, Monthly: 30 days)
      const durationDays = payment.duration_days || 
        (payment.amount_cents === 299 ? 7 : (payment.amount_cents === 0 ? 3 : 30));
      const expirationDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

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
            planDurationDays: durationDays,
            publishedAt: now.toISOString(),
            expiresAt: expirationDate.toISOString(),
            requireModeration,
          },
        });
      } else if (payment.purpose === 'renewal') {
        // Manual renewal based on plan duration
        const prevExpires = property.expires_at ? new Date(property.expires_at) : now;
        // If already expired, start from now; if still active, extend by plan duration days
        const baseDate = prevExpires > now ? prevExpires : now;
        const newExpires = new Date(baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

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
          event_type: 'listing_renewed_plan',
          provider: providerName,
          raw_payload: {
            planDurationDays: durationDays,
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
