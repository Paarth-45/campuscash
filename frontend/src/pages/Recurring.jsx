import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CalendarClock, Plus, Trash2, Calendar, CheckCircle } from 'lucide-react';
import api from '../api/client';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function Recurring() {
  const { refreshKey } = useOutletContext();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Recurring Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [frequency, setFrequency] = useState('MONTHLY');
  const [nextDueDate, setNextDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rRes, cRes] = await Promise.all([
        api.get('/recurring'),
        api.get('/categories')
      ]);
      setItems(rRes.data || []);
      setCategories(cRes.data || []);
      if (cRes.data?.length > 0 && !categoryId) {
        setCategoryId(cRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!description.trim() || !amount || Number(amount) <= 0 || !nextDueDate) return;

    setSubmitting(true);
    try {
      await api.post('/recurring', {
        description,
        amount: Number(amount),
        categoryId: categoryId ? Number(categoryId) : null,
        frequency,
        nextDueDate,
      });
      setIsModalOpen(false);
      setDescription('');
      setAmount('');
      setNextDueDate('');
      fetchData();
    } catch (err) {
      alert('Failed to add recurring commitment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this recurring payment?')) return;
    try {
      await api.delete(`/recurring/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  const totalMonthlyCommitments = items.reduce((acc, i) => acc + Number(i.amount || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Recurring Bills & Subscriptions
          </h1>
          <p className="text-xs text-slate-400">
            Automatically factored into your daily Safe-to-Spend to guarantee bills are never missed
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-auto flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/25 transition active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* Overview Banner */}
      <div className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Monthly Commitments</p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            {formatCurrency(totalMonthlyCommitments)}
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Across {items.length} active subscriptions & utility bills
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
          <CalendarClock className="w-6 h-6" />
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">Loading recurring bills...</div>
        ) : items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300">
                      {item.frequency}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-2">
                      {item.description}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.categoryName}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-slate-400 hover:text-rose-500 transition p-1"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400">Next Due Date</p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-brand-500" />
                    <span>{formatDate(item.nextDueDate)}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-rose-500">
                    {formatCurrency(item.amount)}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {item.daysUntilDue > 0 ? `In ${item.daysUntilDue} days` : 'Due soon'}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full glass-card rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No recurring subscriptions found.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Add Spotify, college rent, mobile recharges, or gym memberships to keep your Safe-to-Spend accurate.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
            >
              + Add First Subscription
            </button>
          </div>
        )}
      </div>

      {/* Add Subscription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">
              Add Recurring Commitment
            </h3>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subscription / Bill Name
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Spotify Student, Hostel Rent, 5G Plan"
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-xs focus:ring-2 focus:ring-brand-500 outline-none transition dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 59"
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-xs font-bold focus:ring-2 focus:ring-brand-500 outline-none transition dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none transition dark:text-white"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Next Due Date
                </label>
                <input
                  type="date"
                  required
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-brand-500 outline-none transition dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none transition dark:text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
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
                  {submitting ? 'Adding...' : 'Save Commitment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
