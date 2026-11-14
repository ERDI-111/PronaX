/**
 * PronaX AI — AGENT 6: Notification & Retention Agent
 * Krijon njoftime skadimi dhe rikujtime të personalizuara në shqip
 */

export interface ExpiryNotificationInput {
  propertyTitle: string;
  propertyId: string;
  planName: string;
  daysRemaining: number;
  ownerName?: string;
}

export class NotificationRetentionAgent {
  static readonly agentId = 'notification_retention';

  /**
   * Gjeneron tekstin e njoftimit sipas ditëve të mbetura
   */
  static generateExpiryReminder(input: ExpiryNotificationInput): {
    subject: string;
    body: string;
    actionUrl: string;
  } {
    const actionUrl = `/dashboard/pronat`;
    const greeting = input.ownerName ? `I/E nderuar ${input.ownerName},` : 'Përshëndetje,';

    if (input.daysRemaining === 2) {
      return {
        subject: `PronaX: Shpallja juaj skadon pas 2 ditësh — ${input.propertyTitle}`,
        body:
          `${greeting}\n\n` +
          `Ju njoftojmë se shpallja juaj **"${input.propertyTitle}"** (Plani ${input.planName}) skadon pas 2 ditësh.\n\n` +
          `Për të siguruar që prona juaj të mbetet e dukshme për blerësit dhe qiramarrësit potencialë në Kosovë, ` +
          `mund ta rinovoni atë me një klikim të vetëm nga paneli juaj.\n\n` +
          `*PronaX nuk kryen debitim automatik. Rinovimi është 100% manual me zgjedhjen tuaj.*`,
        actionUrl,
      };
    }

    if (input.daysRemaining <= 0) {
      return {
        subject: `PronaX: Shpallja juaj sapo ka skaduar — ${input.propertyTitle}`,
        body:
          `${greeting}\n\n` +
          `Shpallja juaj **"${input.propertyTitle}"** ka përfunduar periudhën e vlefshmërisë dhe tani është çaktivizuar nga kërkimi publik.\n\n` +
          `Të gjitha të dhënat dhe fotografitë tuaja janë ruajtur të sigurta. Mund ta riaktivizoni menjëherë duke zgjedhur një nga 3 planet tona:\n` +
          `• Plani Falas: 0.00 € (3 ditë)\n` +
          `• Plani Javor: 2.99 € (7 ditë)\n` +
          `• Plani Mujor: 9.99 € (30 ditë)\n\n` +
          `Klikoni më poshtë për ta rinovuar me lehtësi.`,
        actionUrl,
      };
    }

    return {
      subject: `PronaX: Përditësim mbi shpalljen tuaj — ${input.propertyTitle}`,
      body:
        `${greeting}\n\n` +
        `Shpallja juaj **"${input.propertyTitle}"** mbetet aktive edhe për ${input.daysRemaining} ditë. ` +
        `Ju urojmë suksese në shitjen ose dhënien me qira!`,
      actionUrl,
    };
  }
}
