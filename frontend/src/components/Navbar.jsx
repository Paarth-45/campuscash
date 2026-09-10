import React from 'react';
import { Search, Bell, ChevronDown, Sun, Moon, Plus, Scale } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ onOpenAddModal, onOpenAffordModal }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const firstName = user?.name ? user.name.split(' ')[0] : 'Alex';
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'AS';

  return (
    <header className="h-16 bg-white dark:bg-[#0f172a] border-b border-slate-100 dark:border-slate-800/80 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Search Bar matching mockup */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search transactions, categories, or ask AI..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Quick Add CTA */}
        <button
          onClick={onOpenAddModal}
          className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Expense</span>
        </button>

        {/* Can I Afford It quick action */}
        <button
          onClick={onOpenAffordModal}
          className="hidden md:inline-flex items-center space-x-1 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Can I Afford It?</span>
        </button>

        {/* Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button className="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition">
            <Bell className="w-4 h-4" />
          </button>
          <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white dark:ring-slate-900" />
        </div>

        {/* User Pill Avatar */}
        <div className="flex items-center space-x-2 pl-1 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
            {initials}
          </div>
          <div className="hidden sm:flex items-center space-x-1">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Hi, {firstName}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
}
