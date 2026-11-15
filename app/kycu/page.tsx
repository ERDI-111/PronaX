'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff,
  AlertCircle, KeyRound, CheckCircle2, RefreshCw, ArrowLeft, Clock
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard/pronat';

  // Step state: 'credentials' | 'verification'
  const [step, setStep] = useState<'credentials' | 'verification'>('credentials');

  // Form values
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 6-digit code inputs
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  // States & feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [simulatedNotice, setSimulatedNotice] = useState<string | null>(null);

  // Timers
  const [cooldown, setCooldown] = useState(0); // Cooldown for resend (60s)
  const [expirySeconds, setExpirySeconds] = useState(300); // 5 minutes expiration

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Expiry countdown effect
  useEffect(() => {
    if (step !== 'verification' || expirySeconds <= 0) return;
    const timer = setInterval(() => {
      setExpirySeconds((prev) => {
        if (prev <= 1) {
          setErrorMessage('Kodi ka skaduar. Ju lutem kërkoni një kod të ri.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step, expirySeconds]);

  // Focus first digit box when switching to verification step
  useEffect(() => {
    if (step === 'verification') {
      setTimeout(() => {
        digitRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Handle credentials submit (Step 1 -> Step 2)
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setSimulatedNotice(null);

    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, checkCredentials: true }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Dështoi dërgimi i kodit. Ju lutem provoni përsëri.');
        setLoading(false);
        return;
      }

      // Success -> move to Step 2
      setStep('verification');
      setCooldown(data.cooldownSeconds || 60);
      setExpirySeconds(300); // 5 minutes
      setRemainingAttempts(5);

      if (data.isSimulated && data.simulatedCode) {
        setSimulatedNotice(data.simulatedCode);
      }
    } catch {
      setErrorMessage('Ndodhi një gabim gjatë lidhjes. Ju lutem provoni përsëri.');
    } finally {
      setLoading(false);
    }
  };

  // Handle digit input change & auto-advance
  const handleDigitChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setErrorMessage('');

    if (char && index < 5) {
      digitRefs.current[index + 1]?.focus();
    }

    // Auto-verify if all 6 digits entered
    if (char && index === 5 && newDigits.every((d) => d !== '')) {
      handleVerifyCode(newDigits.join(''));
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
  };

  // Handle pasting full 6 digits
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setDigits(newDigits);

    const focusIdx = Math.min(pasted.length, 5);
    digitRefs.current[focusIdx]?.focus();

    if (pasted.length === 6) {
      handleVerifyCode(pasted);
    }
  };

  // Handle verify submission (Step 2)
  const handleVerifyCode = async (codeToVerify?: string) => {
    const code = codeToVerify || digits.join('');
    if (code.length !== 6) {
      setErrorMessage('Ju lutem plotësoni të 6 shifrat e kodit.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Kodi është i pasaktë.');
        if (typeof data.remainingAttempts === 'number') {
          setRemainingAttempts(data.remainingAttempts);
        }
        setLoading(false);
        return;
      }

      setSuccessMessage('Kodi u verifikua me sukses! Po kyçeni...');
      try {
        localStorage.setItem('pronax_user', JSON.stringify({ email: email.toLowerCase().trim() }));
      } catch {}

      // Admin auto-redirect
      const targetUrl =
        email.toLowerCase().trim() === 'pronaxestate@outlook.com' &&
        redirectTo === '/dashboard/pronat'
          ? '/admin/dashboard'
          : redirectTo;

      setTimeout(() => {
        router.push(targetUrl);
        router.refresh();
      }, 700);
    } catch {
      setErrorMessage('Ndodhi një gabim gjatë verifikimit. Provoni përsëri.');
      setLoading(false);
    }
  };

  // Handle Resend code
  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, checkCredentials: false }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Dështoi ridërgimi i kodit.');
        setLoading(false);
        return;
      }

      setCooldown(data.cooldownSeconds || 60);
      setExpirySeconds(300);
      setDigits(['', '', '', '', '', '']);
      setRemainingAttempts(5);
      setSuccessMessage('Kodi i ri u dërgua me sukses.');
      if (data.isSimulated && data.simulatedCode) {
        setSimulatedNotice(data.simulatedCode);
      }
      setTimeout(() => digitRefs.current[0]?.focus(), 100);
    } catch {
      setErrorMessage('Ndodhi një gabim gjatë ridërgimit.');
    } finally {
      setLoading(false);
    }
  };

  // Format mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
        {/* ================= STEP 1: CREDENTIALS ================= */}
        {step === 'credentials' ? (
          <>
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">Kyçu në PronaX</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Mirë se vini përsëri! Kyçje e sigurt me verifikim me dy hapa (2FA).
              </p>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Admin hint */}
            <div className="mb-5 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-xs">
              <strong>Administratori:</strong> <code>pronaxestate@outlook.com</code> →{' '}
              <Link href="/admin/dashboard" className="underline font-bold">
                Paneli Admin
              </Link>
            </div>

            {/* Google Sign-in Option */}
            <div className="mb-6">
              <Link
                href={`/api/auth/google?redirectTo=${encodeURIComponent(redirectTo)}`}
                className="w-full py-3 px-4 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600/80 text-slate-800 dark:text-white font-bold rounded-2xl shadow-xs transition-all text-xs flex items-center justify-center gap-3 group hover:border-slate-400"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Vazhdo me Google (1-Kliko, Pa Kod)</span>
              </Link>

              <div className="relative my-5 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <span className="relative bg-white dark:bg-slate-800 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  ose me email & fjalëkalim
                </span>
              </div>
            </div>

            <form onSubmit={handleCredentialsSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Adresa Email
                </label>
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
                  <Link
                    href="/fjalekalimi-harruar"
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium"
                  >
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
                <span>{loading ? 'Duke dërguar kodin...' : 'Vazhdo me Verifikim'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 text-center text-xs text-slate-600 dark:text-slate-400">
              <span>Nuk keni ende llogari? </span>
              <Link href="/regjistrohu" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                Regjistrohuni falas
              </Link>
            </div>
          </>
        ) : (
          /* ================= STEP 2: 6-DIGIT CODE VERIFICATION ================= */
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">Verifikimi me Kod</h1>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Kemi dërguar një kod 6-shifror në adresën:
              </p>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 font-mono">
                {email}
              </p>
            </div>

            {/* Simulated environment testing notice */}
            {simulatedNotice && (
              <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
                <Clock className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-bold">Mjedis Testimi (SMTP i pakonfiguruar në Render):</p>
                  <p className="mt-0.5 leading-relaxed">
                    Kodi juaj 2FA për testim është: <strong className="font-mono text-sm tracking-widest text-emerald-700 dark:text-emerald-400 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-lg">{simulatedNotice}</strong>
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p>{errorMessage}</p>
                  {remainingAttempts !== null && remainingAttempts > 0 && (
                    <p className="text-[11px] mt-1 font-semibold">
                      Keni edhe {remainingAttempts} {remainingAttempts === 1 ? 'tentativë' : 'tentativa'} para bllokimit.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* 6-Digit Inputs */}
            <div className="my-6">
              <label className="block text-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Shëno kodin 6-shifror
              </label>
              <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      digitRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-12 h-14 text-center text-2xl font-black font-mono bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-600 transition-all dark:text-white"
                  />
                ))}
              </div>
            </div>

            {/* Timers info */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-5 px-1">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  Skadon pas: <strong className="text-slate-700 dark:text-slate-200">{formatTimer(expirySeconds)}</strong>
                </span>
              </div>
              <div>
                {cooldown > 0 ? (
                  <span>
                    Ridërgimi pas: <strong>{cooldown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Ridërgo kodin</span>
                  </button>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={() => handleVerifyCode()}
              disabled={loading || digits.some((d) => !d) || expirySeconds <= 0}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Duke verifikuar...' : 'Konfirmo & Kyçu'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>

            {/* Change Email back button */}
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => {
                  setStep('credentials');
                  setDigits(['', '', '', '', '', '']);
                  setErrorMessage('');
                }}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Ndrysho adresën email</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-center flex items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Verifikim me dy hapa (2FA) me skadim 5-minutësh</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Suspense
          fallback={
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
