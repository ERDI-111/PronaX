import crypto from 'crypto';
import { 
  PaymentAdapter, 
  PaymentProvider, 
  CreatePaymentSessionParams, 
  PaymentSessionResult, 
  WebhookVerificationResult 
} from '../types';

export class PayseraModernAdapter implements PaymentAdapter {
  name: PaymentProvider = 'paysera';

  private projectId: string;
  private projectPassword: string;
  private isTestMode: boolean;

  constructor() {
    this.projectId = process.env.PAYMENT_PROJECT_ID || process.env.PAYSERA_PROJECT_ID || '';
    this.projectPassword = process.env.PAYMENT_API_SECRET || process.env.PAYSERA_PROJECT_PASSWORD || '';
    this.isTestMode = process.env.NODE_ENV !== 'production' || process.env.PAYSERA_TEST_MODE === '1';
  }

  private encodeBase64Url(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  private decodeBase64Url(str: string): string {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return Buffer.from(base64, 'base64').toString('utf-8');
  }

  async createSession(params: CreatePaymentSessionParams): Promise<PaymentSessionResult> {
    if (!this.projectId || !this.projectPassword) {
      throw new Error('Konfigurimi i Paysera mungon: Ju lutem vendosni PAYMENT_PROJECT_ID dhe PAYMENT_API_SECRET në .env.');
    }

    // Build payload per Paysera specifications
    const payload = new URLSearchParams({
      projectid: this.projectId,
      orderid: params.paymentId,
      accepturl: params.returnUrl,
      cancelurl: params.cancelUrl,
      callbackurl: params.callbackUrl,
      amount: params.amountCents.toString(), // 700 cents = 7.00 EUR
      currency: params.currency,             // EUR
      payment: '',                           // Allow all card / direct methods
      test: this.isTestMode ? '1' : '0',
      version: '1.4',
      p_email: params.userEmail,
      p_firstname: params.userName || '',
      description: `Publikim/Rinovim i pronës në PronaX (${params.propertyTitle})`,
    });

    const data = this.encodeBase64Url(payload.toString());
    const sign = crypto
      .createHash('md5')
      .update(data + this.projectPassword)
      .digest('hex');

    const checkoutUrl = `https://bank.paysera.com/pay/?data=${encodeURIComponent(data)}&sign=${encodeURIComponent(sign)}`;

    return {
      paymentId: params.paymentId,
      checkoutUrl,
      providerTransactionId: undefined,
      metadata: {
        projectId: this.projectId,
        testMode: this.isTestMode,
      },
    };
  }

  async verifyWebhook(headers: Headers, body: any): Promise<WebhookVerificationResult> {
    if (!this.projectPassword) {
      return {
        isValid: false,
        paymentId: '',
        status: 'failed',
        amountCents: 0,
        currency: 'EUR',
        rawPayload: body,
        errorMessage: 'Sekreti i projektit Paysera mungon në server.',
      };
    }

    // Webhooks from Paysera can come as query params or x-www-form-urlencoded
    const data = body?.data || (typeof body === 'string' ? new URLSearchParams(body).get('data') : null);
    const ss1 = body?.ss1 || (typeof body === 'string' ? new URLSearchParams(body).get('ss1') : null);

    if (!data || !ss1) {
      return {
        isValid: false,
        paymentId: '',
        status: 'failed',
        amountCents: 0,
        currency: 'EUR',
        rawPayload: body,
        errorMessage: 'Të dhënat ose nënshkrimi mungojnë në njoftimin e Paysera.',
      };
    }

    // Verify MD5 signature
    const expectedSign = crypto
      .createHash('md5')
      .update(data + this.projectPassword)
      .digest('hex');

    if (expectedSign.toLowerCase() !== ss1.toLowerCase()) {
      return {
        isValid: false,
        paymentId: '',
        status: 'failed',
        amountCents: 0,
        currency: 'EUR',
        rawPayload: body,
        errorMessage: 'Nënshkrimi kriptografik (ss1) nuk përputhet! Kërkesë e dyshimtë.',
      };
    }

    // Decode parameters
    const decodedStr = this.decodeBase64Url(data);
    const query = new URLSearchParams(decodedStr);

    const orderId = query.get('orderid') || '';
    const amount = parseInt(query.get('amount') || '0', 10);
    const currency = query.get('currency') || 'EUR';
    const statusParam = query.get('status'); // '1' = paid, '0' = not executed, '2' = pending
    const test = query.get('test');
    const transactionId = query.get('requestid') || query.get('payment_id') || undefined;

    // Check project id matches
    if (query.get('projectid') !== this.projectId) {
      return {
        isValid: false,
        paymentId: orderId,
        status: 'failed',
        amountCents: amount,
        currency,
        rawPayload: Object.fromEntries(query.entries()),
        errorMessage: 'ID e projektit nuk përputhet me konfigurimin e platformës PronaX.',
      };
    }

    // Strict validation: Amount must be exactly 700 cents (7.00 EUR)
    if (amount !== 700 || currency !== 'EUR') {
      return {
        isValid: false,
        paymentId: orderId,
        status: 'failed',
        amountCents: amount,
        currency,
        rawPayload: Object.fromEntries(query.entries()),
        errorMessage: `Shuma e pavlefshme: u pranuan ${amount} ${currency}, ndërsa tarifa fikse e PronaX është 700 EUR cents (7.00 €).`,
      };
    }

    // Status: 1 is successful payment in Paysera
    const isSuccessful = statusParam === '1';

    return {
      isValid: true,
      paymentId: orderId,
      providerTransactionId: transactionId,
      status: isSuccessful ? 'successful' : (statusParam === '2' ? 'processing' : 'failed'),
      amountCents: amount,
      currency,
      providerFeeCents: 20, // Estimated gateway commission where applicable
      rawPayload: Object.fromEntries(query.entries()),
    };
  }
}
