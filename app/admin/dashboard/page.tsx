'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  LayoutDashboard, Building2, Users, ShieldCheck, CreditCard,
  TrendingUp, Clock, AlertTriangle, CheckCircle2, XCircle,
  Eye, BarChart3, ArrowRight, Bell, Settings, Activity,
  Home, MapPin, Euro
} from 'lucide-react';

type AdminTab = 'overview' | 'pronat' | 'perdoruesit' | 'agjencite' | 'pagesat';

const MOCK_STATS = {
  totalProperties: 847,
  activeProperties: 612,
  pendingModeration: 23,
  expiredProperties: 94,
  totalUsers: 1842,
  agencyUsers: 47,
  pendingAgencies: 5,
  totalRevenue: 5964,
  thisMonthRevenue: 798,
  totalTransactions: 852,
};

const MOCK_PENDING_PROPERTIES = [
  { id: 'pp-1', title: 'Banesë 3+1 në Breg të Diellit', owner: 'Fatmir Hoxha', municipality: 'Prishtinë', price: 95000, type: 'shitje', submittedAt: '09 Nov 2026, 20:14', status: 'pending_moderation' },
  { id: 'pp-2', title: 'Shtëpi private me oborr në Gjilan', owner: 'Vjosa Musa', municipality: 'Gjilan', price: 72000, type: 'shitje', submittedAt: '09 Nov 2026, 18:55', status: 'pending_moderation' },
  { id: 'pp-3', title: 'Lokal 65m² afër sheshit qendror', owner: 'Dardania Real Estate', municipality: 'Prizren', price: 650, type: 'qira', submittedAt: '09 Nov 2026, 15:30', status: 'pending_moderation' },
  { id: 'pp-4', title: 'Truall 500m² me leje ndërtimi', owner: 'Besim Krasniqi', municipality: 'Ferizaj', price: 48000, type: 'shitje', submittedAt: '09 Nov 2026, 11:00', status: 'pending_moderation' },
];

const MOCK_PENDING_AGENCIES = [
  { id: 'pa-1', name: 'Kosova Prime Properties', owner: 'Ramiz Gashi', email: 'ramiz@prime-ks.com', municipality: 'Prishtinë', arbk: 'ARBK-294810573', submittedAt: '09 Nov 2026', docsUploaded: true },
  { id: 'pa-2', name: 'Prizren Invest Sh.p.k', owner: 'Luljeta Berisha', email: 'info@prizreninvest.com', municipality: 'Prizren', arbk: 'ARBK-837261049', submittedAt: '08 Nov 2026', docsUploaded: true },
  { id: 'pa-3', name: 'Dukagjini Nord Group', owner: 'Mentor Sejdiu', email: 'mentor@nordgroup.com', municipality: 'Pejë', arbk: 'ARBK-102938475', submittedAt: '07 Nov 2026', docsUploaded: false },
];

const MOCK_USERS = [
  { id: 'u-1', name: 'Agim Berisha', email: 'agim@test.com', role: 'privat', properties: 3, joined: '10 Qer 2026', status: 'aktiv' },
  { id: 'u-2', name: 'Dardania Real Estate', email: 'info@dardania.ks', role: 'agjenci', properties: 48, joined: '05 Mar 2026', status: 'aktiv' },
  { id: 'u-3', name: 'Fjolla Kelmendi', email: 'fjolla@test.com', role: 'privat', properties: 1, joined: '22 Tet 2026', status: 'aktiv' },
  { id: 'u-4', name: 'Mentor Gashi', email: 'mentor@test.com', role: 'privat', properties: 0, joined: '01 Nën 2026', status: 'pezulluar' },
];

const MOCK_TRANSACTIONS = [
  { id: 'tx-001', owner: 'Agim Berisha', property: 'Banesë në Prishtinë', amount: 7, status: 'successful', date: '09 Nën 2026' },
  { id: 'tx-002', owner: 'Vjosa Musa', property: 'Shtëpi në Gjilan', amount: 7, status: 'successful', date: '09 Nën 2026' },
  { id: 'tx-003', owner: 'Besim Krasniqi', property: 'Truall Ferizaj', amount: 7, status: 'failed', date: '08 Nën 2026' },
  { id: 'tx-004', owner: 'Dardania Real Estate', property: 'Lokal Prizren', amount: 7, status: 'successful', date: '08 Nën 2026' },
  { id: 'tx-005', owner: 'Fatmir Hoxha', property: 'Vilë Brezovicë', amount: 7, status: 'refunded', date: '07 Nën 2026' },
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [propertyActions, setPropertyActions] = useState<Record<string, 'approved' | 'rejected' | null>>({});
  const [agencyActions, setAgencyActions] = useState<Record<string, 'approved' | 'rejected' | null>>({});
  const [userActions, setUserActions] = useState<Record<string, 'aktiv' | 'pezulluar'>>({});

  const tabs = [
    { id: 'overview' as AdminTab, label: 'Pasqyra', icon: LayoutDashboard },
    { id: 'pronat' as AdminTab, label: 'Prona (Moderim)', icon: Building2, badge: MOCK_PENDING_PROPERTIES.length },
    { id: 'perdoruesit' as AdminTab, label: 'Përdoruesit', icon: Users },
    { id: 'agjencite' as AdminTab, label: 'Agjencitë', icon: ShieldCheck, badge: MOCK_PENDING_AGENCIES.length },
    { id: 'pagesat' as AdminTab, label: 'Transaksionet', icon: CreditCard },
  ];

  const handlePropertyAction = (id: string, action: 'approved' | 'rejected') => {
    setPropertyActions(prev => ({ ...prev, [id]: action }));
  };

  const handleAgencyAction = (id: string, action: 'approved' | 'rejected') => {
    setAgencyActions(prev => ({ ...prev, [id]: action }));
  };

  const toggleUserStatus = (id: string, currentStatus: string) => {
    setUserActions(prev => ({ ...prev, [id]: currentStatus === 'aktiv' ? 'pezulluar' : 'aktiv' }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Paneli i Administratorit — PronaX</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Qendra e Kontrollit</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/settings" className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Konfigurimet</span>
            </Link>
            <Link href="/admin/system-health" className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">Sistemi</span>
            </Link>
            <Link href="/admin/skadimet" className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Skadimet</span>
            </Link>
            <Link href="/admin/pagesat" className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-1.5">
              <Euro className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Pagesat</span>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-1 bg-white border border-slate-200 p-1 rounded-2xl mb-8 shadow-xs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all relative ${
                  activeTab === tab.id
                    ? 'bg-[#0B192C] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* =============================== OVERVIEW =============================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Prona Totale', value: MOCK_STATS.totalProperties.toLocaleString(), sub: `${MOCK_STATS.activeProperties} aktive`, icon: Building2, color: 'emerald' },
                { label: 'Prona në Moderim', value: MOCK_STATS.pendingModeration, sub: 'Presin miratim', icon: Clock, color: 'amber' },
                { label: 'Përdorues Gjithsej', value: MOCK_STATS.totalUsers.toLocaleString(), sub: `${MOCK_STATS.agencyUsers} agjenci`, icon: Users, color: 'blue' },
                { label: 'Të Ardhurat (Muaj)', value: `${MOCK_STATS.thisMonthRevenue} €`, sub: `${MOCK_STATS.totalRevenue} € total`, icon: TrendingUp, color: 'violet' },
              ].map((kpi, i) => {
                const Icon = kpi.icon;
                const colors: Record<string, string> = {
                  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                  amber: 'bg-amber-50 text-amber-600 border-amber-100',
                  blue: 'bg-blue-50 text-blue-600 border-blue-100',
                  violet: 'bg-violet-50 text-violet-600 border-violet-100',
                };
                return (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${colors[kpi.color]}`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">{kpi.value}</div>
                    <div className="text-xs font-semibold text-slate-700 mt-0.5">{kpi.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{kpi.sub}</div>
                  </div>
                );
              })}
            </div>

            {/* Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-800">Veprime të Nevojshme</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-amber-100">
                    <span className="text-slate-700">{MOCK_STATS.pendingModeration} prona presin moderim</span>
                    <button onClick={() => setActiveTab('pronat')} className="text-emerald-700 font-bold flex items-center gap-1 hover:underline">Shqyrto <ArrowRight className="w-3 h-3" /></button>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-amber-100">
                    <span className="text-slate-700">{MOCK_PENDING_AGENCIES.length} agjenci presin verifikim</span>
                    <button onClick={() => setActiveTab('agjencite')} className="text-emerald-700 font-bold flex items-center gap-1 hover:underline">Shqyrto <ArrowRight className="w-3 h-3" /></button>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-amber-100">
                    <span className="text-slate-700">{MOCK_STATS.expiredProperties} prona të skaduara</span>
                    <Link href="/admin/skadimet" className="text-emerald-700 font-bold flex items-center gap-1 hover:underline">Shqyrto <ArrowRight className="w-3 h-3" /></Link>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                    Statistikat e Pronave
                  </span>
                </div>
                <div className="space-y-2.5 text-xs">
                  {[
                    { label: 'Prona Aktive', value: MOCK_STATS.activeProperties, max: MOCK_STATS.totalProperties, color: 'bg-emerald-500' },
                    { label: 'Prona të Skaduara', value: MOCK_STATS.expiredProperties, max: MOCK_STATS.totalProperties, color: 'bg-amber-400' },
                    { label: 'Në Moderim', value: MOCK_STATS.pendingModeration, max: MOCK_STATS.totalProperties, color: 'bg-blue-400' },
                  ].map((stat, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-slate-600 mb-1">
                        <span>{stat.label}</span>
                        <span className="font-bold">{stat.value}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${stat.color} rounded-full`} style={{ width: `${Math.round(stat.value / stat.max * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =============================== PROPERTY MODERATION =============================== */}
        {activeTab === 'pronat' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                Prona që Presin Moderim
                <span className="ml-2 text-sm text-rose-600 font-black">({MOCK_PENDING_PROPERTIES.length})</span>
              </h2>
              <div className="text-xs text-slate-400">Prona aktivizohen vetëm pas miratimit manual ose automatik</div>
            </div>

            <div className="space-y-4">
              {MOCK_PENDING_PROPERTIES.map(property => {
                const action = propertyActions[property.id];
                return (
                  <div key={property.id} className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                    action === 'approved' ? 'border-emerald-200 bg-emerald-50/30' :
                    action === 'rejected' ? 'border-rose-200 bg-rose-50/30 opacity-60' :
                    'border-slate-200'
                  }`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            property.type === 'shitje' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {property.type === 'shitje' ? 'Shitje' : 'Qira'}
                          </span>
                          <span className="text-[11px] text-slate-400">{property.municipality}</span>
                          <span className="text-[11px] text-slate-400">•</span>
                          <span className="text-[11px] text-slate-400">{property.submittedAt}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm">{property.title}</h3>
                        <p className="text-xs text-slate-500">
                          Pronari: <span className="font-semibold text-slate-700">{property.owner}</span>
                          {' · '}
                          <span className="font-semibold text-emerald-700">{property.price.toLocaleString()} €{property.type === 'qira' ? '/muaj' : ''}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/prona/${property.id}`}
                          className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Shiko</span>
                        </Link>
                        {!action ? (
                          <>
                            <button
                              onClick={() => handlePropertyAction(property.id, 'approved')}
                              className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mirato</span>
                            </button>
                            <button
                              onClick={() => handlePropertyAction(property.id, 'rejected')}
                              className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Refuzo</span>
                            </button>
                          </>
                        ) : (
                          <span className={`text-xs font-bold px-3 py-2 rounded-xl ${
                            action === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {action === 'approved' ? '✓ Miratuar' : '✗ Refuzuar'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =============================== USERS =============================== */}
        {activeTab === 'perdoruesit' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                Menaxhimi i Përdoruesve
                <span className="ml-2 text-sm text-slate-500 font-normal">({MOCK_USERS.length} të shfaqur)</span>
              </h2>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="text-left px-5 py-3 text-slate-500 font-semibold">Emri / Email</th>
                      <th className="text-left px-5 py-3 text-slate-500 font-semibold">Roli</th>
                      <th className="text-center px-5 py-3 text-slate-500 font-semibold">Prona</th>
                      <th className="text-left px-5 py-3 text-slate-500 font-semibold">Regjistruar</th>
                      <th className="text-center px-5 py-3 text-slate-500 font-semibold">Statusi</th>
                      <th className="text-center px-5 py-3 text-slate-500 font-semibold">Veprimet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {MOCK_USERS.map(user => {
                      const currentStatus = userActions[user.id] || user.status;
                      return (
                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900">{user.name}</div>
                            <div className="text-slate-500 font-mono text-[11px]">{user.email}</div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              user.role === 'agjenci' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {user.role === 'agjenci' ? 'Agjenci' : 'Privat'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center font-bold text-slate-800">{user.properties}</td>
                          <td className="px-5 py-4 text-slate-500">{user.joined}</td>
                          <td className="px-5 py-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              currentStatus === 'aktiv' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              {currentStatus === 'aktiv' ? '● Aktiv' : '● Pezulluar'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <button
                              onClick={() => toggleUserStatus(user.id, currentStatus)}
                              className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                                currentStatus === 'aktiv'
                                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              {currentStatus === 'aktiv' ? 'Pezullo' : 'Aktivizo'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =============================== AGENCY VERIFICATION =============================== */}
        {activeTab === 'agjencite' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                Verifikimi i Agjencive
                <span className="ml-2 text-sm text-rose-600 font-black">({MOCK_PENDING_AGENCIES.length} presin)</span>
              </h2>
              <Link href="/agjencite" className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1">
                Shiko të gjitha agjencitë <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {MOCK_PENDING_AGENCIES.map(agency => {
                const action = agencyActions[agency.id];
                return (
                  <div key={agency.id} className={`bg-white rounded-2xl border p-6 shadow-xs transition-all ${
                    action === 'approved' ? 'border-emerald-200 bg-emerald-50/30' :
                    action === 'rejected' ? 'border-rose-200 bg-rose-50/30 opacity-60' :
                    'border-slate-200'
                  }`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[11px] text-slate-500">{agency.municipality}</span>
                          <span className="text-[11px] text-slate-400">•</span>
                          <span className="font-mono text-[11px] text-slate-500">{agency.arbk}</span>
                          <span className="text-[11px] text-slate-400">•</span>
                          <span className="text-[11px] text-slate-400">Dërguar: {agency.submittedAt}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-base">{agency.name}</h3>
                        <p className="text-xs text-slate-500">
                          Pronari: <span className="font-semibold text-slate-700">{agency.owner}</span>
                          {' · '}
                          <a href={`mailto:${agency.email}`} className="text-emerald-600 hover:underline">{agency.email}</a>
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          {agency.docsUploaded ? (
                            <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Dokumentet janë ngarkuar
                            </span>
                          ) : (
                            <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Dokumentet mungojnë
                            </span>
                          )}
                        </div>
                      </div>

                      {!action ? (
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleAgencyAction(agency.id, 'approved')}
                            disabled={!agency.docsUploaded}
                            className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verifiko & Aprovo</span>
                          </button>
                          <button
                            onClick={() => handleAgencyAction(agency.id, 'rejected')}
                            className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Refuzo</span>
                          </button>
                        </div>
                      ) : (
                        <span className={`text-xs font-bold px-3 py-2 rounded-xl ${
                          action === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {action === 'approved' ? '✓ Verifikuar' : '✗ Refuzuar'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =============================== TRANSACTIONS =============================== */}
        {activeTab === 'pagesat' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Transaksionet e Fundit</h2>
              <Link href="/admin/pagesat" className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1">
                Raporti i plotë financiar <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="text-left px-5 py-3 text-slate-500 font-semibold">ID</th>
                      <th className="text-left px-5 py-3 text-slate-500 font-semibold">Pronari</th>
                      <th className="text-left px-5 py-3 text-slate-500 font-semibold">Prona</th>
                      <th className="text-center px-5 py-3 text-slate-500 font-semibold">Shuma</th>
                      <th className="text-left px-5 py-3 text-slate-500 font-semibold">Data</th>
                      <th className="text-center px-5 py-3 text-slate-500 font-semibold">Statusi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {MOCK_TRANSACTIONS.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 font-mono text-slate-500">{tx.id}</td>
                        <td className="px-5 py-4 font-semibold text-slate-900">{tx.owner}</td>
                        <td className="px-5 py-4 text-slate-600 max-w-[180px] truncate">{tx.property}</td>
                        <td className="px-5 py-4 text-center font-black text-emerald-700">{tx.amount} €</td>
                        <td className="px-5 py-4 text-slate-500">{tx.date}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            tx.status === 'successful' ? 'bg-emerald-100 text-emerald-700' :
                            tx.status === 'failed' ? 'bg-rose-100 text-rose-700' :
                            tx.status === 'refunded' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {tx.status === 'successful' ? '✓ Sukses' :
                             tx.status === 'failed' ? '✗ Dështuar' :
                             tx.status === 'refunded' ? '↩ Rimbursuar' : tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-slate-100 px-5 py-3 bg-slate-50 flex items-center justify-between text-xs">
                <span className="text-slate-500">Duke shfaqur 5 nga 852 transaksione</span>
                <span className="font-black text-emerald-700">Totali i filtrit: {MOCK_TRANSACTIONS.filter(t => t.status === 'successful').length * 7} €</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
