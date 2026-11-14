'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search, MapPin, Building2, ShieldCheck, Clock, CreditCard,
  CheckCircle2, ArrowRight, Sparkles, Heart, Star, TrendingUp,
  Users, Euro, ChevronRight, Home, Key, Layers, Sun, Moon,
  MessageSquare, Bell, Award, BarChart3, Play, Globe
} from 'lucide-react';
import { KOSOVO_MUNICIPALITIES } from '@/lib/locations/kosovo-data';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { AISmartSearchBar } from '@/components/ai';

const FEATURED_PROPERTIES = [
  {
    id: 'prop-ks-104',
    title: 'Vilë luksoze me pamje malore',
    price: 240000,
    type: 'shitje',
    category: 'Vilë',
    municipality: 'Shtërpcë',
    settlement: 'Brezovicë',
    area_m2: 260,
    rooms: 6,
    badge: '⭐ Premium',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'prop-ks-101',
    title: 'Banesë moderne — Marigona Hill',
    price: 135000,
    type: 'shitje',
    category: 'Banesë',
    municipality: 'Prishtinë',
    settlement: 'Veternik',
    area_m2: 96,
    rooms: 3,
    badge: '🔥 Të preferuara',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'prop-ks-102',
    title: 'Shtëpi private me oborr',
    price: 185000,
    type: 'shitje',
    category: 'Shtëpi',
    municipality: 'Prizren',
    settlement: 'Ortakoll',
    area_m2: 220,
    rooms: 5,
    badge: null,
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'prop-ks-103',
    title: 'Lokal afarist qendror — Pejë',
    price: 750,
    type: 'qira',
    category: 'Lokal afarist',
    municipality: 'Pejë',
    settlement: 'Qendër',
    area_m2: 110,
    rooms: null,
    badge: '📍 Qendër',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
  },
];

const POPULAR_LOCATIONS = [
  { 
    name: 'Prishtinë', 
    count: 342, 
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Pristina%2C_Kosovo.jpg/640px-Pristina%2C_Kosovo.jpg',
    fallback: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=400&q=80'
  },
  { 
    name: 'Prizren', 
    count: 198, 
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Panorama_of_Prizren%2C_2021.jpg/640px-Panorama_of_Prizren%2C_2021.jpg',
    fallback: 'https://images.unsplash.com/photo-1467226632440-65f0b4957563?auto=format&fit=crop&w=400&q=80'
  },
  { 
    name: 'Pejë', 
    count: 124, 
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Peja_aerial.jpg/640px-Peja_aerial.jpg',
    fallback: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=400&q=80'
  },
  { 
    name: 'Ferizaj', 
    count: 87, 
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Ferizaj_city.jpg/640px-Ferizaj_city.jpg',
    fallback: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=400&q=80'
  },
  { 
    name: 'Gjilan', 
    count: 72, 
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Gjilan.jpg/640px-Gjilan.jpg',
    fallback: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
  },
  { 
    name: 'Mitrovicë', 
    count: 56, 
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Mitrovica_city_view.jpg/640px-Mitrovica_city_view.jpg',
    fallback: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=400&q=80'
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Krijo llogarinë', desc: 'Regjistrohu si shitës privat ose agjenci. Procesi zgjat 2 minuta.', icon: Users, color: 'emerald' },
  { step: '02', title: 'Hapi shpalljen', desc: 'Plotëso formularin 8-hapësh me foto, çmim, lokacion dhe detaje të pronës.', icon: Building2, color: 'blue' },
  { step: '03', title: 'Zgjidh Planin', desc: 'Falas (3 ditë), Javor (2.99 €) ose Mujor (9.99 €). Pagesë e sigurt me kartë, pa abonime.', icon: CreditCard, color: 'violet' },
  { step: '04', title: 'Gjej blerësin', desc: 'Prona shfaqet në kërkim, hartë dhe te blerësit e interesuar sipas kohëzgjatjes së planit.', icon: CheckCircle2, color: 'emerald' },
];

const STATS = [
  { label: 'Prona Aktive', value: '800+', icon: Building2 },
  { label: 'Komuna të Mbuluara', value: '38', icon: MapPin },
  { label: 'Agjenci të Verifikuara', value: '50+', icon: ShieldCheck },
  { label: 'Shpallje të Suksesshme', value: '2,400+', icon: TrendingUp },
];

const PROPERTY_TYPES = [
  { label: 'Banesë', icon: Home, q: 'Banesë' },
  { label: 'Shtëpi', icon: Building2, q: 'Shtëpi' },
  { label: 'Vilë', icon: Star, q: 'Vilë' },
  { label: 'Truall', icon: Layers, q: 'Truall' },
  { label: 'Zyrë', icon: Globe, q: 'Zyrë' },
  { label: 'Lokal', icon: Key, q: 'Lokal afarist' },
];

export default function HomepageClient() {
  const { isDark, toggleTheme } = useTheme();
  const [searchType, setSearchType] = useState<'shitje' | 'qira'>('shitje');
  const [searchMunicipality, setSearchMunicipality] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchPriceMax, setSearchPriceMax] = useState('');
  const [featuredProperties, setFeaturedProperties] = useState<typeof FEATURED_PROPERTIES>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  // Load real featured properties from API
  useEffect(() => {
    fetch('/api/properties/featured')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.properties?.length) {
          setFeaturedProperties(data.properties);
        }
      })
      .catch(() => {/* silent - show empty state */})
      .finally(() => setFeaturedLoading(false));
  }, []);

  const buildSearchUrl = () => {
    const params = new URLSearchParams();
    params.set('tipi', searchType);
    if (searchMunicipality) params.set('komuna', searchMunicipality);
    if (searchCategory) params.set('kategoria', searchCategory);
    if (searchPriceMax) params.set('cmimi_max', searchPriceMax);
    return `/prona?${params.toString()}`;
  };

  return (
    <main className="flex-1">
      {/* ===== HERO ===== */}
      <section className="relative bg-[#0B192C] text-white overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#059669_0%,_transparent_60%)] opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1920&q=20')] bg-cover bg-center opacity-10 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          {/* Theme Toggle */}
          <div className="absolute top-4 right-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition-all backdrop-blur-sm"
              title={isDark ? 'Kaloni në temën e çelët' : 'Kaloni në temën e errët'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <div className="text-center space-y-5 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tregu Kryesor i Pasurive të Paluajtshme në Kosovë</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Prona që kërkon.<br />
              <span className="text-emerald-400">Shtëpia që meriton.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Gjej banesën, shtëpinë apo investimin tënd të ardhshëm në të gjitha 38 komunat e Kosovës.
              Publiko me planet tona transparente: <strong className="text-white">Falas (3 ditë), Javor (2.99 €) ose Mujor (9.99 €)</strong>.
            </p>

            {/* AI Smart Search Bar */}
            <div className="mt-8 mb-4 max-w-4xl mx-auto">
              <AISmartSearchBar />
            </div>

            {/* Search Widget */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl max-w-4xl mx-auto text-left border border-slate-100 dark:border-slate-700 mt-4">
              {/* Tabs */}
              <div className="flex gap-2 border-b border-slate-100 dark:border-slate-700 pb-3 mb-4">
                {(['shitje', 'qira'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setSearchType(t)}
                    className={`px-5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      searchType === t
                        ? 'bg-[#0B192C] text-white'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {t === 'shitje' ? '🏠 Në Shitje' : '🔑 Me Qira'}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Lloji</label>
                  <select
                    value={searchCategory}
                    onChange={e => setSearchCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Të gjitha llojet</option>
                    <option value="Banesë">Banesë</option>
                    <option value="Shtëpi">Shtëpi</option>
                    <option value="Vilë">Vilë</option>
                    <option value="Truall">Truall</option>
                    <option value="Lokal afarist">Lokal afarist</option>
                    <option value="Zyrë">Zyrë</option>
                    <option value="Tokë bujqësore">Tokë bujqësore</option>
                  </select>
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Komuna</label>
                  <select
                    value={searchMunicipality}
                    onChange={e => setSearchMunicipality(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Të gjitha (38 Komuna)</option>
                    {KOSOVO_MUNICIPALITIES.map(m => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Çmimi Max (€)</label>
                  <input
                    type="number"
                    min="0"
                    value={searchPriceMax}
                    onChange={e => setSearchPriceMax(e.target.value)}
                    placeholder="p.sh. 150000"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-400"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-semibold text-transparent mb-1">.</label>
                  <Link
                    href={buildSearchUrl()}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl shadow-md shadow-emerald-900/20 transition-all text-xs"
                  >
                    <Search className="w-4 h-4" />
                    <span>Kërko Pronën</span>
                  </Link>
                </div>
              </div>

              {/* Quick type pills */}
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                {PROPERTY_TYPES.map(pt => (
                  <Link
                    key={pt.q}
                    href={`/prona?tipi=${searchType}&kategoria=${encodeURIComponent(pt.q)}`}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 text-[11px] font-semibold transition-all"
                  >
                    <pt.icon className="w-3 h-3" />
                    <span>{pt.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="bg-emerald-700 dark:bg-emerald-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-emerald-300 shrink-0" />
                  <div>
                    <div className="text-xl font-black">{stat.value}</div>
                    <div className="text-[11px] text-emerald-200">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PROPERTIES ===== */}
      <section className="bg-white dark:bg-slate-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Shpalljet e Dallimit</div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Prona të Zgjedhura
              </h2>
            </div>
            <Link href="/prona" className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
              <span>Shiko të gjitha</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredLoading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-xs animate-pulse">
                  <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-700" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                    <div className="h-4 bg-slate-100 dark:bg-slate-600 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-600 rounded w-2/3" />
                  </div>
                </div>
              ))
            ) : featuredProperties.length === 0 ? (
              // Empty state - no demo data shown
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <Building2 className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-2">Prona e para po vijnë</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500 mb-6 max-w-md">
                  Jini të parët! Publikoni pronën tuaj dhe shfaqeni te blerësit dhe qiramarrësit në Kosovë.
                </p>
                <Link
                  href="/publiko"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl transition-all text-sm"
                >
                  <span>Publiko Pronën Tënde</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
            featuredProperties.map(property => (              <Link
                key={property.id}
                href={`/prona/${property.id}`}
                className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full text-white ${
                      property.type === 'shitje' ? 'bg-[#0B192C]/90' : 'bg-violet-700/90'
                    }`}>
                      {property.type === 'shitje' ? 'Shitje' : 'Qira'}
                    </span>
                    {property.badge && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-600/90 text-white">
                        {property.badge}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={e => { e.preventDefault(); }}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 text-slate-400 hover:text-rose-500 transition-colors shadow-xs"
                  >
                    <Heart className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <div className="text-lg font-black text-emerald-700 dark:text-emerald-400 mb-1">
                    {property.price.toLocaleString()} €
                    {property.type === 'qira' && <span className="text-xs font-normal text-slate-400">/muaj</span>}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {property.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-auto">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{property.settlement}, {property.municipality}</span>
                  </p>
                  <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{property.area_m2} m²</span>
                    {property.rooms && <span>· {property.rooms} dhoma</span>}
                    <span>· {property.category}</span>
                  </div>
                </div>
              </Link>
            ))
            )}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/prona"
              className="inline-flex items-center gap-2 bg-[#0B192C] dark:bg-slate-700 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all text-xs"
            >
              <span>Shiko të gjitha shpalljet</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== POPULAR LOCATIONS ===== */}
      <section className="bg-slate-50 dark:bg-slate-950 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Destinacionet e Preferuara</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Lokacionet Popullore
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto">
              Gjeni prona në të gjitha komunat e Kosovës — nga kryeqyteti deri në fshatrat më të largëta.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {POPULAR_LOCATIONS.map(loc => (
              <Link
                key={loc.name}
                href={`/prona?komuna=${encodeURIComponent(loc.name)}`}
                className="group relative rounded-2xl overflow-hidden aspect-square shadow-xs hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <img
                  src={loc.image}
                  alt={`Qyteti i ${loc.name}, Kosovë`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (loc.fallback && target.src !== loc.fallback) {
                      target.src = loc.fallback;
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="font-bold text-white text-sm">{loc.name}</div>
                  <div className="text-emerald-300 text-[11px]">{loc.count} prona</div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-6">
            <Link
              href="/harta"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              <span>Shiko hartën e plotë me të 38 komunat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="bg-white dark:bg-slate-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Procesi i Thjeshtë</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Si Funksionon PronaX?</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => {
              const Icon = step.icon;
              const colorMap: Record<string, string> = {
                emerald: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 border-emerald-200 dark:border-emerald-700',
                blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 border-blue-200 dark:border-blue-700',
                violet: 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 border-violet-200 dark:border-violet-700',
              };
              return (
                <div key={i} className="text-center relative">
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden lg:block absolute top-7 left-[60%] w-[80%] h-px bg-gradient-to-r from-emerald-300 to-transparent dark:from-emerald-700 z-0" />
                  )}
                  <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto mb-4 relative z-10 ${colorMap[step.color]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-black text-slate-400 dark:text-slate-500 mb-1">{step.step}</div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">{step.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== WHY PRONAX ===== */}
      <section className="bg-slate-50 dark:bg-slate-950 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Pse PronaX?</div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-5">
                Platforma e Pasurive të Paluajtshme Ndërtuar për Kosovën
              </h2>
              <div className="space-y-4">
                {[
                  { title: 'Plane transparente dhe fleksibile', desc: 'Falas (0 € / 3 ditë), Javor (2.99 € / 7 ditë), Mujor (9.99 € / 30 ditë). Pa abonime të fshehura.', icon: Euro },
                  { title: 'Mbulon të 38 komunat', desc: 'Nga Prishtina deri te Zubin Potoku — çdo pronë në çdo cep të Kosovës.', icon: MapPin },
                  { title: 'Harta interaktive', desc: 'Kërko pronën drejtpërdrejt në hartë. Shiko çmimet dhe vendoset me saktësi.', icon: Layers },
                  { title: 'Agjenci të verifikuara', desc: 'Çdo agjenci ka licencë ARBK të verifikuar manualisht nga ekipi i PronaX.', icon: ShieldCheck },
                  { title: 'Komunikim i drejtpërdrejtë', desc: 'Kontakto shitësin me WhatsApp, telefon ose mesazh direkt.', icon: MessageSquare },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 flex items-center justify-center shrink-0">
                        <Icon className="w-4.5 h-4.5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-lg">
                <div className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <span>Kosto e Publikimit</span>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-2xl p-5 text-center mb-4">
                  <div className="text-3xl sm:text-4xl font-black text-emerald-700 dark:text-emerald-400">0 € — 9.99 €</div>
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">3 Planet e Publikimit</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Falas (3 ditë) • Javor (2.99 €) • Mujor (9.99 €)</div>
                </div>

                <div className="space-y-2.5 text-xs">
                  {[
                    '✓ Dukshmëri në kërkim, hartë dhe direktori',
                    '✓ Deri në 30 foto + video URL',
                    '✓ Butoni WhatsApp direkt me pronarin',
                    '✓ Statistikat e shikimeve në kohë reale',
                    '✓ Njoftimet para skadimit të planit',
                    '✓ Rinovim vetëm manual — pa abonime automatike',
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <span className="text-emerald-600 font-bold">{f.split(' ')[0]}</span>
                      <span>{f.substring(2)}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/publiko"
                  className="mt-5 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-sm"
                >
                  <span>Publiko Pronën Tënde Tani</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-amber-400 text-amber-900 font-black text-xs px-3 py-1.5 rounded-full shadow-lg rotate-6">
                Pa komisione!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== AGENCY CTA ===== */}
      <section className="bg-[#0B192C] dark:bg-slate-900 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-5">
            <Award className="w-3.5 h-3.5" />
            <span>Partneritet Profesional</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mb-3">
            Jeni agjenci e licencuar patundshmërish?
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl mx-auto mb-7">
            Bashkohuni me rrjetin e agjencive të verifikuara të PronaX. Merrni profilin e plotë, 
            badge-in e verifikimit ARBK dhe dukshmëri shtesë për të gjitha shpalljet tuaja.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/regjistrohu?roli=agjenci"
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all text-xs flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Regjistro Agjencinë Tënde</span>
            </Link>
            <Link
              href="/agjencite"
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all text-xs flex items-center gap-2 border border-slate-700"
            >
              <span>Shfleto Agjencitë</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
