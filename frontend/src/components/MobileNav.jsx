import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, Plus, PieChart, Sparkles } from 'lucide-react';

export default function MobileNav({ onOpenAddModal }) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-[#0b101d]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800/80 px-4 flex items-center justify-around z-30">
      <NavLink
        to="/"
        className={({ isActive }) => `
          flex flex-col items-center space-y-1 py-1
          ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'}
        `}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-[10px] font-medium">Home</span>
      </NavLink>

      <NavLink
        to="/transactions"
        className={({ isActive }) => `
          flex flex-col items-center space-y-1 py-1
          ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'}
        `}
      >
        <ReceiptText className="w-5 h-5" />
        <span className="text-[10px] font-medium">History</span>
      </NavLink>

      {/* Central Prominent Add Action */}
      <button
        onClick={onOpenAddModal}
        className="w-12 h-12 -mt-6 rounded-full bg-gradient-to-tr from-brand-600 to-emerald-450 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 active:scale-95 transition"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      <NavLink
        to="/budgets"
        className={({ isActive }) => `
          flex flex-col items-center space-y-1 py-1
          ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'}
        `}
      >
        <PieChart className="w-5 h-5" />
        <span className="text-[10px] font-medium">Budgets</span>
      </NavLink>

      <NavLink
        to="/ai"
        className={({ isActive }) => `
          flex flex-col items-center space-y-1 py-1
          ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'}
        `}
      >
        <Sparkles className="w-5 h-5" />
        <span className="text-[10px] font-medium">AI Coach</span>
      </NavLink>
    </nav>
  );
}
