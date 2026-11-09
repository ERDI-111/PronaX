'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Heart, Trash2, ArrowRight, Building2, MapPin } from 'lucide-react';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([
    {
      id: 'prop-ks-103',
      title: 'Lokal afarist modern në qendër të Pejës',
      price: 750,
      currency: 'EUR',
      property_type: 'Lokal afarist',
      municipality_id: 'Pejë',
      settlement_id: 'Qendër',
      area_m2: 110,
      cover_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'prop-ks-104',
      title: 'Vilë luksoze me pamje malore në Brezovicë',
      price: 240000,
      currency: 'EUR',
      property_type: 'Vilë',
      municipality_id: 'Shtërpcë',
      settlement_id: 'Brezovicë',
      area_m2: 260,
      cover_image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    },
  ]);

  const removeFavorite = (id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
              <span>Paneli i Përdoruesit</span>
              <span>/</span>
              <span>Favoritet</span>
            </div>
            <h1 className="text-3xl font-black text-[#0B192C] tracking-tight">
              Pronat e Mia të Preferuara ({favorites.length})
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Lista e pronave të ruajtura për krahasim dhe ndjekje të shpejtë.
            </p>
          </div>

          <Link
            href="/prona"
            className="px-4 py-2.5 rounded-xl bg-[#0B192C] hover:bg-[#1E3E62] text-white text-xs font-bold transition-colors self-start sm:self-auto"
          >
            Eksploro Prona të Tjera
          </Link>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-3">
            <Heart className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Nuk keni asnjë pronë të ruajtur</h3>
            <p className="text-xs text-slate-500">Klikoni ikonën e zemrës në çdo pronë për ta ruajtur këtu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-video bg-slate-100">
                  <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeFavorite(p.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-red-600 hover:bg-white shadow"
                    title="Hiq nga favoritet"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className="absolute bottom-3 right-3 bg-slate-900/80 text-white font-black text-sm px-2.5 py-1 rounded-lg">
                    {p.price.toLocaleString()} €
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{p.settlement_id}, {p.municipality_id}</span>
                  </div>
                  <h3 className="font-bold text-sm text-[#0B192C] line-clamp-1">{p.title}</h3>
                  <div className="pt-2 text-xs text-slate-500 flex justify-between items-center border-t border-slate-100">
                    <span>{p.area_m2} m² • {p.property_type}</span>
                    <Link
                      href={`/prona/${p.id}`}
                      className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <span>Shiko</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
