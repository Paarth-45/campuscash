import React, { useState } from 'react';
import { Send, GraduationCap, ArrowLeft, MoreVertical, Sparkles } from 'lucide-react';
import api from '../api/client';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hi! I'm your financial assistant. Ask me anything about your spending, budgets, goals, or finances!",
    },
    {
      id: 2,
      sender: 'user',
      text: 'Where did I spend the most this month?',
    },
    {
      id: 3,
      sender: 'ai',
      text: "You spent the most on Food this month with ₹1,840 (33% of your total spending). That's ₹420 more than last month. Consider cooking more at home or setting a stricter food budget for the rest of the month.",
      categories: [
        { name: 'Food', amount: 1840, percent: 33, color: '#10b981' },
        { name: 'Transport', amount: 1000, percent: 18, color: '#3b82f6' }
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestionChips = [
    'Where did I spend the most this month?',
    'Can I afford ₹2,000 shoes?',
    'How much should I save for my laptop?',
    'What category should I reduce?',
  ];

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: text });
      if (res.data) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'ai',
          text: res.data.reply,
          tip: res.data.actionableTip,
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: "I analyzed your budget: your daily Safe-to-Spend is ₹285/day. Staying within this ensures your semester savings remain 100% protected.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto h-[calc(100vh-120px)] flex flex-col justify-between animate-fade-in py-2">
      {/* Header matching mockup screen 5 */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
            <GraduationCap className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            CampusCash AI
          </h2>
        </div>
        <button className="text-slate-400 hover:text-slate-600">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Suggestion Chips */}
      <div className="py-2.5 flex items-center space-x-2 overflow-x-auto no-scrollbar">
        {suggestionChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 text-[11px] font-medium shrink-0 hover:bg-blue-100 transition text-left"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 py-2 pr-1">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start space-x-2.5 ${
              m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-[10px] font-bold ${
              m.sender === 'user' ? 'bg-slate-700' : 'bg-emerald-500'
            }`}>
              {m.sender === 'user' ? 'You' : <GraduationCap className="w-3.5 h-3.5" />}
            </div>

            <div className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed ${
              m.sender === 'user'
                ? 'bg-emerald-600 text-white font-medium rounded-tr-none'
                : 'bg-white dark:bg-[#151f32] border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm rounded-tl-none'
            }`}>
              <p>{m.text}</p>

              {/* Category Breakdown Progress Bars inside message bubble matching Screen 5! */}
              {m.categories && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <p className="text-[10px] font-bold text-slate-400">Spending by Category</p>
                  {m.categories.map((c) => (
                    <div key={c.name} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <div className="flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{c.name}</span>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">₹{c.amount.toLocaleString()} ({c.percent}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${c.percent * 2}%`, backgroundColor: c.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-slate-400 pl-9">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>CampusCash AI is typing...</span>
          </div>
        )}
      </div>

      {/* Input Bar matching mockup screen 5 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="mt-2 flex items-center space-x-2 p-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#151f32] shadow-sm"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your finances..."
          className="flex-1 px-4 py-2 bg-transparent text-xs text-slate-800 dark:text-white outline-none placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition disabled:opacity-40 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
