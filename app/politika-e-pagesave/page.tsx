import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CreditCard, ShieldCheck, Clock, CheckCircle2, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Politika e Pagesave & Planet | PronaX Kosovë',
  description: 'Planet e publikimit në PronaX: Falas 3 ditë, Javore 2.99 € dhe Mujore 9.99 €. Pagesa njëherëshe pa abonime automatike.',
};

export default function PaymentPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-6 text-sm text-slate-600 leading-relaxed">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Rregullore Financiare</span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B192C] mt-1">Politika e Pagesave & Planet e Publikimit</h1>
            <p className="text-xs text-slate-400 mt-1">pronax-ks.com • Planet: Falas 3 ditë | Javore 2.99 € (7 ditë) | Mujore 9.99 € (30 ditë)</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-700 uppercase block mb-1">Plani Falas</span>
              <span className="text-2xl font-black text-[#0B192C]">0.00 €</span>
              <span className="text-[11px] text-slate-500 block mt-1">Vlefshmëri 3 Ditë</span>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center">
              <span className="text-xs font-bold text-blue-800 uppercase block mb-1">Plani Javor</span>
              <span className="text-2xl font-black text-[#0B192C]">2.99 €</span>
              <span className="text-[11px] text-slate-500 block mt-1">Vlefshmëri 7 Ditë</span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-xs font-bold text-emerald-800 uppercase block mb-1">Plani Mujor</span>
              <span className="text-2xl font-black text-[#0B192C]">9.99 €</span>
              <span className="text-[11px] text-slate-500 block mt-1">Vlefshmëri 30 Ditë</span>
            </div>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Planet e Publikimit dhe Kohëzgjatja</h2>
            <p>
              PronaX ofron tre plane transparente të publikimit:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li><strong>Plani Falas (0 €):</strong> Publikim i menjëhershëm për 3 ditë kalendarike pa asnjë pagesë. Pasi të skadojnë 3 ditët, shpallja çaktivizohet automatikisht nga kërkimi publik dhe harta.</li>
              <li><strong>Plani Javor (2.99 €):</strong> Publikim aktiv për 7 ditë të plota me kartelë bankare Visa/Mastercard.</li>
              <li><strong>Plani Mujor (9.99 €):</strong> Publikim i plotë dhe ekspozim maksimal në të 38 komunat e Kosovës për 30 ditë.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Garancia Kundër Abonimeve Automatike</h2>
            <p>
              PronaX zbaton një parim strikt: <strong>Asnjë ripërtëritje automatike e fshehur dhe asnjë abonim i padëshiruar</strong>. Kur skadon kohëzgjatja e planit tuaj, prona largohet nga rezultatet publike dhe harta. Ne kurrë nuk tërheqim fonde automatikisht nga kartela juaj bankare.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Rregullat e Rinovimit Manual</h2>
            <p>
              Nëse prona juaj nuk është shitur apo lëshuar me qira pas përfundimit të afatit, ju mund ta ri-publikoni atë në çdo kohë nga paneli juaj personal duke zgjedhur cilindo plan që dëshironi (Falas 3 ditë, Javore 2.99 € ose Mujore 9.99 €). Rinovimi kryhet vetëm manualisht me aprovimin tuaj të drejtpërdrejtë.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Metodat e Pagesës dhe Siguria 3D-Secure</h2>
            <p>
              Pagesat për planet me pagesë realizohen në mënyrë të sigurt me kartela bankare <strong>Visa</strong> dhe <strong>Mastercard</strong> me mbrojtje 3D-Secure 2.0 përmes partnerëve tanë financiarë. Të gjitha transaksionet verifikohen me nënshkrim kriptografik në server.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
