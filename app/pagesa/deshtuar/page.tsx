'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { XCircle, RefreshCw, ShieldAlert, ArrowLeft } from 'lucide-react';

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId') || 'prop-ks-101';

  return (
    <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-16">
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200/80 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-red-500/10">
          <XCircle className="w-9 h-9" />
        </div>

        <span className="text-[11px] font-bold tracking-widest uppercase px-3 py-1 bg-red-50 text-red-700 rounded-full border border-red-200">
          Pagesa Nuk u Realizua
        </span>

        <h1 className="text-2xl font-black text-[#0B192C] mt-3 tracking-tight">
          Transaksioni u Anulua ose Dështoi
        </h1>

        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          Nuk është kryer asnjë zbritje nga kartela juaj. Prona juaj mbetet e ruajtur në mënyrë të sigurt në gjendje të gatshme (Në Pritje të Pagesës).
        </p>

        <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 text-left space-y-2">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Arsyet e mundshme të dështimit:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-500 pl-1">
            <li>Anulim vullnetar nga përdoruesi para përfundimit.</li>
            <li>Mungesë fondesh ose kufizim i pagesave online nga banka emituese.</li>
            <li>Mosplotësim i kodit të sigurisë 3D Secure (SMS OTP).</li>
          </ul>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            href={`/pagesa/${propertyId}`}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm shadow-md shadow-emerald-700/20"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Provo Përsëri Pagesën (7.00 €)</span>
          </Link>

          <Link
            href="/dashboard/pagesat"
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kthehu te Paneli i Kontrollit</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />
      <Suspense fallback={
        <div className="flex-1 max-w-xl w-full mx-auto p-12 text-center text-xs text-slate-500">
          Duke ngarkuar...
        </div>
      }>
        <PaymentFailedContent />
      </Suspense>
      <Footer />
    </div>
  );
}
