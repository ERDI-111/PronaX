import { PaymentAdapter, PaymentProvider } from './types';
import { PayseraModernAdapter } from './adapters/paysera';
import { KosovoBankPosAdapter } from './adapters/kosovo-pos';
import { SandboxPaymentAdapter } from './adapters/sandbox';

export class PaymentAdapterFactory {
  static getAdapter(providerName?: string): PaymentAdapter {
    const activeProvider = (
      providerName || 
      process.env.PAYMENT_PROVIDER || 
      'sandbox'
    ).toLowerCase() as PaymentProvider;

    switch (activeProvider) {
      case 'paysera':
        return new PayseraModernAdapter();
      case 'procredit_pos':
        return new KosovoBankPosAdapter('procredit_pos');
      case 'nlb_pos':
        return new KosovoBankPosAdapter('nlb_pos');
      case 'sandbox':
      default:
        return new SandboxPaymentAdapter();
    }
  }

  static getSupportedProviders(): { id: PaymentProvider; label: string; description: string; isLiveConfigured: boolean }[] {
    const hasPayseraKeys = Boolean(process.env.PAYMENT_PROJECT_ID && process.env.PAYMENT_API_SECRET);
    const hasProCreditKeys = Boolean(process.env.PROCREDIT_POS_CLIENT_ID && process.env.PROCREDIT_POS_STORE_KEY);
    const hasNlbKeys = Boolean(process.env.NLB_POS_CLIENT_ID && process.env.NLB_POS_STORE_KEY);

    return [
      {
        id: 'paysera',
        label: 'Paysera Modern Checkout',
        description: 'Pagesa me kartelë (Visa/Mastercard) dhe llogari Paysera me mbrojtje 3D-Secure.',
        isLiveConfigured: hasPayseraKeys,
      },
      {
        id: 'procredit_pos',
        label: 'ProCredit Bank Virtual POS',
        description: 'Virtual POS i drejtpërdrejtë bankar nga ProCredit Bank Kosovë me 3D Secure 2.0.',
        isLiveConfigured: hasProCreditKeys,
      },
      {
        id: 'nlb_pos',
        label: 'NLB Banka Virtual POS',
        description: 'Virtual POS i drejtpërdrejtë bankar nga NLB Banka Kosovë me NestPay / Asseco.',
        isLiveConfigured: hasNlbKeys,
      },
      {
        id: 'sandbox',
        label: 'PronaX Sandbox Simulator',
        description: 'Mjedis testimi dhe verifikimi të pagesave për fazën e zhvillimit dhe kontrollit.',
        isLiveConfigured: true,
      },
    ];
  }
}
