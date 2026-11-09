'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldCheck, CreditCard, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

function SandboxCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paymentId = searchParams.get('paymentId') || 'pay_demo_test';
  const propertyId = searchParams.get('propertyId') || 'prop-ks-101';
  const amount = searchParams.get('amount') || '700';
  const currency = searchParams.get('currency') || 'EUR';
  const purpose = searchParams.get('purpose') || 'new_listing';

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simulateWebhook = async (status: 'successful' | 'failed' | 'cancelled') => {
    setProcessing(true);
    setError(null);

    try {
      const payload = {
        paymentId,
        providerTransactionId: `SANDBOX-TX-${Date.now()}`,
        status,
        amountCents: 700,
        currency: 'EUR',
      };

      const res = await fetch('/api/payments/webhook/sandbox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pronax-signature': 'mock_verified_signature_token',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Dështoi simulimi i webhook-ut.');
      }

      if (status === 'successful') {
        router.push(`/pagesa/sukses?paymentId=${paymentId}&propertyId=${propertyId}`);
      } else {
        router.push(`/pagesa/deshtuar?paymentId=${paymentId}&propertyId=${propertyId}`);
      }
    } catch (err: any) {
      setError(err.message || 'Gabim gjatë ekzekutimit të simulimit.');
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-white text-lg">
            P
          </div>
          <div>
            <span className="font-black text-white tracking-tight">Prona<span className="text-emerald-400">X</span> Gateway</span>
            <span className="block text-[10px] text-emerald-400 uppercase font-mono tracking-widest">Sandbox Simulator</span>
          </div>
        </div>
        <span className="text-xs bg-emerald-500/10 text-emerald-300 font-semibold px-2 py-1 rounded">
          3D Secure 2.0
        </span>
      </div>

      {/* Transaction Details */}
      <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-700/50 space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Referenca e Porosisë:</span>
          <span className="font-mono text-slate-200">{paymentId}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>Qëllimi:</span>
          <span className="text-emerald-400 font-medium">
            {purpose === 'renewal' ? 'Rinovim 30 ditor' : 'Publikim i ri 30 ditor'}
          </span>
        </div>
        <div className="flex justify-between items-baseline pt-2 border-t border-slate-800 text-sm">
          <span className="text-slate-300 font-semibold">Shuma e Faturuar:</span>
          <span className="text-2xl font-black text-white">7.00 € <span className="text-xs font-normal text-slate-400">EUR</span></span>
        </div>
      </div>

      {/* Card Mock Details */}
      <div className="bg-gradient-to-tr from-slate-900 to-slate-800 rounded-2xl p-5 border border-slate-700 text-xs space-y-4">
        <div className="flex justify-between items-center text-slate-400">
          <CreditCard className="w-6 h-6 text-emerald-400" />
          <span className="font-semibold text-white tracking-widest">VISA TEST</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block">NUMRI I KARTELËS</span>
          <span className="font-mono text-sm tracking-wider text-slate-200">4000 •••• •••• 0001</span>
        </div>
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>VALIDE: 12/28</span>
          <span>CVV: •••</span>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Simulation Actions */}
      <div className="space-y-2.5 pt-2">
        <button
          onClick={() => simulateWebhook('successful')}
          disabled={processing}
          className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-900/40"
        >
          {processing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Simulo Pagesë të Suksesshme (7.00 €)</span>
            </>
          )}
        </button>

        <button
          onClick={() => simulateWebhook('failed')}
          disabled={processing}
          className="w-full py-2.5 px-4 rounded-xl font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-900/40 active:scale-95 disabled:opacity-50 transition-all text-xs"
        >
          Simulo Refuzim / Kartelë të Dështuar
        </button>

        <button
          onClick={() => simulateWebhook('cancelled')}
          disabled={processing}
          className="w-full py-2 px-4 rounded-xl font-medium text-slate-400 hover:text-slate-200 active:scale-95 text-xs flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Anulo dhe Kthehu te PronaX</span>
        </button>
      </div>

      <div className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Testim i arkitekturës së pagesave pa ngarkim real financiar.</span>
      </div>
    </div>
  );
}

export default function SandboxCheckoutPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4">
      <Suspense fallback={<div className="text-white text-xs">Duke hapur simulatorin...</div>}>
        <SandboxCheckoutContent />
      </Suspense>
    </div>
  );
}
