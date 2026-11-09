import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckCircle2, XCircle, AlertCircle, ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Rregullat e Publikimit | PronaX Kosovë',
  description: 'Standardet, rregullat dhe kriteret e kërkuara për publikimin e pasurive të paluajtshme në PronaX.',
};

export default function ListingRulesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-6 text-sm text-slate-600 leading-relaxed">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Cilësia & Siguria</span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B192C] mt-1">Rregullat e Publikimit të Pronave</h1>
            <p className="text-xs text-slate-400 mt-1">Standardi i cilësisë për tregun e patundshmërive në Kosovë</p>
          </div>

          <p>
            Për të ruajtur standardin e lartë dhe besueshmërinë e platformës PronaX, çdo shpallje i nënshtrohet këtyre kritereve thelbësore para dhe gjatë publikimit:
          </p>

          {/* Do's and Don'ts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
              <span className="font-bold text-xs uppercase text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Çfarë Lejohet dhe Kërkohet
              </span>
              <ul className="space-y-2 text-xs text-emerald-950">
                <li>✓ Fotografi reale, të qarta dhe të bëra në pronën aktuale.</li>
                <li>✓ Çmim real dhe transparent në Euro (€).</li>
                <li>✓ Përzgjedhje e saktë e komunës dhe vendbanimit në Kosovë.</li>
                <li>✓ Përshkrim i qartë mbi katin, ngrohjen, parkingun dhe sipërfaqen në m².</li>
                <li>✓ Numër kontakti aktiv dhe i arritshëm (mundësisht me WhatsApp).</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-red-50/60 border border-red-200 space-y-3">
              <span className="font-bold text-xs uppercase text-red-900 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-red-600" />
                Çfarë Ndalohet Rreptësisht
              </span>
              <ul className="space-y-2 text-xs text-red-950">
                <li>✕ Fotografi të marra nga interneti apo projekte të huaja që nuk i përkasin pronës.</li>
                <li>✕ Çmime mashtruese si "1 €" ose "0 €" për të tërhequr klikime.</li>
                <li>✕ Shpallje të dyfishta (duplikate) të së njëjtës pronë nga i njëjti përdorues.</li>
                <li>✕ Përmbajtje fyese, diskriminuese ose reklama të produkteve të tjera.</li>
                <li>✕ Publikim i pronave me status të paqartë juridik pa autorizim.</li>
              </ul>
            </div>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">Moderimi dhe Largimi i Shpalljeve</h2>
            <p>
              Ekipi i PronaX monitoron shpalljet në mënyrë të vazhdueshme. Shpalljet që shkelin këto rregulla do të pezullohen menjëherë deri në korrigjimin e tyre, ose do të fshihen pa rimbursim në rast të shkeljeve të përsëritura mashtruese.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
