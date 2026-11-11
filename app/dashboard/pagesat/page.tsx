'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  CreditCard, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Building2,
  Filter
} from 'lucide-react';

export default function UserPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    async function loadPayments() {
      try {
        const res = await fetch('/api/payments/history?userId=user-erdis-001');
        const data = await res.json();
        if (data.success) {
          setPayments(data.payments);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, []);

  const filtered = payments.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Page Title & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
              <span>Paneli i Përdoruesit</span>
              <span>/</span>
              <span>Financat</span>
            </div>
            <h1 className="text-3xl font-black text-[#0B192C] tracking-tight">
              Historiku i Pagesave & Faturave
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Menaxho të gjitha faturat e publikimit, dëshmitë e pagesave dhe planet aktive.
            </p>
          </div>

          <Link
            href="/publiko"
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>Publiko Pronë të Re</span>
          </Link>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <span className="text-xs font-medium text-slate-500 block mb-1">Total i Shpenzuar</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#0B192C]">
                {payments
                  .filter(p => p.status === 'successful')
                  .reduce((acc, p) => acc + (p.amount_cents || 0) / 100, 0)
                  .toFixed(2)} €
              </span>
              <span className="text-xs text-slate-400">EUR</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
              Sipas planeve të zgjedhura
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <span className="text-xs font-medium text-slate-500 block mb-1">Transaksione të Suksesshme</span>
            <span className="text-2xl font-black text-emerald-600">
              {payments.filter(p => p.status === 'successful').length}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Publikime & rinovime aktive
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <span className="text-xs font-medium text-slate-500 block mb-1">Prona të Skaduara (Kërkojnë Rinovim)</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-amber-600">1</span>
              <Link 
                href="/pagesa/prop-ks-102?purpose=renewal"
                className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1"
              >
                Rinovo me 7 € <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Shtëpi luksoze në Prizren
            </span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700">Filtro sipas statusit:</span>
          </div>

          <div className="flex gap-1.5 bg-slate-200/60 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Të Gjitha
            </button>
            <button
              onClick={() => setFilter('successful')}
              className={`px-3 py-1 rounded-lg transition-colors ${filter === 'successful' ? 'bg-white text-emerald-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Të Suksesshme
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-lg transition-colors ${filter === 'pending' ? 'bg-white text-amber-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Në Pritje
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">Duke ngarkuar të dhënat e pagesave...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">Nuk u gjet asnjë transaksion.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Referenca / Data</th>
                    <th className="py-3.5 px-4">Prona / Qëllimi</th>
                    <th className="py-3.5 px-4">Ofruesi & Mënyra</th>
                    <th className="py-3.5 px-4">Shuma</th>
                    <th className="py-3.5 px-4">Statusi</th>
                    <th className="py-3.5 px-4 text-right">Veprime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-semibold text-slate-800 block">{item.id}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString('sq-AL', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block max-w-xs truncate">
                          {item.metadata?.propertyTitle || 'Prona në PronaX'}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 inline-block mt-0.5">
                          {item.purpose === 'renewal' ? 'Rinovim 30 ditor' : 'Publikim i ri'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-700 font-medium capitalize block">{item.provider}</span>
                        <span className="text-[11px] text-slate-400">{item.paymentMethod || 'Kartelë bankare'}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-sm font-black text-slate-900">{item.amount} {item.currency}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        {item.status === 'successful' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            E Suksesshme
                          </span>
                        )}
                        {item.status === 'pending' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3.5 h-3.5" />
                            Në Pritje
                          </span>
                        )}
                        {item.status === 'failed' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <AlertCircle className="w-3.5 h-3.5" />
                            E Dështuar
                          </span>
                        )}
                        {item.status === 'refunded' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            <RefreshCw className="w-3.5 h-3.5" />
                            E Rimbursuar
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/pagesa/sukses?paymentId=${item.id}&propertyId=${item.propertyId}`}
                          className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold text-xs"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Dëshmia</span>
                        </Link>
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
