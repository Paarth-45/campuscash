import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, Plus, UserPlus, DollarSign, Calendar, ArrowUpRight } from 'lucide-react';
import api from '../api/client';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function Groups() {
  const { refreshKey } = useOutletContext();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupExpenses, setGroupExpenses] = useState([]);
  const [youAreOwed, setYouAreOwed] = useState(0);
  const [loading, setLoading] = useState(true);

  // Create Group Modal
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');

  // Add Expense to Group Modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expAmount, setExpAmount] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [splitCount, setSplitCount] = useState(2);

  useEffect(() => {
    fetchGroups();
  }, [refreshKey]);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupDetails(selectedGroup.id);
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await api.get('/groups');
      const data = res.data || [];
      setGroups(data);
      if (data.length > 0 && !selectedGroup) {
        setSelectedGroup(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupDetails = async (groupId) => {
    try {
      const res = await api.get(`/groups/${groupId}/expenses`);
      if (res.data) {
        setGroupExpenses(res.data.expenses || []);
        setYouAreOwed(res.data.youAreOwed || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    try {
      const res = await api.post('/groups', {
        name: groupName,
        description: groupDesc,
      });
      if (res.data) {
        setGroupName('');
        setGroupDesc('');
        setIsGroupModalOpen(false);
        setGroups(prev => [...prev, res.data]);
        setSelectedGroup(res.data);
      }
    } catch (err) {
      alert('Failed to create group');
    }
  };

  const handleAddGroupExpense = async (e) => {
    e.preventDefault();
    if (!selectedGroup || !expAmount || Number(expAmount) <= 0) return;

    try {
      await api.post(`/groups/${selectedGroup.id}/expenses`, {
        amount: Number(expAmount),
        description: expDesc || 'Shared bill',
        splitCount: Number(splitCount),
        date: new Date().toISOString().split('T')[0],
      });
      setIsExpenseModalOpen(false);
      setExpAmount('');
      setExpDesc('');
      fetchGroupDetails(selectedGroup.id);
    } catch (err) {
      alert('Failed to record group expense');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Roommate & Group Splits
          </h1>
          <p className="text-xs text-slate-400">
            Split hostel rent, mess bills, and weekend trips without the awkward math
          </p>
        </div>

        <button
          onClick={() => setIsGroupModalOpen(true)}
          className="self-start sm:self-auto flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/25 transition active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Group</span>
        </button>
      </div>

      {/* Main Layout: Group Selector + Group Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Groups List Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Your Groups
          </h3>
          {groups.length > 0 ? (
            groups.map((g) => (
              <div
                key={g.id}
                onClick={() => setSelectedGroup(g)}
                className={`cursor-pointer p-4 rounded-2xl border transition ${
                  selectedGroup?.id === g.id
                    ? 'bg-brand-50/80 dark:bg-brand-950/40 border-brand-500 shadow-sm'
                    : 'glass-card border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-sm">
                    👥
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{g.name}</h4>
                    {g.description && (
                      <p className="text-[11px] text-slate-400">{g.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-card rounded-2xl p-6 text-center border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-400">No groups created yet.</p>
            </div>
          )}
        </div>

        {/* Group Details & Expense Feed */}
        <div className="lg:col-span-8 space-y-4">
          {selectedGroup ? (
            <>
              {/* Group Hero Banner */}
              <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedGroup.name}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedGroup.description || 'Shared expense pool'}
                  </p>
                  <div className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    <span>You are owed:</span>
                    <span className="font-bold text-sm">{formatCurrency(youAreOwed)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-500/25 transition active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add Group Bill</span>
                </button>
              </div>

              {/* Expense List */}
              <div className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Shared Bills & Settlements
                </h3>

                {groupExpenses.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {groupExpenses.map((exp) => {
                      const perPerson = exp.amount / exp.splitCount;
                      return (
                        <div key={exp.id} className="py-3 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {exp.description}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Split among {exp.splitCount} people ({formatDate(exp.date)})
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm text-slate-900 dark:text-white">
                              Total: {formatCurrency(exp.amount)}
                            </p>
                            <p className="text-[10px] font-semibold text-emerald-500">
                              Your share: {formatCurrency(perPerson)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-8 text-center">
                    No bills added to this group yet.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="glass-card rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-400">Select or create a group to view shared expenses.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">
              Create Split Group
            </h3>

            <form onSubmit={handleCreateGroup} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Flat 302 Roommates, Manali Trip"
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-xs focus:ring-2 focus:ring-brand-500 outline-none transition dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  placeholder="e.g. WiFi, Groceries, Electricity & Rent"
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-xs focus:ring-2 focus:ring-brand-500 outline-none transition dark:text-white"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Group Bill Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">
              Add Bill to {selectedGroup?.name}
            </h3>

            <form onSubmit={handleAddGroupExpense} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bill Description
                </label>
                <input
                  type="text"
                  required
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="e.g. WiFi monthly recharge, Grocery bill"
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-xs focus:ring-2 focus:ring-brand-500 outline-none transition dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Total Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="1200"
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-xs font-bold focus:ring-2 focus:ring-brand-500 outline-none transition dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Number of People
                  </label>
                  <input
                    type="number"
                    required
                    min="2"
                    value={splitCount}
                    onChange={(e) => setSplitCount(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 text-xs font-bold focus:ring-2 focus:ring-brand-500 outline-none transition dark:text-white"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs flex justify-between items-center">
                <span className="text-slate-500">Each person owes:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(expAmount && splitCount ? Number(expAmount) / Number(splitCount) : 0)}
                </span>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  Record Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
