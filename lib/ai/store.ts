/**
 * PronaX AI — In-Memory Store & Fallback Layer
 * Siguron funksionim të pandërprerë të sistemit AI edhe kur baza e të dhënave
 * Supabase është në modalitet zhvillimi / sandbox.
 */

import {
  AgentId,
  AgentSettings,
  AIConversation,
  AIMessageRecord,
  ActionLogRecord,
  ModerationFlagRecord,
  EmergencySwitch,
} from './types';

class AIStore {
  private emergencySwitch: EmergencySwitch = {
    allAgentsDisabled: false,
  };

  private agentSettings: Map<AgentId, AgentSettings> = new Map();
  private conversations: Map<string, AIConversation> = new Map();
  private messages: Map<string, AIMessageRecord[]> = new Map();
  private actionLogs: ActionLogRecord[] = [];
  private moderationFlags: Map<string, ModerationFlagRecord> = new Map();

  constructor() {
    this.seedDefaultSettings();
  }

  private seedDefaultSettings() {
    const defaults: AgentSettings[] = [
      {
        agentId: 'customer_support',
        name: 'Agjenti i Mbështetjes',
        description: 'Jep mbështetje automatike për përdoruesit e PronaX në shqip dhe anglisht.',
        isEnabled: true,
        model: 'claude-sonnet-4-5',
        maxTokens: 1024,
        temperature: 0.7,
        systemPrompt: null,
        rateLimitPerMinute: 30,
        rateLimitPerDay: 1000,
        requiresAuth: false,
        requiresAdmin: false,
        accessLevel: 'public',
      },
      {
        agentId: 'listing_assistant',
        name: 'Asistenti i Shpalljeve',
        description: 'Ndihmon në gjenerimin e titujve, përshkrimeve dhe fjalëve kyçe.',
        isEnabled: true,
        model: 'claude-sonnet-4-5',
        maxTokens: 2048,
        temperature: 0.8,
        systemPrompt: null,
        rateLimitPerMinute: 10,
        rateLimitPerDay: 200,
        requiresAuth: true,
        requiresAdmin: false,
        accessLevel: 'authenticated',
      },
      {
        agentId: 'fraud_detection',
        name: 'Zbulimi i Mashtrimit',
        description: 'Verifikon rrezikun e shpalljeve të reja dhe njofton administratorin.',
        isEnabled: true,
        model: 'claude-sonnet-4-5',
        maxTokens: 512,
        temperature: 0.1,
        systemPrompt: null,
        rateLimitPerMinute: 50,
        rateLimitPerDay: 2000,
        requiresAuth: false,
        requiresAdmin: false,
        accessLevel: 'public',
      },
      {
        agentId: 'smart_search',
        name: 'Kërkimi Inteligjent',
        description: 'Konverton kërkesat e folura/shkruara në filtra të strukturuar.',
        isEnabled: true,
        model: 'claude-sonnet-4-5',
        maxTokens: 512,
        temperature: 0.3,
        systemPrompt: null,
        rateLimitPerMinute: 60,
        rateLimitPerDay: 3000,
        requiresAuth: false,
        requiresAdmin: false,
        accessLevel: 'public',
      },
      {
        agentId: 'admin_assistant',
        name: 'Asistenti i Administratorit',
        description: 'Analitikë, raporte ditore/mujore dhe mbështetje teknike për administratorin.',
        isEnabled: true,
        model: 'claude-sonnet-4-5',
        maxTokens: 2048,
        temperature: 0.6,
        systemPrompt: null,
        rateLimitPerMinute: 20,
        rateLimitPerDay: 500,
        requiresAuth: true,
        requiresAdmin: true,
        accessLevel: 'admin',
      },
      {
        agentId: 'notification_retention',
        name: 'Agjenti i Njoftimeve',
        description: 'Krijon mesazhe rikujtuese dhe njoftime skadimi të personalizuara.',
        isEnabled: true,
        model: 'claude-sonnet-4-5',
        maxTokens: 512,
        temperature: 0.7,
        systemPrompt: null,
        rateLimitPerMinute: 20,
        rateLimitPerDay: 500,
        requiresAuth: false,
        requiresAdmin: false,
        accessLevel: 'public',
      },
      {
        agentId: 'market_insights',
        name: 'Analiza e Tregut',
        description: 'Statistika mbi çmimet për m² dhe tendencat në Kosovë.',
        isEnabled: true,
        model: 'claude-sonnet-4-5',
        maxTokens: 1024,
        temperature: 0.4,
        systemPrompt: null,
        rateLimitPerMinute: 10,
        rateLimitPerDay: 200,
        requiresAuth: false,
        requiresAdmin: false,
        accessLevel: 'public',
      },
      {
        agentId: 'recommendation',
        name: 'Rekomandimet',
        description: 'Prona të ngjashme dhe sugjerime të personalizuara.',
        isEnabled: true,
        model: 'claude-sonnet-4-5',
        maxTokens: 512,
        temperature: 0.5,
        systemPrompt: null,
        rateLimitPerMinute: 30,
        rateLimitPerDay: 1000,
        requiresAuth: false,
        requiresAdmin: false,
        accessLevel: 'public',
      },
    ];

    for (const item of defaults) {
      this.agentSettings.set(item.agentId, item);
    }
  }

  // ---- Emergency Switch ----
  getEmergencySwitch(): EmergencySwitch {
    return { ...this.emergencySwitch };
  }

  setEmergencySwitch(disabled: boolean, reason?: string) {
    this.emergencySwitch = {
      allAgentsDisabled: disabled,
      disabledAt: disabled ? new Date().toISOString() : undefined,
      disableReason: reason,
    };
  }

  // ---- Agent Settings ----
  getAllAgentSettings(): AgentSettings[] {
    return Array.from(this.agentSettings.values());
  }

  getAgentSetting(agentId: AgentId): AgentSettings | undefined {
    return this.agentSettings.get(agentId);
  }

  updateAgentSetting(agentId: AgentId, patch: Partial<AgentSettings>): AgentSettings {
    const existing = this.agentSettings.get(agentId);
    if (!existing) {
      throw new Error(`Agjenti ${agentId} nuk u gjet.`);
    }
    const updated = { ...existing, ...patch };
    this.agentSettings.set(agentId, updated);
    return updated;
  }

  // ---- Conversations ----
  getConversation(id: string): AIConversation | undefined {
    return this.conversations.get(id);
  }

  saveConversation(conv: AIConversation) {
    this.conversations.set(conv.id, conv);
  }

  getMessages(conversationId: string): AIMessageRecord[] {
    return this.messages.get(conversationId) || [];
  }

  addMessage(msg: AIMessageRecord) {
    const list = this.messages.get(msg.conversationId) || [];
    list.push(msg);
    this.messages.set(msg.conversationId, list);
  }

  // ---- Action Logs ----
  logAction(log: ActionLogRecord) {
    this.actionLogs.unshift(log);
    if (this.actionLogs.length > 1000) {
      this.actionLogs.pop();
    }
  }

  getActionLogs(limit = 50): ActionLogRecord[] {
    return this.actionLogs.slice(0, limit);
  }

  // ---- Moderation Flags ----
  addModerationFlag(flag: ModerationFlagRecord) {
    this.moderationFlags.set(flag.id, flag);
  }

  getModerationFlags(): ModerationFlagRecord[] {
    return Array.from(this.moderationFlags.values());
  }

  updateModerationFlag(id: string, patch: Partial<ModerationFlagRecord>) {
    const existing = this.moderationFlags.get(id);
    if (existing) {
      this.moderationFlags.set(id, { ...existing, ...patch });
    }
  }
}

// Eksport i vetëm singleton
export const aiStore = new AIStore();
