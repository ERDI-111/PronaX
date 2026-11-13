import { PaymentStore } from '../payments/store';
import { 
  DaysRemainingInfo, 
  ExpirationCheckResult, 
  ExpirationDashboardMetrics, 
  RenewalHistoryItem 
} from './types';

export class ExpirationService {
  /**
   * Calculates days and hours remaining until plan-based listing expiration.
   * Supports all three plans: free (3 days), weekly (7 days), monthly (30 days).
   * Provides UI helper labels and severity classes in Albanian.
   */
  static calculateDaysRemaining(expiresAt: string | null | undefined): DaysRemainingInfo {
    if (!expiresAt) {
      return {
        daysRemaining: 0,
        hoursRemaining: 0,
        isExpired: true,
        isExpiringSoon: false,
        isUrgent: false,
        statusLabel: 'E paaktivizuar',
        colorClass: 'text-slate-500 bg-slate-100 border-slate-200',
      };
    }

    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs <= 0) {
      const daysAgo = Math.abs(Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      return {
        daysRemaining: 0,
        hoursRemaining: 0,
        isExpired: true,
        isExpiringSoon: false,
        isUrgent: false,
        statusLabel: daysAgo === 0 ? 'E skaduar sot' : `E skaduar para ${daysAgo} ditësh`,
        colorClass: 'text-red-700 bg-red-50 border-red-200',
      };
    }

    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    const isUrgent = days === 0; // Less than 24 hours
    const isExpiringSoon = days <= 3; // 3 days or less

    let statusLabel = '';
    let colorClass = '';

    if (isUrgent) {
      statusLabel = `Skadon sot! (Mbeten ${hours} orë)`;
      colorClass = 'text-red-700 bg-red-100 border-red-300 animate-pulse';
    } else if (isExpiringSoon) {
      statusLabel = `Skadon pas ${days} ditësh (Rinovo tani)`;
      colorClass = 'text-amber-800 bg-amber-50 border-amber-200';
    } else {
      statusLabel = `Aktive (Mbeten edhe ${days} ditë)`;
      colorClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    }

    return {
      daysRemaining: days,
      hoursRemaining: hours,
      isExpired: false,
      isExpiringSoon,
      isUrgent,
      statusLabel,
      colorClass,
    };
  }

  /**
   * Automated cron/background worker:
   * 1. Transitions expired published listings past 30 days to 'expired'.
   * 2. Excludes them from public view while preserving them in owner's dashboard.
   * 3. Dispatches 3-day and 1-day warning in-app notifications.
   */
  static async runDailyExpirationCheck(): Promise<ExpirationCheckResult> {
    const allProperties = await PaymentStore.getAllProperties();
    const now = new Date();

    let expiredCount = 0;
    let warned3dCount = 0;
    let warned1dCount = 0;
    const processed: ExpirationCheckResult['processedProperties'] = [];

    for (const prop of allProperties) {
      if (prop.status === 'published' && prop.expires_at) {
        const expiryDate = new Date(prop.expires_at);
        const diffMs = expiryDate.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        // Case 1: Property expired (30-day period ended)
        if (diffMs <= 0) {
          await PaymentStore.updatePropertyStatus(prop.id, 'expired', {
            expired_notification_sent_at: now.toISOString(),
          });

          await PaymentStore.createNotification({
            user_id: prop.owner_id,
            property_id: prop.id,
            type: 'property_expired',
            title: 'Prona juaj ka skaduar',
            message: `Periudha e publikimit për pronën "${prop.title}" ka përfunduar. Ajo nuk shfaqet më publikisht. Mund ta rinovoni manualisht duke zgjedhur një plan të ri.`,
            action_url: `/pagesa/${prop.id}?purpose=renewal`,
          });

          await PaymentStore.recordEvent({
            payment_id: null,
            event_type: 'property_expired_automatically',
            provider: 'system_cron',
            raw_payload: {
              propertyId: prop.id,
              title: prop.title,
              expiresAt: prop.expires_at,
            },
          });

          processed.push({
            id: prop.id,
            title: prop.title,
            action: 'expired',
            ownerId: prop.owner_id,
            expiresAt: prop.expires_at,
          });

          expiredCount++;
        }
        // Case 2: Urgent 1-Day warning (24 hours or less)
        else if (diffHours <= 24 && !prop.expiration_warning_1d_sent_at) {
          await PaymentStore.updatePropertyStatus(prop.id, 'published', {
            expiration_warning_1d_sent_at: now.toISOString(),
          });

          await PaymentStore.createNotification({
            user_id: prop.owner_id,
            property_id: prop.id,
            type: 'expiration_warning_1d',
            title: 'Urgjente: Prona juaj skadon nesër!',
            message: `Kanë mbetur më pak se 24 orë deri në skadimin e pronës "${prop.title}". Rinovoni me një plan të ri për të ruajtur vazhdimësinë e publikimit.`,
            action_url: `/pagesa/${prop.id}?purpose=renewal`,
          });

          processed.push({
            id: prop.id,
            title: prop.title,
            action: 'warned_1d',
            ownerId: prop.owner_id,
            expiresAt: prop.expires_at,
          });

          warned1dCount++;
        }
        // Case 3: 3-Day warning (72 hours or less)
        else if (diffHours <= 72 && !prop.expiration_warning_3d_sent_at && !prop.expiration_warning_1d_sent_at) {
          await PaymentStore.updatePropertyStatus(prop.id, 'published', {
            expiration_warning_3d_sent_at: now.toISOString(),
          });

          await PaymentStore.createNotification({
            user_id: prop.owner_id,
            property_id: prop.id,
            type: 'expiration_warning_3d',
            title: 'Kujdes: Prona juaj skadon pas 3 ditësh',
            message: `Publikimi i pronës "${prop.title}" përfundon pas 3 ditësh. Rinovoni para skadimit duke zgjedhur një plan të ri.`,
            action_url: `/pagesa/${prop.id}?purpose=renewal`,
          });

          processed.push({
            id: prop.id,
            title: prop.title,
            action: 'warned_3d',
            ownerId: prop.owner_id,
            expiresAt: prop.expires_at,
          });

          warned3dCount++;
        }
      }
    }

    return {
      timestamp: now.toISOString(),
      expiredCount,
      warned3dCount,
      warned1dCount,
      processedProperties: processed,
    };
  }

  /**
   * Fetches full renewal audit timeline for a specific property.
   */
  static async getPropertyRenewalHistory(propertyId: string): Promise<RenewalHistoryItem[]> {
    const renewals = await PaymentStore.getRenewalsForProperty(propertyId);
    const items: RenewalHistoryItem[] = [];

    for (const r of renewals) {
      const payment = await PaymentStore.getPayment(r.payment_id);
      items.push({
        renewalId: r.id,
        propertyId: r.property_id,
        paymentId: r.payment_id,
        amount: payment ? (payment.amount_cents / 100).toFixed(2) : '0.00',
        currency: payment?.currency || 'EUR',
        paymentMethod: payment?.payment_method || 'Kartelë bankare',
        previousExpiresAt: r.previous_expires_at,
        newExpiresAt: r.new_expires_at,
        createdAt: r.created_at,
      });
    }

    return items;
  }

  /**
   * Generates metrics for Administrator Expiration & Renewal dashboard.
   */
  static async getExpirationMetrics(): Promise<ExpirationDashboardMetrics> {
    const allProps = await PaymentStore.getAllProperties();
    const allRenewals = await PaymentStore.getAllRenewals();
    const now = new Date();

    let totalPublished = 0;
    let expiringIn3Days = 0;
    let expiringIn1Day = 0;
    let totalExpired = 0;

    for (const p of allProps) {
      if (p.status === 'published' && p.expires_at) {
        totalPublished++;
        const diffMs = new Date(p.expires_at).getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours > 0 && diffHours <= 24) {
          expiringIn1Day++;
        } else if (diffHours > 24 && diffHours <= 72) {
          expiringIn3Days++;
        }
      } else if (p.status === 'expired') {
        totalExpired++;
      }
    }

    const totalRenewals = allRenewals.length;
    const totalSubjectToRenewal = totalExpired + totalRenewals;
    const renewalConversionRate = totalSubjectToRenewal > 0 
      ? Math.round((totalRenewals / totalSubjectToRenewal) * 100) 
      : 0;

    return {
      totalPublished,
      expiringIn3Days,
      expiringIn1Day,
      totalExpired,
      totalRenewals,
      renewalConversionRate,
    };
  }
}
