'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  CreditCard, ShieldCheck, Euro, Building2, Clock,
  CheckCircle2, AlertCircle, ArrowLeft, Lock, RefreshCw,
  MapPin, Calendar, Sparkles, Check, Zap
} from 'lucide-react';
import { PRONAX_PRICING_PLANS, PricingPlanId, getPlanById } from '@/lib/payments/plans';

const MOCK_PROPERTIES: Record<string, any> = {
  'prop-ks-101': { title: 'Banesë moderne në lagjen Marigona Hill', property_type: 'Banesë', municipality_name: 'Prishtinë', price: 135000, listing_type: 'shitje' },
  'prop-ks-102': { title: 'Shtëpi komode me oborr të rregulluar', property_type: 'Shtëpi', municipality_name: 'Prizren', price: 185000, listing_type: 'shitje' },
  'prop-ks-103': { title: 'Lokal afarist modern në qendër të Pejës', property_type: 'Lokal afarist', municipality_name: 'Pejë', price: 750, listing_type: 'qira' },
  'prop-ks-104': { title: 'Vilë luksoze me pamje malore në Brezovicë', property_type: 'Vilë', municipality_name: 'Shtërpcë', price: 240000, listing_type: 'shitje' },
  'prop-ks-105': { title: 'Truall ndërtimor 1500m² me leje ndërtimi', property_type: 'Truall', municipality_name: 'Fushë Kosovë', price: 68000, listing_type: 'shitje' },
  'prop-ks-106': { title: 'Banesë 2+1 me ballkon të madh — Ferizaj Qendër', property_type: 'Banesë', municipality_name: 'Ferizaj', price: 72000, listing_type: 'shitje' },
};

function PaymentPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const propertyId = params?.propertyId as string;

  const initialPlan = (searchParams.get('plan') as PricingPlanId) || 'monthly';
  const [selectedPlanId, setSelectedPlanId] = useState<PricingPlanId>(
    ['free', 'weekly', 'monthly'].includes(initialPlan) ? initialPlan : 'monthly'
  );

  const [property, setProperty] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentStep, setPaymentStep] = useState<'review' | 'processing' | 'done' | 'error'>('review');
  const [paymentProvider, setPaymentProvider] = useState<string>('sandbox');
  const [errorMsg, setErrorMsg] = useState('');

  const currentPlan = getPlanById(selectedPlanId);

  useEffect(() => {
    const found = MOCK_PROPERTIES[propertyId];
    if (found) {
      setProperty({ ...found, id: propertyId });
      setLoading(false);
      return;
    }
    fetch(`/api/properties/${propertyId}`)
      .then(r => r.json())
      .then(data => {
        if (data.property) setProperty(data.property);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [propertyId]);

  const handleInitiatePayment = async () => {
    setPaymentStep('processing');
    setErrorMsg('');

    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          planId: currentPlan.id,
          purpose: 'new_listing',
          preferredProvider: paymentProvider,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Nuk mund të iniciohet plani. Provoni sërish.');
      }

      // Free plan directly activates and redirects
      if (data.isFree) {
        router.push(`/pagesa/sukses?paymentId=${data.paymentId}&propertyId=${propertyId}&plan=free`);
        return;
      }

      if (data.checkoutUrl) {
        // If sandbox provider
        if (data.checkoutUrl.includes('sandbox-checkout')) {
          router.push(`/pagesa/sandbox-checkout?propertyId=${propertyId}&paymentId=${data.paymentId}&amount=${data.amountCents}`);
        } else {
          window.location.href = data.checkoutUrl;
        }
      } else {
        router.push(`/pagesa/sandbox-checkout?propertyId=${propertyId}&paymentId=${data.paymentId}&amount=${data.amountCents}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gabim gjatë procesimit të kërkesës.');
      setPaymentStep('error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Duke ngarkuar të dhënat e pronës...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-10">
      {/* Back link */}
      <Link href={property ? `/prona/${propertyId}` : '/dashboard/pronat'} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Kthehu te prona
      </Link>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-[#0B192C] to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Zgjidhni Planin e Publikimit</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
          Zgjidhni një nga tre planet e përshtatshme për pronën tuaj në Kosovë. Pa abonim automatik.
        </p>
      </div>

      {/* Property Info Card */}
      {property && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 mb-6 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-slate-900 dark:text-white text-sm truncate">{property.title}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {property.municipality_name}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  property.listing_type === 'shitje' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                }`}>
                  {property.listing_type === 'shitje' ? 'Në Shitje' : 'Me Qira'}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500">{property.property_type}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* THREE PRICING PLANS SELECTOR */}
      <div className="mb-8">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
          1. Zgjidhni Planin Tuaj:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Plan 1: Free */}
          <div
            onClick={() => setSelectedPlanId('free')}
            className={`relative rounded-2xl p-5 border-2 cursor-pointer transition-all ${
              selectedPlanId === 'free'
                ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-400/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                {PRONAX_PRICING_PLANS.free.name}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {PRONAX_PRICING_PLANS.free.badge}
              </span>
            </div>
            <div className="mb-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white">0 €</span>
              <span className="text-xs text-slate-500 ml-1">/ 3 ditë</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Provë njëherëshe falas pa asnjë pagesë. Skadon automatikisht pas 3 ditësh.
            </p>
            <ul className="space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
              {PRONAX_PRICING_PLANS.free.features.slice(0, 3).map((f, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Plan 2: Weekly */}
          <div
            onClick={() => setSelectedPlanId('weekly')}
            className={`relative rounded-2xl p-5 border-2 cursor-pointer transition-all ${
              selectedPlanId === 'weekly'
                ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-400/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                {PRONAX_PRICING_PLANS.weekly.name}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                {PRONAX_PRICING_PLANS.weekly.badge}
              </span>
            </div>
            <div className="mb-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white">2.99 €</span>
              <span className="text-xs text-slate-500 ml-1">/ 7 ditë</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Ideale për shitje apo qiradhënie të shpejtë gjatë javës.
            </p>
            <ul className="space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
              {PRONAX_PRICING_PLANS.weekly.features.slice(0, 3).map((f, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Plan 3: Monthly (Most Popular) */}
          <div
            onClick={() => setSelectedPlanId('monthly')}
            className={`relative rounded-2xl p-5 border-2 cursor-pointer transition-all ${
              selectedPlanId === 'monthly'
                ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-400/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                {PRONAX_PRICING_PLANS.monthly.name}
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                MË E POPULLARIZUARA
              </span>
            </div>
            <div className="mb-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white">9.99 €</span>
              <span className="text-xs text-slate-500 ml-1">/ 30 ditë</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Mbulim i plotë mujor në të gjithë territorin e Kosovës me ekspozim maksimal.
            </p>
            <ul className="space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
              {PRONAX_PRICING_PLANS.monthly.features.slice(0, 3).map((f, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Plan Summary Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-6 shadow-xs">
        <h2 className="font-black text-slate-900 dark:text-white text-sm mb-4">Përmbledhja e Porosisë</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              Plani i zgjedhur: <strong>{currentPlan.name}</strong> ({currentPlan.durationDays} ditë)
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {currentPlan.priceEur === 0 ? 'Falas (0.00 €)' : `${currentPlan.priceEur.toFixed(2)} €`}
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Kohëzgjatja e publikimit
            </span>
            <span>{currentPlan.durationDays} ditë nga data e aktivizimit</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              Ripërtëritja
            </span>
            <span>Manual vetëm me dëshirën tuaj (Pa abonim automatik)</span>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-700 pt-3 flex justify-between items-baseline">
            <span className="font-black text-slate-900 dark:text-white">Totali për të Paguar</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400 text-2xl">
              {currentPlan.priceEur === 0 ? '0.00 €' : `${currentPlan.priceEur.toFixed(2)} €`}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Provider Selection (Only shown for Paid Plans: Weekly & Monthly) */}
      {currentPlan.priceEur > 0 && paymentStep === 'review' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-6 shadow-xs">
          <h2 className="font-black text-slate-900 dark:text-white text-sm mb-4">Mënyra e Pagesës</h2>
          <div className="space-y-3">
            <label className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
              paymentProvider === 'sandbox'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
            }`}>
              <input
                type="radio"
                name="provider"
                value="sandbox"
                checked={paymentProvider === 'sandbox'}
                onChange={e => setPaymentProvider(e.target.value)}
                className="text-emerald-600"
              />
              <div className="flex items-center gap-2 flex-1">
                <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                  <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Kartelë Bankare (Sandbox / Live)</div>
                  <div className="text-[11px] text-slate-400">Pagesë e sigurt me Visa dhe Mastercard (3D Secure 2.0)</div>
                </div>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">AKTIV</span>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-xl border-2 border-slate-100 dark:border-slate-700 cursor-not-allowed opacity-60">
              <input type="radio" name="provider" disabled className="text-slate-300" />
              <div className="flex items-center gap-2 flex-1">
                <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Paysera Checkout Modern</div>
                  <div className="text-[11px] text-slate-400">Pagesë direkte me llogari Paysera ose kartelë</div>
                </div>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">CONFIG</span>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-xl border-2 border-slate-100 dark:border-slate-700 cursor-not-allowed opacity-60">
              <input type="radio" name="provider" disabled className="text-slate-300" />
              <div className="flex items-center gap-2 flex-1">
                <div className="w-8 h-8 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Euro className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Virtual POS Bankar në Kosovë</div>
                  <div className="text-[11px] text-slate-400">ProCredit / NLB Virtual POS për tregtarët në Kosovë</div>
                </div>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">CONFIG</span>
            </label>
          </div>

          <div className="mt-4 flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-500 dark:text-slate-400">
              PronaX nuk ruan të dhënat e kartelës tuaj (numrin, CVV apo PIN). Të gjitha pagesat janë të enkriptuara me standardin ndërkombëtar PCI-DSS.
            </div>
          </div>
        </div>
      )}

      {/* Error Notice */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Action CTA Button */}
      <div className="space-y-3">
        <button
          onClick={handleInitiatePayment}
          disabled={paymentStep === 'processing'}
          className="w-full py-4 px-6 rounded-2xl font-black text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-50 transition-all text-sm sm:text-base shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2"
        >
          {paymentStep === 'processing' ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : currentPlan.priceEur === 0 ? (
            <>
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Publiko Pronën Falas (3 Ditë)</span>
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              <span>Paguaj {currentPlan.priceEur.toFixed(2)} € dhe Publiko ({currentPlan.durationDays} Ditë)</span>
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-slate-400">
          Duke vazhduar, ju pranoni{' '}
          <Link href="/kushtet-e-perdorimit" className="underline hover:text-emerald-500">Kushtet e Përdorimit</Link>
          {' '}dhe{' '}
          <Link href="/politika-e-pagesave" className="underline hover:text-emerald-500">Politikën e Pagesave</Link>
          {' '}të PronaX Kosovë.
        </p>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <Suspense fallback={
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <PaymentPageContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
