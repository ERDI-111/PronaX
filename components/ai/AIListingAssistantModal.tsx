'use client';

import React, { useState } from 'react';
import { Sparkles, Check, X, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import { ListingAssistance } from '@/lib/ai/types';

interface AIListingAssistantModalProps {
  formData: {
    propertyType: string;
    listingType: 'shitje' | 'qira';
    municipality: string;
    settlement?: string;
    price: number;
    areaM2?: number;
    bedrooms?: number;
    bathrooms?: number;
    floor?: number;
    userNotes?: string;
  };
  onApply: (content: { title: string; description: string }) => void;
}

export function AIListingAssistantModal({ formData, onApply }: AIListingAssistantModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ListingAssistance | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');

  const handleGenerate = async () => {
    setIsLoading(true);
    setIsOpen(true);

    try {
      // Përdorim orkestratorin e Agent 2
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'listing_assistant',
          message: JSON.stringify(formData),
          context: formData,
        }),
      });

      const data = await res.json();

      // Përpunojmë përgjigjen
      let parsedAssistance: ListingAssistance;
      try {
        const jsonMatch = data.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedAssistance = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Not JSON');
        }
      } catch {
        // Fallback strukturuar
        const qyteti = formData.municipality || 'Kosovë';
        const lloji = formData.propertyType === 'banese' ? 'Banesë' : formData.propertyType === 'shtepi' ? 'Shtëpi' : 'Pronë';
        const veprimi = formData.listingType === 'qira' ? 'me Qira' : 'në Shitje';
        const siperfaqja = formData.areaM2 ? ` (${formData.areaM2} m²)` : '';

        parsedAssistance = {
          suggestedTitle: `${lloji} ${veprimi} në ${qyteti}${siperfaqja}`,
          suggestedDescription: data.content,
          keywords: [formData.propertyType, formData.listingType, formData.municipality],
          missingFields: formData.areaM2 ? [] : ['Sipërfaqja në m²'],
          qualityScore: formData.areaM2 && formData.price > 0 ? 90 : 70,
          approved: false,
        };
      }

      setResult(parsedAssistance);
      setEditedTitle(parsedAssistance.suggestedTitle);
      setEditedDescription(parsedAssistance.suggestedDescription);
    } catch (err) {
      console.error('Gabim gjatë gjenerimit me AI:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmApply = () => {
    if (editedTitle && editedDescription) {
      onApply({
        title: editedTitle,
        description: editedDescription,
      });
      setIsOpen(false);
    }
  };

  return (
    <div>
      {/* Butoni nxitës në formular */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-semibold text-xs sm:text-sm rounded-xl border border-emerald-300 dark:border-emerald-700/60 transition-all active:scale-95 shadow-sm"
      >
        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span>Përmirëso / Gjenero me PronaX AI</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Asistenti i Shpalljeve PronaX AI
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sugjerim profesional — kërkon aprovimin tuaj
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {isLoading && (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <Sparkles className="w-8 h-8 text-emerald-500 animate-spin" />
                  <p className="text-sm font-medium">PronaX AI po analizon të dhënat e pronës suaj...</p>
                </div>
              )}

              {!isLoading && result && (
                <>
                  {/* Quality Score & Missing fields */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        Cilësia e Shpalljes:
                      </span>{' '}
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {result.qualityScore} / 100
                      </span>
                    </div>

                    {result.missingFields.length > 0 && (
                      <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Mungon: {result.missingFields.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Titulli i Sugjeruar */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Titulli i Sugjeruar (Mund ta modifikoni):
                    </label>
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="w-full text-sm font-semibold p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Përshkrimi i Sugjeruar */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Përshkrimi Profesional:
                    </label>
                    <textarea
                      rows={6}
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none leading-relaxed"
                    />
                  </div>

                  {/* Fjalët Kyçe */}
                  {result.keywords && result.keywords.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                        Fjalë Kyçe (SEO):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {result.keywords.map((kw, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Siguria & Aprovimi */}
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                    <Shield className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>
                      Përmbajtja do të vendoset në formular vetëm pasi të klikoni butonin{' '}
                      <strong>"Apliko në Shpallje"</strong>.
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Anulo
              </button>

              <button
                type="button"
                onClick={handleConfirmApply}
                disabled={isLoading || !editedTitle || !editedDescription}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl shadow transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Apliko në Shpallje</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
