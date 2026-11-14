'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Search, ArrowRight } from 'lucide-react';
import { SearchFilters } from '@/lib/ai/types';

export function AISmartSearchBar() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    setIsSearching(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'smart_search',
          message: cleanQuery,
        }),
      });

      const data = await res.json();
      let filters: Partial<SearchFilters> = {};

      try {
        const jsonMatch = data.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          filters = JSON.parse(jsonMatch[0]);
        }
      } catch {
        // Fallback
      }

      // Ndërto parametrat e URL-së për te /prona
      const params = new URLSearchParams();
      if (cleanQuery) params.set('q', cleanQuery);
      if (filters.municipality) params.set('municipality', filters.municipality);
      if (filters.propertyType) params.set('type', filters.propertyType);
      if (filters.listingType) params.set('listing_type', filters.listingType);
      if (filters.maxPrice) params.set('max_price', filters.maxPrice.toString());
      if (filters.minPrice) params.set('min_price', filters.minPrice.toString());

      router.push(`/prona?${params.toString()}`);
    } catch (err) {
      // Në rast gabimi, kërko me tekst të thjeshtë
      router.push(`/prona?q=${encodeURIComponent(cleanQuery)}`);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSearch} className="relative flex items-center">
        <div className="absolute left-4 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 pointer-events-none">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded">
            AI Search
          </span>
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Kërko me gjuhë natyrore: p.sh. Banesë në Pejë nën 80 mijë euro me qira..."
          disabled={isSearching}
          className="w-full pl-12 sm:pl-28 pr-14 sm:pr-32 py-3.5 sm:py-4 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-medium border border-slate-200 dark:border-slate-800 shadow-lg focus:outline-none focus:border-emerald-500 transition-all placeholder:text-slate-400"
        />

        <div className="absolute right-2 flex items-center">
          <button
            type="submit"
            disabled={!query.trim() || isSearching}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow active:scale-95"
          >
            {isSearching ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Kërko</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Shembuj të shpejtë kërkimi */}
      <div className="mt-2 flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-500 dark:text-slate-400 px-2 scrollbar-none">
        <span className="shrink-0 font-medium text-slate-400">Shembuj:</span>
        {[
          'Banesë në Pejë nën 80,000 €',
          'Shtëpi në Prishtinë me 3 dhoma',
          'Qira në Pejë nën 300 €',
          'Tokë në Prizren',
        ].map((example, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setQuery(example);
            }}
            className="shrink-0 hover:text-emerald-600 dark:hover:text-emerald-400 underline decoration-slate-300 dark:decoration-slate-700 hover:decoration-emerald-500 transition-colors"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
