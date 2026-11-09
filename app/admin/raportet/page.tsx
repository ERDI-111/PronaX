'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Flag, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowLeft, 
  ExternalLink, 
  AlertTriangle,
  Building2,
  Mail,
  RefreshCw,
  Filter
} from 'lucide-react';

interface PropertyReport {
  id: string;
  propertyId: string;
  propertyTitle: string;
  reporterEmail?: string;
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
  createdAt: string;
}

const REASON_LABELS: Record<string, string> = {
  fake: 'Pronë e rreme / skamuese',
  duplicate: 'Shpallje e dubluar',
  wrong_price: 'Çmim i pasaktë / manipulues',
  sold: 'Prona tashmë është shitur',
  wrong_location: 'Vendndodhje e gabuar',
  other: 'Arsye tjetër',
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<PropertyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'actioned' | 'dismissed'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/admin/reports');
      const data = await res.json();
      if (data.success && data.reports) {
        setReports(data.reports);
      }
    } catch {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'actioned' | 'dismissed' | 'reviewed') => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setReports((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
      }
    } catch {}
    finally {
      setUpdatingId(null);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (activeFilter === 'all') return true;
    return r.status === activeFilter;
  });

  const pendingCount = reports.filter((r) => r.status === 'pending').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 uppercase tracking-wider mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>Moderimi i Sigurisë & Sinjalizimet</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">
              Raportimet e Pronave ({reports.length})
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Shqyrtoni sinjalizimet e qytetarëve për shpallje mashtruese, çmime të pasakta ose prona të shitura.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs">
            <div className="text-xs font-bold text-slate-400 mb-1">Raporte në Pritje</div>
            <div className="text-3xl font-black text-rose-600 dark:text-rose-400">{pendingCount}</div>
            <div className="text-[11px] text-slate-500 mt-1">Kërkojnë shqyrtim administrativ</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs">
            <div className="text-xs font-bold text-slate-400 mb-1">Shpallje të Ndëshkuara / Hequra</div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {reports.filter((r) => r.status === 'actioned').length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Veprime të ndërmarra me sukses</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs">
            <div className="text-xs font-bold text-slate-400 mb-1">Raporte të Refuzuara</div>
            <div className="text-3xl font-black text-slate-700 dark:text-slate-300">
              {reports.filter((r) => r.status === 'dismissed').length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Shpallje legjitime pa parregullsi</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'actioned', 'dismissed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilter === filter
                  ? 'bg-[#0B192C] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {filter === 'all' && `Të Gjitha (${reports.length})`}
              {filter === 'pending' && `Në Pritje (${pendingCount})`}
              {filter === 'actioned' && `Të Ndërmarra`}
              {filter === 'dismissed' && `Të Hedhura`}
            </button>
          ))}
        </div>

        {/* Reports Table / List */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
              Duke ngarkuar raportet...
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              Nuk ka raporte në këtë kategori.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
              {filteredReports.map((report) => (
                <div key={report.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-50/50 dark:hover:bg-slate-750 transition-colors">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-slate-400 text-[11px]">{report.id}</span>
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400">
                        {REASON_LABELS[report.reason] || report.reason}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        report.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : report.status === 'actioned'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        Statusi: {report.status === 'pending' ? 'Në Pritje' : report.status === 'actioned' ? 'Pronë e Bllokuar' : 'E Zgjidhur'}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{report.propertyTitle}</span>
                      <Link
                        href={`/prona/${report.propertyId}`}
                        target="_blank"
                        className="text-xs text-emerald-600 hover:underline inline-flex items-center gap-0.5 font-normal"
                      >
                        (Shiko Pronën <ExternalLink className="w-3 h-3" />)
                      </Link>
                    </h3>

                    {report.details && (
                      <p className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs leading-relaxed">
                        &quot;{report.details}&quot;
                      </p>
                    )}

                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>Raportuesi: {report.reporterEmail}</span>
                      <span>•</span>
                      <span>Data: {new Date(report.createdAt).toLocaleDateString('sq-AL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {report.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(report.id, 'actioned')}
                          disabled={updatingId === report.id}
                          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Blloko Pronën</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                          disabled={updatingId === report.id}
                          className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Hidh Raportin</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Veprimi është përmbyllur</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
