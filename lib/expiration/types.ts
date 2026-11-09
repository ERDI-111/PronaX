export interface ExpirationCheckResult {
  timestamp: string;
  expiredCount: number;
  warned3dCount: number;
  warned1dCount: number;
  processedProperties: {
    id: string;
    title: string;
    action: 'expired' | 'warned_3d' | 'warned_1d';
    ownerId: string;
    expiresAt: string;
  }[];
}

export interface DaysRemainingInfo {
  daysRemaining: number;
  hoursRemaining: number;
  isExpired: boolean;
  isExpiringSoon: boolean; // 3 days or less
  isUrgent: boolean;       // 24 hours or less
  statusLabel: string;
  colorClass: string;
}

export interface RenewalHistoryItem {
  renewalId: string;
  propertyId: string;
  paymentId: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  previousExpiresAt?: string | null;
  newExpiresAt: string;
  createdAt: string;
}

export interface ExpirationDashboardMetrics {
  totalPublished: number;
  expiringIn3Days: number;
  expiringIn1Day: number;
  totalExpired: number;
  totalRenewals: number;
  renewalConversionRate: number; // Percentage of expired listings that got renewed
}
