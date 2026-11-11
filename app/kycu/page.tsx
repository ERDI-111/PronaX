'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard/pronat';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // Try Supabase auth
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        // Map Supabase error codes to Albanian messages
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Email ose fjalëkalimi janë të gabuar. Provoni përsëri.');
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMessage('Ju lutem konfirmoni email-in tuaj para kyçjes.');
        } else if (error.message.includes('Too many requests')) {
          setErrorMessage('Shumë tentativa. Prisni pak minuta dhe provoni përsëri.');
        } else {
          setErrorMessage(error.message);
        }
        setLoading(false);
        return;
      }

      // Success → redirect
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      // Supabase not configured: demo mode
      console.warn('Supabase not configured, using demo mode');
      setTimeout(() => {
        setLoading(false);
        router.push(redirectTo);
      }, 800);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Kyçu në PronaX</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Mirë se vini përsëri! Menaxhoni shpalljet dhe mesazhet tuaja.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {errorMessage}
          </div>
        )}

        {/* Admin hint */}
        <div className="mb-5 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-xs">
          <strong>Administratori:</strong> <code>pronaxestate@outlook.com</code> → <Link href="/admin/dashboard" className="underline font-bold">Paneli Admin</Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Adresa Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="shembull@pronax-ks.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-600 transition-colors dark:text-white dark:placeholder-slate-400"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Fjalëkalimi</label>
              <Link href="/fjalekalimi-harruar" className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium">
                Keni harruar fjalëkalimin?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-600 transition-colors dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#0B192C] hover:bg-[#162436] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Duke u kyçur...' : 'Kyçu në Llogari'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 text-center text-xs text-slate-600 dark:text-slate-400">
          <span>Nuk keni ende llogari? </span>
          <Link href="/regjistrohu" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
            Regjistrohuni falas
          </Link>
        </div>
      </div>

      <div className="mt-6 text-center flex items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Të dhëna të enkriptuara me standardet më të larta të sigurisë</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Suspense fallback={
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        }>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
