'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Calculator, 
  Euro, 
  Calendar, 
  Percent, 
  HelpCircle, 
  PieChart as PieChartIcon, 
  Building2, 
  ShieldCheck, 
  ArrowRight,
  TrendingDown
} from 'lucide-react';

export default function MortgageCalculatorPage() {
  const propertyPriceId = useId();
  const downPaymentPercentId = useId();
  const downPaymentEurId = useId();
  const loanTermId = useId();
  const interestRateId = useId();

  // Inputs
  const [propertyPrice, setPropertyPrice] = useState<number>(100000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [loanTermYears, setLoanTermYears] = useState<number>(20);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(4.2);

  // Calculations
  const downPaymentAmount = (propertyPrice * downPaymentPercent) / 100;
  const loanAmount = Math.max(0, propertyPrice - downPaymentAmount);

  const calculateMonthlyPayment = () => {
    if (loanAmount <= 0) return 0;
    const monthlyRate = annualInterestRate / 100 / 12;
    const totalPayments = loanTermYears * 12;
    if (monthlyRate === 0) return loanAmount / totalPayments;

    const monthly =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1);
    return isNaN(monthly) ? 0 : monthly;
  };

  const monthlyPayment = calculateMonthlyPayment();
  const totalRepayment = monthlyPayment * loanTermYears * 12;
  const totalInterest = Math.max(0, totalRepayment - loanAmount);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Calculator className="w-4 h-4" />
            <span>Kalkulatori Financiar PronaX</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Kalkulatori i Kredisë Hipotekare
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Llogaritni këstin mujor, interesin e përgjithshëm dhe planin e pagesës sipas kushteve të tregut bankar në Republikën e Kosovës.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-lg font-black text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-700">
              Parametrat e Kredisë
            </h2>

            {/* Çmimi i Pronës */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor={propertyPriceId} className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Çmimi i Pronës (€)
                </label>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  {propertyPrice.toLocaleString()} €
                </span>
              </div>
              <input
                id={propertyPriceId}
                type="range"
                min="20000"
                max="500000"
                step="5000"
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>20,000 €</span>
                <span>250,000 €</span>
                <span>500,000 €</span>
              </div>
            </div>

            {/* Pjesëmarrja Vetjake (Down Payment) */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor={downPaymentPercentId} className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Pjesëmarrja Vetjake ({downPaymentPercent}%)
                </label>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {downPaymentAmount.toLocaleString()} €
                </span>
              </div>
              <input
                id={downPaymentPercentId}
                type="range"
                min="10"
                max="50"
                step="5"
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>10% (Minimi standard)</span>
                <span>20% (Rekomanduar)</span>
                <span>50%</span>
              </div>
            </div>

            {/* Afati i Shlyerjes (Vite) */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor={loanTermId} className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Afati i Shlyerjes (Vite)
                </label>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {loanTermYears} Vite ({loanTermYears * 12} Muaj)
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[10, 15, 20, 25].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setLoanTermYears(term)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      loanTermYears === term
                        ? 'bg-[#0B192C] text-white border-[#0B192C]'
                        : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {term} Vite
                  </button>
                ))}
              </div>
            </div>

            {/* Norma e Interesit */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor={interestRateId} className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Norma Vjetore e Interesit (%)
                </label>
                <span className="font-black text-blue-600 dark:text-blue-400 text-sm">
                  {annualInterestRate.toFixed(1)} %
                </span>
              </div>
              <input
                id={interestRateId}
                type="range"
                min="3.0"
                max="8.0"
                step="0.1"
                value={annualInterestRate}
                onChange={(e) => setAnnualInterestRate(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>3.0%</span>
                <span>Mesatarja në Kosovë (~4.0% - 4.5%)</span>
                <span>8.0%</span>
              </div>
            </div>

            {/* Bank Reference Note */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 flex items-start gap-3 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                Normat e interesit në bankat e Kosovës (ProCredit, NLB, TEB, Raiffeisen, BKT) variojnë zakonisht nga 3.8% deri në 4.9% efektive varësisht nga të ardhurat dhe kolaterali.
              </div>
            </div>
          </div>

          {/* Results Summary Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0B192C] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Pagesa Mujore e Vlerësuar
              </span>
              <div className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight my-2">
                {Math.round(monthlyPayment).toLocaleString()} €
                <span className="text-sm font-normal text-slate-400"> / muaj</span>
              </div>
              <p className="text-xs text-slate-300 mt-2 mb-6">
                Kësti llogaritet me anuitete të barabarta mujore për {loanTermYears * 12} muaj.
              </p>

              {/* Breakdown */}
              <div className="space-y-3 pt-6 border-t border-slate-800 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Shuma e Kredisë (Kryegjëja):</span>
                  <span className="font-bold text-white">{loanAmount.toLocaleString()} €</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Pjesëmarrja e Paguar menjëherë:</span>
                  <span className="font-bold text-white">{downPaymentAmount.toLocaleString()} €</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Interesi Total i Bankës:</span>
                  <span className="font-bold text-amber-400">{Math.round(totalInterest).toLocaleString()} €</span>
                </div>
                <div className="flex justify-between text-slate-300 pt-3 border-t border-slate-800 font-bold">
                  <span>Totali i Kthimit të Kredisë:</span>
                  <span className="text-emerald-400 text-sm">{Math.round(totalRepayment).toLocaleString()} €</span>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-8">
                <Link
                  href="/prona?tipi=shitje"
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all text-xs"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Shfleto Pronat në Shitje</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Advice Box */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs text-xs space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                Këshilla Financiare për Blerësit
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Rregulli i artë i financave personale rekomandon që kësti mujor i kredisë të mos i tejkalojë <strong>35% deri 40%</strong> të të ardhurave neto mujore të familjes.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
