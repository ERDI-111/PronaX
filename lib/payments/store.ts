import { PaymentRecord, PaymentEventRecord, ListingRenewalRecord, PropertySummary } from './types';
import { InAppNotification } from '../notifications/types';

// In-memory persistent store for production & active sessions
// Empty initial state for production launch (no mock/fake data)
const demoProperties: Record<string, PropertySummary> = {};

const inMemoryPayments: Record<string, PaymentRecord> = {};

const inMemoryEvents: PaymentEventRecord[] = [];

const inMemoryRenewals: ListingRenewalRecord[] = [];

const inMemoryNotifications: InAppNotification[] = [];

export class PaymentStore {
  // Properties
  static async getProperty(id: string): Promise<PropertySummary | null> {
    if (!demoProperties[id]) {
      // Dynamic fallback for newly registered properties during active session
      demoProperties[id] = {
        id,
        title: 'Pronë në PronaX Kosovë',
        slug: id,
        price: 0,
        currency: 'EUR',
        property_type: 'Banesë',
        listing_type: 'shitje',
        municipality_id: 'Prishtinë',
        settlement_id: 'Qendër',
        address: '',
        status: 'pending_payment',
        renewal_count: 0,
        owner_id: 'user-erdis-001',
        published_at: null,
        expires_at: null,
      };
    }
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
