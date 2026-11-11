import crypto from 'crypto';
import { 
  PaymentAdapter, 
  PaymentProvider, 
  CreatePaymentSessionParams, 
  PaymentSessionResult, 
  WebhookVerificationResult 
} from '../types';

/**
 * Kosovo Bank Virtual POS Adapter
 * Supports standard 3D-Secure 2.0 POS gateways used in Kosovo:
 * ProCredit Bank Kosovo & NLB Bank (NestPay / Asseco SEE Virtual POS standard).
 */
export class KosovoBankPosAdapter implements PaymentAdapter {
  name: PaymentProvider;
  private clientId: string;
  private storeKey: string;
  private gatewayUrl: string;

  constructor(providerName: 'procredit_pos' | 'nlb_pos' = 'procredit_pos') {
    this.name = providerName;
    this.clientId = process.env[`${providerName.toUpperCase()}_CLIENT_ID`] || process.env.PAYMENT_PROJECT_ID || '';
    this.storeKey = process.env[`${providerName.toUpperCase()}_STORE_KEY`] || process.env.PAYMENT_API_SECRET || '';
    
    // Gateway endpoint provided by bank (NestPay / Bankart / Asseco portal)
    this.gatewayUrl = process.env[`${providerName.toUpperCase()}_GATEWAY_URL`] || 
      (providerName === 'procredit_pos' 
        ? 'https://vpos.procreditbank-kos.com/fim/est3Dgate' 
        : 'https://pgw.nlbkosovo.com/fim/est3Dgate');
  }

  private generateHash(params: {
    clientId: string;
    oid: string;
    amount: string;
    okUrl: string;
    failUrl: string;
    tranType: string;
    rnd: string;
    storeKey: string;
  }): string {
    const rawString = `${params.clientId}${params.oid}${params.amount}${params.okUrl}${params.failUrl}${params.tranType}${params.rnd}${params.storeKey}`;
    return crypto.createHash('sha512').update(rawString, 'utf-8').digest('base64');
  }

  async createSession(params: CreatePaymentSessionParams): Promise<PaymentSessionResult> {
    if (!this.clientId || !this.storeKey) {
      throw new Error(`Konfigurimi i ${this.name.toUpperCase()} mungon: Ju lutem vendosni Client ID dhe Store Key në .env.`);
    }

    const amountStr = (params.amountCents / 100).toFixed(2); // "7.00"
    const rnd = crypto.randomBytes(16).toString('hex');
    const tranType = 'Auth';

    const hash = this.generateHash({
      clientId: this.clientId,
      oid: params.paymentId,
      amount: amountStr,
      okUrl: params.returnUrl,
      failUrl: params.cancelUrl,
      tranType,
      rnd,
      storeKey: this.storeKey,
    });

    const queryParams = new URLSearchParams({
      clientid: this.clientId,
      oid: params.paymentId,
      amount: amountStr,
      okUrl: params.returnUrl,
      failUrl: params.cancelUrl,
      trantype: tranType,
      currency: '978', // ISO code for EUR
      rnd,
      hash,
      storetype: '3d_pay_hosting',
      lang: 'sq',
      email: params.userEmail,
      BillToName: params.userName || 'Klient PronaX',
    });

    const checkoutUrl = `${this.gatewayUrl}?${queryParams.toString()}`;

    return {
      paymentId: params.paymentId,
      checkoutUrl,
      metadata: {
        gatewayUrl: this.gatewayUrl,
        clientId: this.clientId,
        amount: amountStr,
      },
    };
  }

  async verifyWebhook(headers: Headers, body: any): Promise<WebhookVerificationResult> {
    const response = body?.Response || body?.response;
    const mdStatus = body?.mdStatus || body?.mdstatus;
    const oid = body?.oid || body?.ReturnOid || '';
    const hash = body?.HASH || body?.hash;
    const amountStr = body?.amount || '0.00';
    const amountCents = Math.round(parseFloat(amountStr) * 100);
    const transId = body?.TransId || body?.transId || undefined;

    if (!response || !hash) {
      return {
        isValid: false,
        paymentId: oid,
        status: 'failed',
        amountCents,
        currency: 'EUR',
        rawPayload: body,
        errorMessage: 'Përgjigjja e bankës nuk përmban parametrat e nevojshëm të vërtetimit.',
      };
    }

    // Verify 3D-Secure success status
    // mdStatus 1, 2, 3, 4 means 3D secure authenticated
    const is3dSuccessful = ['1', '2', '3', '4'].includes(String(mdStatus));
    const isApproved = String(response).toUpperCase() === 'APPROVED';

    // Strict amount validation: Must match PronaX plans (2.99 € = 299 cents, 9.99 € = 999 cents)
    const validPlanAmounts = [299, 999];
    if (!validPlanAmounts.includes(amountCents)) {
      return {
        isValid: false,
        paymentId: oid,
        status: 'failed',
        amountCents,
        currency: 'EUR',
        rawPayload: body,
        errorMessage: `Shuma nuk përputhet me planet e PronaX (Pranuar: ${amountCents} cent, Planet: 299 cent ose 999 cent).`,
      };
    }

    const isSuccessful = is3dSuccessful && isApproved;

    return {
      isValid: true,
      paymentId: oid,
      providerTransactionId: transId,
      status: isSuccessful ? 'successful' : 'failed',
      amountCents,
      currency: 'EUR',
      providerFeeCents: 18, // Standard local interchange fee (e.g., ~0.25% + 15c)
      rawPayload: body,
    };
  }
}
