'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Clock, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  Play, 
  RefreshCw, 
  Calendar, 
  ShieldAlert, 
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  FileCheck2
} from 'lucide-react';

export default function AdminExpirationsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cronRunning, setCronRunning] = useState(false);
  const [cronMessage, setCronMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'expiringSoon' | 'expired'>('all');

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/expirations');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggerManualCron = async () => {
    setCronRunning(true);
    setCronMessage(null);
    try {
      const res = await fetch('/api/cron/check-expirations', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setCronMessage(json.message);
        await fetchData();
      } else {
        setCronMessage(`Gabim: ${json.error}`);
      }
    } catch (err: any) {
      setCronMessage(`Gabim gjatë thirrjes së cron: ${err.message}`);
    } finally {
      setCronRunning(false);
    }
  };

  const properties = (data?.properties || []).filter((p: any) => {
    const matchesSearch = 
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.municipality_id.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === 'all') return true;
    if (filter === 'published') return p.status === 'published';
    if (filter === 'expiringSoon') return p.status === 'published' && p.expirationInfo.isExpiringSoon;
    if (filter === 'expired') return p.status === 'expired';
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>Paneli Administrativ • pronaxestate@outlook.com</span>
            </div>
            <h1 className="text-3xl font-black text-[#0B192C] tracking-tight">
              Mbikëqyrja e Skadimeve & Automatizimi i Planeve
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Menaxho skadimet sipas planit (3 / 7 / 30 ditë), ekzekuto kontrollin automatik (cron) dhe inspekto njoftimet e dërguara.
            </p>
          </div>

          {/* Trigger Cron Action */}
          <button
            onClick={triggerManualCron}
            disabled={cronRunning}
            className="px-5 py-3 rounded-xl bg-[#0B192C] hover:bg-[#1E3E62] text-white font-bold text-xs flex items-center gap-2 shadow-md disabled:opacity-50 transition-all self-start sm:self-auto"
          >
            {cronRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Duke ekzekutuar kontrollin...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-emerald-400 fill-current" />
                <span>Ekzekuto Kontrollin e Skadimeve Tani (Cron)</span>
              </>
            )}
          </button>
        </div>

        {cronMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{cronMessage}</span>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <span className="text-xs text-slate-500 font-medium block mb-1">Prona Aktive</span>
            <span className="text-2xl font-black text-[#0B192C]">{data?.metrics?.totalPublished || 0}</span>
            <span className="text-[11px] text-emerald-600 font-medium block mt-1">Të publikuara publikisht</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <span className="text-xs text-slate-500 font-medium block mb-1">Skadojnë në 3 Ditë</span>
            <span className="text-2xl font-black text-amber-600">{data?.metrics?.expiringIn3Days || 0}</span>
            <span className="text-[11px] text-amber-700 font-medium block mt-1">Paralajmërim 3-ditor</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <span className="text-xs text-slate-500 font-medium block mb-1">Skadojnë Sot (≤ 24 orë)</span>
            <span className="text-2xl font-black text-red-600">{data?.metrics?.expiringIn1Day || 0}</span>
            <span className="text-[11px] text-red-700 font-medium block mt-1">Paralajmërim urgjent</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <span className="text-xs text-slate-500 font-medium block mb-1">Prona të Skaduara</span>
            <span className="text-2xl font-black text-slate-700">{data?.metrics?.totalExpired || 0}</span>
            <span className="text-[11px] text-slate-400 block mt-1">Të fshehura nga kërkimi</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm col-span-2 lg:col-span-1">
            <span className="text-xs text-slate-500 font-medium block mb-1">Norma e Rinovimit</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-700">{data?.metrics?.renewalConversionRate || 0}%</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              {data?.metrics?.totalRenewals || 0} rinovime të suksesshme
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Kërko me titull ose komunë..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-1.5 bg-slate-200/60 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
            {[
              { id: 'all', label: 'Të Gjitha' },
              { id: 'published', label: 'Aktive' },
              { id: 'expiringSoon', label: 'Skadon Së Shpejti' },
              { id: 'expired', label: 'Të Skaduara' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id as any)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filter === t.id ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table of Properties */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">Duke ngarkuar të dhënat e skadimit...</div>
          ) : properties.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">Nuk u gjet asnjë pronë sipas kritereve.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Prona / Vendndodhja</th>
                    <th className="py-3.5 px-4">Statusi</th>
                    <th className="py-3.5 px-4">Data e Publikimit</th>
                    <th className="py-3.5 px-4">Data e Skadimit</th>
                    <th className="py-3.5 px-4">Paralajmërimet</th>
                    <th className="py-3.5 px-4 text-right">Veprime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {properties.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-bold text-slate-900 block truncate">{p.title}</span>
                        <span className="text-[11px] text-slate-400">
                          {p.municipality_id} • {p.price.toLocaleString()} {p.currency}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${p.expirationInfo.colorClass}`}>
                          {p.expirationInfo.statusLabel}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {p.published_at ? new Date(p.published_at).toLocaleDateString('sq-AL') : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-800 font-semibold">
                        {p.expires_at ? new Date(p.expires_at).toLocaleDateString('sq-AL') : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-[11px]">
                        {p.expiration_warning_1d_sent_at ? (
                          <span className="text-red-600 font-semibold block">✓ Paralajmërim 1-ditor</span>
                        ) : p.expiration_warning_3d_sent_at ? (
                          <span className="text-amber-600 font-semibold block">✓ Paralajmërim 3-ditor</span>
                        ) : (
                          <span className="text-slate-400 block">—</span>
                        )}
                        {p.expired_notification_sent_at && (
                          <span className="text-slate-500 block text-[10px]">✓ Njoftim skadimi i dërguar</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {p.status === 'expired' ? (
                          <a
                            href={`/pagesa/${p.id}?purpose=renewal`}
                            className="text-emerald-600 hover:text-emerald-700 font-bold text-xs inline-flex items-center gap-1"
                          >
                            <span>Simulo Rinovim (7 €)</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
