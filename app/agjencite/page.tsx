'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Search, 
  ArrowRight, 
  ExternalLink,
  Users,
  Award,
  Filter
} from 'lucide-react';
import { KOSOVO_MUNICIPALITIES } from '@/lib/locations/kosovo-data';

export interface Agency {
  id: string;
  slug: string;
  name: string;
  logo: string;
  municipality: string;
  address: string;
  arbk_license: string;
  verified: boolean;
  active_listings: number;
  phone: string;
  email: string;
  description: string;
  founded_year: number;
  agents_count: number;
}

export const KOSOVO_AGENCIES: Agency[] = [
  {
    id: 'ag-1',
    slug: 'dardania-real-estate',
    name: 'Dardania Real Estate',
    logo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=300&q=80',
    municipality: 'Prishtinë',
    address: 'Bulevardi Dëshmorët e Kombit, Nr. 45, Prishtinë',
    arbk_license: 'ARBK-810492819',
    verified: true,
    active_listings: 48,
    phone: '+383 44 123 456',
    email: 'info@dardania-estate.ks',
    description: 'Agjenci lidere e patundshmërive në Prishtinë e specializuar në banesa luksoze, vila në Marigona Hill dhe objekte afariste në qendër të kryeqytetit.',
    founded_year: 2016,
    agents_count: 8,
  },
  {
    id: 'ag-2',
    slug: 'prizreni-patundshmeri',
    name: 'Prizreni Patundshmëri',
    logo: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=300&q=80',
    municipality: 'Prizren',
    address: 'Rruga Remzi Ademaj, Nr. 12, Prizren',
    arbk_license: 'ARBK-709182341',
    verified: true,
    active_listings: 32,
    phone: '+383 49 222 333',
    email: 'kontakt@prizreni-patundshmeri.com',
    description: 'Përvoja më e mirë në tregun e pasurive të paluajtshme në rajonin e Prizrenit, Suharekës dhe Rahovecit. Asistencë e plotë noteriale dhe juridike.',
    founded_year: 2018,
    agents_count: 5,
  },
  {
    id: 'ag-3',
    slug: 'dukagjini-estate',
    name: 'Dukagjini Estate Pejë',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80',
    municipality: 'Pejë',
    address: 'Sheshi Shaban Polluzha, Pejë',
    arbk_license: 'ARBK-932148590',
    verified: true,
    active_listings: 24,
    phone: '+383 45 444 555',
    email: 'peja@dukagjini-estate.com',
    description: 'Specialistë për toka bujqësore, troje turistike në Rugovë dhe lokale komerciale në rrethinën e Pejës dhe Deçanit.',
    founded_year: 2020,
    agents_count: 4,
  },
  {
    id: 'ag-4',
    slug: 'ferizaj-invest-estate',
    name: 'Ferizaj Invest Patundshmëri',
    logo: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=300&q=80',
    municipality: 'Ferizaj',
    address: 'Rruga Dëshmorët e Kombit, Ferizaj',
    arbk_license: 'ARBK-628491023',
    verified: true,
    active_listings: 19,
    phone: '+383 44 888 999',
    email: 'info@ferizajinvest.com',
    description: 'Zona Industriale, magazina dhe banesa të reja me çmime të përballueshme në qytetin dinamik të Ferizajit dhe Shtimes.',
    founded_year: 2021,
    agents_count: 3,
  },
  {
    id: 'ag-5',
    slug: 'anamorava-properties',
    name: 'Anamorava Real Estate Gjilan',
    logo: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=300&q=80',
    municipality: 'Gjilan',
    address: 'Bulevardi i Pavarësisë, Gjilan',
    arbk_license: 'ARBK-551029384',
    verified: false,
    active_listings: 14,
    phone: '+383 49 777 666',
    email: 'zyra@anamorava-estate.com',
    description: 'Ndërmjetësim i sigurt për pronat në Gjilan, Kamenicë dhe Viti. Vlerësim profesional dhe promovim digjital i avancuar.',
    founded_year: 2022,
    agents_count: 3,
  },
];

export default function AgenciesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');

  const filteredAgencies = KOSOVO_AGENCIES.filter(agency => {
    const matchesSearch = agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          agency.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMunicipality = !selectedMunicipality || agency.municipality === selectedMunicipality;
    return matchesSearch && matchesMunicipality;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      {/* Hero Header */}
      <div className="bg-[#0B192C] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4 border border-emerald-500/30">
            <Award className="w-3.5 h-3.5" />
            <span>Agjenci të Licencuara & Verifikuara në Kosovë</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
            Agjencitë e Patundshmërive
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            Gjeni agjencinë e duhur për blerjen, shitjen apo marrjen me qira të pronës suaj në të 38 komunat e Republikës së Kosovës.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search & Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-8 flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Kërko agjenci sipas emrit ose përshkrimit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
            />
          </div>

          <div className="w-full md:w-64">
            <select
              value={selectedMunicipality}
              onChange={(e) => setSelectedMunicipality(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-700"
            >
              <option value="">Të gjitha Komunat</option>
              {KOSOVO_MUNICIPALITIES.map(m => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Agencies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgencies.map((agency) => (
            <div
              key={agency.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-500/50 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <img
                      src={agency.logo}
                      alt={agency.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    {agency.verified ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2.5 py-1 rounded-full">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verifikuar</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-medium px-2 py-0.5 rounded-full">
                        E Regjistruar
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-1">
                  {agency.name}
                </h3>

                <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{agency.municipality}, Kosovë</span>
                </p>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  {agency.description}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Prona Aktive</span>
                    <span className="font-bold text-slate-800">{agency.active_listings} shpallje</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Agjentë</span>
                    <span className="font-bold text-slate-800">{agency.agents_count} profesionistë</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  {agency.arbk_license}
                </span>
                <Link
                  href={`/agjencite/${agency.slug}`}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Shiko Profilin</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredAgencies.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">Nuk u gjet asnjë agjenci</h3>
            <p className="text-xs text-slate-500">
              Provoni të ndryshoni kriteret e kërkimit ose komunën e përzgjedhur.
            </p>
          </div>
        )}

        {/* Agency CTA */}
        <div className="mt-12 bg-gradient-to-r from-[#0B192C] to-[#1E3E62] rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider block mb-1">
              Për Agjencitë e Patundshmërive
            </span>
            <h2 className="text-xl sm:text-2xl font-black mb-2">
              Jeni agjenci e licencuar në Kosovë?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Hapni llogarinë tuaj të biznesit në PronaX, verifikoni licencën ARBK dhe publikoni pronat tuaja me dukshmëri maksimale.
            </p>
          </div>
          <Link
            href="/regjistrohu?roli=agjenci"
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/40 whitespace-nowrap transition-all"
          >
            Regjistro Agjencinë Tënde
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
