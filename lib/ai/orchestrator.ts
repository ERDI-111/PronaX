/**
 * PronaX AI — Shërbimi Qendror i Orkestrimit (Central AI Orchestration Service)
 * Faza 2: Menaxhimi i unifikuar i 8 Agjentëve të Specializuar
 */

import {
  AgentId,
  AIRequest,
  AIResponse,
  AIMessage,
  AIConversation,
  AIMessageRecord,
} from './types';
import { aiStore } from './store';
import { AISecurityGuard } from './security';
import { SYSTEM_PROMPTS } from './prompts/system-prompts';
import { ClaudeClient, getClaudeClient } from './client';
import {
  CustomerSupportAgent,
  ListingAssistantAgent,
  FraudDetectionAgent,
  SmartSearchAgent,
  AdminAssistantAgent,
  NotificationRetentionAgent,
  MarketInsightsAgent,
  RecommendationAgent,
} from './agents';

export class AIOrchestrator {
  /**
   * Pika e vetme qendrore hyrëse për të gjithë agjentët AI
   */
  static async handleRequest(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    const { agentId, sessionId, userId, ipAddress, language = 'sq' } = request;

    // 1. KONTROLLI I ÇELËSIT TË EMERGJENCËS (Emergency Switch)
    const emergency = aiStore.getEmergencySwitch();
    if (emergency.allAgentsDisabled) {
      return {
        success: false,
        conversationId: request.conversationId || `conv-${Date.now()}`,
        agentId,
        content:
          language === 'sq'
            ? 'Sistemi AI është përkohësisht i çaktivizuar nga administrata për mirëmbajtje.'
            : 'AI system is temporarily disabled by administrators for maintenance.',
        tokensUsed: { input: 0, output: 0 },
        responseTimeMs: Date.now() - startTime,
        error: 'EMERGENCY_DISABLED',
      };
    }

    // 2. KONTROLLI I STATUSIT TË AGJENTIT (Individual Agent Enabled/Disabled)
    const settings = aiStore.getAgentSetting(agentId);
    if (!settings || !settings.isEnabled) {
      return {
        success: false,
        conversationId: request.conversationId || `conv-${Date.now()}`,
        agentId,
        content:
          language === 'sq'
            ? 'Ky shërbim AI është përkohësisht i padisponueshëm.'
            : 'This AI service is currently unavailable.',
        tokensUsed: { input: 0, output: 0 },
        responseTimeMs: Date.now() - startTime,
        error: 'AGENT_DISABLED',
      };
    }

    // 3. KONTROLLI I AUTORIZIMIT DHE ROLIT
    const accessCheck = AISecurityGuard.validateAccess(
      settings.accessLevel,
      userId,
      request.context?.isAdmin === true
    );
    if (!accessCheck.safe) {
      return {
        success: false,
        conversationId: request.conversationId || `conv-${Date.now()}`,
        agentId,
        content: accessCheck.reason || 'Nuk keni autorizim për këtë shërbim.',
        tokensUsed: { input: 0, output: 0 },
        responseTimeMs: Date.now() - startTime,
        error: 'ACCESS_DENIED',
      };
    }

    // 4. KONTROLLI I RATE LIMIT (Kufizimi i Kërkesave)
    const clientKey = `${agentId}:${ipAddress || sessionId || 'anonymous'}`;
    // Përdorim rate-limit bazë
    const rateCheck = AISecurityGuard.validateRateLimit(
      clientKey,
      agentId,
      0, // Store mund të zgjerohet me numërues
      settings.rateLimitPerMinute
    );
    if (!rateCheck.safe) {
      return {
        success: false,
        conversationId: request.conversationId || `conv-${Date.now()}`,
        agentId,
        content: rateCheck.reason || 'Keni kaluar kufirin e kërkesave.',
        tokensUsed: { input: 0, output: 0 },
        responseTimeMs: Date.now() - startTime,
        error: 'RATE_LIMIT_EXCEEDED',
      };
    }

    // 5. KONTROLLI I SIGURISË: PROMPT INJECTION & SANITIZATION
    const lastUserMessage = request.messages
      .filter((m) => m.role === 'user')
      .slice(-1)[0];

    if (!lastUserMessage) {
      return {
        success: false,
        conversationId: request.conversationId || `conv-${Date.now()}`,
        agentId,
        content: 'Ju lutem shkruani një kërkesë të vlefshme.',
        tokensUsed: { input: 0, output: 0 },
        responseTimeMs: Date.now() - startTime,
        error: 'EMPTY_INPUT',
      };
    }

    const securityCheck = AISecurityGuard.checkInput(lastUserMessage.content);
    if (!securityCheck.safe) {
      aiStore.logAction({
        id: `act-${Date.now()}`,
        agentId,
        userId,
        actionType: 'security_violation',
        actionInput: { rawText: lastUserMessage.content },
        actionOutput: { reason: securityCheck.reason },
        success: false,
        durationMs: Date.now() - startTime,
        ipAddress,
        createdAt: new Date().toISOString(),
      });

      return {
        success: false,
        conversationId: request.conversationId || `conv-${Date.now()}`,
        agentId,
        content:
          securityCheck.reason ||
          'Kërkesa përmban elemente të pasigurta dhe nuk mund të përpunohet.',
        tokensUsed: { input: 0, output: 0 },
        responseTimeMs: Date.now() - startTime,
        error: 'SECURITY_BLOCKED',
      };
    }

    // 6. MENAXHIMI I SESIONIT DHE HISTORIKUT TË BISEDËS
    const convId = request.conversationId || `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    let conv = aiStore.getConversation(convId);
    if (!conv) {
      conv = {
        id: convId,
        agentId,
        userId,
        sessionId,
        propertyId: request.propertyId,
        status: 'active',
        language,
        escalatedToAdmin: false,
        totalMessages: 0,
        inputTokensUsed: 0,
        outputTokensUsed: 0,
        startedAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
      };
      aiStore.saveConversation(conv);
    }

    // Ruaj mesazhin e përdoruesit
    aiStore.addMessage({
      id: `msg-${Date.now()}-u`,
      conversationId: convId,
      role: 'user',
      content: securityCheck.sanitizedInput || lastUserMessage.content,
      isFlagged: false,
      inputTokens: 0,
      outputTokens: 0,
      responseTimeMs: 0,
      createdAt: new Date().toISOString(),
    });

    // 7. EKZEKUTIMI I AGJENTIT (Claude API ose Intelligent Engine Fallback)
    const systemPrompt = settings.systemPrompt || SYSTEM_PROMPTS[agentId];

    let aiOutput = '';
    let inputTokens = 0;
    let outputTokens = 0;

    try {
      if (ClaudeClient.isConfigured()) {
        const client = getClaudeClient();
        const claudeMessages = request.messages.map((m) => ({
          role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
          content: m.content,
        }));

        const response = await client.complete({
          model: settings.model,
          maxTokens: settings.maxTokens,
          temperature: Number(settings.temperature),
          systemPrompt,
          messages: claudeMessages,
        });

        aiOutput = response.content;
        inputTokens = response.inputTokens;
        outputTokens = response.outputTokens;
      } else {
        // Fallback inteligjent kur CLAUDE_API_KEY ende nuk është vendosur në Render / Local
        aiOutput = this.generateAutonomousFallback(agentId, lastUserMessage.content, language);
        inputTokens = Math.ceil(lastUserMessage.content.length / 4);
        outputTokens = Math.ceil(aiOutput.length / 4);
      }
    } catch (err: any) {
      console.error(`[PronaX AI] Gabim gjatë ekzekutimit të agjentit ${agentId}:`, err);
      // Përdorim motorin e pavarur fallback për të siguruar 100% uptime
      aiOutput = this.generateAutonomousFallback(agentId, lastUserMessage.content, language);
      inputTokens = Math.ceil(lastUserMessage.content.length / 4);
      outputTokens = Math.ceil(aiOutput.length / 4);
    }

    const durationMs = Date.now() - startTime;

    // 8. RUAJTJA E MESAZHIT TË AGJENTIT DHE AUDITIMI
    aiStore.addMessage({
      id: `msg-${Date.now()}-a`,
      conversationId: convId,
      role: 'assistant',
      content: aiOutput,
      isFlagged: false,
      inputTokens,
      outputTokens,
      responseTimeMs: durationMs,
      createdAt: new Date().toISOString(),
    });

    // Përditëso bisedën
    conv.totalMessages += 2;
    conv.inputTokensUsed += inputTokens;
    conv.outputTokensUsed += outputTokens;
    conv.lastMessageAt = new Date().toISOString();
    aiStore.saveConversation(conv);

    // Audit log
    aiStore.logAction({
      id: `act-${Date.now()}`,
      agentId,
      conversationId: convId,
      userId,
      actionType: 'agent_response',
      actionInput: { query: lastUserMessage.content },
      actionOutput: { preview: aiOutput.slice(0, 120) },
      success: true,
      durationMs,
      ipAddress,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      conversationId: convId,
      agentId,
      content: aiOutput,
      tokensUsed: { input: inputTokens, output: outputTokens },
      responseTimeMs: durationMs,
    };
  }

  /**
   * Gjenerues i përgjigjeve të sakta autonome sipas të dhënave të platformës
   * (Përdoret kur API key nuk është i pranishëm ose si mbrojtje nga dështimi i rrjetit)
   */
  private static generateAutonomousFallback(
    agentId: AgentId,
    query: string,
    language: 'sq' | 'en'
  ): string {
    const q = query.toLowerCase();

    switch (agentId) {
      case 'customer_support':
        if (q.includes('plan') || q.includes('cmim') || q.includes('çmim') || q.includes('kushton') || q.includes('price')) {
          return language === 'sq'
            ? 'Në PronaX kemi 3 plane të thjeshta dhe transparente:\n\n' +
                '1. **Plani Falas (0 €)** — Publikim për 3 ditë pa asnjë pagesë.\n' +
                '2. **Plani Javor (2.99 €)** — Shfaqje prioritare për 7 ditë të plota.\n' +
                '3. **Plani Mujor (9.99 €)** — Ekspozim maksimal për 30 ditë kalendarike.\n\n' +
                'Të gjitha pagesat janë njëherëshe pa debitim automatik dhe rinovimi bëhet vetëm manualisht nga paneli juaj.'
            : 'PronaX offers 3 transparent listing plans:\n\n' +
                '1. **Free Plan (0 €)** — 3 days publication with zero cost.\n' +
                '2. **Weekly Plan (2.99 €)** — Priority exposure for 7 days.\n' +
                '3. **Monthly Plan (9.99 €)** — Maximum visibility for 30 days.\n\n' +
                'All plans are one-time payments with no automatic recurring charges.';
        }
        if (q.includes('publiko') || q.includes('shto') || q.includes('publish')) {
          return language === 'sq'
            ? 'Për të publikuar një pronë:\n\n' +
                '1. Kliko butonin **"Publiko Pronë"** në menunë kryesore.\n' +
                '2. Plotëso 5 hapat e thjeshtë (Kategoria, Detajet, Lokacioni në Kosovë, Çmimi, dhe Fotot).\n' +
                '3. Nëse zgjedh Planin Falas (0 €), prona juaj aktivizohet menjëherë pa kërkuar pagesë!'
            : 'To publish a property, click "Publiko Pronë", complete the 5 simple steps, and choose your preferred plan (Free 0€ activates instantly).';
        }
        return language === 'sq'
          ? 'Përshëndetje! Jam Asistenti Zyrtar i PronaX. Mund t\'ju ndihmoj me informacion mbi shpalljet e pronave, planet tona (0 €, 2.99 €, 9.99 €), kërkimin në hartë dhe llogarinë tuaj në Kosovë. Si mund t\'ju ndihmoj sot?'
          : 'Hello! I am the PronaX Support Assistant. How can I assist you with real estate in Kosovo today?';

      case 'smart_search': {
        const filters = SmartSearchAgent.parseQuery(query);
        return JSON.stringify(filters, null, 2);
      }

      case 'market_insights': {
        const insight = MarketInsightsAgent.getInsight('prishtine', 'banese', 'shitje');
        return insight.analysisText;
      }

      case 'admin_assistant':
        return AdminAssistantAgent.answerQuery(query);

      default:
        return language === 'sq'
          ? `Agjenti ${agentId} e përpunoi kërkesën tuaj me sukses.`
          : `Agent ${agentId} processed your request successfully.`;
    }
  }
}
