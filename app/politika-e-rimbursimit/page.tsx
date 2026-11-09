import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Politika e Rimbursimit | PronaX Kosovë',
  description: 'Kushtet dhe procedurat e rimbursimit të pagesave në platformën PronaX.',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-6 text-sm text-slate-600 leading-relaxed">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Kthimi i Mjeteve</span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B192C] mt-1">Politika e Rimbursimit</h1>
            <p className="text-xs text-slate-400 mt-1">pronax-ks.com • Shërbimi Financiar</p>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Parimet e Përgjithshme të Rimbursimit</h2>
            <p>
              Duke qenë se shërbimi i publikimit në PronaX ofron qasje dhe shpërndarje të menjëhershme digjitale sapo prona të aktivizohet, pagesat për pronat e publikuara me sukses përgjithësisht nuk janë të rimbursueshme pas aktivizimit publik.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Rastet kur Pranohet Rimbursimi</h2>
            <p>Rimbursimi i plotë prej 7.00 € aprovohet menjëherë në rastet vijuese:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li><strong>Pagesë e dyfishtë e paqëllimshme:</strong> Kur për shkak të ndonjë vonese rrjeti kartela është tarifuar dy herë për të njëjtën pronë.</li>
              <li><strong>Refuzim përfundimtar nga moderimi:</strong> Nëse prona refuzohet nga stafi administrativ dhe përdoruesi zgjedh të mos e ri-dorëzojë me fotografi apo të dhëna të korrigjuara.</li>
              <li><strong>Gabim teknik i platformës:</strong> Nëse prona nuk shfaqet për shkak të ndonjë defekti teknik të papritur të serverit.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Si të Kërkoni Rimbursim</h2>
            <p>
              Për të kërkuar rimbursim, dërgoni email te <a href="mailto:pronaxestate@gmail.com" className="font-bold text-emerald-600 underline">pronaxestate@gmail.com</a> duke bashkëngjitur:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>Referencën e transaksionit (ID e pagesës nga dëshmia digjitale).</li>
              <li>Titullin dhe ID e pronës.</li>
              <li>Arsyen e kërkesës së rimbursimit.</li>
            </ul>
            <p className="text-xs text-slate-500 mt-2">
              Pas miratimit nga administratori, fondet kthehen në të njëjtën kartelë bankare brenda 3 deri në 7 ditë pune, varësisht nga banka juaj emituese në Kosovë.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
