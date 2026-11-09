'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  MapPin, Euro, Building2, BedDouble, Bath, Layers,
  Calendar, Heart, Share2, Flag, Phone, Mail, MessageSquare,
  CheckCircle2, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight,
  Eye, Clock, ExternalLink, Home, Square, Thermometer, Car,
  Wind, Zap, TreePine, Maximize2, X, Star, Sparkles
} from 'lucide-react';

// --- Mock data matching the search API ---
const MOCK_PROPERTIES: Record<string, any> = {
  'prop-ks-101': {
    id: 'prop-ks-101',
    title: 'Banesë moderne në lagjen Marigona Hill',
    slug: 'banesa-moderne-marigona-hill-pristine',
    description: 'Banesë e re luksoze me pamje të mrekullueshme, e vendosur në lagjen prestigjioze Marigona Hill. Kompleksi ofron siguri 24/7, pishinë, palestër dhe hapësira të gjelbra. Banesa është plotësisht e mobiluar me materiale premium dhe pajisje moderne.',
    listing_type: 'shitje',
    property_type: 'Banesë',
    municipality_name: 'Prishtinë',
    settlement_name: 'Veternik',
    address: 'Rr. Marigona Hill, Nr. 24',
    price: 135000,
    currency: 'EUR',
    area_m2: 96,
    bedrooms: 3,
    bathrooms: 2,
    living_rooms: 1,
    floor: 4,
    total_floors: 10,
    year_built: 2021,
    furnished: 'i mobiluar',
    heating_type: 'Ngrohje qendrore',
    has_balcony: true,
    has_parking: true,
    has_elevator: true,
    has_ac: true,
    cover_image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80',
    ],
    status: 'published',
    published_at: '2026-10-10T10:00:00Z',
    expires_at: '2026-11-09T10:00:00Z',
    is_featured: true,
    lat: 42.635,
    lng: 21.172,
    owner_name: 'Agim Berisha',
    owner_phone: '+383 44 123 456',
    owner_email: 'agim.berisha@pronax.ks',
    owner_type: 'privat',
    whatsapp: '+38344123456',
    views: 847,
  },
  'prop-ks-102': {
    id: 'prop-ks-102',
    title: 'Shtëpi komode me oborr të rregulluar',
    slug: 'shtepi-komode-oborr-prizren',
    description: 'Shtëpi private me oborr të bollshëm dhe kopshti të kultivuar mirë, në lagje të qetë të Prizrenit. Përfshin garazh dyçek, bodrumë dhe tarracë me pamje panoramike ndaj qytetit historik. Dokumentet janë 1/1.',
    listing_type: 'shitje',
    property_type: 'Shtëpi',
    municipality_name: 'Prizren',
    settlement_name: 'Ortakoll',
    address: 'Rr. Ortakoll, Nr. 8',
    price: 185000,
    currency: 'EUR',
    area_m2: 220,
    bedrooms: 5,
    bathrooms: 3,
    living_rooms: 2,
    floor: null,
    total_floors: 2,
    year_built: 2018,
    furnished: 'i mobiluar',
    heating_type: 'Ngrohje me gaz',
    has_balcony: true,
    has_parking: true,
    has_elevator: false,
    has_ac: true,
    cover_image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80',
    ],
    status: 'published',
    published_at: '2026-10-15T09:00:00Z',
    expires_at: '2026-11-14T09:00:00Z',
    is_featured: true,
    lat: 42.221,
    lng: 20.738,
    owner_name: 'Luljeta Berisha',
    owner_phone: '+383 49 222 333',
    owner_email: 'info@dardaniarealestate.ks',
    owner_type: 'agjenci',
    whatsapp: '+38349222333',
    views: 523,
  },
  'prop-ks-103': {
    id: 'prop-ks-103',
    title: 'Lokal afarist modern në qendër të Pejës',
    slug: 'lokal-afarist-qender-peje',
    description: 'Lokal afarist me pozitë qendrore, i përshtatshëm për zyrë, dyqan, restorant ose aktivitet tjetër tregtar. Fasada e shikueshme, dritare të mëdha, hyrje direkte nga rruga kryesore.',
    listing_type: 'qira',
    property_type: 'Lokal afarist',
    municipality_name: 'Pejë',
    settlement_name: 'Qendër',
    address: 'Rr. Mbretëresha Teuta, Nr. 44',
    price: 750,
    currency: 'EUR',
    area_m2: 110,
    bedrooms: null,
    bathrooms: 1,
    living_rooms: null,
    floor: 0,
    total_floors: 3,
    year_built: 2016,
    furnished: 'i mobiluar',
    heating_type: 'Ngrohje elektrike',
    has_balcony: false,
    has_parking: true,
    has_elevator: false,
    has_ac: true,
    cover_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    ],
    status: 'published',
    published_at: '2026-10-20T12:00:00Z',
    expires_at: '2026-11-19T12:00:00Z',
    is_featured: false,
    lat: 42.659,
    lng: 20.292,
    owner_name: 'Dardania Real Estate',
    owner_phone: '+383 44 123 456',
    owner_email: 'info@dardania.ks',
    owner_type: 'agjenci',
    whatsapp: '+38344123456',
    views: 312,
  },
  'prop-ks-104': {
    id: 'prop-ks-104',
    title: 'Vilë luksoze me pamje malore në Brezovicë',
    slug: 'vile-luksoze-brezovice',
    description: 'Vilë private luksoze me arkitekturë bashkëkohore, e vendosur në malin e Brezovicës. Ofron 6 dhoma gjumi, 4 banja, pishinë të mbuluar, sauna, palestër dhe garazh 3-veturor. Pamje mahnitëse të alpeve kosovare. Perfekte për rezidencë verore ose investim turistik.',
    listing_type: 'shitje',
    property_type: 'Vilë',
    municipality_name: 'Shtërpcë',
    settlement_name: 'Brezovicë',
    address: 'Brezovicë, Kompleksi Alpin, Nr. 3',
    price: 240000,
    currency: 'EUR',
    area_m2: 260,
    bedrooms: 6,
    bathrooms: 4,
    living_rooms: 2,
    floor: null,
    total_floors: 3,
    year_built: 2020,
    furnished: 'i mobiluar',
    heating_type: 'Ngrohje me naftë',
    has_balcony: true,
    has_parking: true,
    has_elevator: false,
    has_ac: true,
    cover_image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
    ],
    status: 'published',
    published_at: '2026-10-25T08:00:00Z',
    expires_at: '2026-11-24T08:00:00Z',
    is_featured: true,
    lat: 42.215,
    lng: 21.002,
    owner_name: 'Ramiz Gashi',
    owner_phone: '+383 44 999 888',
    owner_email: 'ramiz@prime-ks.com',
    owner_type: 'agjenci',
    whatsapp: '+38344999888',
    views: 1204,
  },
  'prop-ks-105': {
    id: 'prop-ks-105',
    title: 'Truall ndërtimor 1500m² me leje ndërtimi',
    slug: 'truall-ndertimorr-fushe-kosove',
    description: 'Truall ideal ndërtimor me leje ndërtimi të vlefshme, i rregulluar me rrymë, ujësjellës dhe kanalizim. Pozitë strategjike pranë rrugës automobilistike. Potencial i madh për zhvillim rezidencial ose komercial.',
    listing_type: 'shitje',
    property_type: 'Truall',
    municipality_name: 'Fushë Kosovë',
    settlement_name: 'Zona Industriale',
    address: 'Rr. Industrial, Zona A',
    price: 68000,
    currency: 'EUR',
    area_m2: 1500,
    bedrooms: null,
    bathrooms: null,
    living_rooms: null,
    floor: null,
    total_floors: null,
    year_built: null,
    furnished: null,
    heating_type: null,
    has_balcony: false,
    has_parking: false,
    has_elevator: false,
    has_ac: false,
    cover_image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    ],
    status: 'published',
    published_at: '2026-11-01T14:00:00Z',
    expires_at: '2026-12-01T14:00:00Z',
    is_featured: false,
    lat: 42.632,
    lng: 21.115,
    owner_name: 'Besim Krasniqi',
    owner_phone: '+383 45 777 666',
    owner_email: 'besim@test.ks',
    owner_type: 'privat',
    whatsapp: '+38345777666',
    views: 189,
  },
  'prop-ks-106': {
    id: 'prop-ks-106',
    title: 'Banesë 2+1 me ballkon të madh — Ferizaj Qendër',
    slug: 'banesa-2plus1-ballkon-ferizaj',
    description: 'Banesë e re 2+1 në zemër të Ferizajt, me ballkon 12m² me pamje panoramike. Ndërtim 2019, materiale premium, dritare alumini, dysheme parket. Afër qendrës tregtare, shkollave dhe spitalit.',
    listing_type: 'shitje',
    property_type: 'Banesë',
    municipality_name: 'Ferizaj',
    settlement_name: 'Qendër',
    address: 'Rr. Skënderbeu, Nr. 15',
    price: 72000,
    currency: 'EUR',
    area_m2: 78,
    bedrooms: 2,
    bathrooms: 1,
    living_rooms: 1,
    floor: 3,
    total_floors: 6,
    year_built: 2019,
    furnished: 'i pamobiluar',
    heating_type: 'Ngrohje qendrore',
    has_balcony: true,
    has_parking: false,
    has_elevator: true,
    has_ac: false,
    cover_image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1200&q=80',
    ],
    status: 'published',
    published_at: '2026-11-05T10:00:00Z',
    expires_at: '2026-12-05T10:00:00Z',
    is_featured: false,
    lat: 42.370,
    lng: 21.148,
    owner_name: 'Vjosa Musa',
    owner_phone: '+383 49 555 444',
    owner_email: 'vjosa@test.ks',
    owner_type: 'privat',
    whatsapp: '+38349555444',
    views: 95,
  },
};

function formatPrice(price: number, listingType: string, currency: string) {
  const formatted = price.toLocaleString('sq-AL');
  return listingType === 'qira' ? `${formatted} ${currency}/muaj` : `${formatted} ${currency}`;
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('sq-AL', { day: '2-digit', month: 'long', year: 'numeric' });
}

function PropertyDetailContent() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id as string;

  const [property, setProperty] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSent, setReportSent] = useState(false);

  useEffect(() => {
    // Try to fetch from API, fallback to mock
    async function load() {
      try {
        // First check mock data
        const found = MOCK_PROPERTIES[propertyId];
        if (found) {
          setProperty(found);
          setLoading(false);
          return;
        }
        // Try API
        const res = await fetch(`/api/properties/${propertyId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.property) {
            setProperty(data.property);
          } else {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      } catch {
        // Fallback: check if there's a matching slug
        const bySlug = Object.values(MOCK_PROPERTIES).find((p: any) => p.slug === propertyId);
        if (bySlug) {
          setProperty(bySlug);
        } else {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    }
    if (propertyId) load();
  }, [propertyId]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: property?.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setMessageSent(true);
  };

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSent(true);
    setTimeout(() => setShowReportModal(false), 2000);
  };

  const prevImage = () => setCurrentImageIndex(i => Math.max(0, i - 1));
  const nextImage = () => setCurrentImageIndex(i => Math.min((property?.images?.length ?? 1) - 1, i + 1));

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 text-sm">Duke ngarkuar pronën...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !property) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-slate-800 mb-2">Prona nuk u gjet</h1>
            <p className="text-slate-500 mb-6">Kjo pronë nuk ekziston ose ka qenë e hequr.</p>
            <Link href="/prona" className="bg-[#0B192C] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#162436] transition-colors">
              ← Kthehu te Prona
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const images = property.images || [property.cover_image];
  const isForSale = property.listing_type === 'shitje';
  const relatedProperties = Object.values(MOCK_PROPERTIES)
    .filter((p: any) => p.id !== property.id && p.listing_type === property.listing_type)
    .slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Header />

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 text-white hover:text-slate-300 p-2 rounded-full bg-white/10" onClick={() => setLightboxOpen(false)}>
            <X className="w-6 h-6" />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30"
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            disabled={currentImageIndex === 0}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <img
            src={images[currentImageIndex]}
            alt={property.title}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30"
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            disabled={currentImageIndex === images.length - 1}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowReportModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-slate-900 dark:text-white text-lg mb-4 flex items-center gap-2">
              <Flag className="w-5 h-5 text-rose-500" /> Raportoni Pronën
            </h3>
            {reportSent ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">Raporti u dërgua. Faleminderit!</p>
              </div>
            ) : (
              <form onSubmit={handleReport} className="space-y-4">
                <select
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-slate-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">Zgjidhni arsyen...</option>
                  <option value="fake">Pronë e rreme / skamuese</option>
                  <option value="duplicate">Pronë e dubluar</option>
                  <option value="wrong_price">Çmim i gabuar</option>
                  <option value="sold">Prona tashmë është shitur</option>
                  <option value="wrong_location">Vendndodhja e gabuar</option>
                  <option value="other">Arsye tjetër</option>
                </select>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowReportModal(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Anulo</button>
                  <button type="submit" className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-500 transition-colors">Dërgo Raportin</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500">
            <Link href="/" className="hover:text-emerald-600 transition-colors">Ballina</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/prona" className="hover:text-emerald-600 transition-colors">Prona</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/prona?komuna=${encodeURIComponent(property.municipality_name)}`} className="hover:text-emerald-600 transition-colors">{property.municipality_name}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[180px]">{property.title}</span>
          </nav>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-6">

              {/* Gallery */}
              <div className="relative rounded-2xl overflow-hidden shadow-lg bg-slate-900">
                <div className="relative h-72 sm:h-96 md:h-[480px] cursor-pointer" onClick={() => setLightboxOpen(true)}>
                  <img
                    src={images[currentImageIndex]}
                    alt={property.title}
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`text-xs font-black px-3 py-1.5 rounded-full shadow-sm ${isForSale ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}`}>
                      {isForSale ? 'Në Shitje' : 'Me Qira'}
                    </span>
                    {property.is_featured && (
                      <span className="text-xs font-black px-3 py-1.5 rounded-full bg-amber-500 text-white shadow-sm flex items-center gap-1">
                        <Star className="w-3 h-3" /> Premium
                      </span>
                    )}
                  </div>
                  {/* Expand button */}
                  <button className="absolute top-4 right-4 p-2 bg-black/40 text-white rounded-lg hover:bg-black/60 transition-colors backdrop-blur-sm">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  {/* Nav arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors disabled:opacity-30 backdrop-blur-sm"
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        disabled={currentImageIndex === 0}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors disabled:opacity-30 backdrop-blur-sm"
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        disabled={currentImageIndex === images.length - 1}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  {/* Counter */}
                  <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </div>

                {/* Thumbnail strip */}
                {images.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto bg-slate-900">
                    {images.map((img: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${idx === currentImageIndex ? 'border-emerald-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-75'}`}
                      >
                        <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Title & Price */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight mb-3">
                      {property.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        <span>{property.settlement_name && `${property.settlement_name}, `}{property.municipality_name}</span>
                      </span>
                      {property.address && (
                        <span className="flex items-center gap-1.5">
                          <Home className="w-4 h-4 text-slate-400" />
                          {property.address}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-slate-400" />
                        {property.views?.toLocaleString()} shikime
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                      {formatPrice(property.price, property.listing_type, property.currency)}
                    </div>
                    {property.area_m2 && (
                      <div className="text-xs text-slate-400 mt-0.5">
                        {Math.round(property.price / property.area_m2).toLocaleString()} €/m²
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => setIsFavorited(!isFavorited)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      isFavorited
                        ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                        : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
                    {isFavorited ? 'Ruajtur' : 'Ruaj'}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    {copied ? 'Kopjuar!' : 'Ndaj'}
                  </button>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 hover:border-rose-200 transition-all"
                  >
                    <Flag className="w-4 h-4" />
                    Raportoni
                  </button>
                  <div className="ml-auto text-xs text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Publikuar: {formatDate(property.published_at)}
                  </div>
                </div>
              </div>

              {/* Quick Specs */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs">
                <h2 className="text-base font-black text-slate-900 dark:text-white mb-4">Karakteristikat Kryesore</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                    <Square className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-slate-400">Sipërfaqja</div>
                      <div className="font-black text-slate-900 dark:text-white text-sm">{property.area_m2 ?? '—'} m²</div>
                    </div>
                  </div>
                  {property.bedrooms != null && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                      <BedDouble className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-slate-400">Dhoma gjumi</div>
                        <div className="font-black text-slate-900 dark:text-white text-sm">{property.bedrooms}</div>
                      </div>
                    </div>
                  )}
                  {property.bathrooms != null && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                      <Bath className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-slate-400">Banja</div>
                        <div className="font-black text-slate-900 dark:text-white text-sm">{property.bathrooms}</div>
                      </div>
                    </div>
                  )}
                  {property.floor != null && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                      <Layers className="w-5 h-5 text-violet-500 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-slate-400">Kati</div>
                        <div className="font-black text-slate-900 dark:text-white text-sm">
                          {property.floor === 0 ? 'Përdhes' : `${property.floor}/${property.total_floors ?? '?'}`}
                        </div>
                      </div>
                    </div>
                  )}
                  {property.year_built && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                      <Calendar className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-slate-400">Viti ndërtimit</div>
                        <div className="font-black text-slate-900 dark:text-white text-sm">{property.year_built}</div>
                      </div>
                    </div>
                  )}
                  {property.furnished && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                      <Home className="w-5 h-5 text-rose-400 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-slate-400">Mobilimi</div>
                        <div className="font-black text-slate-900 dark:text-white text-sm capitalize">{property.furnished}</div>
                      </div>
                    </div>
                  )}
                  {property.heating_type && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                      <Thermometer className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-slate-400">Ngrohja</div>
                        <div className="font-black text-slate-900 dark:text-white text-sm">{property.heating_type}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Features Grid */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {property.has_balcony && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 px-3 py-1.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ballkon
                    </span>
                  )}
                  {property.has_parking && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 px-3 py-1.5 rounded-full">
                      <Car className="w-3.5 h-3.5" /> Parking
                    </span>
                  )}
                  {property.has_elevator && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 px-3 py-1.5 rounded-full">
                      <Layers className="w-3.5 h-3.5" /> Ashensor
                    </span>
                  )}
                  {property.has_ac && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 px-3 py-1.5 rounded-full">
                      <Wind className="w-3.5 h-3.5" /> Klimatizim
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs">
                <h2 className="text-base font-black text-slate-900 dark:text-white mb-3">Përshkrimi</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {/* Map Placeholder */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs">
                <h2 className="text-base font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-500" /> Vendndodhja
                </h2>
                <div className="bg-slate-100 dark:bg-slate-700 rounded-xl h-56 flex items-center justify-center relative overflow-hidden">
                  {/* Simple visual map placeholder */}
                  <div className="absolute inset-0 opacity-30 dark:opacity-20"
                    style={{
                      backgroundImage: 'radial-gradient(circle at 50% 50%, #10B981 2px, transparent 2px), linear-gradient(0deg, #e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
                      backgroundSize: '48px 48px, 24px 24px, 24px 24px',
                    }}
                  />
                  <div className="relative z-10 text-center px-4">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full border-4 border-white shadow-lg mx-auto mb-3 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{property.municipality_name}</p>
                    {property.settlement_name && <p className="text-xs text-slate-500 dark:text-slate-400">{property.settlement_name}</p>}
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Harta interaktive kërkon Google Maps API Key</p>
                    {property.lat && property.lng && (
                      <a
                        href={`https://www.google.com/maps?q=${property.lat},${property.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline mt-2"
                      >
                        Hap në Google Maps <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                  * Vendndodhja e shfaqur është e përafërt për mbrojtje të privatësisë.
                </p>
              </div>

              {/* Similar Properties */}
              {relatedProperties.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" /> Prona të Ngjashme
                    </h2>
                    <Link href="/prona" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                      Të gjitha <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {relatedProperties.map((rel: any) => (
                      <Link href={`/prona/${rel.id}`} key={rel.id} className="group block">
                        <div className="relative h-32 rounded-xl overflow-hidden mb-2">
                          <img src={rel.cover_image} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <span className={`absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-full ${rel.listing_type === 'shitje' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}`}>
                            {rel.listing_type === 'shitje' ? 'Shitje' : 'Qira'}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 transition-colors">{rel.title}</h4>
                        <p className="text-xs font-black text-emerald-600 mt-0.5">{formatPrice(rel.price, rel.listing_type, rel.currency)}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN — Sticky Contact Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-4">
                {/* Price Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                    {isForSale ? 'Çmimi i shitjes' : 'Çmimi i qirasë'}
                  </div>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    {formatPrice(property.price, property.listing_type, property.currency)}
                  </div>
                  {property.area_m2 && (
                    <div className="text-xs text-slate-400 mt-0.5">
                      ≈ {Math.round(property.price / property.area_m2).toLocaleString()} €/m²
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    Skadon: {formatDate(property.expires_at)}
                  </div>
                </div>

                {/* Seller Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0B192C] to-emerald-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                      {property.owner_name?.[0] ?? 'P'}
                    </div>
                    <div>
                      <div className="font-black text-slate-900 dark:text-white text-sm">{property.owner_name}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          property.owner_type === 'agjenci'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}>
                          {property.owner_type === 'agjenci' ? '🏢 Agjenci' : '👤 Privat'}
                        </span>
                        {property.owner_type === 'agjenci' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <a
                      href={`tel:${property.owner_phone?.replace(/\s/g, '')}`}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-[#0B192C] hover:bg-[#162436] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {property.owner_phone}
                    </a>

                    {property.whatsapp && (
                      <a
                        href={`https://wa.me/${property.whatsapp}?text=${encodeURIComponent(`Përshëndetje! Jam i interesuar për pronën: "${property.title}". A mund të marrim informacion?`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-xl font-bold text-sm transition-colors"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.49" />
                        </svg>
                        WhatsApp
                      </a>
                    )}

                    <button
                      onClick={() => setShowContactForm(!showContactForm)}
                      className="flex items-center justify-center gap-2 w-full py-3 border-2 border-slate-200 dark:border-slate-600 hover:border-emerald-500 hover:text-emerald-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Dërgo Mesazh
                    </button>
                  </div>

                  {/* Contact Form */}
                  {showContactForm && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                      {messageSent ? (
                        <div className="text-center py-3">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Mesazhi u dërgua!</p>
                          <p className="text-xs text-slate-400">Shitësi do t'ju kontaktojë së shpejti.</p>
                        </div>
                      ) : (
                        <form onSubmit={handleSendMessage} className="space-y-3">
                          <textarea
                            value={contactMessage}
                            onChange={e => setContactMessage(e.target.value)}
                            placeholder="Jam i interesuar për këtë pronë. A mund të merremi me telefon?"
                            rows={3}
                            required
                            className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 dark:bg-slate-700 dark:text-white placeholder-slate-400"
                          />
                          <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors">
                            <Mail className="w-3.5 h-3.5" /> Dërgo Mesazhin
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>

                {/* Listing Info */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 text-xs space-y-2">
                  <div className="flex justify-between text-slate-500">
                    <span>ID Pronës:</span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{property.id}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Tipi:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{property.property_type}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Publikuar:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(property.published_at)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Skadon:</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">{formatDate(property.expires_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function PropertyDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 text-sm">Duke ngarkuar pronën...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <PropertyDetailContent />
    </Suspense>
  );
}
