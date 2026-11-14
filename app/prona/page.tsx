'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  KOSOVO_MUNICIPALITIES, 
  PROPERTY_CATEGORIES, 
  getMunicipality 
} from '@/lib/locations/kosovo-data';
import { 
  Search, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  Map as MapIcon, 
  Building2, 
  MapPin, 
  Euro, 
  Heart, 
  Share2, 
  ArrowRight,
  Filter,
  CheckCircle2,
  X
} from 'lucide-react';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filters state
  const [listingType, setListingType] = useState<string>(searchParams.get('tipi') || 'te-gjitha');
  const [propertyType, setPropertyType] = useState<string>(searchParams.get('kategoria') || 'te-gjitha');
  const [municipality, setMunicipality] = useState<string>(searchParams.get('komuna') || 'te-gjitha');
  const [minPrice, setMinPrice] = useState<string>(searchParams.get('cmimiMin') || '');
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get('cmimiMax') || '');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');

  // Properties data
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedMapProperty, setSelectedMapProperty] = useState<any | null>(null);

  useEffect(() => {
    async function loadProperties() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (listingType && listingType !== 'te-gjitha') params.set('tipi', listingType);
        if (propertyType && propertyType !== 'te-gjitha') params.set('kategoria', propertyType);
        if (municipality && municipality !== 'te-gjitha') params.set('komuna', municipality);
        if (minPrice) params.set('cmimi_min', minPrice);
        if (maxPrice) params.set('cmimi_max', maxPrice);
        if (sortBy) params.set('sort', sortBy);

        const res = await fetch(`/api/properties/search?${params.toString()}`);
        const data = await res.json();
        if (data && Array.isArray(data.properties)) {
          setProperties(data.properties);
        } else {
          setProperties([]);
        }
      } catch (err) {
        console.error('Failed to load properties:', err);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    }
    loadProperties();
  }, [listingType, propertyType, municipality, minPrice, maxPrice, sortBy]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  // Filter logic
  const filtered = properties.filter((p) => {
    if (listingType !== 'te-gjitha' && p.listing_type !== listingType) return false;
    if (propertyType !== 'te-gjitha' && p.property_type !== propertyType) return false;
    if (municipality !== 'te-gjitha' && p.municipality_id !== municipality) return false;
    if (minPrice && p.price < parseFloat(minPrice)) return false;
    if (maxPrice && p.price > parseFloat(maxPrice)) return false;
    return true;
  });

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          {/* Sale / Rent Switch */}
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setListingType('te-gjitha')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors ${
                listingType === 'te-gjitha' ? 'bg-[#0B192C] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Të Gjitha
            </button>
            <button
              onClick={() => setListingType('shitje')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors ${
                listingType === 'shitje' ? 'bg-[#0B192C] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Në Shitje
            </button>
            <button
              onClick={() => setListingType('qira')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors ${
                listingType === 'qira' ? 'bg-[#0B192C] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Me Qira
            </button>
          </div>

          {/* View Mode Toggle: Grid, List, Map */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Pamja Rrjetë"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Pamja Listë"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'map' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Pamja Hartë"
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Komuna</label>
            <select
              value={municipality}
              onChange={(e) => setMunicipality(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
            >
              <option value="te-gjitha">Të gjitha komunat (38)</option>
              {KOSOVO_MUNICIPALITIES.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Lloji i Pronës</label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
            >
              <option value="te-gjitha">Të gjitha kategoritë</option>
              {PROPERTY_CATEGORIES.map((c) => (
                <option key={c.id} value={c.label}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Çmimi Min (€)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="psh. 50,000"
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Çmimi Max (€)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="psh. 250,000"
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Active Results Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-6 px-1">
        <span>U gjetën <strong>{filtered.length} prona aktive</strong> në Kosovë</span>
        <div className="flex items-center gap-2">
          <span>Rendit sipas:</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="border-0 bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="newest">Më të rejat</option>
            <option value="lowest">Çmimi më i ulët</option>
            <option value="highest">Çmimi më i lartë</option>
          </select>
        </div>
      </div>

      {/* VIEW: MAP VIEW */}
      {viewMode === 'map' && (
        <div className="bg-slate-900 rounded-3xl p-6 mb-8 text-white relative overflow-hidden h-[500px] flex flex-col justify-between">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Harta e Pronave në Republikën e Kosovës</span>
            </div>
            <span className="text-[11px] text-slate-400">Markera me çmim aktiv</span>
          </div>

          {/* Simulated Interactive Map Markers */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 my-auto">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedMapProperty(p)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3 py-2 rounded-xl shadow-lg border border-white/20 transition-transform active:scale-95 flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{p.price.toLocaleString()} €</span>
              </button>
            ))}
          </div>

          {/* Property Map Card Popup Preview */}
          {selectedMapProperty ? (
            <div className="relative z-20 bg-white text-slate-900 rounded-2xl p-4 max-w-sm flex items-center gap-3 shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-2">
              <img 
                src={selectedMapProperty.cover_image} 
                alt={selectedMapProperty.title} 
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0 text-xs">
                <span className="font-black text-slate-900 block truncate">{selectedMapProperty.title}</span>
                <span className="text-slate-500 text-[11px] block">{selectedMapProperty.municipality_id} • {selectedMapProperty.area_m2} m²</span>
                <span className="text-emerald-700 font-bold block mt-0.5">{selectedMapProperty.price.toLocaleString()} €</span>
              </div>
              <Link
                href={`/prona/${selectedMapProperty.id}`}
                className="p-2 rounded-xl bg-[#0B192C] text-white hover:bg-[#1E3E62]"
                title="Hap pronën"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="relative z-10 text-xs text-slate-400 text-center">
              Klikoni mbi një çmim në hartë për të parë detajet e pronës.
            </div>
          )}
        </div>
      )}

      {/* RESULTS LISTINGS */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-500">Duke kërkuar prona aktive...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs">
          <Building2 className="w-14 h-14 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">Nuk u gjet asnjë pronë me këto filtra</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md">
            Prona të reja shtohen çdo ditë në Kosovë. Publiko pronën tënde dhe bëhu i pari në këtë kategori!
          </p>
          <Link
            href="/publiko"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-emerald-700/20 text-sm transition-all"
          >
            <span>Publiko Pronën Tënde</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <>
          {/* VIEW: GRID VIEW */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <Link
                  key={p.id}
                  href={`/prona/${p.id}`}
                  className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    <img
                      src={p.cover_image || (p.images && p.images[0]) || '/images/cities/prishtine.jpg'}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg shadow">
                      {p.listing_type === 'shitje' ? 'Në Shitje' : 'Me Qira'}
                    </span>
                    
                    <button
                      onClick={(e) => toggleFavorite(p.id, e)}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-colors ${
                        favorites.includes(p.id) ? 'bg-red-500 text-white' : 'bg-slate-900/40 text-white hover:bg-slate-900/70'
                      }`}
                      title="Ruaj te favoritet"
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(p.id) ? 'fill-current' : ''}`} />
                    </button>

                    <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur text-white font-black text-base px-3 py-1 rounded-xl">
                      {p.price.toLocaleString()} €
                    </div>
                  </div>

                  <div className="p-5 space-y-2 flex-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{p.settlement_id ? `${p.settlement_id}, ` : ''}{p.municipality_id}</span>
                    </div>

                    <h3 className="font-bold text-sm text-[#0B192C] line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors">
                      {p.title}
                    </h3>

                    <div className="flex items-center gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600 font-semibold">
                      <span>{p.area_m2} m²</span>
                      <span>•</span>
                      <span>{p.property_type}</span>
                      {p.bedrooms > 0 && (
                        <>
                          <span>•</span>
                          <span>{p.bedrooms} Dhomë</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* VIEW: LIST VIEW */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {filtered.map((p) => (
                <Link
                  key={p.id}
                  href={`/prona/${p.id}`}
                  className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-5 items-center group"
                >
                  <div className="w-full sm:w-56 aspect-video sm:aspect-square rounded-2xl overflow-hidden bg-slate-100 relative flex-shrink-0">
                    <img
                      src={p.cover_image || (p.images && p.images[0]) || '/images/cities/prishtine.jpg'}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 bg-emerald-600 text-white font-bold text-[10px] uppercase px-2 py-0.5 rounded">
                      {p.listing_type === 'shitje' ? 'Shitje' : 'Qira'}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{p.settlement_id ? `${p.settlement_id}, ` : ''}{p.municipality_id} (Kosovë)</span>
                    </div>

                    <h3 className="font-bold text-base text-[#0B192C] leading-snug group-hover:text-emerald-600 transition-colors">
                      {p.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-slate-600 font-semibold">
                      <span>{p.area_m2} m²</span>
                      <span>•</span>
                      <span>{p.property_type}</span>
                      <span>•</span>
                      <span>{p.bathrooms} Banjo</span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 sm:pl-4 sm:border-l sm:border-slate-100 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
                    <span className="text-xl font-black text-[#0B192C]">{p.price.toLocaleString()} €</span>
                    <span className="text-xs font-bold text-emerald-600 group-hover:underline flex items-center gap-1 mt-2">
                      <span>Shiko Detajet</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />
      <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Duke ngarkuar kërkimin...</div>}>
        <SearchPageContent />
      </Suspense>
      <Footer />
    </div>
  );
}
