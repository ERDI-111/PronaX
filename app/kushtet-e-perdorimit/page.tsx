import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Kushtet e Përdorimit | PronaX Kosovë',
  description: 'Rregullat dhe kushtet e përdorimit të platformës së pasurive të paluajtshme PronaX (pronax-ks.com).',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-6 text-sm text-slate-600 leading-relaxed">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Dokument Ligjor</span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B192C] mt-1">Kushtet e Përdorimit</h1>
            <p className="text-xs text-slate-400 mt-1">Përditësuar së fundmi: Nëntor 2026 • Republika e Kosovës</p>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Pranimi i Kushteve</h2>
            <p>
              Duke hyrë dhe përdorur portalin <strong>PronaX</strong> (pronax-ks.com), ju pranoni të jeni të lidhur ligjërisht me këto Kushte të Përdorimit. Nëse nuk pajtoheni me ndonjë nga këto kushte, ju lutem mos vazhdoni me përdorimin e shërbimeve tona.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Modeli i Shërbimit & Tarifa e Publikimit</h2>
            <p>
              PronaX është një treg online (marketplace) që lehtëson lidhjen ndërmjet pronarëve, shitësve, agjencive dhe blerësve apo qiramarrësve në Republikën e Kosovës.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>Tarifa standarde e shpalljes së një prone është <strong>7.00 € (EUR)</strong>.</li>
              <li>Çdo publikim i suksesshëm mbetet aktiv për një periudhë fikse prej <strong>30 ditësh kalendarike</strong>.</li>
              <li>Pagesa është e njëhershme; nuk ka abonim automatik apo tërheqje të përsëritur nga kartela juaj.</li>
              <li>Rinovimi kërkon një pagesë të re manuale prej 7.00 € për 30 ditë shtesë.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Përgjegjësia e Përmbajtjes</h2>
            <p>
              Përdoruesi mban përgjegjësi të plotë ligjore dhe morale për saktësinë e të dhënave, pronësinë juridike, çmimin dhe vërtetësinë e fotografive të publikuara. PronaX rezervon të drejtën të pezullojë ose fshijë shpalljet që shkelin ligjin, përmbajnë fotografi mashtruese ose synojnë dezinformimin e tregut.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Ligji i Zbatueshëm & Juridiksioni</h2>
            <p>
              Këto Kushte rregullohen dhe interpretohen në përputhje me legjislacionin në fuqi të <strong>Republikës së Kosovës</strong>. Çdo mosmarrëveshje që rrjedh nga përdorimi i kësaj faqeje i nënshtrohet juridiksionit të gjykatave kompetente në Kosovë.
            </p>
          </section>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <strong>Vërejtje juridike:</strong> PronaX nuk është agjenci ndërmjetësimi pronash dhe nuk mban përgjegjësi për transaksionet financiare të shitblerjes apo kontratat e qirasë të lidhura jashtë platformës ndërmjet palëve.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
