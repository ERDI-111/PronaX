/**
 * PronaX AI — AGENT 1: Customer Support Agent
 * Ofron mbështetje automatike profesionale në shqip dhe anglisht
 */

import { AIMessage, AIResponse } from '../types';
import { SYSTEM_PROMPTS } from '../prompts/system-prompts';
import { ClaudeClient, getClaudeClient } from '../client';

export class CustomerSupportAgent {
  static readonly agentId = 'customer_support';

  static async process(
    messages: AIMessage[],
    language: 'sq' | 'en' = 'sq',
    context?: Record<string, unknown>
  ): Promise<{ content: string; escalated: boolean; escalationReason?: string }> {
    const lastMsg = messages[messages.length - 1]?.content || '';
    const lower = lastMsg.toLowerCase();

    // Kontroll për eskalim te administratori
    let escalated = false;
    let escalationReason: string | undefined;

    if (
      lower.includes('mashtrim') ||
      lower.includes('vodhën') ||
      lower.includes('polici') ||
      lower.includes('avokat') ||
      lower.includes('rimbursim') ||
      lower.includes('scam') ||
      lower.includes('refund') ||
      lower.includes('legal')
    ) {
      escalated = true;
      escalationReason = 'Përdoruesi kërkon ndërhyrje njerëzore për çështje ligjore/financiare/mashtrimi.';
    }

    // Nëse Claude API është i konfiguruar, thirr modelin
    if (ClaudeClient.isConfigured()) {
      try {
        const client = getClaudeClient();
        const response = await client.complete({
          model: 'claude-sonnet-4-5',
          maxTokens: 1024,
          temperature: 0.6,
          systemPrompt: SYSTEM_PROMPTS.customer_support,
          messages: messages.map((m) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
        });

        return {
          content: response.content,
          escalated,
          escalationReason,
        };
      } catch (err) {
        console.warn('[CustomerSupportAgent] Claude API dështoi, përdorim motorin e saktë autonom:', err);
      }
    }

    // Motori autonom i diturive të PronaX
    const content = this.generateAutonomousSupport(lower, language, escalated);
    return { content, escalated, escalationReason };
  }

  private static generateAutonomousSupport(
    query: string,
    language: 'sq' | 'en',
    escalated: boolean
  ): string {
    if (escalated) {
      return language === 'sq'
        ? 'Rasti juaj kërkon vëmendjen e drejtpërdrejtë të stafit administrativ të PronaX. ' +
            'Kërkesa juaj është shënuar për rishikim prioritar. Ju lutemi gjithashtu na shkruani drejtpërdrejt në: ' +
            '**pronaxestate@outlook.com** ose përmes faqes [/kontakti](/kontakti) duke përfshirë numrin e telefonit tuaj.'
        : 'Your inquiry requires direct administrator assistance. ' +
            'Please contact us directly at **pronaxestate@outlook.com** or via our [/kontakti](/kontakti) page.';
    }

    if (
      query.includes('plan') ||
      query.includes('cmim') ||
      query.includes('çmim') ||
      query.includes('tarife') ||
      query.includes('kushton') ||
      query.includes('pages')
    ) {
      return language === 'sq'
        ? 'PronaX ofron 3 plane të unifikuara për publikimin e pronave në Kosovë:\n\n' +
            '1. **Plani Falas (0.00 €)**:\n' +
            '   • Kohëzgjatja: **3 ditë**\n' +
            '   • Nuk kërkon pagesë — prona juaj aktivizohet menjëherë!\n\n' +
            '2. **Plani Javor (2.99 €)**:\n' +
            '   • Kohëzgjatja: **7 ditë**\n' +
            '   • Shfaqje prioritare në kërkim & hartë gjeografike\n\n' +
            '3. **Plani Mujor (9.99 €)**:\n' +
            '   • Kohëzgjatja: **30 ditë**\n' +
            '   • Ekspozim maksimal në të gjithë Kosovën me shënjues të veçuar\n\n' +
            '*(Kujtesë: Të gjitha pagesat janë njëherëshe pa debitim automatik. Rinovimi bëhet vetëm me zgjedhjen tuaj manuale)*'
        : 'PronaX provides 3 official listing plans in Kosovo:\n\n' +
            '1. **Free Plan (0.00 €)**: 3 days active, zero payment needed.\n' +
            '2. **Weekly Plan (2.99 €)**: 7 days active, priority visibility.\n' +
            '3. **Monthly Plan (9.99 €)**: 30 days active, maximum exposure.\n\n' +
            'All plans are single payments with NO recurring subscriptions.';
    }

    if (query.includes('publiko') || query.includes('shto') || query.includes('shpall')) {
      return language === 'sq'
        ? 'Për të publikuar pronën tuaj:\n\n' +
            '1. Shko te butoni **"Publiko Pronë"** në menunë kryesore.\n' +
            '2. Plotëso 5 hapat: Lloji i pronës, Karakteristikat, Lokacioni (38 komunat e Kosovës), Çmimi, dhe Ngarko Fotot nga telefoni/kompjuteri.\n' +
            '3. Nëse zgjedh Planin Falas (0 €), shpallja shkon direkt live pa pritur!'
        : 'To list your property, click "Publiko Pronë", follow the 5 steps, upload your photos directly from your device, and select your plan.';
    }

    if (query.includes('skad') || query.includes('rinov') || query.includes('vlefshm')) {
      return language === 'sq'
        ? 'Kur skadon afati i pronës suaj (3 ditë, 7 ditë ose 30 ditë), prona çaktivizohet automatikisht dhe ruhet në panelin tuaj te [/dashboard/pronat](/dashboard/pronat).\n\n' +
            'PronaX **nuk tërheq kurrë para automatikisht**. Për ta riaktivizuar, thjesht klikoni butonin "Rinovo" dhe zgjidhni një nga 3 planet tona.'
        : 'When your property expires, it is safely stored in your dashboard. PronaX has 0 automatic debits. You can renew anytime manually with one click.';
    }

    if (query.includes('harta') || query.includes('map') || query.includes('lokacion')) {
      return language === 'sq'
        ? 'Harta jonë interaktive mbulon të 38 komunat e Kosovës me OpenStreetMap. Mund të filtroni banesa, shtëpi, troje dhe lokale në çdo qytet dhe fshat të Kosovës te faqja [/harta](/harta).'
        : 'Our interactive map covers all 38 municipalities of Kosovo. Explore listings at [/harta](/harta).';
    }

    return language === 'sq'
      ? 'Përshëndetje! Jam Asistenti Zyrtar i Mbështetjes PronaX. Mund t\'ju ndihmoj për:\n' +
          '• Si të publikoni pronën tuaj (me Planin Falas 0 € ose planet javore/mujore)\n' +
          '• Informacione mbi çmimet dhe rregullat e tregut në Kosovë\n' +
          '• Menaxhimin e llogarisë dhe rinovimin e shpalljeve\n\n' +
          'Çfarë dëshironi të dini?'
      : 'Hello! I am the PronaX Support Assistant. I can assist you with publishing, pricing, renewals, and finding real estate across Kosovo. How may I help you?';
  }
}
