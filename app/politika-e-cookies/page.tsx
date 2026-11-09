import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Politika e Cookies | PronaX Kosovë',
  description: 'Mësoni se si përdor PronaX teknologjinë e cookies për të përmirësuar përvojën e kërkimit.',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-6 text-sm text-slate-600 leading-relaxed">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Transparencë Teknike</span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B192C] mt-1">Politika e Cookies</h1>
            <p className="text-xs text-slate-400 mt-1">pronax-ks.com • Republika e Kosovës</p>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Çfarë janë Cookies?</h2>
            <p>
              Cookies janë skedarë të vegjël teksti që ruhen në pajisjen tuaj (kompjuter, tablet ose telefon) kur vizitoni faqen tonë. Ato ndihmojnë faqen të mbajë mend preferencat tuaja të kërkimit dhe hyrjen në llogari.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Llojet e Cookies që Përdorim</h2>
            <ul className="list-disc pl-5 space-y-2 text-xs">
              <li>
                <strong>Cookies Thelbësore (Teknike):</strong> Të nevojshme për autentikimin e përdoruesit, sesionet e sigurta dhe procesimin e shportës së pagesës. Pa to, faqja nuk mund të funksionojë siç duhet.
              </li>
              <li>
                <strong>Cookies të Preferencave:</strong> Mbajnë mend filtrat tuaj të fundit (psh. komuna e përzgjedhur, çmimi maksimal, lista apo pamja në hartë).
              </li>
              <li>
                <strong>Cookies Analitike:</strong> Na ndihmojnë të kuptojmë se cilat prona shikohen më shumë dhe si të optimizojmë performancën e shfletimit në Kosovë.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Menaxhimi i Cookies</h2>
            <p>
              Ju mund t'i kontrolloni ose fshini cookies në çdo kohë përmes cilësimeve të shfletuesit tuaj (Chrome, Safari, Firefox, Edge).
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
