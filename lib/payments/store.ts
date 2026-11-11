import { PaymentRecord, PaymentEventRecord, ListingRenewalRecord, PropertySummary } from './types';
import { InAppNotification } from '../notifications/types';

// In-memory persistent store for development & offline testing
// Seed with initial realistic demo properties so testing can happen immediately!
const demoProperties: Record<string, PropertySummary> = {
  'prop-ks-101': {
    id: 'prop-ks-101',
    title: 'Banesë moderne me 2 dhoma në Prishtinë (Bregu i Diellit)',
    slug: 'banese-moderne-ne-prishtine-bregu-i-diellit-101',
    price: 95000,
    currency: 'EUR',
    property_type: 'Banesë',
    listing_type: 'shitje',
    municipality_id: 'Prishtinë',
    settlement_id: 'Bregu i Diellit',
    address: 'Rruga Gazmend Zajmi, Hyrja 3',
    status: 'pending_payment',
    renewal_count: 0,
    owner_id: 'user-erdis-001',
    published_at: null,
    expires_at: null,
  },
  'prop-ks-102': {
    id: 'prop-ks-102',
    title: 'Shtëpi luksoze me oborr në Prizren',
    slug: 'shtepi-luksoze-me-oborr-ne-prizren-102',
    price: 185000,
    currency: 'EUR',
    property_type: 'Shtëpi',
    listing_type: 'shitje',
    municipality_id: 'Prizren',
    settlement_id: 'Ortakoll',
    address: 'Rruga Edit Durham',
    status: 'expired',
    published_at: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expired_notification_sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    renewal_count: 0,
    owner_id: 'user-erdis-001',
  },
  'prop-ks-103': {
    id: 'prop-ks-103',
    title: 'Lokal afarist në qendër të Pejës',
    slug: 'lokal-afarist-ne-qender-te-pejes-103',
    price: 750,
    currency: 'EUR',
    property_type: 'Lokal afarist',
    listing_type: 'qira',
    municipality_id: 'Pejë',
    settlement_id: 'Qendër',
    address: 'Sheshi Shkëlzen Haradinaj',
    status: 'published',
    published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    renewal_count: 1,
    owner_id: 'user-erdis-001',
  },
  'prop-ks-104': {
    id: 'prop-ks-104',
    title: 'Vilë moderne me pishinë në Brezovicë',
    slug: 'vile-moderne-me-pishine-ne-brezovice-104',
    price: 240000,
    currency: 'EUR',
    property_type: 'Vilë',
    listing_type: 'shitje',
    municipality_id: 'Shtërpcë',
    settlement_id: 'Brezovicë',
    address: 'Zona Turistike',
    status: 'published',
    published_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Expiring in 2 days (Warning 3d)
    renewal_count: 0,
    owner_id: 'user-erdis-001',
  },
  'prop-ks-105': {
    id: 'prop-ks-105',
    title: 'Truall për ndërtim në Fushë Kosovë (Zona Industriale)',
    slug: 'truall-per-ndertim-ne-fushe-kosove-105',
    price: 68000,
    currency: 'EUR',
    property_type: 'Truall',
    listing_type: 'shitje',
    municipality_id: 'Fushë Kosovë',
    settlement_id: 'Zona Industriale',
    address: 'Magjistralja Prishtinë-Pejë',
    status: 'published',
    published_at: new Date(Date.now() - 29.2 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 0.8 * 24 * 60 * 60 * 1000).toISOString(), // Expiring in ~19 hours (Warning 1d)
    renewal_count: 0,
    owner_id: 'user-erdis-001',
  },
};

const inMemoryPayments: Record<string, PaymentRecord> = {
  'tx-sample-01': {
    id: 'tx-sample-01',
    property_id: 'prop-ks-103',
    user_id: 'user-erdis-001',
    amount_cents: 999,
    currency: 'EUR',
    purpose: 'new_listing',
    provider: 'sandbox',
    provider_transaction_id: 'SANDBOX-TX-9901',
    provider_fee_cents: 15,
    status: 'successful',
    payment_method: 'Visa **** 4001',
    idempotency_key: 'idemp-tx-sample-01',
    created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
  },
  'tx-sample-02': {
    id: 'tx-sample-02',
    property_id: 'prop-ks-103',
    user_id: 'user-erdis-001',
    amount_cents: 999,
    currency: 'EUR',
    purpose: 'renewal',
    provider: 'sandbox',
    provider_transaction_id: 'SANDBOX-TX-9902',
    provider_fee_cents: 15,
    status: 'successful',
    payment_method: 'Mastercard **** 5101',
    idempotency_key: 'idemp-tx-sample-02',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
};

const inMemoryEvents: PaymentEventRecord[] = [];

const inMemoryRenewals: ListingRenewalRecord[] = [
  {
    id: 'rnw-init-01',
    property_id: 'prop-ks-103',
    payment_id: 'tx-sample-02',
    previous_expires_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    new_expires_at: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const inMemoryNotifications: InAppNotification[] = [
  {
    id: 'notif-001',
    user_id: 'user-erdis-001',
    property_id: 'prop-ks-102',
    type: 'property_expired',
    title: 'Prona juaj në Prizren ka skaduar',
    message: 'Periudha e publikimit ka përfunduar. Prona nuk shfaqet më publikisht. Mund ta riaktivizoni manualisht duke zgjedhur një plan të ri.',
    action_url: '/pagesa/prop-ks-102?purpose=renewal',
    is_read: false,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-002',
    user_id: 'user-erdis-001',
    property_id: 'prop-ks-103',
    type: 'renewal_successful',
    title: 'Rinovimi u realizua me sukses',
    message: 'Prona "Lokal afarist në qendër të Pejës" u rinovua me sukses për 30 ditë të tjera sipas planit mujor.',
    action_url: '/dashboard/pronat',
    is_read: true,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export class PaymentStore {
  // Properties
  static async getProperty(id: string): Promise<PropertySummary | null> {
    return demoProperties[id] || null;
  }

  static async getAllProperties(): Promise<PropertySummary[]> {
    return Object.values(demoProperties);
  }

  static async getUserProperties(userId: string): Promise<PropertySummary[]> {
    return Object.values(demoProperties).filter(p => p.owner_id === userId);
  }

  /**
   * Strictly public search & map listings:
   * Enforces: status === 'published' AND expires_at > NOW()
   * Expired properties are never visible publicly!
   */
  static async getPublicProperties(): Promise<PropertySummary[]> {
    const now = new Date();
    return Object.values(demoProperties).filter(p => {
      if (p.status !== 'published') return false;
      if (!p.expires_at) return false;
      return new Date(p.expires_at) > now;
    });
  }

  static async updatePropertyStatus(
    id: string, 
    status: PropertySummary['status'], 
    dates?: { 
      published_at?: string; 
      expires_at?: string; 
      incrementRenewal?: boolean;
      expiration_warning_3d_sent_at?: string;
      expiration_warning_1d_sent_at?: string;
      expired_notification_sent_at?: string;
    }
  ): Promise<PropertySummary | null> {
    const prop = demoProperties[id];
    if (!prop) return null;

    prop.status = status;
    if (dates?.published_at) prop.published_at = dates.published_at;
    if (dates?.expires_at) prop.expires_at = dates.expires_at;
    if (dates?.incrementRenewal) prop.renewal_count = (prop.renewal_count || 0) + 1;
    if (dates?.expiration_warning_3d_sent_at) prop.expiration_warning_3d_sent_at = dates.expiration_warning_3d_sent_at;
    if (dates?.expiration_warning_1d_sent_at) prop.expiration_warning_1d_sent_at = dates.expiration_warning_1d_sent_at;
    if (dates?.expired_notification_sent_at) prop.expired_notification_sent_at = dates.expired_notification_sent_at;

    return prop;
  }

  // Payments
  static async createPayment(record: PaymentRecord): Promise<PaymentRecord> {
    inMemoryPayments[record.id] = { ...record };
    return inMemoryPayments[record.id];
  }

  static async getPayment(id: string): Promise<PaymentRecord | null> {
    return inMemoryPayments[id] || null;
  }

  static async getPaymentByIdempotencyKey(key: string): Promise<PaymentRecord | null> {
    return Object.values(inMemoryPayments).find(p => p.idempotency_key === key) || null;
  }

  static async updatePayment(id: string, updates: Partial<PaymentRecord>): Promise<PaymentRecord | null> {
    const p = inMemoryPayments[id];
    if (!p) return null;

    inMemoryPayments[id] = {
      ...p,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return inMemoryPayments[id];
  }

  static async listUserPayments(userId: string): Promise<PaymentRecord[]> {
    return Object.values(inMemoryPayments)
      .filter(p => p.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static async listAllPayments(): Promise<PaymentRecord[]> {
    return Object.values(inMemoryPayments)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Audit Events
  static async recordEvent(event: Omit<PaymentEventRecord, 'id' | 'created_at'>): Promise<PaymentEventRecord> {
    const record: PaymentEventRecord = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      created_at: new Date().toISOString(),
    };
    inMemoryEvents.push(record);
    return record;
  }

  static async listEventsForPayment(paymentId: string): Promise<PaymentEventRecord[]> {
    return inMemoryEvents.filter(e => e.payment_id === paymentId);
  }

  // Renewals
  static async recordRenewal(renewal: Omit<ListingRenewalRecord, 'id' | 'created_at'>): Promise<ListingRenewalRecord> {
    const record: ListingRenewalRecord = {
      ...renewal,
      id: `rnw-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      created_at: new Date().toISOString(),
    };
    inMemoryRenewals.push(record);
    return record;
  }

  static async getRenewalsForProperty(propertyId: string): Promise<ListingRenewalRecord[]> {
    return inMemoryRenewals
      .filter(r => r.property_id === propertyId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static async getAllRenewals(): Promise<ListingRenewalRecord[]> {
    return [...inMemoryRenewals].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Notifications
  static async createNotification(notification: Omit<InAppNotification, 'id' | 'created_at' | 'is_read'>): Promise<InAppNotification> {
    const record: InAppNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    inMemoryNotifications.unshift(record);
    return record;
  }

  static async getUserNotifications(userId: string): Promise<InAppNotification[]> {
    return inMemoryNotifications
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static async getUnreadNotificationCount(userId: string): Promise<number> {
    return inMemoryNotifications.filter(n => n.user_id === userId && !n.is_read).length;
  }

  static async markNotificationAsRead(id: string, userId: string): Promise<boolean> {
    const notif = inMemoryNotifications.find(n => n.id === id && n.user_id === userId);
    if (notif) {
      notif.is_read = true;
      return true;
    }
    return false;
  }

  static async markAllNotificationsAsRead(userId: string): Promise<number> {
    let count = 0;
    for (const notif of inMemoryNotifications) {
      if (notif.user_id === userId && !notif.is_read) {
        notif.is_read = true;
        count++;
      }
    }
    return count;
  }
}
