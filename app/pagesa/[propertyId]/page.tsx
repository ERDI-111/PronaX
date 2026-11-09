'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  CreditCard, ShieldCheck, Euro, Building2, Clock,
  CheckCircle2, AlertCircle, ArrowLeft, Lock, RefreshCw,
  MapPin, Calendar, Sparkles
} from 'lucide-react';

const MOCK_PROPERTIES: Record<string, any> = {
  'prop-ks-101': { title: 'Banesë moderne në lagjen Marigona Hill', property_type: 'Banesë', municipality_name: 'Prishtinë', price: 135000, listing_type: 'shitje' },
  'prop-ks-102': { title: 'Shtëpi komode me oborr të rregulluar', property_type: 'Shtëpi', municipality_name: 'Prizren', price: 185000, listing_type: 'shitje' },
  'prop-ks-103': { title: 'Lokal afarist modern në qendër të Pejës', property_type: 'Lokal afarist', municipality_name: 'Pejë', price: 750, listing_type: 'qira' },
  'prop-ks-104': { title: 'Vilë luksoze me pamje malore në Brezovicë', property_type: 'Vilë', municipality_name: 'Shtërpcë', price: 240000, listing_type: 'shitje' },
  'prop-ks-105': { title: 'Truall ndërtimor 1500m² me leje ndërtimi', property_type: 'Truall', municipality_name: 'Fushë Kosovë', price: 68000, listing_type: 'shitje' },
  'prop-ks-106': { title: 'Banesë 2+1 me ballkon të madh — Ferizaj Qendër', property_type: 'Banesë', municipality_name: 'Ferizaj', price: 72000, listing_type: 'shitje' },
};

const LISTING_FEE_EUR = 7;

function PaymentPageContent() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.propertyId as string;

  const [property, setProperty] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentStep, setPaymentStep] = useState<'review' | 'processing' | 'done' | 'error'>('review');
  const [paymentProvider, setPaymentProvider] = useState<string>('sandbox');
  const [errorMsg, setErrorMsg] = useState('');

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
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: propertyId,
          purpose: 'new_listing',
          amount_eur: LISTING_FEE_EUR,
          provider: paymentProvider,
        }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.redirect_url) {
          window.location.href = data.redirect_url;
        } else if (data.sandbox) {
          router.push(`/pagesa/sandbox-checkout?propertyId=${propertyId}&sessionId=${data.session_id}&amount=${LISTING_FEE_EUR}`);
        }
      } else {
        setErrorMsg(data.error || 'Pagesa nuk mund të iniciohet. Provoni përsëri.');
        setPaymentStep('error');
      }
    } catch {
      setErrorMsg('Gabim i lidhjes. Kontrolloni internetin dhe provoni përsëri.');
      setPaymentStep('error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Duke ngarkuar detajet e pagesës...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 py-10">
      {/* Back link */}
      <Link href={property ? `/prona/${propertyId}` : '/dashboard/pronat'} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Kthehu
      </Link>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-[#0B192C] to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Publiko Pronën Tënde</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Pagesa e njëhershme • 30 ditë publikim aktiv
        </p>
      </div>

      {/* Property Info Card */}
      {property && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-5 shadow-xs">
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

      {/* Payment Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-5 shadow-xs">
        <h2 className="font-black text-slate-900 dark:text-white text-sm mb-4">Përmbledhja e Pagesës</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Tarifa e publikimit (30 ditë)</span>
            <span className="font-bold text-slate-900 dark:text-white">{LISTING_FEE_EUR}.00 €</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Periudha e aktivitetit
            </span>
            <span>30 ditë nga miratimi</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              Rinovimi
            </span>
            <span>Manual, 7 € pas skadimit</span>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-700 pt-3 flex justify-between">
            <span className="font-black text-slate-900 dark:text-white">Totali</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400 text-xl">{LISTING_FEE_EUR}.00 €</span>
          </div>
        </div>
      </div>

      {/* What's Included */}
      <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-2xl p-5 mb-5">
        <h3 className="font-black text-emerald-800 dark:text-emerald-300 text-sm mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Çfarë përfshin 7 €
        </h3>
        <div className="space-y-2">
          {[
            '30 ditë listim i plotë aktiv',
            'Shfaqje në rezultatet e kërkimit',
            'Shfaqje në hartën interaktive',
            'Raport i shikimeve dhe statistikave',
            'Mundësi kontakti direkt nga blerësit',
            'Deri 30 fotografi të pronës',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Payment Provider Selection */}
      {paymentStep === 'review' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-5 shadow-xs">
          <h2 className="font-black text-slate-900 dark:text-white text-sm mb-4">Mënyra e Pagesës</h2>
          <div className="space-y-3">
            <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
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
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Sandbox (Test)</div>
                  <div className="text-[11px] text-slate-400">Pagesa simuluese — pa para reale</div>
                </div>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">TEST</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-100 dark:border-slate-700 cursor-not-allowed opacity-50">
              <input type="radio" name="provider" disabled className="text-slate-300" />
              <div className="flex items-center gap-2 flex-1">
                <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Paysera Checkout</div>
                  <div className="text-[11px] text-slate-400">Visa / Mastercard — kërkon konfigurimin e llogarisë</div>
                </div>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">CONFIG</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-100 dark:border-slate-700 cursor-not-allowed opacity-50">
              <input type="radio" name="provider" disabled className="text-slate-300" />
              <div className="flex items-center gap-2 flex-1">
                <div className="w-8 h-8 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Euro className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Virtual POS (Kosovo Bank)</div>
                  <div className="text-[11px] text-slate-400">ProCredit / NLB — kërkon aprovimin e tregtarit</div>
                </div>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">CONFIG</span>
            </label>
          </div>

          <div className="mt-4 flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Pagesa procesuar me anë të ofruesit të sigurt. PronaX <strong className="text-slate-700 dark:text-slate-300">nuk ruan</strong> të dhëna të kartës. Çmimi verifikohet nga serveri.
            </p>
          </div>
        </div>
      )}

      {/* Processing State */}
      {paymentStep === 'processing' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 mb-5 shadow-xs text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="font-black text-slate-900 dark:text-white mb-1">Duke inicuar pagesën...</h3>
          <p className="text-xs text-slate-400">Ju po ridrejtoheni te ofruesi i pagesave.</p>
        </div>
      )}

      {/* Error State */}
      {paymentStep === 'error' && (
        <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-2xl p-5 mb-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-black text-rose-800 dark:text-rose-300 text-sm">Gabim gjatë inicimit të pagesës</h3>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errorMsg}</p>
              <button
                onClick={() => setPaymentStep('review')}
                className="mt-3 text-xs font-bold text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Provo Përsëri
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pay Button */}
      {paymentStep === 'review' && (
        <div className="space-y-3">
          <button
            onClick={handleInitiatePayment}
            className="w-full py-4 bg-[#0B192C] hover:bg-[#162436] text-white font-black text-base rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-slate-900/20 dark:shadow-slate-900/40"
          >
            <Lock className="w-5 h-5" />
            Paguaj {LISTING_FEE_EUR}.00 € dhe Publiko
          </button>
          <p className="text-center text-xs text-slate-400 dark:text-slate-500">
            Duke klikuar, pranoni <Link href="/kushtet-e-perdorimit" className="underline hover:text-emerald-600">Kushtet e Përdorimit</Link> dhe <Link href="/politika-e-pagesave" className="underline hover:text-emerald-600">Politikën e Pagesave</Link>.
          </p>
          <p className="text-center text-xs text-amber-600 dark:text-amber-400 font-semibold">
            ⚠️ Pagesa verifikohet nga serveri. Prona aktivizohet vetëm pas konfirmimit të pagesës.
          </p>
        </div>
      )}

      {/* Important notices */}
      <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs text-slate-500 dark:text-slate-400">
        <p className="flex items-start gap-1.5"><Clock className="w-3.5 h-3.5 mt-0.5 text-amber-500 flex-shrink-0" /> Prona bëhet aktive pas miratimit manual ose automatik nga administratori.</p>
        <p className="flex items-start gap-1.5"><RefreshCw className="w-3.5 h-3.5 mt-0.5 text-blue-400 flex-shrink-0" /> Rinovimi kërkon pagesë tjetër manuale prej 7 €. Nuk ka pagesë automatike.</p>
        <p className="flex items-start gap-1.5"><ShieldCheck className="w-3.5 h-3.5 mt-0.5 text-emerald-500 flex-shrink-0" /> Pagesa e dështuar nuk aktivizon pronën. Idempotenca e transaksionit sigurohet nga serveri.</p>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Header />
      <main className="flex-1">
        <Suspense fallback={
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500 text-sm">Duke ngarkuar faqen e pagesës...</p>
            </div>
          </div>
        }>
          <PaymentPageContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
