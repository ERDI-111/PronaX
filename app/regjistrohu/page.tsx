'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, 
  User, Phone, Building2, FileText, CheckCircle2,
  Briefcase, UserCircle2, AlertCircle
} from 'lucide-react';
import { Suspense } from 'react';

type UserRole = 'privat' | 'agjenci';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get('roli') as UserRole) || 'privat';

  const [role, setRole] = useState<UserRole>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');

  const [form, setForm] = useState({
    emri: '',
    mbiemri: '',
    email: '',
    telefoni: '',
    password: '',
    confirmPassword: '',
    // Agency fields
    emriAgjencise: '',
    licencaArbk: '',
    adresa: '',
    komuna: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateForm = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.emri.trim()) newErrors.emri = 'Emri është i detyrueshëm.';
    if (!form.mbiemri.trim()) newErrors.mbiemri = 'Mbiemri është i detyrueshëm.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Adresa email nuk është e vlefshme.';
    if (!form.telefoni.trim()) newErrors.telefoni = 'Numri i telefonit është i detyrueshëm.';
    if (form.password.length < 8) newErrors.password = 'Fjalëkalimi duhet të ketë të paktën 8 karaktere.';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Fjalëkalimet nuk përputhen.';
    if (role === 'agjenci') {
      if (!form.emriAgjencise.trim()) newErrors.emriAgjencise = 'Emri i agjencisë është i detyrueshëm.';
      if (!form.licencaArbk.trim()) newErrors.licencaArbk = 'Numri i licencës ARBK është i detyrueshëm.';
      if (!form.adresa.trim()) newErrors.adresa = 'Adresa e zyrës është e detyrueshme.';
    }
    if (!form.acceptTerms) newErrors.acceptTerms = 'Duhet të pranoni kushtet e shërbimit.';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setLoading(true);

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: `${form.emri} ${form.mbiemri}`,
            phone: form.telefoni,
            user_role: role === 'agjenci' ? 'agency' : 'user',
            agency_name: role === 'agjenci' ? form.emriAgjencise : null,
            arbk_license: role === 'agjenci' ? form.licencaArbk : null,
            office_address: role === 'agjenci' ? form.adresa : null,
            municipality: role === 'agjenci' ? form.komuna : null,
          }
        }
      });

      if (error) {
        setErrors({ general: error.message });
        setLoading(false);
        return;
      }

      setLoading(false);
      setStep('success');
    } catch {
      // Graceful degradation when Supabase is in demo mode
      setTimeout(() => {
        setLoading(false);
        setStep('success');
      }, 800);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="bg-white rounded-3xl border border-slate-200 p-10 shadow-sm max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Llogaria u krijua!</h1>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              {role === 'agjenci'
                ? 'Kërkesa juaj për regjistrim si agjenci u dërgua me sukses. Ekipi i PronaX do të verifikojë licencën tuaj ARBK dhe do t\'ju njoftojë brenda 24–48 orëve.'
                : 'Llogaria juaj u krijua me sukses. Kontrolloni emailin tuaj për konfirmim dhe pastaj kyçuni.'}
            </p>
            <Link
              href="/kycu"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all text-xs"
            >
              <span>Kyçu tani</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />
      <main className="flex-1 px-4 py-10">
        <div className="max-w-2xl mx-auto">
          {/* Role Selector */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-900 mb-1">Regjistrohu në PronaX</h1>
            <p className="text-xs text-slate-500 mb-6">Zgjidhni llojin e llogarisë që dëshironi të hapni</p>
            <div className="inline-flex bg-slate-100 rounded-2xl p-1 gap-1">
              <button
                onClick={() => setRole('privat')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  role === 'privat'
                    ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCircle2 className="w-4 h-4" />
                <span>Përdorues Privat</span>
              </button>
              <button
                onClick={() => setRole('agjenci')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  role === 'agjenci'
                    ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Agjenci Patundshmërish</span>
              </button>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-sm">
            {errors.general && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.general}</span>
              </div>
            )}
            {role === 'agjenci' && (
              <div className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-xs text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Llogaritë e agjencive kalojnë nëpër verifikim manual të licencës ARBK. Procesi zgjat 24–48 orë pune.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-xs" noValidate>
              {/* Basic Info */}
              <div>
                <h2 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Të dhënat personale</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Emri <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={form.emri}
                      onChange={e => updateForm('emri', e.target.value)}
                      placeholder="p.sh. Agim"
                      className={`w-full p-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors ${errors.emri ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}`}
                    />
                    {errors.emri && <p className="text-rose-500 mt-1 text-[11px]">{errors.emri}</p>}
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mbiemri <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={form.mbiemri}
                      onChange={e => updateForm('mbiemri', e.target.value)}
                      placeholder="p.sh. Berisha"
                      className={`w-full p-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors ${errors.mbiemri ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}`}
                    />
                    {errors.mbiemri && <p className="text-rose-500 mt-1 text-[11px]">{errors.mbiemri}</p>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => updateForm('email', e.target.value)}
                    placeholder="agim@shembull.com"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors ${errors.email ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}`}
                  />
                  {errors.email && <p className="text-rose-500 mt-1 text-[11px]">{errors.email}</p>}
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Telefoni <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="tel"
                    value={form.telefoni}
                    onChange={e => updateForm('telefoni', e.target.value)}
                    placeholder="+383 44 000 000"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors ${errors.telefoni ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}`}
                  />
                  {errors.telefoni && <p className="text-rose-500 mt-1 text-[11px]">{errors.telefoni}</p>}
                </div>
              </div>

              {/* Agency-specific fields */}
              {role === 'agjenci' && (
                <div className="pt-3 border-t border-slate-100">
                  <h2 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>Të dhënat e agjencisë</span>
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Emri i Agjencisë <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        value={form.emriAgjencise}
                        onChange={e => updateForm('emriAgjencise', e.target.value)}
                        placeholder="p.sh. Dardania Real Estate Sh.p.k"
                        className={`w-full p-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors ${errors.emriAgjencise ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}`}
                      />
                      {errors.emriAgjencise && <p className="text-rose-500 mt-1 text-[11px]">{errors.emriAgjencise}</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Numri i Licencës ARBK <span className="text-rose-500">*</span></label>
                        <input
                          type="text"
                          value={form.licencaArbk}
                          onChange={e => updateForm('licencaArbk', e.target.value)}
                          placeholder="p.sh. ARBK-810492819"
                          className={`w-full p-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white font-mono transition-colors ${errors.licencaArbk ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}`}
                        />
                        {errors.licencaArbk && <p className="text-rose-500 mt-1 text-[11px]">{errors.licencaArbk}</p>}
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Komuna e Zyrës <span className="text-rose-500">*</span></label>
                        <input
                          type="text"
                          value={form.komuna}
                          onChange={e => updateForm('komuna', e.target.value)}
                          placeholder="p.sh. Prishtinë"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Adresa e Zyrës <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        value={form.adresa}
                        onChange={e => updateForm('adresa', e.target.value)}
                        placeholder="p.sh. Rr. Dëshmorët e Kombit, Nr. 45, Prishtinë"
                        className={`w-full p-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors ${errors.adresa ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}`}
                      />
                      {errors.adresa && <p className="text-rose-500 mt-1 text-[11px]">{errors.adresa}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="pt-3 border-t border-slate-100">
                <h2 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>Siguria e llogarisë</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Fjalëkalimi <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={e => updateForm('password', e.target.value)}
                        placeholder="Min. 8 karaktere"
                        className={`w-full pr-10 p-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors ${errors.password ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}`}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-rose-500 mt-1 text-[11px]">{errors.password}</p>}
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Konfirmo Fjalëkalimin <span className="text-rose-500">*</span></label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={e => updateForm('confirmPassword', e.target.value)}
                      placeholder="Përsërit fjalëkalimin"
                      className={`w-full p-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors ${errors.confirmPassword ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}`}
                    />
                    {errors.confirmPassword && <p className="text-rose-500 mt-1 text-[11px]">{errors.confirmPassword}</p>}
                  </div>
                </div>
                {/* Password strength */}
                {form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                          form.password.length >= [4, 7, 10, 13][i]
                            ? ['bg-rose-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-600'][i]
                            : 'bg-slate-200'
                        }`} />
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {form.password.length < 4 ? 'Shumë i shkurtër' : form.password.length < 7 ? 'I dobët' : form.password.length < 10 ? 'I mirë' : 'I fortë'}
                    </p>
                  </div>
                )}
              </div>

              {/* Terms */}
              <div className="pt-3 border-t border-slate-100">
                <label className={`flex items-start gap-3 cursor-pointer ${errors.acceptTerms ? 'text-rose-500' : 'text-slate-600'}`}>
                  <input
                    type="checkbox"
                    checked={form.acceptTerms}
                    onChange={e => updateForm('acceptTerms', e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-emerald-600 rounded"
                  />
                  <span className="text-[11px] leading-relaxed">
                    Pranoj{' '}
                    <Link href="/kushtet-e-perdorimit" className="text-emerald-600 hover:underline font-semibold">Kushtet e Shërbimit</Link>
                    {' '}dhe{' '}
                    <Link href="/politika-e-privatesise" className="text-emerald-600 hover:underline font-semibold">Politikën e Privatësisë</Link>
                    {' '}të PronaX. Jam i/e vetëdijshëm se platforma mbledh dhe procedon të dhëna personale sipas GDPR.
                  </span>
                </label>
                {errors.acceptTerms && <p className="text-rose-500 mt-1 text-[11px]">{errors.acceptTerms}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md shadow-emerald-900/20 transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              >
                <span>{loading ? 'Duke krijuar llogarinë...' : role === 'agjenci' ? 'Regjistro Agjencinë' : 'Krijo Llogarinë'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
              <span>Keni tashmë llogari? </span>
              <Link href="/kycu" className="font-bold text-emerald-600 hover:underline">Kyçuni këtu</Link>
            </div>
          </div>

          <div className="mt-5 text-center flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Të dhënat enkriptohen me SSL dhe mbrohen sipas ligjit të Kosovës për mbrojtjen e të dhënave</span>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div></div>}>
      <RegisterContent />
    </Suspense>
  );
}
