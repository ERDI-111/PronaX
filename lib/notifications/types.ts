export type NotificationType =
  | 'expiration_warning_3d'
  | 'expiration_warning_1d'
  | 'property_expired'
  | 'renewal_successful'
  | 'renewal_failed'
  | 'listing_published';

export interface InAppNotification {
  id: string;
  user_id: string;
  property_id?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  action_url?: string | null;
  is_read: boolean;
  created_at: string;
}
