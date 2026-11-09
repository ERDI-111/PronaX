'use client';

import React, { useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Users, 
  Calendar, 
  ArrowLeft, 
  Share2,
  ExternalLink,
  Euro,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { KOSOVO_AGENCIES } from '../page';

function AgencyProfileContent() {
  const params = useParams();
  const slug = (params?.slug as string) || 'dardania-real-estate';

  const agency = KOSOVO_AGENCIES.find(a => a.slug === slug) || KOSOVO_AGENCIES[0];

  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryText, setInquiryText] = useState('');

  // Sample listings for this agency
  const agencyListings = [
    {
      id: 'prop-ks-101',
      title: 'Banesë moderne në lagjen Marigona Hill',
      price: 135000,
      currency: 'EUR',
      type: 'shitje',
      category: 'Banesë',
      municipality: agency.municipality,
      settlement: 'Veternik',
      area_m2: 96,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'prop-ks-103',
      title: 'Lokal afarist modern në qendër',
      price: 750,
      currency: 'EUR',
      type: 'qira',
      category: 'Lokal afarist',
      municipality: agency.municipality,
      settlement: 'Qendër',
      area_m2: 110,
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryText.trim()) return;
    setInquirySent(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            href="/agjencite"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kthehu te Agjencitë</span>
          </Link>

          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert('Linku i agjencisë u kopjua me sukses!');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Shpërndaj</span>
          </button>
        </div>

        {/* Agency Header Banner Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                <img
                  src={agency.logo}
                  alt={agency.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                    {agency.name}
                  </h1>
                  {agency.verified && (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Agjenci e Verifikuar</span>
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mb-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{agency.address}</span>
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <span>Numri i Biznesit: <strong className="font-mono">{agency.arbk_license}</strong></span>
                  <span>Themeluar: <strong>{agency.founded_year}</strong></span>
                  <span>Agjentë: <strong>{agency.agents_count}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Contact Buttons */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto shrink-0">
              <a
                href={`https://wa.me/${agency.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md text-center transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Kontakto në WhatsApp</span>
              </a>

              <button
                onClick={() => setPhoneRevealed(true)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md text-center transition-all flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>{phoneRevealed ? agency.phone : 'Shfaq Numrin e Telefonit'}</span>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h3 className="font-bold text-slate-900 mb-2">Rreth Agjencisë</h3>
            <p>{agency.description}</p>
          </div>
        </div>

        {/* Two-Column Content: Listings & Direct Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Listings Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <span>Shpalljet e Agjencisë ({agency.active_listings})</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {agencyListings.map(listing => (
                <div
                  key={listing.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-video overflow-hidden bg-slate-100">
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#0B192C]/90 text-white backdrop-blur-xs">
                        {listing.type === 'shitje' ? 'Shitje' : 'Qira'}
                      </span>
                    </div>

                    <div className="p-4">
                      <div className="text-base font-black text-emerald-700 mb-1">
                        {listing.price.toLocaleString()} €
                        {listing.type === 'qira' && <span className="text-xs font-normal text-slate-500"> /muaj</span>}
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm mb-2 group-hover:text-emerald-700 transition-colors line-clamp-1">
                        {listing.title}
                      </h3>

                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{listing.settlement}, {listing.municipality}</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <Link
                      href={`/prona/${listing.id}`}
                      className="w-full block text-center py-2 bg-slate-50 hover:bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-slate-200 hover:border-emerald-200 transition-all"
                    >
                      Shiko Detajet
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Message Box */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs sticky top-24">
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Dërgo Kërkesë te Agjencia
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Kontaktoni drejtpërdrejt agjentët e {agency.name} për të diskutuar pronat apo bashkëpunimin.
              </p>

              {inquirySent ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center text-xs text-emerald-800">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="font-bold mb-1">Kërkesa u dërgua me sukses!</p>
                  <p className="text-emerald-700">Agjencia do t'ju kontaktojë së shpejti me email ose telefon.</p>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Emri & Mbiemri</label>
                    <input
                      type="text"
                      required
                      placeholder="p.sh. Agim Berisha"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Numri i Telefonit</label>
                    <input
                      type="tel"
                      required
                      placeholder="+383 44 000 000"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="agim@example.com"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Mesazhi juaj</label>
                    <textarea
                      rows={3}
                      required
                      value={inquiryText}
                      onChange={(e) => setInquiryText(e.target.value)}
                      placeholder="Jam i interesuar për pronat tuaja..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all text-xs"
                  >
                    Dërgo Mesazhin
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function AgencyProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    }>
      <AgencyProfileContent />
    </Suspense>
  );
}
