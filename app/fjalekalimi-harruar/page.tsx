'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            {sent ? (
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-2">Email u dërgua!</h2>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  Nëse adresa <strong className="text-slate-800">{email}</strong> ekziston në sistemin tonë, do të merrni udhëzimet për rivendosjen e fjalëkalimit brenda disa minutash. Kontrolloni edhe dosjen Spam.
                </p>
                <Link
                  href="/kycu"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kthehu te kyçja</span>
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-7">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-amber-600" />
                  </div>
                  <h1 className="text-2xl font-black text-slate-900">Keni harruar fjalëkalimin?</h1>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Shkruani adresën tuaj email dhe do t'ju dërgojmë instruksionet për rivendosjen e fjalëkalimit.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Adresa Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="adresa@shembull.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <span>{loading ? 'Duke dërguar...' : 'Dërgo Udhëzimet'}</span>
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>

                <div className="mt-5 pt-5 border-t border-slate-100 text-center">
                  <Link href="/kycu" className="text-xs text-slate-500 hover:text-emerald-700 flex items-center justify-center gap-1.5 font-medium">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kthehu te faqja e kyçjes</span>
                  </Link>
                </div>
              </>
            )}
          </div>
          <div className="mt-5 text-center flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Linku i rivendosjes skadon pas 1 ore dhe mund të përdoret vetëm një herë</span>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
