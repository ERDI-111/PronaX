'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  MapPin, 
  Euro, 
  Building2, 
  SlidersHorizontal, 
  X, 
  ArrowRight, 
  Sparkles,
  Layers,
  Search,
  ExternalLink
} from 'lucide-react';
import { KOSOVO_MUNICIPALITIES } from '@/lib/locations/kosovo-data';

interface MapProperty {
  id: string;
  title: string;
  price: number;
  type: string;
  category: string;
  municipality: string;
  settlement: string;
  lat: number;
  lng: number;
  area_m2: number;
  image: string;
  badge?: string;
}

const SAMPLE_MAP_PROPERTIES: MapProperty[] = [
  {
    id: 'prop-ks-101',
    title: 'Banesë moderne në lagjen Marigona Hill',
    price: 135000,
    type: 'shitje',
    category: 'Banesë',
    municipality: 'Prishtinë',
    settlement: 'Veternik',
    lat: 42.6350,
    lng: 21.1720,
    area_m2: 96,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    badge: 'Premium',
  },
  {
    id: 'prop-ks-102',
    title: 'Shtëpi komode me oborr të rregulluar',
    price: 185000,
    type: 'shitje',
    category: 'Shtëpi',
    municipality: 'Prizren',
    settlement: 'Ortakoll',
    lat: 42.2210,
    lng: 20.7380,
    area_m2: 220,
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'prop-ks-103',
    title: 'Lokal afarist modern në qendër të Pejës',
    price: 750,
    type: 'qira',
    category: 'Lokal afarist',
    municipality: 'Pejë',
    settlement: 'Qendër',
    lat: 42.6590,
    lng: 20.2920,
    area_m2: 110,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    badge: 'Qira Ditore/Mujore',
  },
  {
    id: 'prop-ks-104',
    title: 'Vilë luksoze me pamje malore në Brezovicë',
    price: 240000,
    type: 'shitje',
    category: 'Vilë',
    municipality: 'Shtërpcë',
    settlement: 'Brezovicë',
    lat: 42.2150,
    lng: 21.0020,
    area_m2: 260,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    badge: 'Pamje Panoramike',
  },
  {
    id: 'prop-ks-105',
    title: 'Truall për ndërtim në Zonën Industriale',
    price: 68000,
    type: 'shitje',
    category: 'Truall',
    municipality: 'Fushë Kosovë',
    settlement: 'Zona Industriale',
    lat: 42.6320,
    lng: 21.1150,
    area_m2: 1500,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
  },
];

export default function KosovoMapPage() {
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState('');
  const [activeProperty, setActiveProperty] = useState<MapProperty | null>(SAMPLE_MAP_PROPERTIES[0]);

  const filteredProperties = SAMPLE_MAP_PROPERTIES.filter(p => {
    if (selectedMunicipality && p.municipality !== selectedMunicipality) return false;
    if (selectedCategory && p.category !== selectedCategory) return false;
    if (selectedPurpose && p.type !== selectedPurpose) return false;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <Header />

      {/* Top Filter Bar */}
      <div className="bg-[#0B192C] border-b border-slate-800 py-3 px-4 sm:px-6 shadow-md z-20">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>Harta e Pronave në Kosovë</span>
            </span>
            <span className="text-slate-400">
              ({filteredProperties.length} prona aktive në hartë)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedPurpose}
              onChange={(e) => setSelectedPurpose(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none"
            >
              <option value="">Të gjitha (Shitje & Qira)</option>
              <option value="shitje">Në Shitje</option>
              <option value="qira">Me Qira</option>
            </select>

            <select
              value={selectedMunicipality}
              onChange={(e) => setSelectedMunicipality(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none"
            >
              <option value="">Të gjitha Komunat (38)</option>
              {KOSOVO_MUNICIPALITIES.map(m => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none"
            >
              <option value="">Lloji i Pronës</option>
              <option value="Banesë">Banesë</option>
              <option value="Shtëpi">Shtëpi</option>
              <option value="Vilë">Vilë</option>
              <option value="Truall">Truall</option>
              <option value="Lokal afarist">Lokal afarist</option>
            </select>

            {(selectedMunicipality || selectedCategory || selectedPurpose) && (
              <button
                onClick={() => {
                  setSelectedMunicipality('');
                  setSelectedCategory('');
                  setSelectedPurpose('');
                }}
                className="text-slate-400 hover:text-white px-2 py-1 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Pastro</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Map & Property Tray View */}
      <div className="flex-1 relative flex flex-col lg:flex-row h-[calc(100vh-140px)]">
        {/* Interactive Interactive View */}
        <div className="flex-1 relative bg-slate-950 overflow-hidden min-h-[400px]">
          {/* Stylized Vector Map Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-70"></div>

          {/* Kosovo Map Overlay Simulation */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl h-full max-h-[600px] border border-slate-800/80 rounded-3xl bg-gradient-to-b from-slate-900/60 to-slate-950/80 shadow-2xl overflow-hidden backdrop-blur-sm">
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/90 border border-slate-700/60 px-3 py-1.5 rounded-xl text-xs backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-300 font-medium">Republika e Kosovës (38 Komuna)</span>
              </div>

              {/* Pin markers */}
              {filteredProperties.map((prop, idx) => {
                const isSelected = activeProperty?.id === prop.id;
                // Relative positioning in mock coordinates grid
                const posStyles: Record<string, { top: string; left: string }> = {
                  'prop-ks-101': { top: '38%', left: '56%' }, // Prishtine
                  'prop-ks-102': { top: '72%', left: '40%' }, // Prizren
                  'prop-ks-103': { top: '48%', left: '22%' }, // Peje
                  'prop-ks-104': { top: '80%', left: '54%' }, // Brezovice
                  'prop-ks-105': { top: '42%', left: '50%' }, // Fushe Kosove
                };
                const style = posStyles[prop.id] || { top: `${30 + idx * 12}%`, left: `${30 + idx * 10}%` };

                return (
                  <div
                    key={prop.id}
                    style={style}
                    onClick={() => setActiveProperty(prop)}
                    className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group transition-all duration-300"
                  >
                    <div className={`px-2.5 py-1 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-xl transition-all ${
                      isSelected 
                        ? 'bg-emerald-500 text-slate-950 scale-110 ring-4 ring-emerald-400/30 shadow-emerald-500/50' 
                        : 'bg-slate-900 text-white border border-emerald-500/60 hover:bg-emerald-600 hover:text-white'
                    }`}>
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
                      <span>{prop.price.toLocaleString()} €</span>
                    </div>

                    <div className="text-[10px] text-slate-400 text-center font-medium mt-0.5 whitespace-nowrap bg-slate-950/70 px-1 rounded backdrop-blur-xs">
                      {prop.municipality}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map Controls */}
          <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
            <button
              onClick={() => alert('Koordinatat e sakta të GPS ngarkohen në pajisjet me shërbime lokacioni.')}
              className="bg-slate-800 hover:bg-slate-700 text-white p-2.5 rounded-xl border border-slate-700 shadow-lg text-xs flex items-center gap-2"
              title="Gjej lokacionin tim"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Lokacioni Im</span>
            </button>
          </div>
        </div>

        {/* Selected Property Preview Drawer */}
        <div className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 p-5 overflow-y-auto flex flex-col justify-between">
          {activeProperty ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
                  {activeProperty.type === 'shitje' ? 'Në Shitje' : 'Me Qira'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                  {activeProperty.category}
                </span>
              </div>

              <div className="relative rounded-2xl overflow-hidden mb-4 aspect-video bg-slate-800">
                <img
                  src={activeProperty.image}
                  alt={activeProperty.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-emerald-600 text-white text-base font-black px-3 py-1 rounded-xl shadow-lg">
                  {activeProperty.price.toLocaleString()} €
                  {activeProperty.type === 'qira' && <span className="text-xs font-normal"> /muaj</span>}
                </div>
              </div>

              <h2 className="text-lg font-bold text-white mb-2 leading-snug">
                {activeProperty.title}
              </h2>

              <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-4">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{activeProperty.settlement}, {activeProperty.municipality}, Kosovë</span>
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs mb-6">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">Sipërfaqja</span>
                  <span className="font-bold text-white text-sm">{activeProperty.area_m2} m²</span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">Statusi</span>
                  <span className="font-bold text-emerald-400 text-sm">Aktive</span>
                </div>
              </div>

              <Link
                href={`/prona/${activeProperty.id}`}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-900/30 transition-all text-xs"
              >
                <span>Shiko Detajet e Plota të Pronës</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 text-xs">
              <Building2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p>Zgjidhni një pronë në hartë për të parë detajet.</p>
            </div>
          )}

          {/* Quick link back */}
          <div className="pt-6 border-t border-slate-800 text-center mt-6">
            <Link
              href="/prona"
              className="text-xs text-slate-400 hover:text-emerald-400 flex items-center justify-center gap-1.5"
            >
              <span>Kthehu te pamja e listës & filtrat e avancuar</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
