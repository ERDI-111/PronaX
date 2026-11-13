'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Eye, 
  Sparkles,
  Inbox
} from 'lucide-react';
import { EmailTemplateType } from '@/lib/email/types';

const templatesList: { type: EmailTemplateType; label: string; desc: string }[] = [
  { type: 'payment_success', label: 'Pagesë e Suksesshme', desc: 'Dëshmi fature dhe konfirmim i periudhës së planit' },
  { type: 'expiring_3d', label: 'Skadon pas 3 Ditësh (Paralajmërim)', desc: 'Njoftim me link për rinovim para se të ndërpritet' },
  { type: 'expiring_1d', label: 'Skadon Nesër (Urgjente 24 orë)', desc: 'Alarm i kuq para se prona të bëhet e padukshme' },
  { type: 'expired', label: 'Prona ka Skaduar (Riaktivizim)', desc: 'Njoftim heqjeje nga kërkimi me buton riaktivizimi' },
  { type: 'renewed', label: 'Prona u Rinovua me Sukses', desc: 'Konfirmim i ditëve të reja të shtuara' },
  { type: 'listing_published', label: 'Prona u Publikua (Aktive)', desc: 'Njoftim se prona u aprovua dhe është publike' },
  { type: 'listing_rejected', label: 'Prona u Refuzua (Moderim)', desc: 'Njoftim me arsyet e moderimit dhe udhëzimet e korrigjimit' },
  { type: 'welcome', label: 'Mirëseardhje në PronaX', desc: 'Email mirëseardhjeje pas regjistrimit të llogarisë' },
  { type: 'email_verification', label: 'Kodi 6-Shifror i Verifikimit', desc: 'Kodi i sigurisë 2FA me skadim 5 minuta' },
  { type: 'password_reset', label: 'Rivendosja e Fjalëkalimit', desc: 'Udhëzime të sigurta për ndryshimin e fjalëkalimit' },
  { type: 'new_message', label: 'Mesazh i Ri nga Blerësi', desc: 'Njoftim për pyetje ose kërkesë vizite nga blerësi' },
  { type: 'saved_search_match', label: 'Pronë e Re (Kërkim i Ruajtur)', desc: 'Njoftim kur listohet një pronë sipas filtrave të ruajtur' },
];

export default function EmailPreviewPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateType>('payment_success');
  const [preview, setPreview] = useState<{ subject: string; html: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendFeedback, setSendFeedback] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState('pronaxestate@outlook.com');

  const fetchPreview = async (tmpl: EmailTemplateType) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/emails?template=${tmpl}`);
      const data = await res.json();
      if (data.success) {
        setPreview(data.preview);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreview(selectedTemplate);
  }, [selectedTemplate]);

  const handleSendTest = async () => {
    setSending(true);
    setSendFeedback(null);
    try {
      const res = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateType: selectedTemplate, to: testEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setSendFeedback(`✓ Email-i u dërgua me sukses (Statusi: ${data.result.simulated ? 'Simuluar në Log' : 'Dërguar me Resend'}).`);
      } else {
        setSendFeedback(`Gabim: ${data.error}`);
      }
    } catch (err: any) {
      setSendFeedback(`Gabim: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
              <Mail className="w-4 h-4" />
              <span>Qendra e Njoftimeve me Email • Resend Engine</span>
            </div>
            <h1 className="text-3xl font-black text-[#0B192C] tracking-tight">
              Qendra e Shabloneve të Emaileve</h1>
            <p className="text-sm text-slate-600 mt-1">
              Shiko dhe testo 12 shabllonet e plota të transaksioneve, skadimit 30-ditor dhe mirëseardhjes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Template Selection */}
          <div className="lg:col-span-4 space-y-2">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
              Zgjidh Shabllonin ({templatesList.length})
            </h3>
            <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1">
              {templatesList.map((tmpl) => (
                <button
                  key={tmpl.type}
                  onClick={() => setSelectedTemplate(tmpl.type)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs ${
                    selectedTemplate === tmpl.type
                      ? 'bg-[#0B192C] text-white border-[#0B192C] shadow-md'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <div className="font-bold">{tmpl.label}</div>
                  <div className={`text-[11px] mt-0.5 line-clamp-1 ${
                    selectedTemplate === tmpl.type ? 'text-slate-300' : 'text-slate-500'
                  }`}>
                    {tmpl.desc}
                  </div>
                </button>
              ))}
            </div>

            {/* Test Send Card */}
            <div className="mt-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <span className="font-bold text-xs text-[#0B192C] block">Dërgo Provë me Email</span>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="pronaxestate@outlook.com"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleSendTest}
                disabled={sending}
                className="w-full py-2.5 px-3 rounded-lg font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {sending ? 'Duke dërguar...' : 'Dërgo Email Test'}
              </button>
              {sendFeedback && (
                <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  {sendFeedback}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Iframe HTML Preview */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">Subjekti i Email-it:</span>
                <span className="text-sm font-bold text-slate-900">
                  {preview?.subject || 'Duke ngarkuar...'}
                </span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                HTML Responsive
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[600px] flex flex-col">
              {loading ? (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
                  Duke gjeneruar pamjen paraprake...
                </div>
              ) : preview ? (
                <iframe
                  title="Email Preview"
                  srcDoc={preview.html}
                  className="w-full flex-1 border-0"
                />
              ) : null}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
