import crypto from 'crypto';
import { 
  PaymentAdapter, 
  PaymentProvider, 
  CreatePaymentSessionParams, 
  PaymentSessionResult, 
  WebhookVerificationResult 
} from '../types';

/**
 * PronaX Sandbox Payment Adapter
 * High-fidelity local & staging test gateway.
 * Allows complete end-to-end testing of checkout, webhook signature verification,
 * idempotency, 30-day listing activation, and manual renewals without an active merchant contract.
 */
export class SandboxPaymentAdapter implements PaymentAdapter {
  name: PaymentProvider = 'sandbox';
  private webhookSecret: string;

  constructor() {
    this.webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || 'pronax_sandbox_secret_2026';
  }

  generateSignature(payload: string): string {
    return crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');
  }

  async createSession(params: CreatePaymentSessionParams): Promise<PaymentSessionResult> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Generates simulated checkout gateway URL
    const checkoutUrl = `${appUrl}/pagesa/sandbox-checkout?paymentId=${params.paymentId}&amount=${params.amountCents}&currency=${params.currency}&propertyId=${params.propertyId}&purpose=${params.purpose}`;

    return {
      paymentId: params.paymentId,
      checkoutUrl,
      providerTransactionId: `SANDBOX-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      metadata: {
        isSandbox: true,
        testCardVisa: '4000 0000 0000 0001',
        testCardMastercard: '5100 0000 0000 0001',
        purpose: params.purpose,
      },
    };
  }

  async verifyWebhook(headers: Headers, body: any): Promise<WebhookVerificationResult> {
    const signature = headers.get('x-pronax-signature') || headers.get('x-signature');
    const paymentId = body?.paymentId;
    const amountCents = body?.amountCents || 0;
    const currency = body?.currency || 'EUR';
    const status = body?.status || 'failed';
    const providerTransactionId = body?.providerTransactionId || `SANDBOX-TX-${Date.now()}`;

    // Verify HMAC signature
    const stringifiedPayload = typeof body === 'string' ? body : JSON.stringify(body);
    const expectedSignature = this.generateSignature(stringifiedPayload);

    if (signature && signature !== expectedSignature) {
      return {
        isValid: false,
        paymentId: paymentId || '',
        status: 'failed',
        amountCents,
        currency,
        rawPayload: body,
        errorMessage: 'Nënshkrimi HMAC i sandbox nuk është i vlefshëm.',
      };
    }

    // Strict validation: Amount must be exactly 700 cents (7.00 EUR)
    if (amountCents !== 700 || currency !== 'EUR') {
      return {
        isValid: false,
        paymentId: paymentId || '',
        status: 'failed',
        amountCents,
        currency,
        rawPayload: body,
        errorMessage: `Shuma e pavlefshme: ${amountCents} cent. Kërkohet saktësisht 700 EUR cents (7.00 €).`,
      };
    }

    return {
      isValid: true,
      paymentId,
      providerTransactionId,
      status: status === 'successful' ? 'successful' : (status === 'cancelled' ? 'cancelled' : 'failed'),
      amountCents,
      currency,
      providerFeeCents: 15, // Simulated 0.15 EUR fee
      rawPayload: body,
    };
  }

  async refund(transactionId: string, amountCents: number, reason?: string) {
    return {
      success: true,
    };
  }
}
