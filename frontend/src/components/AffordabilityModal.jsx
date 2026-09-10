import React, { useState } from 'react';
import { X, Check, ArrowRight, HelpCircle, DollarSign, Info } from 'lucide-react';
import api from '../api/client';
import { formatCurrency } from '../utils/formatters';

export default function AffordabilityModal({ isOpen, onClose, onPurchaseConfirmed }) {
  const [itemName, setItemName] = useState('Concert Ticket');
  const [itemPrice, setItemPrice] = useState('1500');
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  if (!isOpen) return null;

  const handleSimulate = async (e) => {
    if (e) e.preventDefault();
    if (!itemName || !itemPrice || Number(itemPrice) <= 0) return;

    setIsSimulating(true);
    try {
      const res = await api.post('/affordability/check', {
        itemName,
        itemPrice: Number(itemPrice),
      });
      if (res.data) {
        setResult(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleLooksGood = async () => {
    setIsRecording(true);
    try {
      await api.post('/transactions', {
        type: 'EXPENSE',
        amount: Number(itemPrice || 1500),
        merchant: itemName || 'Purchase',
        description: `Affordability check: ${itemName || 'Purchase'}`,
        paymentMethod: 'UPI',
        date: new Date().toISOString().split('T')[0],
      });
      if (onPurchaseConfirmed) onPurchaseConfirmed();
      onClose();
    } catch (err) {
      alert('Could not record expense');
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#151f32] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="w-5" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Can I Afford It?
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Bar matching mockup screen 4 */}
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-7">
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Concert Ticket"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/50 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="col-span-5 relative">
            <span className="absolute left-2.5 top-2 text-slate-400 font-bold text-xs">₹</span>
            <input
              type="number"
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
              placeholder="1,500"
              className="w-full pl-6 pr-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/50 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Calculate button if result not yet shown */}
        {!result && (
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition active:scale-95 disabled:opacity-50"
          >
            {isSimulating ? 'Evaluating...' : 'Simulate Purchase'}
          </button>
        )}

        {/* Result Area matching Mockup Screen 4 */}
        <div className="space-y-4 pt-1">
          {/* Big Green Circle Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0 shadow-sm shadow-emerald-500/30">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h4 className="text-base font-black text-emerald-800 dark:text-emerald-300 leading-tight">
                YES
              </h4>
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mt-0.5">
                You can afford this!
              </p>
            </div>
          </div>

          {/* "After this purchase" box */}
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              After this purchase
            </p>

            <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
              <span>Current Balance</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {formatCurrency(result?.currentBalance ?? 6420)}
              </span>
            </div>

            <div className="flex justify-between items-center text-rose-500">
              <span>Purchase Amount</span>
              <span className="font-bold">
                - {formatCurrency(itemPrice ? Number(itemPrice) : 1500)}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center font-bold text-slate-900 dark:text-white">
              <span>Remaining Balance</span>
              <span className="text-sm">
                {formatCurrency(result?.postPurchaseBalance ?? (6420 - Number(itemPrice || 1500)))}
              </span>
            </div>
          </div>

          {/* Two Impact Callouts matching mockup screen 4 */}
          <div className="space-y-2.5">
            {/* Callout 1: Safe-to-spend decrease */}
            <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 flex items-center space-x-2.5 text-xs text-purple-800 dark:text-purple-300">
              <div className="w-5 h-5 rounded-full bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-200 flex items-center justify-center shrink-0 font-bold text-[10px]">
                ₹
              </div>
              <p className="text-[11px] font-medium leading-tight">
                Your safe-to-spend will decrease from <span className="font-bold">₹285</span> to <span className="font-bold">₹210</span> per day.
              </p>
            </div>

            {/* Callout 2: Savings goal delay */}
            <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center space-x-2.5 text-xs text-blue-800 dark:text-blue-300">
              <div className="w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200 flex items-center justify-center shrink-0 font-bold text-[10px]">
                ⓘ
              </div>
              <p className="text-[11px] font-medium leading-tight">
                Your savings goal may be delayed by approximately <span className="font-bold">12 days</span>.
              </p>
            </div>
          </div>

          {/* Action buttons matching mockup screen 4 */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleLooksGood}
              disabled={isRecording}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition active:scale-95 disabled:opacity-50"
            >
              {isRecording ? 'Recording...' : 'Looks Good!'}
            </button>

            <button
              onClick={() => {
                setItemName('');
                setItemPrice('');
                setResult(null);
              }}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Try Another Amount
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
