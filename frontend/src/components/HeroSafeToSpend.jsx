import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, Info, ChevronDown, ChevronUp, Scale, Sparkles } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function HeroSafeToSpend({ safeToSpend, onOpenAffordModal }) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  if (!safeToSpend) return null;

  const isHealthy = safeToSpend.status === 'HEALTHY';
  const isCaution = safeToSpend.status === 'CAUTION';
  const isDeficit = safeToSpend.isNegative;

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8 bg-gradient-to-br from-indigo-900 via-[#131b31] to-[#0d1322] text-white shadow-xl border border-indigo-500/20">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-60 h-60 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header Tag and Days Remaining */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
              Daily Safe-to-Spend
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-indigo-200 border border-white/10">
              🗓️ {safeToSpend.remainingDaysInMonth} days left in month
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              isHealthy ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
              isCaution ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
              'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              {safeToSpend.status}
            </span>
          </div>
        </div>

        {/* Hero Daily Amount Display */}
        <div className="my-3 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
          <div>
            <div className="flex items-baseline space-x-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-100 to-emerald-200 bg-clip-text text-transparent">
                {formatCurrency(safeToSpend.dailySafeToSpend)}
              </h1>
              <span className="text-sm sm:text-base font-semibold text-indigo-300">/ day</span>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-indigo-200/90 max-w-xl leading-relaxed">
              {safeToSpend.explanation}
            </p>
          </div>

          {/* Quick simulator trigger */}
          <button
            onClick={onOpenAffordModal}
            className="self-start md:self-center flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition duration-200 shadow-lg active:scale-95 shrink-0"
          >
            <Scale className="w-4 h-4 text-emerald-400" />
            <span>Simulate Purchase</span>
          </button>
        </div>

        {/* Breakdown Accordion Toggle */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex items-center space-x-2 text-xs font-medium text-indigo-300 hover:text-white transition"
          >
            <Info className="w-3.5 h-3.5" />
            <span>How is this calculated?</span>
            {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showBreakdown && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-black/25 backdrop-blur-md border border-white/10 text-xs">
              <div>
                <p className="text-indigo-300/80 text-[11px]">Current Balance</p>
                <p className="text-base font-bold text-white mt-0.5">{formatCurrency(safeToSpend.currentBalance)}</p>
              </div>
              <div>
                <p className="text-indigo-300/80 text-[11px]">Committed Bills</p>
                <p className="text-base font-bold text-rose-300 mt-0.5">- {formatCurrency(safeToSpend.upcomingCommittedExpenses)}</p>
              </div>
              <div>
                <p className="text-indigo-300/80 text-[11px]">Savings Target</p>
                <p className="text-base font-bold text-amber-300 mt-0.5">- {formatCurrency(safeToSpend.remainingSavingsTarget)}</p>
              </div>
              <div>
                <p className="text-indigo-300/80 text-[11px]">Total Safe Buffer</p>
                <p className="text-base font-bold text-emerald-300 mt-0.5">{formatCurrency(safeToSpend.monthlySafeToSpend)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
