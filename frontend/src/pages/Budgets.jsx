import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { PieChart, Plus, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../api/client';
import { formatCurrency } from '../utils/formatters';

export default function Budgets() {
  const { refreshKey } = useOutletContext();
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Set Budget Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [monthYear, setMonthYear] = useState(new Date().toISOString().substring(0, 7)); // "YYYY-MM"
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [monthYear, refreshKey]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, cRes] = await Promise.all([
        api.get('/budgets/utilization', { params: { monthYear } }),
        api.get('/categories')
      ]);
      setBudgets(bRes.data || []);
      setCategories(cRes.data || []);
      if (cRes.data?.length > 0 && !selectedCategory) {
        setSelectedCategory(cRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setSubmitting(true);
    try {
      await api.post('/budgets', {
        categoryId: Number(selectedCategory),
        amount: Number(amount),
        monthYear,
      });
      setIsModalOpen(false);
      setAmount('');
      fetchData();
    } catch (err) {
      alert('Failed to set budget');
    } finally {
      setSubmitting(false);
    }
  };

  const totalBudgeted = budgets.reduce((acc, b) => acc + Number(b.budgetLimit || 0), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + Number(b.currentSpent || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Category Budgets
          </h1>
          <p className="text-xs text-slate-400">
            Set student-friendly caps to prevent mid-month wallet drainage
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <input
            type="month"
            value={monthYear}
            onChange={(e) => setMonthYear(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
          />

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/25 transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4.5 border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-400 font-semibold uppercase">Total Budgeted</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalBudgeted)}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-4.5 border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-400 font-semibold uppercase">Total Spent So Far</p>
          <p className="text-2xl font-bold text-rose-500 mt-1">
            {formatCurrency(totalSpent)}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-4.5 border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-400 font-semibold uppercase">Remaining Buffer</p>
          <p className={`text-2xl font-bold mt-1 ${totalBudgeted - totalSpent < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
            {formatCurrency(totalBudgeted - totalSpent)}
          </p>
        </div>
      </div>

      {/* Budget Meters List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-xs text-slate-400">Loading budgets...</div>
        ) : budgets.length > 0 ? (
          budgets.map((b) => (
            <div key={b.categoryId} className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-300 flex items-center justify-center font-bold text-sm">
                    🏷️
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {b.categoryName}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Cap: {formatCurrency(b.budgetLimit)}
                    </p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  b.status === 'EXCEEDED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                  b.status === 'WARNING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {b.status.replace('_', ' ')}
                </span>
              </div>

              {/* Progress meter */}
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    b.status === 'EXCEEDED' ? 'bg-rose-500' :
                    b.status === 'WARNING' ? 'bg-amber-500' :
                    'bg-brand-500'
                  }`}
                  style={{ width: `${Math.min(100, b.percentageUsed)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Spent: <span className="font-bold">{formatCurrency(b.currentSpent)}</span>
                </span>
                <span className="font-semibold text-slate-500 dark:text-slate-400">
                  Left: <span className={b.remainingAmount < 0 ? 'text-rose-500 font-bold' : 'text-emerald-500 font-bold'}>{formatCurrency(b.remainingAmount)}</span>
                </span>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                {b.alertMessage}
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-2 glass-card rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No budgets set for this month.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Create a budget and make your pocket money last longer.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
            >
              + Create Budget
            </button>
          </div>
        )}
      </div>

      {/* Set Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">
              Set Category Budget
            </h3>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none transition dark:text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Limit (₹)
                </label>
                <input
                  type="number"
                  required
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 2500"
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none transition dark:text-white"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
