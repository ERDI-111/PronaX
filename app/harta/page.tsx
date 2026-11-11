'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Building2, 
  MapPin, 
  Layers, 
  Search, 
  X, 
  ArrowRight, 
  Filter, 
  ExternalLink,
  ChevronRight,
  Maximize2,
  Sparkles,
  BedDouble,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import { KOSOVO_MUNICIPALITIES, getMunicipality } from '@/lib/locations/kosovo-data';
import { MapPropertyItem } from '@/components/map/KosovoInteractiveMap';

// Dynamically import Leaflet map with SSR disabled to prevent window/document undefined issues
const KosovoInteractiveMap = dynamic(
  () => import('@/components/map/KosovoInteractiveMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[500px] bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-slate-500">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-sm text-slate-800 dark:text-slate-200">Duke ngarkuar hartën gjeografike të Kosovës...</p>
        <p className="text-xs text-slate-400 mt-1">Po ngarkohen të dhënat dhe rrugët për të 38 komunat</p>
      </div>
    ),
  }
);

export default function KosovoMapPage() {
  const [properties, setProperties] = useState<MapPropertyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<MapPropertyItem | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState<'shitje' | 'qira' | ''>('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [targetCoords, setTargetCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Fetch active properties from API
  useEffect(() => {
    async function loadMapProperties() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedMunicipality) params.set('komuna', selectedMunicipality);
        if (selectedCategory) params.set('kategoria', selectedCategory);
        if (selectedPurpose) params.set('tipi', selectedPurpose);
        if (searchQuery) params.set('q', searchQuery);

        const res = await fetch(`/api/properties/map?${params.toString()}`);
        const data = await res.json();

        if (data.success && Array.isArray(data.properties)) {
          setProperties(data.properties);
          // Set first property as active by default if none selected or if previously selected is no longer in list
          if (data.properties.length > 0) {
            setSelectedProperty((prev) => {
              if (prev && data.properties.some((p: any) => p.id === prev.id)) {
                return prev;
              }
              return data.properties[0];
            });
          } else {
            setSelectedProperty(null);
          }
        }
      } catch (err) {
        console.error('Error fetching map properties:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMapProperties();
  }, [selectedMunicipality, selectedCategory, selectedPurpose, searchQuery]);

  // Handle municipality change: auto-pan map to municipality center
  const handleMunicipalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const muniName = e.target.value;
    setSelectedMunicipality(muniName);

    if (muniName) {
      const muni = KOSOVO_MUNICIPALITIES.find((m) => m.name === muniName);
      if (muni) {
        setTargetCoords({ lat: muni.lat, lng: muni.lng });
      }
    } else {
      setTargetCoords(null);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedPurpose('');
    setSelectedMunicipality('');
    setSelectedCategory('');
    setPriceMin('');
    setPriceMax('');
    setTargetCoords(null);
  };

  // Filter properties client-side by price min/max if provided
  const displayProperties = useMemo(() => {
    return properties.filter((p) => {
      if (priceMin && p.price < Number(priceMin)) return false;
      if (priceMax && p.price > Number(priceMax)) return false;
      return true;
    });
  }, [properties, priceMin, priceMax]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Header />

      {/* Top Filter Bar */}
      <div className="bg-white dark:bg-[#0B192C] border-b border-slate-200 dark:border-slate-800 py-3.5 px-4 sm:px-6 shadow-sm z-30 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
          {/* Title & Count Badge */}
          <div className="flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 font-black text-sm text-[#0B192C] dark:text-white">
              <span className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </span>
              <span>Harta e Pronave në Kosovë</span>
            </div>
            <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold px-2.5 py-1 rounded-full text-[11px]">
              {loading ? 'Duke kërkuar...' : `${displayProperties.length} prona aktive`}
            </span>
          </div>

          {/* Filter Controls Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-56 min-w-[140px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Kërko me lagje ose titull..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white pl-8 pr-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Purpose Select */}
            <select
              value={selectedPurpose}
              onChange={(e) => setSelectedPurpose(e.target.value as any)}
              className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Të gjitha (Shitje & Qira)</option>
              <option value="shitje">Në Shitje</option>
              <option value="qira">Me Qira</option>
            </select>

            {/* Municipality Select (All 38 Kosovo Municipalities) */}
            <select
              value={selectedMunicipality}
              onChange={handleMunicipalityChange}
              className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[180px]"
            >
              <option value="">Të gjitha Komunat (38)</option>
              {KOSOVO_MUNICIPALITIES.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name} ({m.region})
                </option>
              ))}
            </select>

            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Lloji i Pronës</option>
              <option value="Banesë">Banesë</option>
              <option value="Shtëpi">Shtëpi</option>
              <option value="Vilë">Vilë</option>
              <option value="Truall">Truall</option>
              <option value="Tokë bujqësore">Tokë bujqësore</option>
              <option value="Lokal afarist">Lokal afarist</option>
              <option value="Zyrë">Zyrë</option>
              <option value="Depo">Depo</option>
              <option value="Garazh">Garazh</option>
            </select>

            {/* Clear Filters Button */}
            {(searchQuery || selectedPurpose || selectedMunicipality || selectedCategory || priceMin || priceMax) && (
              <button
                onClick={handleClearFilters}
                className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                title="Pastro të gjithë filtrat"
              >
                <X className="w-3.5 h-3.5" />
                <span>Pastro</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Map Content View: Full Height Layout */}
      <div className="flex-1 relative flex flex-col lg:flex-row h-[calc(100vh-145px)] overflow-hidden">
        {/* Real Geographical Map Component */}
        <div className="flex-1 relative w-full h-full">
          <KosovoInteractiveMap
            properties={displayProperties}
            selectedProperty={selectedProperty}
            onSelectProperty={(prop) => setSelectedProperty(prop)}
            targetMunicipalityCoords={targetCoords}
          />
        </div>

        {/* Selected Property Preview Drawer (Right on Desktop, Bottom Sheet on Mobile) */}
        <div className="w-full lg:w-[410px] bg-white dark:bg-[#0B192C] border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 flex flex-col z-20 shadow-xl overflow-hidden max-h-[45vh] lg:max-h-full">
          {/* Header of Drawer */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {selectedProperty ? 'Detajet e Shpejta të Pronës' : 'Zgjidhni një Pronë'}
            </span>
            <Link
              href="/prona"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-500 flex items-center gap-1"
            >
              <span>Shiko si Listë</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {selectedProperty ? (
              <div className="space-y-4">
                {/* Image & Price Overlay */}
                <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-100 dark:bg-slate-800 group">
                  <img
                    src={selectedProperty.cover_image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider shadow-md ${
                      selectedProperty.listing_type === 'shitje'
                        ? 'bg-blue-600 text-white'
                        : 'bg-amber-500 text-slate-950'
                    }`}>
                      {selectedProperty.listing_type === 'shitje' ? 'Në Shitje' : 'Me Qira'}
                    </span>
                    <span className="bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-white/20">
                      {selectedProperty.property_type}
                    </span>
                  </div>

                  {/* Price Tag */}
                  <div className="absolute bottom-3 left-3 bg-[#0B192C]/90 backdrop-blur-md border border-emerald-500/50 text-white px-3 py-1.5 rounded-xl shadow-lg flex items-baseline gap-1">
                    <span className="text-lg font-black text-emerald-400">
                      {selectedProperty.price.toLocaleString('sq-AL')} €
                    </span>
                    {selectedProperty.listing_type === 'qira' && (
                      <span className="text-xs text-slate-300 font-normal">/muaj</span>
                    )}
                  </div>
                </div>

                {/* Title & Location */}
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {selectedProperty.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>
                      {selectedProperty.settlement_name ? `${selectedProperty.settlement_name}, ` : ''}
                      {selectedProperty.municipality_name}, Kosovë
                    </span>
                  </p>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Sipërfaqja</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">{selectedProperty.area_m2} m²</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Dhoma Gjumi</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {selectedProperty.bedrooms ? `${selectedProperty.bedrooms} dhoma` : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Verification Notice */}
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Pronë e verifikuar dhe aktive në platformë</span>
                </div>

                {/* Call-to-action button */}
                <Link
                  href={`/prona/${selectedProperty.id}`}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all text-xs"
                >
                  <span>Shiko Detajet e Plota të Pronës</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 text-xs space-y-3">
                <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="font-medium text-slate-600 dark:text-slate-400">
                  Zgjidhni një shënjues në hartë për të parë detajet dhe fotot e pronës.
                </p>
                <p className="text-[11px] text-slate-400">
                  Ose ndryshoni filtrat në shiritin e mësipërm për të eksploruar komunat e Kosovës.
                </p>
              </div>
            )}

            {/* Other Properties in Same Filter */}
            {displayProperties.length > 1 && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2.5">
                  Prona të tjera në këtë zonë ({displayProperties.length - 1}):
                </span>
                <div className="space-y-2">
                  {displayProperties
                    .filter((p) => p.id !== selectedProperty?.id)
                    .slice(0, 3)
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedProperty(item)}
                        className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3 transition-colors text-xs"
                      >
                        <img
                          src={item.cover_image}
                          alt={item.title}
                          className="w-12 h-12 rounded-lg object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 dark:text-white truncate">{item.title}</h4>
                          <span className="text-[11px] text-emerald-600 font-extrabold block">
                            {item.price.toLocaleString('sq-AL')} €
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
