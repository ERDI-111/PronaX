/**
 * PronaX AI — AGENT 10: Email Management and Admin Notification Agent
 * Menaxhon njoftimet dalëse dhe informon administratorin (pronaxestate@outlook.com)
 * për veprimet thelbësore: kontakt, mbështetje, prona të reja, pagesa dhe siguri.
 */

import { EmailService } from '@/lib/email/service';
import { EmailTransporter } from '@/lib/email/transporter';
import { PropertySummary } from '@/lib/payments/types';
import { PaymentStore } from '@/lib/payments/store';

export interface InboundEmailAnalysis {
  category: 'inquiry' | 'support' | 'partnership' | 'complaint' | 'spam';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  isSpam: boolean;
  suggestedReplySq: string;
  suggestedReplyEn: string;
}

export class AdminNotificationAgent {
  static readonly agentId = 'admin_notification';
  public static readonly ADMIN_EMAIL = 'pronaxestate@outlook.com';

  /**
   * A. Contact Form Notifications:
   * Dispatches email to pronaxestate@outlook.com whenever a visitor sends a contact form.
   */
  static async notifyContactFormSubmitted(data: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    propertyId?: string;
    propertyTitle?: string;
  }) {
    return EmailService.sendAdminContactNotification(data);
  }

  /**
   * B. Support Request Notifications:
   * Alerts the administrator when a user submits a support ticket or escalates an inquiry.
   */
  static async notifySupportRequest(data: {
    name: string;
    email: string;
    category: string;
    request: string;
    urgency?: 'low' | 'medium' | 'high' | 'critical';
    referenceId?: string;
  }) {
    return EmailService.sendAdminSupportNotification(data);
  }

  /**
   * C. New Property Notifications:
   * Alerts administrator whenever a new property listing is submitted.
   */
  static async notifyNewPropertySubmitted(
    property: PropertySummary,
    options?: { requiresModeration?: boolean }
  ) {
    return EmailService.sendAdminNewPropertyNotification({
      title: property.title,
      category: property.property_type,
      municipality: property.municipality_id,
      price: property.price,
      ownerEmail: property.owner_email || '—',
      ownerPhone: property.owner_phone || '—',
      planId: property.plan_id || 'free',
      planName: property.plan_id === 'monthly' ? 'Mujore (9.99 €)' : (property.plan_id === 'weekly' ? 'Javore (2.99 €)' : 'Falas (0.00 €)'),
      listingType: property.listing_type,
      requiresModeration: options?.requiresModeration ?? (property.status === 'pending_moderation'),
      propertyId: property.id,
    });
  }

  /**
   * D. Payment Notifications:
   * Strictly reports verified server-side payment transactions. AI NEVER marks payments as successful.
   */
  static async notifyPaymentEvent(event: {
    paymentId: string;
    amount: string;
    currency?: string;
    plan: string;
    planName?: string;
    durationDays?: number;
    propertyTitle?: string;
    propertyId?: string;
    userEmail?: string;
    provider?: string;
    status: 'successful' | 'failed' | 'pending' | 'refunded';
  }) {
    return EmailService.sendAdminPaymentNotification(event);
  }

  /**
   * E. Account & Security Notifications:
   * Alerts administrator of suspicious activity, repeated failed logins, or fraud flags.
   */
  static async notifySecurityAlert(alert: {
    title: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    details: string;
    affectedEmail?: string;
    ip?: string;
  }) {
    return EmailService.sendAdminSecurityAlert(alert);
  }

  /**
   * F. Platform Summary & Expiry Digest:
   * Generates a platform digest for the administrator.
   */
  static async generatePlatformDigest(): Promise<string> {
    const properties = await PaymentStore.getAllProperties();
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const expiringSoon = properties.filter((p) => {
      if (p.status !== 'published' || !p.expires_at) return false;
      const exp = new Date(p.expires_at);
      return exp > now && exp <= threeDaysFromNow;
    }).length;

    const expired = properties.filter((p) => p.status === 'expired').length;
    const published = properties.filter((p) => p.status === 'published').length;
    const pendingModeration = properties.filter((p) => p.status === 'pending_moderation').length;
    const emailStats = EmailTransporter.getStats();

    return (
      `📬 **STATUSI I NJOFTIMEVE & EMAIL-EVE — PRONAX**\n` +
      `👤 Destinacioni Kryesor: **${this.ADMIN_EMAIL}**\n` +
      `⚙️ Ofruesi Aktiv: **${emailStats.activeProvider.toUpperCase()}**\n\n` +
      `**Metrikat e Email-eve:**\n` +
      `• Gjithsej të Dërguar: ${emailStats.total}\n` +
      `• Të Dorëzuar me Sukses: ${emailStats.delivered + emailStats.simulated}\n` +
      `• Dështime në Dërgim: ${emailStats.failed}\n\n` +
      `**Pasqyra e Platformës:**\n` +
      `• Shpallje Aktive (Published): ${published}\n` +
      `• Shpallje në Skadim (3 ditë): ${expiringSoon}\n` +
      `• Shpallje të Skaduara: ${expired}\n` +
      `• Shpallje në Pritje të Moderimit: ${pendingModeration}`
    );
  }

  /**
   * Inbound Email Management Assistant:
   * Categorizes, summarizes, flags urgent messages, detects spam, and drafts bilingual suggested replies.
   * STRICT: Does not auto-delete emails or auto-send without authorization.
   */
  static analyzeInboundEmail(rawEmail: {
    from: string;
    subject: string;
    body: string;
  }): InboundEmailAnalysis {
    const text = `${rawEmail.subject} ${rawEmail.body}`.toLowerCase();

    // 1. Spam detection
    const spamKeywords = ['viagra', 'casino', 'lottery', 'crypto investment guarantee', 'prince of nigeria', '100% free money'];
    const isSpam = spamKeywords.some((w) => text.includes(w));

    // 2. Category detection
    let category: InboundEmailAnalysis['category'] = 'inquiry';
    if (isSpam) {
      category = 'spam';
    } else if (text.includes('ankes') || text.includes('complaint') || text.includes('mashtrim') || text.includes('scam') || text.includes('problem')) {
      category = 'complaint';
    } else if (text.includes('bashkëpunim') || text.includes('partner') || text.includes('partnership') || text.includes('agjenci')) {
      category = 'partnership';
    } else if (text.includes('ndihm') || text.includes('support') || text.includes('nuk po mund') || text.includes('password') || text.includes('humbur')) {
      category = 'support';
    }

    // 3. Urgency detection
    let urgency: InboundEmailAnalysis['urgency'] = 'medium';
    if (isSpam) {
      urgency = 'low';
    } else if (category === 'complaint' || text.includes('urgjent') || text.includes('urgent') || text.includes('polici') || text.includes('mashtrim')) {
      urgency = 'critical';
    } else if (category === 'support') {
      urgency = 'high';
    }

    // 4. Summary
    const summary = rawEmail.body.length > 140 ? `${rawEmail.body.slice(0, 140)}...` : rawEmail.body;

    // 5. Bilingual Suggested Replies (Draft only - never sent automatically)
    const suggestedReplySq =
      category === 'complaint'
        ? `Përshëndetje,\n\nFaleminderit që kontaktuat administratën e PronaX. Kemi regjistruar çështjen tuaj dhe ekipi ynë po e heton me prioritet të lartë.\n\nDo t'ju njoftojmë së shpejti me hapat konkretë.\n\nMe respekt,\nEkipi PronaX Kosovë`
        : `Përshëndetje,\n\nFaleminderit për mesazhin tuaj lidhur me PronaX. E kemi pranuar kërkesën tuaj dhe jemi në dispozicion për t'ju ndihmuar.\n\nMe respekt,\nEkipi PronaX Kosovë`;

    const suggestedReplyEn =
      category === 'complaint'
        ? `Hello,\n\nThank you for reaching out to PronaX administration. We have logged your case and our team is investigating it with high priority.\n\nWe will update you shortly.\n\nBest regards,\nPronaX Team`
        : `Hello,\n\nThank you for reaching out to PronaX. We have received your inquiry and are happy to assist you.\n\nBest regards,\nPronaX Team`;

    return {
      category,
      urgency,
      summary,
      isSpam,
      suggestedReplySq,
      suggestedReplyEn,
    };
  }
}
