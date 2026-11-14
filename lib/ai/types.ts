/**
 * PronaX AI — Tipet dhe Interfejset e Sistemit AI
 * Faza 2: Dizajni i Arkitekturës
 */

// ID-të e agjentëve të licencuar
export type AgentId =
  | 'customer_support'
  | 'listing_assistant'
  | 'fraud_detection'
  | 'smart_search'
  | 'admin_assistant'
  | 'notification_retention'
  | 'market_insights'
  | 'recommendation';

// Nivelet e rrezikut për Agjentin 3 (Fraud Detection)
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// Rolet e mesazheve në bisedë
export type MessageRole = 'user' | 'assistant' | 'system';

// Statuset e bisedave AI
export type ConversationStatus = 'active' | 'resolved' | 'escalated' | 'closed';

// Gjuhët e mbështetura
export type SupportedLanguage = 'sq' | 'en';

// ==============================================================================
// Interfejset Kryesore
// ==============================================================================

/** Konfigurimet e agjentit nga baza e të dhënave */
export interface AgentSettings {
  agentId: AgentId;
  name: string;
  description: string;
  isEnabled: boolean;
  model: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string | null;
  rateLimitPerMinute: number;
  rateLimitPerDay: number;
  requiresAuth: boolean;
  requiresAdmin: boolean;
  accessLevel: 'public' | 'authenticated' | 'admin';
}

/** Kërkesa për orkestratorin AI */
export interface AIRequest {
  agentId: AgentId;
  conversationId?: string;
  sessionId: string;
  userId?: string;
  propertyId?: string;
  messages: AIMessage[];
  language?: SupportedLanguage;
  context?: Record<string, unknown>;
  ipAddress?: string;
}

/** Mesazhi individual AI */
export interface AIMessage {
  role: MessageRole;
  content: string;
}

/** Përgjigja e orkestratorit AI */
export interface AIResponse {
  success: boolean;
  conversationId: string;
  content: string;
  agentId: AgentId;
  tokensUsed: {
    input: number;
    output: number;
  };
  responseTimeMs: number;
  escalated?: boolean;
  escalationReason?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

/** Rezultati i zbulimit të mashtrimit (Agjenti 3) */
export interface FraudAnalysisResult {
  riskLevel: RiskLevel;
  riskScore: number;        // 0 - 100
  reasons: string[];
  detectedIssues: {
    duplicateContent?: boolean;
    suspiciousPrice?: boolean;
    suspiciousDescription?: boolean;
    suspiciousContact?: boolean;
    suspiciousImages?: boolean;
    unusualActivity?: boolean;
  };
  recommendation: string;  // 'approve' | 'review' | 'hold' | 'reject'
  requiresAdminReview: boolean;
}

/** Filtrat e strukturuar nga kërkimi me gjuhë natyrore (Agjenti 4) */
export interface SearchFilters {
  municipality?: string;
  propertyType?: string;
  listingType?: 'shitje' | 'qira';
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  maxRooms?: number;
  minArea?: number;
  maxArea?: number;
  hasParking?: boolean;
  hasGarage?: boolean;
  hasBalcony?: boolean;
  hasElevator?: boolean;
  furnished?: string;
  confidence: number;       // 0.0 - 1.0, besimi i AI-t
  originalQuery: string;    // Kërkesa origjinale e përdoruesit
}

/** Ndihmë e gjeneruar nga Agjenti 2 (Listing Assistant) */
export interface ListingAssistance {
  suggestedTitle: string;
  suggestedDescription: string;
  keywords: string[];
  seoTitle?: string;
  seoDescription?: string;
  missingFields: string[];
  qualityScore: number;     // 0 - 100
  approved: false;          // GJITHMONË false — duhet aprovim nga përdoruesi
}

/** Raporti i tregut nga Agjenti 7 (Market Insights) */
export interface MarketInsight {
  municipality: string;
  propertyType: string;
  listingType: string;
  avgPriceEur: number;
  avgPricePerM2: number;
  minPrice: number;
  maxPrice: number;
  totalListings: number;
  priceTrend: 'rritje' | 'rënie' | 'stabil';
  trendPercentage: number;
  analysisText: string;     // Tekst narrativ në shqip
  generatedAt: string;
  expiresAt: string;
}

/** Parametrat e emergjencës */
export interface EmergencySwitch {
  allAgentsDisabled: boolean;
  disabledAt?: string;
  disableReason?: string;
}

// ==============================================================================
// Regjistrat e Bazës së të Dhënave dhe Store-it
// ==============================================================================

export interface AIConversation {
  id: string;
  agentId: AgentId;
  userId?: string;
  sessionId: string;
  propertyId?: string;
  status: 'active' | 'resolved' | 'escalated' | 'closed';
  language: 'sq' | 'en';
  escalatedToAdmin: boolean;
  escalationReason?: string;
  summary?: string;
  totalMessages: number;
  inputTokensUsed: number;
  outputTokensUsed: number;
  startedAt: string;
  lastMessageAt: string;
}

export interface AIMessageRecord {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  isFlagged: boolean;
  flagReason?: string;
  inputTokens: number;
  outputTokens: number;
  responseTimeMs: number;
  createdAt: string;
}

export interface ActionLogRecord {
  id: string;
  agentId: AgentId;
  conversationId?: string;
  userId?: string;
  actionType: string;
  actionInput: Record<string, unknown>;
  actionOutput: Record<string, unknown>;
  success: boolean;
  errorMessage?: string;
  durationMs: number;
  ipAddress?: string;
  createdAt: string;
}

export interface ModerationFlagRecord {
  id: string;
  propertyId: string;
  userId?: string;
  flaggedByAgent: AgentId;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  reasons: string[];
  detectedIssues: Record<string, unknown>;
  adminReviewed: boolean;
  adminDecision?: string;
  adminNotes?: string;
  reviewedAt?: string;
  createdAt: string;
}

