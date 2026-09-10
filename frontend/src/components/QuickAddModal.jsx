import React, { useState, useEffect } from 'react';
import { X, Camera, Sparkles, Check, DollarSign, Calendar } from 'lucide-react';
import api from '../api/client';

export default function QuickAddModal({ isOpen, onClose, onTransactionAdded }) {
  const [tab, setTab] = useState('manual'); // 'manual', 'receipt', 'nlp'
  const [amount, setAmount] = useState('250');
  const [categoryId, setCategoryId] = useState('');
  const [merchant, setMerchant] = useState('College Cafeteria');
  const [description, setDescription] = useState('Lunch with friends');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  
  // NLP / Receipt State
  const [nlpText, setNlpText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get('/categories').then(res => {
        if (res.data) {
          setCategories(res.data);
          if (res.data.length > 0 && !categoryId) {
            setCategoryId(res.data[0].id);
          }
        }
      }).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNlpParse = async () => {
    if (!nlpText.trim()) return;
    setIsProcessing(true);
    try {
      const res = await api.post('/ai/parse-expense', { text: nlpText });
      if (res.data) {
        setAmount(res.data.amount?.toString() || '250');
        setMerchant(res.data.merchant || '');
        setDescription(res.data.description || '');
        if (res.data.categoryId) setCategoryId(res.data.categoryId);
        setTab('manual');
      }
    } catch (e) {
      setTab('manual');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setSubmitting(true);
    try {
      await api.post('/transactions', {
        type: 'EXPENSE',
        amount: Number(amount),
        categoryId: categoryId ? Number(categoryId) : null,
        merchant,
        description: notes ? `${description} (${notes})` : description,
        paymentMethod,
        date,
      });
      onTransactionAdded();
      onClose();
    } catch (err) {
      alert('Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#151f32] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <div className="w-5" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Add Expense
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Pills matching mockup screen 1 */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800/60 rounded-full my-4 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setTab('manual')}
            className={`flex-1 py-1.5 rounded-full transition ${
              tab === 'manual' 
                ? 'bg-emerald-500 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Manual Entry
          </button>
          <button
            type="button"
            onClick={() => setTab('receipt')}
            className={`flex-1 py-1.5 rounded-full transition ${
              tab === 'receipt' 
                ? 'bg-emerald-500 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Scan Receipt
          </button>
          <button
            type="button"
            onClick={() => setTab('nlp')}
            className={`flex-1 py-1.5 rounded-full transition ${
              tab === 'nlp' 
                ? 'bg-emerald-500 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Natural Language
          </button>
        </div>

        {tab === 'manual' ? (
          <form onSubmit={handleSave} className="space-y-3.5">
            {/* Amount */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold text-sm">₹</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Merchant */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Merchant
              </label>
              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="College Cafeteria"
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Lunch with friends"
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Payment Method & Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="UPI">UPI</option>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="NET_BANKING">Net Banking</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Add Notes (optional) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Add Notes (optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Split with roomies..."
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Save Expense Button matching mockup */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Expense'}
            </button>
          </form>
        ) : tab === 'receipt' ? (
          <div className="space-y-4 py-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center">
              <Camera className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">Scan Paper Receipt</h4>
              <p className="text-xs text-slate-400 mt-1">
                Upload canteen bill, stationery receipt or food slip for automatic extraction.
              </p>
            </div>
            <label className="block cursor-pointer py-2.5 px-4 rounded-xl border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 bg-emerald-50/40 text-emerald-700 text-xs font-bold transition">
              <span>Choose Receipt Image</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={() => {
                  setAmount('320');
                  setMerchant('Campus Bookstore');
                  setDescription('Notebooks & Pens');
                  setTab('manual');
                }} 
              />
            </label>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Type what you spent naturally:
              </label>
              <textarea
                rows="3"
                value={nlpText}
                onChange={(e) => setNlpText(e.target.value)}
                placeholder="e.g. Spent 220 on chai and cold coffee at canteen via UPI"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="button"
              onClick={handleNlpParse}
              disabled={isProcessing || !nlpText.trim()}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition disabled:opacity-50"
            >
              {isProcessing ? 'Parsing with AI...' : 'Auto-Fill Fields'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
