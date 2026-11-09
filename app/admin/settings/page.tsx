'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Settings, 
  ShieldCheck, 
  Euro, 
  Clock, 
  CreditCard, 
  Mail, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Sliders,
  Server,
  Lock,
  RefreshCw
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [settings, setSettings] = useState({
    listing_fee_eur: '7.00',
    listing_duration_days: '30',
    moderation_mode: 'manual',
    payment_provider: 'sandbox',
    contact_email: 'pronaxestate@gmail.com',
    admin_notification_email: 'pronaxestate@gmail.com',
    max_images_per_listing: '30',
    max_image_size_mb: '10',
    maintenance_mode: 'false',
    featured_listing_addon_eur: '15.00',
  });

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMessage('Konfigurimet u ruajtën me sukses në sistem!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(data.error || 'Dështoi ruajtja e konfigurimeve.');
      }
    } catch {
      setErrorMessage('Gabim lidhjeje me serverin.');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, val: string) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Paneli i Administratorit — PronaX</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">
              Konfigurimet Globale të Platformës
            </h1>
          </div>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kthehu te Dashboard
          </Link>
        </div>

        {/* Feedback Alerts */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2 shadow-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Seksioni 1: Rregullat e Pagesës & Shpalljes */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-xs">
            <h2 className="text-base font-black text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Euro className="w-4.5 h-4.5 text-emerald-600" />
              <span>Tarifat dhe Cikli i Jetës së Shpalljes</span>
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Rregullat qendrore të modelit të biznesit të PronaX në Kosovë.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Tarifa Fikse e Publikimit (€)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={settings.listing_fee_eur}
                    onChange={(e) => updateSetting('listing_fee_eur', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute right-4 top-3.5 font-bold text-slate-400">EUR</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Tarifa fikse e njëhershme për çdo shpallje.</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Kohëzgjatja e Shpalljes (Ditë)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={settings.listing_duration_days}
                    onChange={(e) => updateSetting('listing_duration_days', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute right-4 top-3.5 font-bold text-slate-400">DITË</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Pas kësaj periudhe prona skadon automatikisht.</p>
              </div>
            </div>
          </div>

          {/* Seksioni 2: Moderimi & Siguria */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-xs">
            <h2 className="text-base font-black text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-blue-600" />
              <span>Mënyra e Moderimit dhe Siguria</span>
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Përcaktoni nëse shpalljet publikohen direkt apo kalojnë në filtrin administrativ.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Mënyra e Moderimit të Pronave
                </label>
                <select
                  value={settings.moderation_mode}
                  onChange={(e) => updateSetting('moderation_mode', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="manual">Manual (Kërkon miratim nga Administratori)</option>
                  <option value="auto">Automatik (Publikohet direkt pas pagesës së suksesshme)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">Rekomandohet &quot;Manual&quot; për parandalimin e spam-it.</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Ofruesi Aktiv i Pagesave
                </label>
                <select
                  value={settings.payment_provider}
                  onChange={(e) => updateSetting('payment_provider', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="sandbox">Sandbox Engine (Test pa rrezik financiar)</option>
                  <option value="paysera">Paysera Modern Checkout (Live)</option>
                  <option value="kosovo_pos">Virtual POS Bankat e Kosovës (ProCredit / NLB)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">Përzgjedhja e kanalit primar të pagesave me kartelë.</p>
              </div>
            </div>
          </div>

          {/* Seksioni 3: Kontaktet Zyrtare */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-xs">
            <h2 className="text-base font-black text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Mail className="w-4.5 h-4.5 text-amber-600" />
              <span>Adresat Zyrtare të Komunikimit</span>
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Adresat e email-it ku dërgohen njoftimet e sistemit dhe pyetjet e klientëve.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Email Publik i Kontaktit
                </label>
                <input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => updateSetting('contact_email', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Email i Administratorit (Njoftimet e Sistemit)
                </label>
                <input
                  type="email"
                  value={settings.admin_notification_email}
                  onChange={(e) => updateSetting('admin_notification_email', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-4 rounded-2xl shadow-lg transition-all text-xs disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Duke ruajtur...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Ruaj Konfigurimet e PronaX</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
