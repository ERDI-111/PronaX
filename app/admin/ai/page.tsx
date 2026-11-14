'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Bot, ShieldAlert, ShieldCheck, Zap, ZapOff,
  ToggleLeft, ToggleRight, AlertTriangle, CheckCircle2,
  Clock, Activity, Flag, FileText, RefreshCw,
  Eye, Lock, Unlock, MessageSquare, Search,
  TrendingUp, Bell, Star, Users, ChevronDown,
  XCircle, Info, Cpu, BarChart3
} from 'lucide-react';

// ---- Tipet ----
interface AgentSettings {
  agentId: string;
  name: string;
  description: string;
  isEnabled: boolean;
  model: string;
  maxTokens: number;
  temperature: number;
  rateLimitPerMinute: number;
  rateLimitPerDay: number;
  requiresAuth: boolean;
  requiresAdmin: boolean;
  accessLevel: string;
}

interface EmergencySwitch {
  allAgentsDisabled: boolean;
  disabledAt?: string;
  disableReason?: string;
}

interface ModerationFlag {
  id: string;
  propertyId: string;
  userId?: string;
  flaggedByAgent: string;
  riskLevel: string;
  riskScore: number;
  reasons: string[];
  detectedIssues: Record<string, unknown>;
  adminReviewed: boolean;
  adminDecision?: string;
  adminNotes?: string;
  reviewedAt?: string;
  createdAt: string;
}

interface ActionLog {
  id: string;
  agentId: string;
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

interface SystemStatus {
  emergencySwitch: EmergencySwitch;
  enabledAgentsCount: number;
  disabledAgentsCount: number;
  totalAgents: number;
  aiProvider: string;
  stats: {
    totalRequestsToday: number;
    pendingFlagsCount: number;
    highRiskFlagsCount: number;
    errorCount: number;
    agentRequestCounts: Record<string, number>;
  };
  system: {
    emergencySwitch: EmergencySwitch;
    enabledAgentsCount: number;
    disabledAgentsCount: number;
    totalAgents: number;
    aiProvider: string;
  };
  agents: AgentSettings[];
  moderationFlags: ModerationFlag[];
  recentLogs: ActionLog[];
}

type AdminAITab = 'agjentet' | 'moderimi' | 'regjistri';

// ---- Ikona dhe ngjyrat sipas agjentit ----
const AGENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  customer_support: MessageSquare,
  listing_assistant: FileText,
  fraud_detection: ShieldAlert,
  smart_search: Search,
  admin_assistant: Users,
  notification_retention: Bell,
  market_insights: TrendingUp,
  recommendation: Star,
};

const AGENT_COLORS: Record<string, string> = {
  customer_support: 'emerald',
  listing_assistant: 'blue',
  fraud_detection: 'rose',
  smart_search: 'violet',
  admin_assistant: 'amber',
  notification_retention: 'cyan',
  market_insights: 'orange',
  recommendation: 'pink',
};

const RISK_BADGES: Record<string, string> = {
  low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  critical: 'bg-rose-100 text-rose-700 border-rose-200',
};

const RISK_LABELS: Record<string, string> = {
  low: 'I Ulët',
  medium: 'Mesatar',
  high: 'I Lartë',
  critical: 'Kritik',
};

const ACTION_ICONS: Record<string, string> = {
  chat: '💬',
  moderate: '🛡️',
  search: '🔍',
  error: '❌',
  emergency: '🚨',
  toggle: '🔄',
};

// ---- Komponenti kryesor ----
export default function AdminAIPage() {
  const [activeTab, setActiveTab] = useState<AdminAITab>('agjentet');
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialogi i konfirmimit për Emergency Kill Switch
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('');
  const [emergencyLoading, setEmergencyLoading] = useState(false);

  // Toggle i agjentit
  const [togglingAgent, setTogglingAgent] = useState<string | null>(null);

  // Zgjero flag-ën e moderimit
  const [expandedFlag, setExpandedFlag] = useState<string | null>(null);

  // ---- Ngarko statusin ----
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/admin/status');
      if (!res.ok) {
        if (res.status === 403) {
          setError('Qasja e ndaluar — kjo faqe është vetëm për administratorë.');
        } else {
          setError('Nuk u arrit të ngarkohen të dhënat e sistemit AI.');
        }
        return;
      }
      const data = await res.json();
      setStatus(data);
      setError(null);
    } catch {
      setError('Gabim rrjeti — provoni përsëri.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // rifresko çdo 30 sekonda
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // ---- Emergency Kill Switch ----
  const handleEmergencyToggle = async () => {
    const isCurrentlyDisabled = status?.emergencySwitch?.allAgentsDisabled;
    if (!isCurrentlyDisabled && !emergencyReason.trim()) {
      alert('Ju lutemi shkruani arsyen e çaktivizimit të emergjencës.');
      return;
    }

    setEmergencyLoading(true);
    try {
      const res = await fetch('/api/ai/admin/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disabled: !isCurrentlyDisabled,
          reason: isCurrentlyDisabled ? 'Rinisjeje nga administratori' : emergencyReason,
        }),
      });

      if (res.ok) {
        await fetchStatus();
        setShowEmergencyConfirm(false);
        setEmergencyReason('');
      } else {
        alert('Gabim gjatë ndryshimit të çelësit të emergjencës.');
      }
    } catch {
      alert('Gabim rrjeti.');
    } finally {
      setEmergencyLoading(false);
    }
  };

  // ---- Toggle Agjentit ----
  const handleAgentToggle = async (agentId: string, currentEnabled: boolean) => {
    setTogglingAgent(agentId);
    try {
      const res = await fetch('/api/ai/admin/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, isEnabled: !currentEnabled }),
      });

      if (res.ok) {
        await fetchStatus();
      } else {
        alert('Gabim gjatë ndryshimit të statusit të agjentit.');
      }
    } catch {
      alert('Gabim rrjeti.');
    } finally {
      setTogglingAgent(null);
    }
  };

  const isEmergencyActive = status?.emergencySwitch?.allAgentsDisabled;

  // ---- Loading ----
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-600 font-semibold">Duke ngarkuar sistemin AI...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ---- Error ----
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center">
          <div className="bg-white rounded-2xl border border-rose-200 p-10 text-center max-w-md shadow-sm">
            <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-black text-slate-900 mb-2">Qasja e Ndaluar</h2>
            <p className="text-sm text-slate-600">{error}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!status) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ======= HEADER ======= */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
              <Bot className="w-4 h-4" />
              <span>Sistemi AI — Paneli i Administratorit</span>
            </div>
            <h1 className="text-3xl font-black text-[#0B192C] tracking-tight">
              Kontrolli i Sistemit AI
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Menaxhoni 8 agjentë AI, moderimin dhe regjistrin e veprimeve.
            </p>
          </div>

          <button
            onClick={fetchStatus}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all shadow-xs self-start"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Rifresko
          </button>
        </div>

        {/* ======= EMERGENCY KILL SWITCH ======= */}
        <div className={`rounded-2xl p-6 mb-6 border-2 transition-all ${
          isEmergencyActive
            ? 'bg-rose-50 border-rose-400 shadow-rose-100 shadow-lg'
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${isEmergencyActive ? 'bg-rose-100' : 'bg-slate-100'}`}>
                {isEmergencyActive
                  ? <ZapOff className="w-7 h-7 text-rose-600" />
                  : <Zap className="w-7 h-7 text-slate-600" />
                }
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-base font-black text-slate-900">
                    Çelësi i Emergjencës
                  </h2>
                  {isEmergencyActive && (
                    <span className="text-[11px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                      AKTIV
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {isEmergencyActive
                    ? `✗ TË GJITHË 8 AGJENTËT JANË TË ÇAKTIVIZUAR — ${status.emergencySwitch.disableReason || 'Arsye e papërcaktuar'}`
                    : '✓ Sistemi AI është operacional — të gjithë agjentët janë aktiv'
                  }
                </p>
                {isEmergencyActive && status.emergencySwitch.disabledAt && (
                  <p className="text-[11px] text-rose-500 mt-0.5 font-semibold">
                    Çaktivizuar në: {new Date(status.emergencySwitch.disabledAt).toLocaleString('sq-AL')}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowEmergencyConfirm(true)}
              className={`px-5 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition-all shadow-md ${
                isEmergencyActive
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              {isEmergencyActive
                ? <><Unlock className="w-4 h-4" /> Rinis Sistemin AI</>
                : <><Lock className="w-4 h-4" /> Çaktivizo TË GJITHË Agjentët</>
              }
            </button>
          </div>

          {/* AI Provider Info */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500">
              Ofruesi: <strong className="text-slate-700">{status.system?.aiProvider}</strong>
            </span>
          </div>
        </div>

        {/* ======= STATISTIKAT E SHPEJTA ======= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-semibold">Kërkesa Sot</span>
              <Activity className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {status.stats.totalRequestsToday}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">gjithsej sot</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-semibold">Flamuj Pritës</span>
              <Flag className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600">
              {status.stats.pendingFlagsCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">për moderim</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-semibold">Rrezik i Lartë</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-rose-600">
              {status.stats.highRiskFlagsCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">kritik / i lartë</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-semibold">Agjentë Aktiv</span>
              <Bot className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {status.system?.enabledAgentsCount ?? status.enabledAgentsCount}
              <span className="text-sm text-slate-400 font-normal">/{status.system?.totalAgents ?? status.totalAgents}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">nga 8 agjentë</div>
          </div>
        </div>

        {/* ======= TABS ======= */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
          {([
            { id: 'agjentet', label: 'Agjentët', icon: Bot, badge: status.system?.disabledAgentsCount > 0 ? status.system?.disabledAgentsCount : undefined },
            { id: 'moderimi', label: 'Moderimi', icon: Flag, badge: status.stats.pendingFlagsCount > 0 ? status.stats.pendingFlagsCount : undefined },
            { id: 'regjistri', label: 'Regjistri', icon: FileText },
          ] as Array<{ id: AdminAITab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }>).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {tab.badge > 9 ? '9+' : tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ======= TAB: AGJENTËT ======= */}
        {activeTab === 'agjentet' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {status.agents.map((agent) => {
              const AgentIcon = AGENT_ICONS[agent.agentId] || Bot;
              const color = AGENT_COLORS[agent.agentId] || 'slate';
              const isToggling = togglingAgent === agent.agentId;

              return (
                <div
                  key={agent.agentId}
                  className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                    agent.isEnabled ? 'border-slate-200' : 'border-slate-200 opacity-70'
                  }`}
                >
                  {/* Header i kartës */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl bg-${color}-50`}>
                        <AgentIcon className={`w-5 h-5 text-${color}-600`} />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-sm">{agent.name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${agent.isEnabled && !isEmergencyActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          <span className="text-[11px] font-semibold text-slate-500">
                            {isEmergencyActive ? 'Çaktivizuar (Emergjencë)' : agent.isEnabled ? 'Aktiv' : 'I Çaktivizuar'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Toggle buton */}
                    <button
                      onClick={() => handleAgentToggle(agent.agentId, agent.isEnabled)}
                      disabled={isToggling || isEmergencyActive}
                      title={isEmergencyActive ? 'Sistemi i emergjencës është aktiv' : agent.isEnabled ? 'Çaktivizo agjentin' : 'Aktivizo agjentin'}
                      className={`transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                        agent.isEnabled ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-300 hover:text-slate-400'
                      }`}
                    >
                      {isToggling
                        ? <div className="w-8 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                        : agent.isEnabled
                          ? <ToggleRight className="w-9 h-9" />
                          : <ToggleLeft className="w-9 h-9" />
                      }
                    </button>
                  </div>

                  {/* Përshkrimi */}
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">{agent.description}</p>

                  {/* Detajet teknike */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-50 rounded-lg px-2.5 py-1.5">
                      <span className="text-slate-400">Modeli</span>
                      <div className="font-semibold text-slate-700 truncate">{agent.model}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg px-2.5 py-1.5">
                      <span className="text-slate-400">Qasja</span>
                      <div className="font-semibold text-slate-700 capitalize">{
                        agent.accessLevel === 'public' ? 'Publike'
                        : agent.accessLevel === 'authenticated' ? 'Autentifikim'
                        : 'Admin'
                      }</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg px-2.5 py-1.5">
                      <span className="text-slate-400">Limit/min</span>
                      <div className="font-semibold text-slate-700">{agent.rateLimitPerMinute} kërkesa</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg px-2.5 py-1.5">
                      <span className="text-slate-400">Limit/ditë</span>
                      <div className="font-semibold text-slate-700">{agent.rateLimitPerDay} kërkesa</div>
                    </div>
                  </div>

                  {/* Badge-t */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {agent.requiresAuth && (
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                        🔐 Kërkon Autentifikim
                      </span>
                    )}
                    {agent.requiresAdmin && (
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                        👑 Vetëm Admin
                      </span>
                    )}
                    <span className="text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">
                      🌡 temp={agent.temperature}
                    </span>
                    <span className="text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">
                      📊 {agent.maxTokens} tokens
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ======= TAB: MODERIMI ======= */}
        {activeTab === 'moderimi' && (
          <div className="space-y-4">
            {/* Baner statistikash */}
            <div className="bg-[#0B192C] text-white rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Zbulimi i Mashtrimit — Agjenti 3
                </span>
                <h3 className="text-lg font-black mt-0.5">
                  {status.stats.pendingFlagsCount} Flamuj Pritës Moderim
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {status.stats.highRiskFlagsCount} me rrezik të lartë/kritik — kërkon rishikim manual
                </p>
              </div>
              <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 px-4 py-2 rounded-xl text-xs font-bold">
                <AlertTriangle className="w-4 h-4" />
                AI NUK BAN automatikisht — vetëm administratori
              </div>
            </div>

            {/* Lista e flamujve */}
            {status.moderationFlags.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
                <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="font-black text-slate-700 text-lg">Asnjë flamur moderimi</p>
                <p className="text-xs text-slate-400 mt-1">
                  Sistemi i zbulimit të mashtrimit nuk ka gjetur shpallje të dyshimta.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {status.moderationFlags.map((flag) => (
                  <div
                    key={flag.id}
                    className={`bg-white rounded-2xl border shadow-xs overflow-hidden transition-all ${
                      flag.riskLevel === 'critical' ? 'border-rose-300'
                      : flag.riskLevel === 'high' ? 'border-orange-300'
                      : 'border-slate-200'
                    }`}
                  >
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedFlag(expandedFlag === flag.id ? null : flag.id)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Risk Score Gauge */}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                            flag.riskScore >= 80 ? 'bg-rose-100 text-rose-700'
                            : flag.riskScore >= 60 ? 'bg-orange-100 text-orange-700'
                            : flag.riskScore >= 40 ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {flag.riskScore}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-slate-900 text-sm truncate">
                                {`Prona #${flag.propertyId?.slice(0, 8) || flag.id.slice(0, 8)}`}
                              </span>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${RISK_BADGES[flag.riskLevel] || RISK_BADGES.medium}`}>
                                {RISK_LABELS[flag.riskLevel] || flag.riskLevel}
                              </span>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                !flag.adminReviewed ? 'bg-amber-50 text-amber-600'
                                : flag.adminDecision === 'dismissed' ? 'bg-slate-100 text-slate-500'
                                : flag.adminDecision === 'actioned' ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-blue-50 text-blue-600'
                              }`}>
                                {!flag.adminReviewed ? '⏳ Pritës'
                                : flag.adminDecision === 'dismissed' ? '✗ Hedhur'
                                : flag.adminDecision === 'actioned' ? '✓ Zgjidhur'
                                : '👁 Rishikuar'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {new Date(flag.createdAt).toLocaleString('sq-AL')}
                            </p>
                          </div>
                        </div>

                        <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${expandedFlag === flag.id ? 'rotate-180' : ''}`} />
                      </div>

                      {/* Arsyet e flagimit */}
                      <div className="flex flex-wrap gap-1.5 mt-3 pl-13">
                        {flag.reasons.slice(0, 3).map((reason, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            {reason}
                          </span>
                        ))}
                        {flag.reasons.length > 3 && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                            +{flag.reasons.length - 3} të tjera
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Detajet e zgjeruara */}
                    {expandedFlag === flag.id && (
                      <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-3">
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 mb-2">Arsyet e plota të flamurimit:</h4>
                          <ul className="space-y-1">
                            {flag.reasons.map((reason, i) => (
                              <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                                <span className="text-rose-500 mt-0.5">•</span>
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {flag.adminReviewed && (
                          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                            <p className="text-xs font-bold text-blue-800">Rishikuar nga administratori</p>
                            {flag.adminNotes && <p className="text-xs text-blue-600 mt-1">{flag.adminNotes}</p>}
                            {flag.adminDecision && (
                              <p className="text-[11px] font-semibold text-blue-500 mt-1">
                                Vendimi: {flag.adminDecision}
                              </p>
                            )}
                            {flag.reviewedAt && (
                              <p className="text-[11px] text-blue-400 mt-1">{new Date(flag.reviewedAt).toLocaleString('sq-AL')}</p>
                            )}
                          </div>
                        )}

                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2">
                          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-700">
                            <strong>Rregull i rëndësishëm:</strong> AI nuk mund të fshijë prona, të bllokojë përdorues ose të bëjë veprime ligjore. Të gjitha vendimet e rrezikut të lartë/kritik <strong>duhet të rishikohen nga administratori</strong> para çdo veprimi.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======= TAB: REGJISTRI ======= */}
        {activeTab === 'regjistri' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-slate-500" />
                  Regjistri i Veprimeve AI (50 të fundit)
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {status.recentLogs.length} hyrje
                </span>
              </div>

              {status.recentLogs.length === 0 ? (
                <div className="p-12 text-center">
                  <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="font-bold text-slate-500">Asnjë veprim i regjistruar ende</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Veprimet e agjentëve AI do të shfaqen këtu kur të fillojnë.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50 text-xs">
                  {status.recentLogs.map((log) => (
                    <div key={log.id} className="px-5 py-3 flex items-center gap-4 hover:bg-slate-50/60 transition-colors">
                      <span className="text-base flex-shrink-0">
                        {ACTION_ICONS[log.actionType] || '📋'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 capitalize">{log.actionType}</span>
                          {log.agentId && (
                            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                              {log.agentId}
                            </span>
                          )}
                          {log.userId && (
                            <span className="text-slate-400 text-[10px]">
                              user: {log.userId.slice(0, 8)}...
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 flex-shrink-0 font-mono">
                        {new Date(log.createdAt).toLocaleTimeString('sq-AL')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rezymeja sipas agjentit */}
            {status.stats && Object.keys(status.stats).length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  Statistika sipas Agjentit (Sot)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(status.stats.agentRequestCounts || {}).map(([agentId, count]) => {
                    const AgentIcon = AGENT_ICONS[agentId] || Bot;
                    return (
                      <div key={agentId} className="bg-slate-50 rounded-xl p-3 text-center">
                        <AgentIcon className="w-5 h-5 text-slate-500 mx-auto mb-1.5" />
                        <div className="text-lg font-black text-slate-900">{count as number}</div>
                        <div className="text-[10px] text-slate-400 truncate">{agentId}</div>
                      </div>
                    );
                  })}
                  {Object.keys(status.stats.agentRequestCounts || {}).length === 0 && (
                    <div className="col-span-4 text-center py-6 text-sm text-slate-400">
                      Asnjë kërkesë e regjistruar sot.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ======= DIALOGI I KONFIRMIMIT TË EMERGJENCËS ======= */}
      {showEmergencyConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              {isEmergencyActive ? (
                <>
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Unlock className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mb-2">
                    Rinis Sistemin AI?
                  </h2>
                  <p className="text-sm text-slate-500">
                    Kjo do të riaktivizojë të gjithë 8 agjentët AI. Konfirmoni vetëm nëse sistemi është i sigurt.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldAlert className="w-8 h-8 text-rose-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mb-2">
                    Çaktivizo TË GJITHË Agjentët AI?
                  </h2>
                  <p className="text-sm text-slate-500">
                    Kjo do të bllokojë menjëherë të gjitha 8 chatbot-et AI dhe API-të. Shpallja e emergjencës kërkon arsye.
                  </p>
                </>
              )}
            </div>

            {!isEmergencyActive && (
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Arsyeja e çaktivizimit <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={emergencyReason}
                  onChange={(e) => setEmergencyReason(e.target.value)}
                  placeholder="Shën. sulm kibernetik i detektuar, testim i planifikuar, mirëmbajtje..."
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 resize-none"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowEmergencyConfirm(false); setEmergencyReason(''); }}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all"
              >
                Anulo
              </button>
              <button
                onClick={handleEmergencyToggle}
                disabled={emergencyLoading || (!isEmergencyActive && !emergencyReason.trim())}
                className={`flex-1 px-4 py-3 rounded-xl font-black text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  isEmergencyActive
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {emergencyLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isEmergencyActive ? (
                  <><Unlock className="w-4 h-4" /> Po, Rinis</>
                ) : (
                  <><Lock className="w-4 h-4" /> Po, Çaktivizo</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
