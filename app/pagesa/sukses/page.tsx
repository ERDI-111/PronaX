'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  FileText, 
  Building2, 
  ArrowRight,
  Printer
} from 'lucide-react';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId');

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      if (!paymentId) {
        setError('Referenca e pagesës mungon.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/payments/verify?paymentId=${paymentId}`);
        const result = await res.json();

        if (!res.ok || !result.success) {
          throw new Error(result.error || 'Nuk mund të verifikohej transaksioni.');
        }

        setData(result);
      } catch (err: any) {
        setError(err.message || 'Gabim gjatë leximit të dëshmisë së pagesës.');
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [paymentId]);

  return (
    <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12">
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-bold text-[#0B192C]">Duke verifikuar pagesën me serverin...</h2>
          <p className="text-xs text-slate-500 mt-1">Po kontrollojmë nënshkrimin digjital dhe të dhënat e transaksionit.</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-red-200">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
            !
          </div>
          <h2 className="text-xl font-bold text-red-900">Transaksioni nuk u verifikua</h2>
          <p className="text-xs text-red-600 mt-2">{error}</p>
          <Link
            href="/dashboard/pagesat"
            className="mt-6 inline-block px-5 py-2.5 bg-slate-800 text-white text-xs font-semibold rounded-xl"
          >
            Kthehu te Paneli
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200/80 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />
            
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <span className="text-[11px] font-bold tracking-widest uppercase px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              Pagesë e Verifikuar me Sukses
            </span>

            <h1 className="text-2xl sm:text-3xl font-black text-[#0B192C] mt-3 tracking-tight">
              Faleminderit! Prona juaj u aktivizua.
            </h1>
            <p className="text-sm text-slate-600 max-w-md mx-auto mt-2">
              Transaksioni u procesua me sukses. Publikimi juaj është i vlefshëm sipas planit të zgjedhur.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500">Statusi i Pronës:</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {data?.property?.status === 'pending_moderation' 
                  ? 'Në Shqyrtim nga Moderatori (Siguri)' 
                  : 'E Publikuar dhe Aktive'}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-[#0B192C]">Dëshmia e Faturës Digjitale</h3>
              </div>
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Printo Faturën</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Referenca e Pagesës:</span>
                <span className="font-mono font-semibold text-slate-800">{data?.payment?.id}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-0.5">ID e Transaksionit të Ofruesit:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {data?.payment?.providerTransactionId || 'TX-KOS-2026-OK'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Shuma e Paguar:</span>
                <span className="text-base font-black text-slate-900">
                  {data?.payment?.amount} {data?.payment?.currency}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Ofruesi i Pagesës:</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {data?.payment?.provider}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <span className="text-emerald-800 font-medium block mb-0.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  Data e Aktivizimit:
                </span>
                <span className="font-semibold text-slate-800">
                  {data?.property?.publishedAt ? new Date(data.property.publishedAt).toLocaleDateString('sq-AL') : 'Sot'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <span className="text-emerald-800 font-medium block mb-0.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  Data e Skadimit:
                </span>
                <span className="font-bold text-emerald-900">
                  {data?.property?.expiresAt ? new Date(data.property.expiresAt).toLocaleDateString('sq-AL') : 'Sipas planit'}
                </span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/dashboard/pagesat"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all"
              >
                <span>Shiko Historikun e Pagesave</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Building2 className="w-4 h-4" />
                <span>Kthehu te Ballina</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />
      <Suspense fallback={
        <div className="flex-1 max-w-3xl w-full mx-auto p-12 text-center text-xs text-slate-500">
          Duke ngarkuar dëshminë e pagesës...
        </div>
      }>
        <PaymentSuccessContent />
      </Suspense>
      <Footer />
    </div>
  );
}
