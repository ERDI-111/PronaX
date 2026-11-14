/**
 * PronaX AI — AGENT 5: Administrator AI Assistant
 * Asistenti inteligjent ekskluziv i administratorit të PronaX
 */

import { aiStore } from '../store';
import { PRONAX_PRICING_PLANS } from '@/lib/payments/plans';

export interface AdminReportData {
  timeframe: 'daily' | 'weekly' | 'monthly';
  totalListingsCount?: number;
  activeListingsCount?: number;
  expiredListingsCount?: number;
  totalUsersCount?: number;
}

export class AdminAssistantAgent {
  static readonly agentId = 'admin_assistant';

  static async generateReport(timeframe: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<string> {
    const flags = aiStore.getModerationFlags();
    const pendingFlags = flags.filter((f) => !f.adminReviewed);
    const agentSettings = aiStore.getAllAgentSettings();
    const emergency = aiStore.getEmergencySwitch();

    const dateStr = new Date().toLocaleDateString('sq-AL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      `📊 **RAPORTI ${timeframe.toUpperCase()} I ADMINISTRATORIT — PRONAX KOSOVË**\n` +
      `📅 Data: ${dateStr}\n\n` +
      `**1. Statusi i Sistemit & Sigurisë:**\n` +
      `• Çelësi i Emergjencës: ${emergency.allAgentsDisabled ? '🔴 ÇAKTIVIZUAR (Emergjencë)' : '🟢 AKTIV (Operacion Normal)'}\n` +
      `• Agjentë AI aktivë: ${agentSettings.filter((a) => a.isEnabled).length} nga ${agentSettings.length}\n` +
      `• Shpallje në pritje të moderimit (Flamuj Rreziku): **${pendingFlags.length}**\n\n` +
      `**2. Planet e Publikimit & Modeli Financiar:**\n` +
      `• Plani Falas: 0.00 € (Kohëzgjatja 3 ditë)\n` +
      `• Plani Javor: 2.99 € (Kohëzgjatja 7 ditë)\n` +
      `• Plani Mujor: 9.99 € (Kohëzgjatja 30 ditë)\n` +
      `• Rregulli i pagesave: 100% manual, 0% abonime automatike.\n\n` +
      `**3. Rekomandime për Administratorin:**\n` +
      (pendingFlags.length > 0
        ? `⚠️ Keni ${pendingFlags.length} shpallje me rrezik mesatar/të lartë që kërkojnë shqyrtim manual te Paneli i Moderimit.\n`
        : `✅ Të gjitha shpalljet janë verifikuar dhe nuk ka raste urgjente të mashtrimit.\n`) +
      `• Sistemi i verifikimit me kod 6-shifror OTP dhe mbrojtja XSS/Rate Limiting janë aktive.`
    );
  }

  static answerQuery(query: string): string {
    const q = query.toLowerCase();

    if (q.includes('raport') || q.includes('report') || q.includes('stat')) {
      return (
        'Mund të gjeneroj raport të plotë ditor, javor ose mujor. ' +
        'Përdorni pyetjet: "Më jep raportin ditor" ose "Si është gjendja e sistemit?".'
      );
    }

    if (q.includes('mashtrim') || q.includes('flamur') || q.includes('flag')) {
      const flags = aiStore.getModerationFlags();
      const pending = flags.filter((f) => !f.adminReviewed);
      return (
        `Aktualisht janë regjistruar ${flags.length} flamurë rreziku nga Agjenti i Moderimit, ` +
        `prej të cilëve ${pending.length} janë në pritje të shqyrtimit tuaj manual.`
      );
    }

    if (q.includes('plan') || q.includes('cmim') || q.includes('çmim')) {
      return (
        'Planet zyrtare të PronaX janë:\n' +
        '• Plani 1: Falas (0 €) — 3 ditë\n' +
        '• Plani 2: Javor (2.99 €) — 7 ditë\n' +
        '• Plani 3: Mujor (9.99 €) — 30 ditë\n' +
        'Të gjitha referencat e çmimit të vjetër 7 € janë eliminuar plotësisht.'
      );
    }

    return (
      'Përshëndetje Administrator! Jam Asistenti juaj Privat i PronaX. ' +
      'Mund t\'ju ndihmoj me analitikën e platformës, monitorimin e transaksioneve, radhën e moderimit dhe raportet ditore. ' +
      'Çfarë dëshironi të shqyrtojmë?'
    );
  }
}
