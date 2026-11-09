import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Mail, MapPin, Phone, MessageSquare, Clock, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kontakti | PronaX Kosovë',
  description: 'Na kontaktoni për pyetje, asistencë teknike ose bashkëpunim në pronaxestate@gmail.com.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Ndihmë & Mbështetje
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0B192C] tracking-tight">
            Kontaktoni Ekipin e PronaX
          </h1>
          <p className="text-sm text-slate-600">
            Jemi këtu për t'ju ndihmuar me publikimin e pronave, pagesat, bashkëpunimet me agjenci dhe çdo pyetje tjetër.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
              <h3 className="font-bold text-base text-[#0B192C]">Informacionet Zyrtare</h3>

              <div className="flex items-start gap-3.5 text-xs">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Email Administrativ:</span>
                  <a href="mailto:pronaxestate@gmail.com" className="text-emerald-600 font-semibold hover:underline">
                    pronaxestate@gmail.com
                  </a>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Përgjigje brenda 24 orëve</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 text-xs">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#1E3E62] flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Selia & Territori:</span>
                  <span className="text-slate-600">Prishtinë, Republika e Kosovës</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Mbulim në 38 komuna</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 text-xs">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Orari i Mbështetjes:</span>
                  <span className="text-slate-600">E Hënë – E Shtunë: 09:00 – 18:00</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-200/80 text-xs text-emerald-900 space-y-2">
              <span className="font-bold flex items-center gap-1.5 text-emerald-950">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Raportimi i Njoftimeve të Dyshimta
              </span>
              <p className="text-emerald-800 leading-relaxed text-[11px]">
                Nëse vëreni një shpallje të rreme, mashtrim apo të dhëna kontakti të pasakta, ju lutem shkruani menjëherë në <a href="mailto:pronaxestate@gmail.com" className="font-bold underline">pronaxestate@gmail.com</a> me ID e pronës.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-5">
              <h3 className="font-bold text-base text-[#0B192C]">Dërgoni një Mesazh të Drejtpërdrejtë</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Emri dhe Mbiemri *</label>
                  <input
                    type="text"
                    placeholder="psh. Valon Berisha"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Adresa *</label>
                  <input
                    type="email"
                    placeholder="email@shembull.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="font-bold text-slate-700 block mb-1">Numri i Telefonit (Opsional)</label>
                <input
                  type="tel"
                  placeholder="+383 44 123 456"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                />
              </div>

              <div className="text-xs">
                <label className="font-bold text-slate-700 block mb-1">Subjekti *</label>
                <input
                  type="text"
                  placeholder="psh. Pyetje rreth pagesës me kartelë"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                />
              </div>

              <div className="text-xs">
                <label className="font-bold text-slate-700 block mb-1">Mesazhi Juaj *</label>
                <textarea
                  rows={4}
                  placeholder="Shkruani pyetjen ose kërkesën tuaj këtu..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                />
              </div>

              <button
                type="button"
                className="w-full py-3.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-700/20"
              >
                Dërgo Mesazhin
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
