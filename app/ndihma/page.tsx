'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  HelpCircle, 
  Search, 
  Euro, 
  Clock, 
  ShieldCheck, 
  Building2, 
  Phone, 
  Mail, 
  ChevronDown, 
  ChevronUp, 
  FileText,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface HelpArticle {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const HELP_ARTICLES: HelpArticle[] = [
  {
    id: 'h1',
    category: 'pagesat',
    question: 'Sa kushton publikimi i një prone në PronaX?',
    answer: 'Publikimi i çdo prone në PronaX kushton saktësisht 7.00 € (tarifë fikse e njëhershme). Nuk ka asnjë tarifë të fshehur, abonim mujor apo ripërtëritje automatike.',
  },
  {
    id: 'h2',
    category: 'publikimi',
    question: 'Sa kohë mbetet prona aktive pas pagesës?',
    answer: 'Çdo shpallje e paguar dhe e miratuar mbetet plotësisht aktive për ekzaktësisht 30 ditë kalendarike. Pas 30 ditëve, prona kalon automatikisht në statusin "e skaduar" dhe hiqet nga kërkimi publik dhe harta.',
  },
  {
    id: 'h3',
    category: 'pagesat',
    question: 'Si bëhet rinovimi i shpalljes pas skadimit?',
    answer: 'Rinovimi bëhet manualisht nga paneli juaj i përdoruesit ("Pronat e Mia"). Për të riaktivizuar pronën për 30 ditë të tjera, kryhet një pagesë e re prej 7.00 €. Sistemi ynë nuk bën kurrë debitime automatike në kartelën tuaj bankare.',
  },
  {
    id: 'h4',
    category: 'agjencite',
    question: 'Si verifikohen agjencitë e patundshmërive?',
    answer: 'Gjatë regjistrimit si agjenci, kërkohet numri i certifikatës ARBK dhe adresa e zyrës. Administratorët tanë kryejnë verifikimin në regjistrin zyrtar brenda 24–48 orëve para se profilit t\'i jepet vula e verifikimit.',
  },
  {
    id: 'h5',
    category: 'siguria',
    question: 'A ruhen të dhënat e kartelës time bankare në PronaX?',
    answer: 'Jo, kurrë. PronaX nuk ruan asnjë numër kartele, CVV apo të dhëna bankare. Të gjitha transaksionet procesohen në mënyrë të enkriptuar përmes ofruesve të autorizuar (Paysera ose Virtual POS i bankave të Kosovës).',
  },
  {
    id: 'h6',
    category: 'publikimi',
    question: 'Sa fotografi mund të ngarkoj për pronën time?',
    answer: 'Ju mund të ngarkoni nga 1 deri në 30 fotografi me cilësi të lartë (JPG, PNG ose WEBP) me madhësi deri në 10 MB për secilën foto.',
  },
  {
    id: 'h7',
    category: 'siguria',
    question: 'Si mund të raportoj një shpallje të dyshimtë apo mashtruese?',
    answer: 'Në çdo faqe të detajeve të pronës ekziston butoni "Raportoni". Zgjidhni arsyen (çmim i rremë, e dubluar, etj.) dhe ekipi ynë i moderimit do ta shqyrtojë rastin me përparësi të lartë.',
  },
  {
    id: 'h8',
    category: 'lokacionet',
    question: 'A mbulohen të gjitha komunat e Kosovës?',
    answer: 'Po! PronaX mbulon të gjitha 38 komunat e Republikës së Kosovës me vendbanimet, fshatrat dhe lagjet përkatëse, duke përfshirë kërkimin interaktiv me hartë.',
  },
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openArticleId, setOpenArticleId] = useState<string | null>('h1');

  const filteredArticles = HELP_ARTICLES.filter((article) => {
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
    const matchesSearch =
      article.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'Të Gjitha' },
    { id: 'pagesat', label: 'Tarifat & Pagesat' },
    { id: 'publikimi', label: 'Publikimi 30-Ditor' },
    { id: 'agjencite', label: 'Agjencitë & ARBK' },
    { id: 'siguria', label: 'Siguria & Privatësia' },
    { id: 'lokacionet', label: 'Komunat e Kosovës' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-4 h-4" />
            <span>Qendra e Ndihmës & Mbështetjes</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Si mund t&apos;ju ndihmojmë sot?
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Gjeni përgjigje të shpejta rreth publikimit, pagesës fikse 7 €, rregullit 30-ditor dhe sigurisë në PronaX.
          </p>

          {/* Search Box */}
          <div className="relative mt-6 max-w-lg mx-auto">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Kërkoni pyetje, p.sh. tarifa 7 €, skadimi, agjencitë..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#0B192C] text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3 mb-12">
          {filteredArticles.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 text-center text-slate-500">
              Nuk u gjet asnjë artikull për kërkimin tuaj. Provoni fjalë të tjera kyçe.
            </div>
          ) : (
            filteredArticles.map((article) => {
              const isOpen = openArticleId === article.id;
              return (
                <div
                  key={article.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs transition-colors"
                >
                  <button
                    onClick={() => setOpenArticleId(isOpen ? null : article.id)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white"
                  >
                    <span>{article.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/50">
                      {article.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Contact Support Box */}
        <div className="bg-gradient-to-br from-[#0B192C] to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black mb-2">
              Nuk gjetët përgjigjen që kërkoni?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
              Ekipi i mbështetjes së PronaX është në dispozicion për t&apos;ju ndihmuar me çdo paqartësi teknike ose pagese.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/kontakti"
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-3 rounded-xl transition-all text-xs"
            >
              <Mail className="w-4 h-4" />
              <span>Dërgo Mesazh</span>
            </Link>
            <a
              href="mailto:pronaxestate@outlook.com"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3 rounded-xl transition-all text-xs border border-white/20"
            >
              <span>pronaxestate@outlook.com</span>
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
