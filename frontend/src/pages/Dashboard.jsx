import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { 
  Wallet, 
  ArrowUpRight, 
  TrendingDown, 
  PiggyBank, 
  Info, 
  ChevronDown, 
  Laptop, 
  Utensils, 
  Bus, 
  PartyPopper, 
  ShoppingBag, 
  Home, 
  Repeat,
  Scale,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import api from '../api/client';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function Dashboard() {
  const { refreshKey, onOpenAddModal, onOpenAffordModal } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fallback demo values matching mockup if backend values are adjusting
  useEffect(() => {
    fetchDashboard();
  }, [refreshKey]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const firstName = data?.userName ? data.userName.split(' ')[0] : 'Alex';
  const availableBalance = data?.currentBalance ?? 6420;
  const monthlyIncome = data?.monthlyIncome ?? 12000;
  const monthlyExpenses = data?.monthExpenses ?? 5580;
  const totalSavings = data?.monthSavings ?? 2000;
  const dailySafeToSpend = data?.safeToSpend?.dailySafeToSpend ?? 285;
  const monthlySafeToSpend = data?.safeToSpend?.monthlySafeToSpend ?? 5700;
  const remainingDays = data?.safeToSpend?.remainingDaysInMonth ?? 20;

  // Monthly spending bar chart data
  const monthlySpendingData = [
    { month: 'Apr', amount: 3800 },
    { month: 'May', amount: 4600 },
    { month: 'Jun', amount: 4200 },
    { month: 'Jul', amount: 4900 },
    { month: 'Aug', amount: 5200 },
    { month: 'Sep', amount: 5580, current: true },
  ];

  // Category Donut Chart data
  const categoryChartData = [
    { name: 'Food', value: 33, color: '#10b981' },
    { name: 'Transport', value: 16, color: '#3b82f6' },
    { name: 'Education', value: 15, color: '#8b5cf6' },
    { name: 'Shopping', value: 12, color: '#6366f1' },
    { name: 'Entertainment', value: 10, color: '#f97316' },
    { name: 'Living', value: 8, color: '#06b6d4' },
    { name: 'Others', value: 5, color: '#94a3b8' },
  ];

  // Budgets items matching mockup
  const budgetsList = [
    { name: 'Food', spent: 1840, limit: 2500, percent: 74, color: '#10b981', icon: Utensils },
    { name: 'Transport', spent: 720, limit: 1000, percent: 72, color: '#3b82f6', icon: Bus },
    { name: 'Entertainment', spent: 850, limit: 1000, percent: 85, color: '#f97316', icon: PartyPopper },
    { name: 'Shopping', spent: 1200, limit: 1500, percent: 80, color: '#8b5cf6', icon: ShoppingBag },
  ];

  // Upcoming payments matching mockup
  const upcomingPaymentsList = [
    { name: 'Spotify', amount: 119, due: 'Due in 3 days', color: '#10b981' },
    { name: 'Hostel Rent', amount: 5000, due: 'Due in 5 days', color: '#3b82f6' },
    { name: 'Netflix', amount: 149, due: 'Due in 8 days', color: '#e50914' },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Greeting Row */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Good morning, {firstName}! 👋
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Here's your financial overview for September 2024.
          </p>
        </div>
        <p className="text-xs text-slate-400 italic hidden md:block">
          "Discipline today, the freedom you want tomorrow."
        </p>
      </div>

      {/* Row 1: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Available Balance */}
        <div className="app-card p-4.5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-500 flex items-center justify-center">
              <Wallet className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              + 12%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs text-slate-400 font-medium">Available Balance</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(availableBalance)}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Your current balance</p>
          </div>
        </div>

        {/* Card 2: Monthly Income */}
        <div className="app-card p-4.5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              + 0%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs text-slate-400 font-medium">Monthly Income</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(monthlyIncome)}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Expected this month</p>
          </div>
        </div>

        {/* Card 3: Monthly Expenses */}
        <div className="app-card p-4.5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              + 8%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs text-slate-400 font-medium">Monthly Expenses</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(monthlyExpenses)}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Spent this month</p>
          </div>
        </div>

        {/* Card 4: Savings */}
        <div className="app-card p-4.5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-500 flex items-center justify-center">
              <PiggyBank className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              + 20%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs text-slate-400 font-medium">Savings</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(totalSavings)}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Towards your goals</p>
          </div>
        </div>
      </div>

      {/* Row 2: Middle Section (Safe to Spend, Monthly Spending, Spending by Category, Right Banner) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main 3 Visual Cards: 9 Cols */}
        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Safe to Spend */}
          <div className="app-card p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <span>Safe to Spend</span>
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </div>
                {/* Bar Icon */}
                <div className="flex items-end space-x-0.5 h-4">
                  <span className="w-1 bg-emerald-300 h-2 rounded-full" />
                  <span className="w-1 bg-emerald-400 h-3 rounded-full" />
                  <span className="w-1 bg-emerald-500 h-4 rounded-full" />
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-baseline space-x-1">
                  <h2 className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(dailySafeToSpend)}
                  </h2>
                  <span className="text-xs font-semibold text-slate-400">/ day</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                  You have <span className="font-bold text-slate-700 dark:text-slate-200">{formatCurrency(monthlySafeToSpend)}</span> available for the remaining {remainingDays} days.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={onOpenAffordModal}
                className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold transition flex items-center justify-center space-x-1.5"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Simulate Purchase</span>
              </button>
            </div>
          </div>

          {/* Card 2: Monthly Spending Bar Chart */}
          <div className="app-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Monthly Spending
              </h4>
              <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-semibold cursor-pointer">
                <span>Last 6 months</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>

            <div className="h-36 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySpendingData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fill: '#94a3b8' }}
                    tickFormatter={(v) => `₹${v / 1000}k`}
                  />
                  <Tooltip 
                    formatter={(val) => [`₹${val}`, 'Spent']}
                    contentStyle={{ fontSize: '11px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {monthlySpendingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.current ? '#10b981' : '#a7f3d0'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 3: Spending by Category Donut Chart */}
          <div className="app-card p-5 flex flex-col justify-between">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Spending by Category
            </h4>

            <div className="flex items-center justify-between mt-2">
              {/* Donut Chart with center text */}
              <div className="relative w-28 h-28 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      innerRadius={36}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`pie-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-[11px] font-black text-slate-800 dark:text-white">
                    ₹5,580
                  </span>
                  <span className="text-[8px] text-slate-400 font-medium">Total</span>
                </div>
              </div>

              {/* Legend with percentages */}
              <div className="space-y-1 text-[9px] font-semibold text-slate-600 dark:text-slate-300">
                {categoryChartData.slice(0, 5).map((c) => (
                  <div key={c.name} className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="truncate max-w-[65px]">{c.name}</span>
                    </div>
                    <span className="text-slate-400 font-medium">{c.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Banner: Better Money Habits (3 Cols on Desktop) */}
        <div className="lg:col-span-3 app-card p-6 bg-gradient-to-br from-emerald-50/60 via-slate-50 to-teal-50/40 dark:from-[#111c30] dark:via-[#131f36] dark:to-[#0f172a] border border-emerald-100/60 dark:border-slate-800 flex flex-col justify-between relative overflow-hidden">
          <div>
            <h3 className="font-handwritten text-3xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
              Better<br />
              Money Habits<br />
              <span className="text-emerald-600 dark:text-emerald-400">A Brighter You</span>
            </h3>

            {/* Potted plant illustration */}
            <div className="my-5 flex justify-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-3xl shadow-sm">
                  🪴
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Note Tag */}
          <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-800/90 shadow-sm border border-slate-100 dark:border-slate-700 text-center">
            <p className="font-handwritten text-base font-bold text-slate-700 dark:text-slate-200">
              Manage today.<br />
              More tomorrow. 🎓
            </p>
          </div>
        </div>
      </div>

      {/* Row 3: Your Budgets, Upcoming Payments, Savings Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Col 1: Your Budgets (5 Cols) */}
        <div className="lg:col-span-5 app-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Your Budgets
            </h4>
            <Link to="/budgets" className="text-[11px] font-semibold text-emerald-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {budgetsList.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.name} className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px]" style={{ backgroundColor: b.color }}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {b.name}
                    </span>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-slate-900 dark:text-white">
                      ₹{b.spent.toLocaleString()} <span className="text-slate-400 font-normal">/ ₹{b.limit.toLocaleString()}</span>
                    </p>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mt-1.5 overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ width: `${b.percent}%`, backgroundColor: b.color }} 
                      />
                    </div>
                    <p className="text-[9px] text-right text-slate-400 mt-1">{b.percent}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Col 2: Upcoming Payments (4 Cols) */}
        <div className="lg:col-span-4 app-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Upcoming Payments
            </h4>
            <Link to="/recurring" className="text-[11px] font-semibold text-emerald-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingPaymentsList.map((p) => (
              <div key={p.name} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                    {p.name === 'Spotify' ? '🎧' : p.name === 'Hostel Rent' ? '🏠' : '🎬'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{p.name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    ₹{p.amount.toLocaleString()}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-semibold bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400">
                    {p.due}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Col 3: Savings Goals (3 Cols) */}
        <div className="lg:col-span-3 app-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Savings Goals
              </h4>
              <Link to="/goals" className="text-[11px] font-semibold text-emerald-600 hover:underline">
                View All
              </Link>
            </div>

            {/* Laptop Goal Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center text-lg shadow-sm">
                  💻
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    New Laptop
                  </h5>
                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                    ₹31,500 <span className="text-[10px] text-slate-400 font-normal">/ ₹60,000</span>
                  </p>
                </div>
              </div>

              <div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: '35%' }} />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5">
                  <span>Target: Jun 2027</span>
                  <span className="font-bold text-slate-600 dark:text-slate-300">35%</span>
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/goals"
            className="mt-4 w-full py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-center text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            + Create New Goal
          </Link>
        </div>
      </div>
    </div>
  );
}
