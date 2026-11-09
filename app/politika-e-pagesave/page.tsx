import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CreditCard, ShieldCheck, Clock, CheckCircle2, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Politika e Pagesave | PronaX Kosovë',
  description: 'Rregullorja e pagesës fikse prej 7.00 €, kohëzgjatja 30-ditore dhe siguria e transaksioneve në PronaX.',
};

export default function PaymentPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-6 text-sm text-slate-600 leading-relaxed">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Rregullore Financiare</span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B192C] mt-1">Politika e Pagesave</h1>
            <p className="text-xs text-slate-400 mt-1">pronax-ks.com • Tarifa Fikse 7.00 € për 30 Ditë</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-xs font-bold text-emerald-800 uppercase block mb-1">Tarifa Fikse</span>
              <span className="text-2xl font-black text-[#0B192C]">7.00 €</span>
              <span className="text-[11px] text-slate-500 block mt-1">Për çdo shpallje</span>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center">
              <span className="text-xs font-bold text-blue-800 uppercase block mb-1">Kohëzgjatja</span>
              <span className="text-2xl font-black text-[#0B192C]">30 Ditë</span>
              <span className="text-[11px] text-slate-500 block mt-1">Vlefshmëri kalendarike</span>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-center">
              <span className="text-xs font-bold text-purple-800 uppercase block mb-1">Ripërtëritja</span>
              <span className="text-2xl font-black text-[#0B192C]">0% Auto</span>
              <span className="text-[11px] text-slate-500 block mt-1">Vetëm manuale</span>
            </div>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Tarifa e Publikimit dhe Cikli 30-Ditor</h2>
            <p>
              Çdo publikim i ri i një prone në PronaX i nënshtrohet një tarife fikse administrative prej <strong>7.00 € (EUR)</strong>. Kjo tarifë garanton shfaqjen e pronës në ballinë, listat e kërkimit dhe hartën interaktive për saktësisht <strong>30 ditë</strong> nga momenti i miratimit.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Garancia Kundër Abonimeve Automatike</h2>
            <p>
              PronaX zbaton një parim strikt: <strong>Asnjë ripërtëritje automatike e fshehur</strong>. Pasi skadojnë 30 ditët, prona kalon automatikisht në statusin e skaduar dhe largohet nga kërkimi publik. Ne kurrë nuk tërheqim fonde automatikisht nga llogaria juaj.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Rregullat e Rinovimit Manual</h2>
            <p>
              Nëse prona nuk është shitur apo lëshuar me qira pas 30 ditësh, pronari mund të klikojë butonin <strong>"Rinovo pronën – 7 €"</strong> në panelin e tij. Rinovimi aktivizon një periudhë të re 30-ditore me tarifën e njëjtë prej 7.00 €.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Metodat e Pagesës dhe Siguria 3D-Secure</h2>
            <p>
              Pagesat realizohen me kartela bankare <strong>Visa</strong> dhe <strong>Mastercard</strong> përmes partnerëve tanë të licencuar financiarë (Paysera Modern Checkout dhe Virtual POS të bankave në Kosovë me mbrojtje 3D-Secure 2.0). Të gjitha transaksionet verifikohen me nënshkrim kriptografik server-to-server para çdo aktivizimi.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
