'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCompare } from '@/lib/compare/CompareContext';
import { 
  Scale, 
  Trash2, 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Check, 
  X, 
  ExternalLink,
  Plus
} from 'lucide-react';

function CompareContent() {
  const { items, removeFromCompare, clearCompare } = useCompare();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-400">
          <Scale className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
          Nuk keni asnjë pronë në krahasim
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
          Eksploroni katalogun e pronave dhe shtoni deri në 4 prona për t&apos;i krahasuar krah për krah sipas çmimit, sipërfaqes dhe veçorive.
        </p>
        <Link
          href="/prona"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg transition-all text-sm"
        >
          <Building2 className="w-4 h-4" />
          <span>Eksploro Pronat</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
            <Scale className="w-4 h-4" />
            <span>Vegla e Krahasimit Krah për Krah</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Krahasimi i Pronave ({items.length}/4)
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/prona"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Shto Pronë Tjetër
          </Link>
          <button
            onClick={clearCompare}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold hover:bg-rose-100 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Pastro Të Gjitha
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700">
              <th className="p-4 w-48 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Prona
              </th>
              {items.map((prop) => (
                <th key={prop.id} className="p-4 min-w-[240px] max-w-[280px] align-top">
                  <div className="relative rounded-2xl overflow-hidden mb-3 aspect-video">
                    <img
                      src={prop.cover_image}
                      alt={prop.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFromCompare(prop.id)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-lg transition-colors"
                      title="Hiq nga krahasimi"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                      {prop.listing_type === 'shitje' ? 'Shitje' : 'Qira'}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 mb-1">
                    {prop.title}
                  </h3>
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mb-2">
                    {prop.price.toLocaleString()} €
                  </div>
                  <Link
                    href={`/prona/${prop.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0B192C] dark:text-slate-200 hover:text-emerald-600 transition-colors"
                  >
                    Shiko Detajet <ExternalLink className="w-3 h-3" />
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
            {/* Lloji i Pronës */}
            <tr>
              <td className="p-4 bg-slate-50 dark:bg-slate-800/50 font-bold text-slate-500">Lloji i Pronës</td>
              {items.map((prop) => (
                <td key={prop.id} className="p-4 font-semibold">{prop.property_type}</td>
              ))}
            </tr>

            {/* Komuna / Vendbanimi */}
            <tr>
              <td className="p-4 bg-slate-50 dark:bg-slate-800/50 font-bold text-slate-500">Vendndodhja</td>
              {items.map((prop) => (
                <td key={prop.id} className="p-4">
                  <div className="flex items-center gap-1 text-slate-900 dark:text-white font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{prop.municipality_name}</span>
                  </div>
                  {prop.settlement_name && (
                    <div className="text-[11px] text-slate-400 pl-4.5">{prop.settlement_name}</div>
                  )}
                </td>
              ))}
            </tr>

            {/* Sipërfaqja */}
            <tr>
              <td className="p-4 bg-slate-50 dark:bg-slate-800/50 font-bold text-slate-500">Sipërfaqja</td>
              {items.map((prop) => (
                <td key={prop.id} className="p-4 font-black text-slate-900 dark:text-white">
                  {prop.area_m2} m²
                  <span className="block text-[11px] text-slate-400 font-normal">
                    ≈ {Math.round(prop.price / prop.area_m2).toLocaleString()} €/m²
                  </span>
                </td>
              ))}
            </tr>

            {/* Dhomat e Gjumit */}
            <tr>
              <td className="p-4 bg-slate-50 dark:bg-slate-800/50 font-bold text-slate-500">Dhoma Gjumi</td>
              {items.map((prop) => (
                <td key={prop.id} className="p-4">{prop.bedrooms ?? '—'}</td>
              ))}
            </tr>

            {/* Banja */}
            <tr>
              <td className="p-4 bg-slate-50 dark:bg-slate-800/50 font-bold text-slate-500">Banja</td>
              {items.map((prop) => (
                <td key={prop.id} className="p-4">{prop.bathrooms ?? '—'}</td>
              ))}
            </tr>

            {/* Kati */}
            <tr>
              <td className="p-4 bg-slate-50 dark:bg-slate-800/50 font-bold text-slate-500">Kati</td>
              {items.map((prop) => (
                <td key={prop.id} className="p-4">{prop.floor != null ? (prop.floor === 0 ? 'Përdhes' : prop.floor) : '—'}</td>
              ))}
            </tr>

            {/* Mobilimi */}
            <tr>
              <td className="p-4 bg-slate-50 dark:bg-slate-800/50 font-bold text-slate-500">Mobilimi</td>
              {items.map((prop) => (
                <td key={prop.id} className="p-4 capitalize">{prop.furnished ?? '—'}</td>
              ))}
            </tr>

            {/* Ngrohja */}
            <tr>
              <td className="p-4 bg-slate-50 dark:bg-slate-800/50 font-bold text-slate-500">Ngrohja</td>
              {items.map((prop) => (
                <td key={prop.id} className="p-4">{prop.heating_type ?? '—'}</td>
              ))}
            </tr>

            {/* Ballkon */}
            <tr>
              <td className="p-4 bg-slate-50 dark:bg-slate-800/50 font-bold text-slate-500">Ballkon</td>
              {items.map((prop) => (
                <td key={prop.id} className="p-4">
                  {prop.has_balcony ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold"><Check className="w-4 h-4" /> Po</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-400"><X className="w-4 h-4" /> Jo</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Parking */}
            <tr>
              <td className="p-4 bg-slate-50 dark:bg-slate-800/50 font-bold text-slate-500">Parking</td>
              {items.map((prop) => (
                <td key={prop.id} className="p-4">
                  {prop.has_parking ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold"><Check className="w-4 h-4" /> Po</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-400"><X className="w-4 h-4" /> Jo</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Ashensor */}
            <tr>
              <td className="p-4 bg-slate-50 dark:bg-slate-800/50 font-bold text-slate-500">Ashensor</td>
              {items.map((prop) => (
                <td key={prop.id} className="p-4">
                  {prop.has_elevator ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold"><Check className="w-4 h-4" /> Po</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-400"><X className="w-4 h-4" /> Jo</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="flex-1">
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <CompareContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
