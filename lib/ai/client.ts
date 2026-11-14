/**
 * PronaX AI — Klienti Qendror i Claude API
 * Provider-independent, server-side only
 * Çelësat sekretë KURRË nuk ekspozohen në frontend
 */

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeRequestOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  messages: ClaudeMessage[];
}

export interface ClaudeResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
  stopReason: string;
}

/**
 * Klasa kryesore e klientit Claude API
 * E pavarur nga ofruesi — mund të zëvendësohet me OpenAI pa ndryshuar kodin tjetër
 */
export class ClaudeClient {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor() {
    const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        '[PronaX AI] CLAUDE_API_KEY nuk është konfiguruar. ' +
        'Vendos variablin e mjedisit CLAUDE_API_KEY në .env.local'
      );
    }
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.anthropic.com/v1';
    this.defaultModel = 'claude-sonnet-4-5';
  }

  /**
   * Dërgon kërkesë te Claude API
   */
  async complete(options: ClaudeRequestOptions): Promise<ClaudeResponse> {
    const {
      model = this.defaultModel,
      maxTokens = 1024,
      temperature = 0.7,
      systemPrompt,
      messages,
    } = options;

    const startTime = Date.now();

    const requestBody: Record<string, unknown> = {
      model,
      max_tokens: maxTokens,
      temperature,
      messages,
    };

    if (systemPrompt) {
      requestBody.system = systemPrompt;
    }

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `[PronaX AI] Claude API gaboi me status ${response.status}: ${errorBody}`
      );
    }

    const data = await response.json();
    const elapsed = Date.now() - startTime;

    console.log(
      `[PronaX AI] Claude u përgjigj në ${elapsed}ms — ` +
      `Tokenë: ${data.usage?.input_tokens ?? 0} hyrje / ${data.usage?.output_tokens ?? 0} dalje`
    );

    return {
      content: data.content?.[0]?.text ?? '',
      inputTokens: data.usage?.input_tokens ?? 0,
      outputTokens: data.usage?.output_tokens ?? 0,
      model: data.model ?? model,
      stopReason: data.stop_reason ?? 'end_turn',
    };
  }

  /**
   * Kontrollo nëse API key është konfiguruar
   */
  static isConfigured(): boolean {
    return !!(process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY);
  }
}

// Eksportim i instancës singleton (lazy initialization)
let _client: ClaudeClient | null = null;

export function getClaudeClient(): ClaudeClient {
  if (!_client) {
    _client = new ClaudeClient();
  }
  return _client;
}
