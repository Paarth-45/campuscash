import React, { useState } from 'react';
import { ChevronDown, TrendingUp, Filter } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { formatCurrency } from '../utils/formatters';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('Overview');

  const trendData = [
    { month: 'Apr', amount: 3500 },
    { month: 'May', amount: 4800 },
    { month: 'Jun', amount: 4100 },
    { month: 'Jul', amount: 5000 },
    { month: 'Aug', amount: 5400 },
    { month: 'Sep', amount: 5580 },
  ];

  const categoryChartData = [
    { name: 'Food', percent: 32, amount: 1840, color: '#10b981' },
    { name: 'Transport', percent: 18, amount: 1000, color: '#3b82f6' },
    { name: 'Education', percent: 16, amount: 890, color: '#8b5cf6' },
    { name: 'Shopping', percent: 12, amount: 670, color: '#6366f1' },
    { name: 'Entertainment', percent: 10, amount: 560, color: '#f97316' },
    { name: 'Living', percent: 8, amount: 450, color: '#06b6d4' },
    { name: 'Others', percent: 4, amount: 220, color: '#94a3b8' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in py-2">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-xl font-black text-slate-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Deep-dive into your student cashflow patterns
        </p>
      </div>

      {/* Tabs matching mockup Screen 2 */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800/60 rounded-full text-xs font-bold">
        {['Overview', 'Categories', 'Trends', 'Income vs Expense'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 rounded-full transition ${
              activeTab === tab 
                ? 'bg-emerald-500 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Total Spending Card */}
      <div className="app-card p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Spending</p>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                ₹5,580
              </h2>
              <span className="text-xs font-bold text-rose-500">
                ↑ 8% vs last month
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1 text-xs text-slate-500 font-medium px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
            <span>Last 5 months</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Trend Line Chart */}
        <div className="h-44 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
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
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#3b82f6" 
                strokeWidth={2.5} 
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Spending by Category Card matching Screen 2 */}
      <div className="app-card p-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
          Spending by Category
        </h3>

        {/* Donut Chart & Legend */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-36 h-36 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={2}
                  dataKey="percent"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-xs font-black text-slate-800 dark:text-white">
                ₹5,580
              </span>
              <span className="text-[9px] text-slate-400">Total</span>
            </div>
          </div>

          {/* Progress Bars for Categories */}
          <div className="flex-1 w-full space-y-2.5">
            {categoryChartData.slice(0, 4).map((c) => (
              <div key={c.name} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{c.name}</span>
                  </div>
                  <div className="space-x-2">
                    <span className="font-bold text-slate-900 dark:text-white">₹{c.amount.toLocaleString()}</span>
                    <span className="text-slate-400 text-[10px]">{c.percent}%</span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${c.percent * 2.5}%`, backgroundColor: c.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
