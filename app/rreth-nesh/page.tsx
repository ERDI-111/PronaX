import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Building2, ShieldCheck, MapPin, Target, Users, Award } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Rreth Nesh | PronaX Kosovë',
  description: 'Mësoni më shumë rreth misionit të PronaX në transformimin e tregut të patundshmërive në Republikën e Kosovës.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Rreth PronaX
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0B192C] tracking-tight">
            Prona që kërkon. Shtëpia që meriton.
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            PronaX është platforma moderne dhe e besueshme e pasurive të paluajtshme, e krijuar posaçërisht për të mbuluar të gjithë territorin e Republikës së Kosovës.
          </p>
        </div>

        {/* Story & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#0B192C]">Misioni Ynë</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Misioni ynë është të ofrojmë një përvojë të thjeshtë, transparente dhe profesionale për këdo që dëshiron të blejë, shesë apo marrë me qira pronë në Kosovë. Ne eliminojmë kaosin e njoftimeve të rreme përmes një procesi të strukturuar të moderimit dhe verifikimit.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#1E3E62] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#0B192C]">Transparencë dhe Siguri</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Modeli ynë i qartë me <strong>3 plane transparente (Falas 3 ditë, Javor 2.99 €, Mujor 9.99 €)</strong> garanton që çdo shpallje është aktive, e freskët dhe e vlefshme. Në PronaX nuk ka abonime të fshehura apo ripërtëritje automatike që ngarkojnë kartelën e përdoruesit.
            </p>
          </div>
        </div>

        {/* Coverage in 38 Municipalities */}
        <div className="bg-[#0B192C] text-white rounded-3xl p-8 sm:p-12 shadow-xl mb-14 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Shtrirje në të Gjithë Kosovën
            </span>
            <h3 className="text-2xl font-black">
              Mbulim në të 38 Komunat e Republikës
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Nga Prishtina, Prizreni, Peja, Gjakova, Ferizaj e Gjilani, e deri te çdo fshat e vendbanim rural – PronaX ofron kërkim të saktë gjeografik me harta interaktive.
            </p>
          </div>
          <div className="text-center sm:text-right flex-shrink-0">
            <span className="text-5xl font-black text-emerald-400 block">38</span>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Komuna të Plota</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
