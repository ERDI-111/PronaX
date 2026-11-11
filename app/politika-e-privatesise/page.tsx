import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Politika e Privatësisë | PronaX Kosovë',
  description: 'Mbrojtja e të dhënave personale, politikat e privatësisë dhe e drejta për fshirje të të dhënave në PronaX.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-6 text-sm text-slate-600 leading-relaxed">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Mbrojtja e të Dhënave</span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B192C] mt-1">Politika e Privatësisë</h1>
            <p className="text-xs text-slate-400 mt-1">Në përputhje me Ligjin për Mbrojtjen e të Dhënave Personale në Kosovë</p>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Të Dhënat që Mbledhim</h2>
            <p>
              PronaX mbledh vetëm informacionet e nevojshme për funksionimin e shërbimit të shpalljeve:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li><strong>Të dhënat e regjistrimit:</strong> Emri, mbiemri, email adresa dhe numri i telefonit.</li>
              <li><strong>Të dhënat e pronës:</strong> Vendndodhja (komuna, vendbanimi, rruga), çmimi, specifikat teknike dhe fotografitë.</li>
              <li><strong>Të dhënat e pagesës:</strong> Referenca e transaksionit bankar dhe statusi. <em>Ne kurrë nuk ruajmë numra kartelash, CVV ose kode PIN.</em></li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Mbrojtja e Vendndodhjes Private</h2>
            <p>
              PronaX respekton privatësinë e pronarëve. Nëse dëshironi, mund të zgjidhni të shfaqni vetëm vendndodhjen e përafërt në hartë pa publikuar numrin e saktë të hyrjes apo katit.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. E Drejta për Fshirje të të Dhënave (Data Deletion)</h2>
            <p>
              Çdo përdorues ka të drejtë të kërkojë në çdo kohë fshirjen e llogarisë së tij dhe të gjitha të dhënave personale të lidhura.
            </p>
            <p className="text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              Për të kërkuar fshirjen e llogarisë apo të dhënave tuaja, dërgoni një email nga adresa e regjistruar te <a href="mailto:pronaxestate@outlook.com" className="font-bold text-emerald-600 underline">pronaxestate@outlook.com</a> me subjektin <em>"Kërkesë për Fshirje të Llogarisë"</em>. Kërkesa do të procesohet brenda 48 orëve.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Siguria e të Dhënave</h2>
            <p>
              Ne zbatojmë enkriptim 256-bit SSL për të gjithë trafikun e të dhënave, politika strikte të bazës së të dhënave (Row Level Security) dhe masa të forta kibernetike për parandalimin e qasjes së paautorizuar.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
