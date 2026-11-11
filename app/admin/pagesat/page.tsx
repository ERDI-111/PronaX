'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  ShieldAlert, 
  TrendingUp, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCcw, 
  ArrowDownRight,
  Search,
  Filter,
  FileSpreadsheet,
  Info
} from 'lucide-react';

export default function AdminPaymentsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refundLoading, setRefundLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin/payments');
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
    fetchAdminData();
  }, []);

  const handleRefund = async (paymentId: string) => {
    const confirmRefund = window.confirm(
      `Jeni të sigurt që dëshironi të rimbursoni transaksionin ${paymentId}? Kjo do ta kthejë pronën e lidhur në status të skaduar.`
    );
    if (!confirmRefund) return;

    setRefundLoading(paymentId);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/payments/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          reason: 'Rimbursim i aprovuar nga administratori (pronaxestate@outlook.com)',
        }),
      });

      const resJson = await res.json();

      if (!res.ok) {
        throw new Error(resJson.error || 'Dështoi rimbursimi.');
      }

      setFeedback({ type: 'success', text: `Pagesa ${paymentId} u rimbursua me sukses.` });
      await fetchAdminData();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Gabim gjatë rimbursimit.' });
    } finally {
      setRefundLoading(null);
    }
  };

  const transactions = (data?.transactions || []).filter((tx: any) => {
    const matchesSearch = 
      tx.id.toLowerCase().includes(search.toLowerCase()) ||
      (tx.metadata?.propertyTitle || '').toLowerCase().includes(search.toLowerCase()) ||
      (tx.providerTransactionId || '').toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Admin Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>Paneli Administrativ • pronaxestate@outlook.com</span>
            </div>
            <h1 className="text-3xl font-black text-[#0B192C] tracking-tight">
              Menaxhimi Financiar & Transaksionet
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Mbikëqyrje e të ardhurave bruto, tarifave të ofruesve, llogaritjes neto dhe rimbursimeve.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setLoading(true); fetchAdminData(); }}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Rifresko</span>
            </button>
          </div>
        </div>

        {feedback && (
          <div className={`mb-6 p-4 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <div className="flex justify-between items-center text-slate-500 text-xs font-medium mb-1">
              <span>Të Ardhurat Bruto</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#0B192C]">
                {((data?.report?.totalGrossCents || 0) / 100).toFixed(2)} €
              </span>
              <span className="text-xs text-slate-400">EUR</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Totali i faturave €7.00 të suksesshme
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <div className="flex justify-between items-center text-slate-500 text-xs font-medium mb-1">
              <span>Tarifat e Vlerësuara (Ofruesi)</span>
              <ArrowDownRight className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600">
                {((data?.report?.estimatedFeesCents || 0) / 100).toFixed(2)} €
              </span>
              <span className="text-xs text-slate-400">EUR</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Komisionet e Paysera / Bank POS
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <div className="flex justify-between items-center text-slate-500 text-xs font-medium mb-1">
              <span>Neto e Vlerësuar (Përafërt)</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-700">
                {((data?.report?.estimatedNetCents || 0) / 100).toFixed(2)} €
              </span>
              <span className="text-xs text-slate-400">EUR</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
              Para zbritjes së tatimit vendor
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <div className="flex justify-between items-center text-slate-500 text-xs font-medium mb-1">
              <span>Transaksione të Suksesshme</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {data?.report?.totalSuccessfulTransactions || 0}
              </span>
              <span className="text-xs text-slate-500">/ {data?.transactions?.length || 0} totale</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Norma e suksesit: {data?.transactions?.length ? Math.round(((data?.report?.totalSuccessfulTransactions || 0) / data.transactions.length) * 100) : 100}%
            </span>
          </div>
        </div>

        {/* Banking Disclaimer Alert */}
        <div className="mb-8 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block text-amber-950 mb-0.5">Parim i Rëndësishëm Kontabël & Bankar:</strong>
            {data?.report?.disclaimer || 'Shumat bruto paraqesin pagesat e autorizuara në portal. Gjendja reale e parave në llogarinë bankare përcaktohet pas zbritjes së komisioneve të ndërmjetësit dhe ekzekutimit të kleringut periodik (T+1 ditë pune).'}
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          {/* Search */}
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Kërko me ID, Titull ose TxID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Status tabs */}
          <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
            {['all', 'successful', 'pending', 'refunded', 'failed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                  statusFilter === st 
                    ? 'bg-white text-slate-900 shadow-sm font-bold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'all' ? 'Të Gjitha' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">Duke ngarkuar të dhënat financiare...</div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">Nuk u gjet asnjë transaksion sipas kritereve.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">ID Transaksionit</th>
                    <th className="py-3.5 px-4">Prona & Përdoruesi</th>
                    <th className="py-3.5 px-4">Ofruesi & Metoda</th>
                    <th className="py-3.5 px-4">Bruto</th>
                    <th className="py-3.5 px-4">Tarifa Ofruesit</th>
                    <th className="py-3.5 px-4">Statusi</th>
                    <th className="py-3.5 px-4 text-right">Veprime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-800 block">{tx.id}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {tx.providerTransactionId || 'N/A'}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {new Date(tx.createdAt).toLocaleDateString('sq-AL', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-semibold text-slate-900 block truncate">
                          {tx.metadata?.propertyTitle || tx.propertyId}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {tx.metadata?.userEmail || tx.userId}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                          {tx.purpose === 'renewal' ? 'Rinovim 30 ditor' : 'Publikim i ri'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-700 capitalize block">{tx.provider}</span>
                        <span className="text-[11px] text-slate-400">{tx.paymentMethod}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-black text-slate-900 text-sm">{tx.amount} {tx.currency}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-amber-700 font-semibold">{tx.providerFee} €</span>
                      </td>

                      <td className="py-3.5 px-4">
                        {tx.status === 'successful' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            E Suksesshme
                          </span>
                        )}
                        {tx.status === 'refunded' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            <RefreshCcw className="w-3.5 h-3.5" />
                            E Rimbursuar
                          </span>
                        )}
                        {tx.status === 'failed' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <AlertCircle className="w-3.5 h-3.5" />
                            E Dështuar
                          </span>
                        )}
                        {tx.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Në Pritje
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {tx.status === 'successful' && (
                          <button
                            onClick={() => handleRefund(tx.id)}
                            disabled={refundLoading === tx.id}
                            className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold text-[11px] transition-colors disabled:opacity-50"
                          >
                            {refundLoading === tx.id ? 'Duke rimbursuar...' : 'Rimburso'}
                          </button>
                        )}
                        {tx.status === 'refunded' && (
                          <span className="text-[11px] text-slate-400 italic">Rimbursuar</span>
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
