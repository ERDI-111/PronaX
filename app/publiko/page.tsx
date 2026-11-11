'use client';

import React, { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  KOSOVO_MUNICIPALITIES, 
  PROPERTY_CATEGORIES, 
  getMunicipality 
} from '@/lib/locations/kosovo-data';
import { SecuritySanitizer } from '@/lib/security/sanitize';
import { 
  Building2, 
  Home, 
  MapPin, 
  Euro, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Camera, 
  Upload, 
  Trash2, 
  Star, 
  User, 
  Phone, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Eye, 
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function PropertyPublishingWizard() {
  const router = useRouter();

  // Wizard Step (1 to 8)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Purpose
    listing_type: 'shitje', // 'shitje' | 'qira'

    // Step 2: Category
    property_type: 'Banesë',

    // Step 3: Basic Info
    title: '',
    description: '',
    price: '',
    currency: 'EUR',
    municipality_id: 'Prishtinë',
    settlement_id: 'Bregu i Diellit',
    address: '',
    area_m2: '',

    // Step 4: Conditional Details
    bedrooms: '2',
    bathrooms: '1',
    living_rooms: '1',
    floor: '3',
    total_floors: '7',
    year_built: '2022',
    furnished: 'po', // 'po' | 'jo' | 'gjysme'
    heating_type: 'Termokos',
    balcony: true,
    parking: true,
    elevator: true,
    air_conditioning: true,
    // Land specific
    land_category: 'Ndërtimore',
    construction_permission: true,
    road_access: true,
    utilities_available: true,
    // Commercial specific
    commercial_rooms: '3',
    commercial_usage: 'Zyre / Administratë',

    // Step 5: Images & Media
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    ] as string[],
    cover_image_index: 0,
    video_url: '',

    // Step 6: Seller Info
    seller_name: 'Erdis Berisha',
    seller_phone: '+383 44 200 300',
    seller_email: 'pronaxestate@outlook.com',
    seller_type: 'private', // 'private' | 'agency'
    agency_name: '',
    whatsapp_available: true,
    hide_phone_publicly: false,
  });

  const selectedMunicipality = getMunicipality(formData.municipality_id) || KOSOVO_MUNICIPALITIES[0];

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMunicipalityChange = (municipalityName: string) => {
    const mun = getMunicipality(municipalityName);
    const firstSettlement = mun?.settlements[0]?.name || 'Qendra';
    setFormData((prev) => ({
      ...prev,
      municipality_id: municipalityName,
      settlement_id: firstSettlement,
    }));
  };

  const handleAddSampleImage = () => {
    if (formData.images.length >= 30) {
      alert('Keni arritur numrin maksimal prej 30 fotografive.');
      return;
    }
    const samplePool = [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80',
    ];
    const nextImg = samplePool[formData.images.length % samplePool.length];
    updateField('images', [...formData.images, nextImg]);
  };

  const handleRemoveImage = (index: number) => {
    const updated = formData.images.filter((_, i) => i !== index);
    updateField('images', updated);
    if (formData.cover_image_index >= updated.length) {
      updateField('cover_image_index', 0);
    }
  };

  const validateStep = (step: number): boolean => {
    setError(null);
    if (step === 3) {
      if (!formData.title.trim()) {
        setError('Ju lutem vendosni titullin e pronës.');
        return false;
      }
      if (!formData.price || parseFloat(formData.price) <= 0) {
        setError('Ju lutem vendosni një çmim të vlefshëm në Euro.');
        return false;
      }
      if (!formData.area_m2 || parseFloat(formData.area_m2) <= 0) {
        setError('Ju lutem vendosni sipërfaqen në m².');
        return false;
      }
    }
    if (step === 5) {
      if (formData.images.length === 0) {
        setError('Ju lutem ngarkoni të paktën 1 fotografi të pronës.');
        return false;
      }
    }
    if (step === 6) {
      if (!formData.seller_name.trim()) {
        setError('Ju lutem plotësoni emrin e shitësit.');
        return false;
      }
      if (!formData.seller_phone.trim()) {
        setError('Ju lutem plotësoni numrin e telefonit për kontakt.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 8));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit and redirect to €7 payment
  const handleProceedToPayment = async () => {
    setSubmitting(true);
    setError(null);

    try {
      // In production, save property draft with status 'pending_payment'
      const generatedPropertyId = `prop-ks-${Date.now().toString().slice(-5)}`;

      // Redirect directly to the €7 checkout workflow (Phase 7)
      router.push(`/pagesa/${generatedPropertyId}?purpose=new_listing`);
    } catch (err: any) {
      setError(err.message || 'Dështoi ruajtja e pronës.');
      setSubmitting(false);
    }
  };

  const isLand = formData.property_type === 'Truall' || formData.property_type === 'Tokë bujqësore';
  const isCommercial = [
    'Lokal afarist', 
    'Zyrë', 
    'Depo', 
    'Ndërtesë', 
    'Objekt industrial', 
    'Objekt komercial'
  ].includes(formData.property_type);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Wizard Steps Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
            <span className="text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Hapi {currentStep} nga 8</span>
            </span>
            <span className="text-slate-400">Tarifa e publikimit: 7.00 € (30 ditë)</span>
          </div>

          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-600 h-full transition-all duration-300"
              style={{ width: `${(currentStep / 8) * 100}%` }}
            />
          </div>

          {/* Steps title bar */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B192C] tracking-tight">
              {currentStep === 1 && 'Hapi 1: Zgjidhni Qëllimin e Pronës'}
              {currentStep === 2 && 'Hapi 2: Zgjidhni Kategorinë e Pronës'}
              {currentStep === 3 && 'Hapi 3: Informacionet Bazë & Vendndodhja në Kosovë'}
              {currentStep === 4 && 'Hapi 4: Specifikat dhe Detajet e Pronës'}
              {currentStep === 5 && 'Hapi 5: Fotografitë dhe Mediat (1–30 Foto)'}
              {currentStep === 6 && 'Hapi 6: Informacionet e Shitësit'}
              {currentStep === 7 && 'Hapi 7: Pamja Paraprake e Shpalljes'}
              {currentStep === 8 && 'Hapi 8: Pagesa e Sigurt & Aktivizimi (7.00 €)'}
            </h1>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Wizard Card Body */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm">
          {/* STEP 1: Purpose */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <p className="text-xs text-slate-500">A dëshironi ta shisni apo ta lëshoni me qira këtë pronë?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => updateField('listing_type', 'shitje')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    formData.listing_type === 'shitje'
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-lg font-black text-[#0B192C] block">Në Shitje</span>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Për prona që ofrohen për shitblerje të plotë.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => updateField('listing_type', 'qira')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    formData.listing_type === 'qira'
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-lg font-black text-[#0B192C] block">Me Qira</span>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Për qiradhënie mujore ose afatgjatë.
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Category */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <p className="text-xs text-slate-500">Përzgjidhni llojin e saktë të patundshmërisë:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {PROPERTY_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => updateField('property_type', cat.label)}
                    className={`p-4 rounded-xl border text-center transition-all text-xs font-bold ${
                      formData.property_type === cat.label
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Basic Info & Kosovo Municipality */}
          {currentStep === 3 && (
            <div className="space-y-5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Titulli i Shpalljes *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="psh. Banesë luksoze me 2 dhoma në Bregun e Diellit"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Çmimi në Euro (€) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => updateField('price', e.target.value)}
                    placeholder="psh. 95000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sipërfaqja në m² *</label>
                  <input
                    type="number"
                    value={formData.area_m2}
                    onChange={(e) => updateField('area_m2', e.target.value)}
                    placeholder="psh. 85"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Kosovo 38 Municipalities Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Komuna (Republika e Kosovës) *</label>
                  <select
                    value={formData.municipality_id}
                    onChange={(e) => handleMunicipalityChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {KOSOVO_MUNICIPALITIES.map((mun) => (
                      <option key={mun.id} value={mun.name}>
                        {mun.name} ({mun.region})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vendbanimi / Lagjja *</label>
                  <select
                    value={formData.settlement_id}
                    onChange={(e) => updateField('settlement_id', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {selectedMunicipality.settlements.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Rruga / Adresa e Përafërt</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="psh. Rruga Gazmend Zajmi, Hyrja 2"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Përshkrimi i Detajuar</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Shpjegoni orientimin, organizimin e brendshëm, afërsinë me shkollat, transportin publik etj."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Conditional Property Details */}
          {currentStep === 4 && (
            <div className="space-y-5 text-xs">
              {/* If Apartment or House */}
              {!isLand && !isCommercial && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Dhoma Gjumi</label>
                      <select 
                        value={formData.bedrooms}
                        onChange={(e) => updateField('bedrooms', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      >
                        <option>1</option><option>2</option><option>3</option><option>4</option><option>5+</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Banjo</label>
                      <select 
                        value={formData.bathrooms}
                        onChange={(e) => updateField('bathrooms', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      >
                        <option>1</option><option>2</option><option>3</option><option>4+</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Kati</label>
                      <input 
                        type="number"
                        value={formData.floor}
                        onChange={(e) => updateField('floor', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Viti i Ndërtimit</label>
                      <input 
                        type="number"
                        value={formData.year_built}
                        onChange={(e) => updateField('year_built', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Mobilimi</label>
                      <select 
                        value={formData.furnished}
                        onChange={(e) => updateField('furnished', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      >
                        <option value="po">Plotësisht e mobiluar</option>
                        <option value="gjysme">Pjesërisht e mobiluar</option>
                        <option value="jo">E pamobiluar</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Lloji i Ngrohjes</label>
                      <select 
                        value={formData.heating_type}
                        onChange={(e) => updateField('heating_type', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      >
                        <option>Termokos (Ngrohje Qendrore)</option>
                        <option>Ngrohje me Rrymë</option>
                        <option>Pompë Termike</option>
                        <option>Pelet / Dru</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.balcony}
                        onChange={(e) => updateField('balcony', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>Ballkon</span>
                    </label>

                    <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.parking}
                        onChange={(e) => updateField('parking', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>Parking / Garazh</span>
                    </label>

                    <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.elevator}
                        onChange={(e) => updateField('elevator', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>Ashensor</span>
                    </label>

                    <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.air_conditioning}
                        onChange={(e) => updateField('air_conditioning', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>Klimatizim</span>
                    </label>
                  </div>
                </>
              )}

              {/* If Land */}
              {isLand && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Kategoria e Tokës</label>
                      <select 
                        value={formData.land_category}
                        onChange={(e) => updateField('land_category', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      >
                        <option>Ndërtimore</option>
                        <option>Bujqësore</option>
                        <option>Industriale</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.construction_permission}
                        onChange={(e) => updateField('construction_permission', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>Leje Ndërtimi</span>
                    </label>

                    <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.road_access}
                        onChange={(e) => updateField('road_access', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>Qasje në Rrugë Asfalti</span>
                    </label>

                    <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.utilities_available}
                        onChange={(e) => updateField('utilities_available', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>Ujë & Rrymë në Vend</span>
                    </label>
                  </div>
                </div>
              )}

              {/* If Commercial */}
              {isCommercial && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Qëllimi i Përdorimit</label>
                      <input 
                        type="text"
                        value={formData.commercial_usage}
                        onChange={(e) => updateField('commercial_usage', e.target.value)}
                        placeholder="psh. Zyra, Klinikë, Bankë, Restorant"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Numri i Hapësirave / Zyrave</label>
                      <input 
                        type="number"
                        value={formData.commercial_rooms}
                        onChange={(e) => updateField('commercial_rooms', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Images & Media */}
          {currentStep === 5 && (
            <div className="space-y-6 text-xs">
              <div>
                <span className="font-bold text-slate-800 block mb-1">Ngarkoni Fotografitë (1 deri 30 Foto)</span>
                <p className="text-slate-500">Formatet e lejuara: JPG, PNG, WEBP. Maksimumi 10 MB për secilën foto.</p>
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {formData.images.map((imgUrl, idx) => (
                  <div 
                    key={idx} 
                    className={`relative rounded-2xl overflow-hidden border-2 aspect-video bg-slate-100 group ${
                      formData.cover_image_index === idx ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-slate-200'
                    }`}
                  >
                    <img src={imgUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                    
                    {formData.cover_image_index === idx && (
                      <span className="absolute top-2 left-2 bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow">
                        Kryesore
                      </span>
                    )}

                    <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateField('cover_image_index', idx)}
                        className="p-1.5 rounded-lg bg-white/90 text-slate-800 hover:bg-white"
                        title="Vendos si foto kryesore"
                      >
                        <Star className="w-4 h-4 text-amber-500 fill-current" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                        title="Fshij foton"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Photo Button */}
                <button
                  type="button"
                  onClick={handleAddSampleImage}
                  className="rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 aspect-video flex flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-emerald-700 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span className="font-semibold text-[11px]">Shto Foto (+1)</span>
                </button>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lidhja e Videos (YouTube / Vimeo - Opsionale)</label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => updateField('video_url', e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* STEP 6: Seller Information */}
          {currentStep === 6 && (
            <div className="space-y-5 text-xs">
              <div className="grid grid-cols-2 gap-3 mb-2">
                <button
                  type="button"
                  onClick={() => updateField('seller_type', 'private')}
                  className={`p-3.5 rounded-xl border text-center font-bold ${
                    formData.seller_type === 'private' ? 'bg-emerald-50 border-emerald-600 text-emerald-800' : 'border-slate-200 text-slate-700'
                  }`}
                >
                  Shitës Privat (Pronar)
                </button>
                <button
                  type="button"
                  onClick={() => updateField('seller_type', 'agency')}
                  className={`p-3.5 rounded-xl border text-center font-bold ${
                    formData.seller_type === 'agency' ? 'bg-emerald-50 border-emerald-600 text-emerald-800' : 'border-slate-200 text-slate-700'
                  }`}
                >
                  Agjenci e Patundshmërive
                </button>
              </div>

              {formData.seller_type === 'agency' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Emri i Agjencisë *</label>
                  <input
                    type="text"
                    value={formData.agency_name}
                    onChange={(e) => updateField('agency_name', e.target.value)}
                    placeholder="psh. Agjencia PronaX Real Estate"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Emri dhe Mbiemri i Kontaktit *</label>
                  <input
                    type="text"
                    value={formData.seller_name}
                    onChange={(e) => updateField('seller_name', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Numri i Telefonit *</label>
                  <input
                    type="tel"
                    value={formData.seller_phone}
                    onChange={(e) => updateField('seller_phone', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Adresa për Njoftime *</label>
                <input
                  type="email"
                  value={formData.seller_email}
                  onChange={(e) => updateField('seller_email', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-2 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.whatsapp_available}
                    onChange={(e) => updateField('whatsapp_available', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Ky numër telefoni ka WhatsApp aktiv për kontakte të shpejta</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hide_phone_publicly}
                    onChange={(e) => updateField('hide_phone_publicly', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Fshih numrin e telefonit publikisht (blerësit do t'ju kontaktojnë vetëm me mesazh të brendshëm)</span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 7: Live Public Preview */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600" />
                <span>Kjo është pamja e saktë se si do të duket prona juaj publikisht në PronaX pas aktivizimit.</span>
              </div>

              {/* Mock Property Card */}
              <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-sm bg-white">
                <div className="relative aspect-video bg-slate-900">
                  <img 
                    src={formData.images[formData.cover_image_index] || formData.images[0]} 
                    alt="Cover" 
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-emerald-600 text-white font-bold text-xs px-3 py-1 rounded-lg">
                    {formData.listing_type === 'shitje' ? 'Në Shitje' : 'Me Qira'}
                  </span>
                  <span className="absolute bottom-3 right-3 bg-slate-900/80 text-white font-black text-lg px-3 py-1 rounded-lg">
                    {Number(formData.price || 0).toLocaleString()} €
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="text-xl font-black text-[#0B192C]">{formData.title || 'Titulli i Pronës'}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>{formData.settlement_id}, {formData.municipality_id} (Kosovë)</span>
                  </div>

                  <div className="flex gap-4 pt-2 border-t border-slate-100 text-xs text-slate-700 font-semibold">
                    <span>{formData.area_m2} m²</span>
                    <span>•</span>
                    <span>{formData.property_type}</span>
                    <span>•</span>
                    <span>{formData.bedrooms} Dhoma Gjumi</span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 pt-2">
                    {formData.description || 'Përshkrimi i pronës...'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: Proceed to €7 Payment */}
          {currentStep === 8 && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Euro className="w-8 h-8" />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-2xl font-black text-[#0B192C]">Gati për Publikim & Aktivizim</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Prona juaj u verifikua. Për ta aktivizuar atë për <strong>30 ditë kalendarike</strong> në të gjithë Kosovën, tarifa standarde është <strong>7.00 €</strong>.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 max-w-sm mx-auto text-xs space-y-2 text-left">
                <div className="flex justify-between">
                  <span>Tarifa e publikimit:</span>
                  <span className="font-bold text-slate-900">7.00 €</span>
                </div>
                <div className="flex justify-between">
                  <span>Kohëzgjatja:</span>
                  <span className="font-bold text-slate-900">30 Ditë</span>
                </div>
                <div className="flex justify-between">
                  <span>Ripërtëritje automatike:</span>
                  <span className="font-bold text-emerald-600">Jo (0.00 €)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToPayment}
                disabled={submitting}
                className="w-full max-w-sm mx-auto py-3.5 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-700/20 text-sm flex items-center justify-center gap-2"
              >
                {submitting ? 'Duke përgatitur pagesën...' : 'Vazhdo te Pagesa e Sigurt (7.00 €)'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Wizard Controls Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Prapa</span>
              </button>
            ) : <div />}

            {currentStep < 8 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2.5 rounded-xl bg-[#0B192C] hover:bg-[#1E3E62] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <span>Vazhdo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
