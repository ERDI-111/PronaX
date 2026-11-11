'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Building2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  RefreshCw, 
  PlusCircle, 
  Calendar, 
  History, 
  MapPin, 
  ArrowRight,
  Filter,
  Eye,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function MyPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [counts, setCounts] = useState<any>({ total: 0, published: 0, expiringSoon: 0, expired: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'expiringSoon' | 'expired' | 'pending'>('all');
  
  // Renewal History Modal state
  const [selectedPropertyForHistory, setSelectedPropertyForHistory] = useState<any | null>(null);
  const [renewalHistory, setRenewalHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/properties/my-properties?userId=user-erdis-001');
      const data = await res.json();
      if (data.success) {
        setProperties(data.properties);
        setCounts(data.counts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const openRenewalHistory = async (property: any) => {
    setSelectedPropertyForHistory(property);
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/properties/renewals?propertyId=${property.id}`);
      const data = await res.json();
      if (data.success) {
        setRenewalHistory(data.history);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const filtered = properties.filter((p) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'published') return p.status === 'published';
    if (activeTab === 'expiringSoon') return p.status === 'published' && p.expirationInfo.isExpiringSoon;
    if (activeTab === 'expired') return p.status === 'expired';
    if (activeTab === 'pending') return p.status === 'pending_payment' || p.status === 'pending_moderation';
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
              <span>Paneli i Përdoruesit</span>
              <span>/</span>
              <span>Pronat e Mia</span>
            </div>
            <h1 className="text-3xl font-black text-[#0B192C] tracking-tight">
              Menaxhimi i Pronave & Cikli i Publikimit
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Mbikëqyr kohëzgjatjen e publikimit sipas planit, prano alarme para skadimit dhe rinovo manualisht kur dëshiron.
            </p>
          </div>

          <Link
            href="/publiko"
            className="self-start sm:self-auto px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-700/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publiko Pronë të Re</span>
          </Link>
        </div>

        {/* Lifecycle KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div 
            onClick={() => setActiveTab('published')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'published' ? 'bg-emerald-50/70 border-emerald-400 shadow-sm' : 'bg-white border-slate-200/80 hover:border-slate-300'
            }`}
          >
            <div className="flex justify-between items-center text-xs text-slate-500 font-medium mb-1">
              <span>Aktive (Publikuara)</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-3xl font-black text-[#0B192C]">{counts.published}</span>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
              Të dukshme në hartë & kërkim
            </span>
          </div>

          <div 
            onClick={() => setActiveTab('expiringSoon')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'expiringSoon' ? 'bg-amber-50/70 border-amber-400 shadow-sm' : 'bg-white border-slate-200/80 hover:border-slate-300'
            }`}
          >
            <div className="flex justify-between items-center text-xs text-slate-500 font-medium mb-1">
              <span>Skadon Së Shpejti</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-3xl font-black text-amber-600">{counts.expiringSoon}</span>
            <span className="text-[11px] text-amber-700 font-medium mt-1 block">
              ≤ 3 ditë deri në skadim
            </span>
          </div>

          <div 
            onClick={() => setActiveTab('expired')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'expired' ? 'bg-red-50/70 border-red-400 shadow-sm' : 'bg-white border-slate-200/80 hover:border-slate-300'
            }`}
          >
            <div className="flex justify-between items-center text-xs text-slate-500 font-medium mb-1">
              <span>Të Skaduara</span>
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <span className="text-3xl font-black text-red-600">{counts.expired}</span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Kërkojnë rinovim manual (7 €)
            </span>
          </div>

          <div 
            onClick={() => setActiveTab('pending')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'pending' ? 'bg-slate-100 border-slate-400 shadow-sm' : 'bg-white border-slate-200/80 hover:border-slate-300'
            }`}
          >
            <div className="flex justify-between items-center text-xs text-slate-500 font-medium mb-1">
              <span>Në Pritje Pagese</span>
              <AlertTriangle className="w-4 h-4 text-slate-600" />
            </div>
            <span className="text-3xl font-black text-slate-700">{counts.pending}</span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Draft / Pritje moderimi
            </span>
          </div>
        </div>

        {/* Tab Filter Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { id: 'all', label: 'Të Gjitha Pronat', count: counts.total },
              { id: 'published', label: 'Aktive', count: counts.published },
              { id: 'expiringSoon', label: 'Skadon Së Shpejti', count: counts.expiringSoon },
              { id: 'expired', label: 'Të Skaduara', count: counts.expired },
              { id: 'pending', label: 'Në Pritje', count: counts.pending },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-[#0B192C] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 hidden sm:block">
            {filtered.length} prona të listuara
          </span>
        </div>

        {/* Properties List */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center text-xs text-slate-500 border border-slate-200">
            Duke ngarkuar pronat tuaja...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Nuk u gjet asnjë pronë në këtë kategori</h3>
            <p className="text-xs text-slate-500 mt-1">Zgjidhni një tab tjetër ose publikoni një pronë të re.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((prop) => {
              const isExpired = prop.status === 'expired';
              const isPublished = prop.status === 'published';
              const isExpiringSoon = isPublished && prop.expirationInfo.isExpiringSoon;
              const isPending = prop.status === 'pending_payment';

              return (
                <div
                  key={prop.id}
                  className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all ${
                    isExpired
                      ? 'border-red-200/90 shadow-sm bg-gradient-to-r from-red-50/20 to-white'
                      : isExpiringSoon
                      ? 'border-amber-300 shadow-sm bg-gradient-to-r from-amber-50/20 to-white'
                      : 'border-slate-200/80 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Property info */}
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-[#1E3E62] border border-slate-200">
                        <Building2 className="w-8 h-8" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${prop.expirationInfo.colorClass}`}>
                            {prop.expirationInfo.statusLabel}
                          </span>

                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {prop.property_type} • {prop.listing_type === 'shitje' ? 'Në Shitje' : 'Me Qira'}
                          </span>

                          {prop.renewal_count > 0 && (
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                              Rinovuar {prop.renewal_count}x
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {prop.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {prop.address ? `${prop.address}, ` : ''}{prop.settlement_id ? `${prop.settlement_id}, ` : ''}{prop.municipality_id}
                          </span>
                          <span>•</span>
                          <span className="font-black text-slate-900">
                            {prop.price.toLocaleString()} {prop.currency}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expiration Details & Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      {/* Dates */}
                      <div className="text-left lg:text-right text-xs space-y-0.5">
                        {prop.published_at && (
                          <div className="text-slate-400 text-[11px]">
                            Publikuar: <strong className="text-slate-700">{new Date(prop.published_at).toLocaleDateString('sq-AL')}</strong>
                          </div>
                        )}
                        {prop.expires_at && (
                          <div className="text-slate-500 text-[11px]">
                            {isExpired ? 'Ka skaduar më: ' : 'Skadon më: '}
                            <strong className={isExpired ? 'text-red-700' : 'text-slate-800'}>
                              {new Date(prop.expires_at).toLocaleDateString('sq-AL')}
                            </strong>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {/* Renewal Button for Expired or Expiring Soon */}
                        {(isExpired || isExpiringSoon) && (
                          <Link
                            href={`/pagesa/${prop.id}?purpose=renewal`}
                            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-1.5"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Rinovo pronën – 7 €</span>
                          </Link>
                        )}

                        {/* Pay pending listing */}
                        {isPending && (
                          <Link
                            href={`/pagesa/${prop.id}`}
                            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[#0B192C] hover:bg-[#1E3E62] transition-colors flex items-center justify-center gap-1.5"
                          >
                            <span>Zgjidh Planin & Vazhdo</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        {/* Renewal history trigger */}
                        {prop.renewal_count > 0 && (
                          <button
                            onClick={() => openRenewalHistory(prop)}
                            className="px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            title="Shiko historikun e rinovimeve"
                          >
                            <History className="w-3.5 h-3.5 text-slate-500" />
                            <span className="hidden sm:inline">Historiku</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Warning banner for expired */}
                  {isExpired && (
                    <div className="mt-4 pt-3 border-t border-red-100 flex items-center justify-between text-xs text-red-800 bg-red-50/50 p-2.5 rounded-xl">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span>Kjo pronë ka skaduar dhe është hequr nga kërkimi publik. Zgjidhni një plan për ta riaktivizuar.</span>
                      </div>
                      <Link
                        href={`/pagesa/${prop.id}?purpose=renewal`}
                        className="font-bold underline text-red-900 whitespace-nowrap ml-2"
                      >
                        Rinovo Tani →
                      </Link>
                    </div>
                  )}

                  {/* Warning banner for expiring soon */}
                  {isExpiringSoon && (
                    <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between text-xs text-amber-900 bg-amber-50/60 p-2.5 rounded-xl">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>Paralajmërim skadimi: Kanë mbetur edhe pak ditë. Rinovoni para skadimit për të mos ndërprerë kontaktet e blerësve.</span>
                      </div>
                      <Link
                        href={`/pagesa/${prop.id}?purpose=renewal`}
                        className="font-bold underline text-amber-950 whitespace-nowrap ml-2"
                      >
                        Rinovo (7 €) →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Renewal History Modal */}
        {selectedPropertyForHistory && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-sm text-[#0B192C]">Historiku i Rinovimeve 30-Ditore</h3>
                </div>
                <button
                  onClick={() => setSelectedPropertyForHistory(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs text-slate-600">
                <span className="font-bold block text-slate-900">{selectedPropertyForHistory.title}</span>
                <span className="text-slate-400 text-[11px]">ID e Pronës: {selectedPropertyForHistory.id}</span>
              </div>

              {loadingHistory ? (
                <div className="p-8 text-center text-xs text-slate-400">Duke ngarkuar historikun...</div>
              ) : renewalHistory.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">Nuk ka të dhëna rinovimi të mëparshëm.</div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {renewalHistory.map((item, idx) => (
                    <div key={item.renewalId} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>Rinovimi #{renewalHistory.length - idx}</span>
                        <span className="text-emerald-700">{item.amount} {item.currency}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex justify-between">
                        <span>Data e ekzekutimit:</span>
                        <span className="font-mono text-slate-700">{new Date(item.createdAt).toLocaleDateString('sq-AL')}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex justify-between">
                        <span>Vlefshmëria e re (30 ditë):</span>
                        <span className="font-semibold text-slate-800">{new Date(item.newExpiresAt).toLocaleDateString('sq-AL')}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/50 flex justify-between">
                        <span>Ref e pagesës: {item.paymentId}</span>
                        <span>{item.paymentMethod}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={() => setSelectedPropertyForHistory(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                >
                  Mbyll
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
