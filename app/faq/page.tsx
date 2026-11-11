'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

const faqs = [
  {
    q: 'Sa kushton publikimi i një prone në PronaX?',
    a: 'Publikimi i çdo prone kushton fiks 7.00 € (EUR). Kjo tarifë përfshin shfaqjen e plotë në ballinë, listat e kërkimit dhe hartën interaktive për saktësisht 30 ditë kalendarike.',
  },
  {
    q: 'A më tërhiqen para automatikisht nga kartela çdo muaj?',
    a: 'Jo, absolutisht jo! PronaX zbaton parimin e pagesës së njëhershme. Nuk ka abonime automatike dhe kartela juaj nuk ngarkohet kurrë pa veprimin tuaj të drejtpërdrejtë dhe manual.',
  },
  {
    q: 'Çfarë ndodh kur kalojnë 30 ditët e publikimit?',
    a: 'Në ditën e 30-të, prona kalon automatikisht në statusin e skaduar dhe largohet nga rezultatet publike të kërkimit. Megjithatë, të gjitha të dhënat, fotografitë dhe përshkrimi mbeten të ruajtura të sigurta në panelin tuaj.',
  },
  {
    q: 'Si funksionon rinovimi i pronës?',
    a: 'Rinovimi është i thjeshtë dhe tërësisht manual. Nga paneli juaj "Pronat e Mia", klikoni butonin "Rinovo pronën – 7 €". Pas kryerjes së pagesës së re prej 7.00 €, prona bëhet sërish publike për 30 ditë të tjera.',
  },
  {
    q: 'A do të pranoj njoftim para se të skadojë prona ime?',
    a: 'Po. Sistemi ynë ju dërgon njoftime automatike në email dhe në panel 3 ditë dhe 24 orë para përfundimit të afatit, në mënyrë që të vendosni nëse dëshironi ta rinovoni pa ndërprerje.',
  },
  {
    q: 'Cilat mënyra pagese mbështeten në PronaX?',
    a: 'Pranohen kartelat bankare Visa dhe Mastercard nga të gjitha bankat në Kosovë dhe ndërkombëtarisht, si dhe llogaritë Paysera me mbrojtje të plotë 3D-Secure 2.0.',
  },
  {
    q: 'A mund ta fsheh adresën time të saktë për arsye privatësie?',
    a: 'Po. Gjatë publikimit mund të zgjidhni të shfaqni vetëm vendndodhjen e përafërt (komunën dhe vendbanimin) pa zbuluar numrin ekzakt të ndërtesës apo hyrjes.',
  },
  {
    q: 'Si mund të raportoj një shpallje mashtruese apo me çmim jo real?',
    a: 'Çdo pronë ka butonin "Raporto pronën". Gjithashtu mund të na shkruani drejtpërdrejt në pronaxestate@outlook.com dhe ekipi ynë i moderimit do ta shqyrtojë rastin brenda pak orësh.',
  },
];

export default function FaqPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center justify-center gap-1">
            <HelpCircle className="w-4 h-4" />
            Pyetjet e Bëra më Shpesh
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0B192C] tracking-tight">
            Gjithçka që Duhet të Dini mbi PronaX
          </h1>
          <p className="text-sm text-slate-600">
            Gjeni përgjigje të qarta mbi tarifën 7.00 €, ciklin 30-ditor, mënyrat e pagesës dhe sigurinë.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm text-[#0B192C] hover:bg-slate-50/60 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-emerald-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/30">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
