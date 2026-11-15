import fs from 'fs';
import path from 'path';
import { PaymentRecord, PaymentEventRecord, ListingRenewalRecord, PropertySummary } from './types';
import { InAppNotification } from '../notifications/types';

// Disk persistence for production & local development (data/properties.json)
const DATA_DIR = path.join(process.cwd(), 'data');
const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');

function saveToDisk(data: Record<string, PropertySummary>) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save properties to disk:', e);
  }
}

function loadFromDisk(): Record<string, PropertySummary> {
  try {
    if (fs.existsSync(PROPERTIES_FILE)) {
      const raw = fs.readFileSync(PROPERTIES_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load properties from disk:', e);
  }
  return {};
}

// Persistent store loaded from disk
function getPropertiesMap(): Record<string, PropertySummary> {
  return loadFromDisk();
}

const inMemoryPayments: Record<string, PaymentRecord> = {};

const inMemoryEvents: PaymentEventRecord[] = [];

const inMemoryRenewals: ListingRenewalRecord[] = [];

const inMemoryNotifications: InAppNotification[] = [];

export class PaymentStore {
  // Properties
  static async createProperty(property: PropertySummary): Promise<PropertySummary> {
    const props = getPropertiesMap();
    props[property.id] = { ...property };
    saveToDisk(props);
    return props[property.id];
  }

  static async updateProperty(id: string, updates: Partial<PropertySummary>): Promise<PropertySummary | null> {
    const props = getPropertiesMap();
    const prop = props[id];
    if (!prop) return null;
    props[id] = {
      ...prop,
      ...updates,
      id, // protect id from being overwritten
    };
    saveToDisk(props);
    return props[id];
  }

  static async deleteProperty(id: string): Promise<boolean> {
    const props = getPropertiesMap();
    if (props[id]) {
      delete props[id];
      saveToDisk(props);
      return true;
    }
    return false;
  }

  static async getProperty(id: string): Promise<PropertySummary | null> {
    const props = getPropertiesMap();
    if (props[id]) return props[id];
    const bySlug = Object.values(props).find(p => p.slug === id);
    if (bySlug) return bySlug;
    return null;
  }

  static async getAllProperties(): Promise<PropertySummary[]> {
    return Object.values(getPropertiesMap());
  }

  static async getUserProperties(userId: string): Promise<PropertySummary[]> {
    return Object.values(getPropertiesMap()).filter(p => p.owner_id === userId);
  }

  /**
   * Strictly public search & map listings:
   * Enforces: status === 'published' AND expires_at > NOW()
   * Expired properties are never visible publicly!
   */
  static async getPublicProperties(): Promise<PropertySummary[]> {
    const now = new Date();
    return Object.values(getPropertiesMap()).filter(p => {
      if (p.status !== 'published') return false;
      if (p.expires_at && new Date(p.expires_at) <= now) return false;
      return true;
    });
  }

  static async searchProperties(params: {
    q?: string;
    tipi?: string;
    kategoria?: string;
    komuna?: string;
    vendbanimi?: string;
    cmimi_min?: number;
    cmimi_max?: number;
    siperfaqja_min?: number;
    siperfaqja_max?: number;
    dhoma?: number;
    sort?: 'newest' | 'price_asc' | 'price_desc' | 'area_desc';
    page?: number;
    per_page?: number;
    includePending?: boolean;
  }): Promise<{ properties: PropertySummary[]; total: number; page: number; per_page: number; total_pages: number }> {
    let list = Object.values(getPropertiesMap());

    if (!params.includePending) {
      const now = new Date();
      list = list.filter(p => {
        if (p.status !== 'published') return false;
        if (p.expires_at && new Date(p.expires_at) <= now) return false;
        return true;
      });
    }

    if (params.q) {
      const q = params.q.toLowerCase().trim();
      list = list.filter(p => 
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.address && p.address.toLowerCase().includes(q)) ||
        (p.municipality_id && p.municipality_id.toLowerCase().includes(q)) ||
        (p.settlement_id && p.settlement_id.toLowerCase().includes(q))
      );
    }

    if (params.tipi && params.tipi !== 'te-gjitha') {
      list = list.filter(p => p.listing_type === params.tipi);
    }
    if (params.kategoria && params.kategoria !== 'te-gjitha') {
      list = list.filter(p => p.property_type === params.kategoria);
    }
    if (params.komuna && params.komuna !== 'te-gjitha') {
      list = list.filter(p => p.municipality_id === params.komuna);
    }
    if (params.cmimi_min) {
      list = list.filter(p => p.price >= params.cmimi_min!);
    }
    if (params.cmimi_max) {
      list = list.filter(p => p.price <= params.cmimi_max!);
    }
    if (params.siperfaqja_min) {
      list = list.filter(p => (p.area_m2 || 0) >= params.siperfaqja_min!);
    }
    if (params.dhoma) {
      list = list.filter(p => (p.bedrooms || 0) === params.dhoma);
    }

    // Sort
    const sort = params.sort || 'newest';
    list.sort((a, b) => {
      if (sort === 'price_asc') return a.price - b.price;
      if (sort === 'price_desc') return b.price - a.price;
      if (sort === 'area_desc') return (b.area_m2 || 0) - (a.area_m2 || 0);
      const tA = a.published_at ? new Date(a.published_at).getTime() : 0;
      const tB = b.published_at ? new Date(b.published_at).getTime() : 0;
      return tB - tA;
    });

    const page = params.page || 1;
    const per_page = params.per_page || 12;
    const total = list.length;
    const offset = (page - 1) * per_page;
    const paginated = list.slice(offset, offset + per_page);

    return {
      properties: paginated,
      total,
      page,
      per_page,
      total_pages: Math.ceil(total / per_page) || 1,
    };
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
    const props = getPropertiesMap();
    const prop = props[id];
    if (!prop) return null;

    prop.status = status;
    if (dates?.published_at) prop.published_at = dates.published_at;
    if (dates?.expires_at) prop.expires_at = dates.expires_at;
    if (dates?.incrementRenewal) prop.renewal_count = (prop.renewal_count || 0) + 1;
    if (dates?.expiration_warning_3d_sent_at) prop.expiration_warning_3d_sent_at = dates.expiration_warning_3d_sent_at;
    if (dates?.expiration_warning_1d_sent_at) prop.expiration_warning_1d_sent_at = dates.expiration_warning_1d_sent_at;
    if (dates?.expired_notification_sent_at) prop.expired_notification_sent_at = dates.expired_notification_sent_at;

    saveToDisk(props);
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
