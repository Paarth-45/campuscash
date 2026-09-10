import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ReceiptText, 
  PieChart, 
  Target, 
  RotateCw, 
  BarChart2, 
  Sparkles, 
  Users, 
  Bell, 
  User, 
  LogOut,
  Moon,
  Sun,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ReceiptText },
    { name: 'Budgets', path: '/budgets', icon: PieChart },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Recurring', path: '/recurring', icon: RotateCw },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'AI Assistant', path: '/ai', icon: Sparkles },
    { name: 'Group Expenses', path: '/groups', icon: Users },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: '3' },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-60 bg-white dark:bg-[#0f172a] border-r border-slate-100 dark:border-slate-800/80 shrink-0 p-5 justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center space-x-2.5 px-2 mb-7">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm shadow-emerald-500/30 shrink-0">
            <GraduationCap className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
              CampusCash
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">
              Spend Smart, Study Freely
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150
                  ${isActive 
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'}
                `}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 stroke-[2]" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area */}
      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        {/* Motivational Box matching design mockup */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
          <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 leading-snug">
            Small steps.<br />
            Big dreams.
          </p>
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center space-x-1">
            <span>You got this!</span>
            <span>💚</span>
          </p>
        </div>

        {/* Dark mode toggle & Logout */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={toggleTheme}
            className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-600" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          <button
            onClick={logout}
            className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
