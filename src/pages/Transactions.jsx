import React, { useState, useEffect } from 'react';
import { Layers, Utensils, CarFront, ShoppingCart, Pencil, ChevronDown, Download, RefreshCw, Building2, Plus, Trash2, X } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { useStore } from '../store/useStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const getCategoryIcon = (category) => {
  switch(category?.toLowerCase()) {
    case 'food & dining': return Utensils;
    case 'transportation': return CarFront;
    case 'groceries': return ShoppingCart;
    case 'housing': return Building2;
    default: return Layers;
  }
};

export default function Transactions() {
  const { user, expenses, fetchExpenses, addExpense, deleteExpense, loading, currency, updatePreferences, fetchSplitBalances, groups, friends, fetchGroups, fetchFriends, recurringExpenses, fetchRecurringExpenses, addRecurringExpense, deleteRecurringExpense } = useStore();
  
  const [activeTab, setActiveTab] = useState('transactions');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [type, setType] = useState('expense');
  
  // Date Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form State
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [isSplit, setIsSplit] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [newParticipant, setNewParticipant] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [nextRunDate, setNextRunDate] = useState('');

  const [selectedGroup, setSelectedGroup] = useState('');
  const savedGroups = user?.preferences?.groups || [];

  const defaultExpenseCategories = ['Food & Dining', 'Transportation', 'Groceries', 'Housing', 'Entertainment'];
  const defaultIncomeCategories = ['Salary', 'Freelance', 'Investments', 'Gift'];
  const defaultPaymentModes = ['Credit Card', 'Debit Card', 'Cash', 'Bank Transfer'];

  const expenseCategories = user?.preferences?.expenseCategories || defaultExpenseCategories;
  const incomeCategories = user?.preferences?.incomeCategories || defaultIncomeCategories;
  const paymentModes = user?.preferences?.paymentModes || defaultPaymentModes;

  const currentCategories = type === 'expense' ? expenseCategories : incomeCategories;

  useEffect(() => {
    if (currentCategories.length > 0 && !currentCategories.includes(category)) {
      setCategory(currentCategories[0]);
    }
  }, [type, user?.preferences?.expenseCategories, user?.preferences?.incomeCategories]);

  useEffect(() => {
    if (paymentModes.length > 0 && !paymentModes.includes(paymentMode)) {
      setPaymentMode(paymentModes[0]);
    }
  }, [user?.preferences?.paymentModes]);

  useEffect(() => {
    fetchExpenses(startDate, endDate);
  }, [startDate, endDate, fetchExpenses]);

  useEffect(() => {
    fetchGroups();
    fetchFriends();
    fetchRecurringExpenses();
  }, [fetchGroups, fetchFriends, fetchRecurringExpenses]);

  const handleCategoryChange = async (e) => {
    const val = e.target.value;
    if (val === 'ADD_NEW') {
      const newCat = prompt("Enter new category name:");
      if (newCat && newCat.trim()) {
        const catList = type === 'expense' ? expenseCategories : incomeCategories;
        const key = type === 'expense' ? 'expenseCategories' : 'incomeCategories';
        if (!catList.includes(newCat.trim())) {
          await updatePreferences({ [key]: [...catList, newCat.trim()] });
        }
        setCategory(newCat.trim());
      } else {
        setCategory(currentCategories[0]);
      }
    } else {
      setCategory(val);
    }
  };

  const exportToCSV = () => {
    if (expenses.length === 0) return;
    const headers = ['Date', 'Type', 'Amount', 'Category', 'Mode', 'Description'];
    const rows = expenses.map(e => [
      new Date(e.date).toISOString().split('T')[0],
      e.type,
      e.amount,
      e.category,
      e.paymentMode,
      `"${e.description}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ledger_export_${new Date().getTime()}.csv`;
    link.click();
  };

  const handleSaveExpense = async () => {
    if (!amount || parseFloat(amount) <= 0 || !description) {
      alert('Please enter a valid amount and description.');
      return;
    }

    if (activeTab === 'recurring') {
       if (!nextRunDate) { alert('Please enter a start date for the recurring expense.'); return; }
       const success = await addRecurringExpense({
         amount: parseFloat(amount),
         description, category, paymentMode, frequency, nextRunDate
       });
       if (success) {
         setAmount(''); setDescription(''); setNextRunDate('');
       }
       return;
    }

    if (isSplit && participants.length === 0) {
      alert('Please add at least one friend to split with.');
      return;
    }
    
    let splitDetails = [];
    if (isSplit) {
      const totalAmount = parseFloat(amount);
      const splitCount = participants.length + 1; // Participants + You
      const splitAmount = totalAmount / splitCount;

      splitDetails = participants.map(name => ({
        userId: name,
        amountOwed: splitAmount
      }));
    }

    const success = await addExpense({
      type,
      amount: parseFloat(amount),
      description,
      category,
      paymentMode,
      isSplit: isSplit,
      splitDetails: isSplit ? splitDetails : []
    });

    if (success) {
      setAmount('');
      setDescription('');
      setParticipants([]);
      setIsSplit(false);
      setNewParticipant('');
      setIsFormOpen(false); // ✅ close modal after successful save
      if (isSplit) fetchSplitBalances();
    } else {
      alert('Failed to save. Please verify your fields.');
    }
  };

  const groupedExpenses = expenses.reduce((groups, expense) => {
    const date = new Date(expense.date);
    let dateLabel = format(date, 'MMM dd, yyyy');
    if (isToday(date)) dateLabel = `TODAY, ${format(date, 'MMM dd')}`;
    else if (isYesterday(date)) dateLabel = `YESTERDAY, ${format(date, 'MMM dd')}`;
    
    if (!groups[dateLabel]) {
      groups[dateLabel] = [];
    }
    groups[dateLabel].push(expense);
    return groups;
  }, {});

  return (
    <div className="min-h-screen pb-24">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Ledger</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Track and manage your inflow and outflow.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportToCSV} className="bg-primary/10 text-primary p-2 rounded-xl" title="Export CSV">
              <Download size={20} />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex mb-6 bg-gray-100 p-1 rounded-xl">
           <button 
             onClick={() => setActiveTab('transactions')}
             className={cn("flex-1 text-sm font-semibold py-2 rounded-lg transition-colors", activeTab === 'transactions' ? 'bg-white shadow text-black' : 'text-gray-500')}
           >
             Transactions
           </button>
           <button 
             onClick={() => setActiveTab('recurring')}
             className={cn("flex-1 text-sm font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1", activeTab === 'recurring' ? 'bg-white shadow text-black' : 'text-gray-500')}
           >
             <RefreshCw size={14} /> Recurring
           </button>
        </div>

        {activeTab === 'transactions' && (
          <>
            <div className="flex gap-2 mb-6 bg-white dark:bg-[#1A2130] p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
               <div className="flex-1">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">From</label>
                 <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full text-sm font-semibold bg-transparent outline-none mt-1 dark:text-white dark:colorscheme-dark" />
               </div>
               <div className="w-px bg-gray-100 dark:bg-gray-700 mx-2"></div>
               <div className="flex-1">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">To</label>
                 <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full text-sm font-semibold bg-transparent outline-none mt-1 dark:text-white dark:colorscheme-dark" />
               </div>
            </div>

            {loading && expenses.length === 0 ? (
              <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[5px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {Object.keys(groupedExpenses).map((dateLabel, idx) => (
                  <div key={dateLabel} className="relative z-10 pt-4">
                    <div className="flex items-center mb-3">
                      <div className={cn("w-2 h-2 rounded-full border-2 border-white absolute left-[1px]", idx === 0 ? "bg-blue-200" : "bg-gray-300")}></div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-6">{dateLabel}</h3>
                    </div>
                    <div className="space-y-3 ml-6">
                      {groupedExpenses[dateLabel].map((exp) => (
                        <ExpenseItem 
                          key={exp._id}
                          icon={getCategoryIcon(exp.category)} 
                          title={exp.description} 
                          category={exp.category} 
                          mode={exp.paymentMode} 
                          amount={`${exp.type === 'income' ? '+' : '-'}${currency.symbol}${exp.amount.toFixed(2)}`} 
                          isIncome={exp.type === 'income'}
                          isSplit={exp.isSplit}
                          time={format(new Date(exp.date), 'hh:mm a')}
                          onDelete={async () => {
                            if (window.confirm(`Delete "${exp.description}"?${exp.isSplit ? '\n\nThis is a split expense — removing it will update balances for all participants.' : ''}`))
                            {
                              const ok = await deleteExpense(exp._id);
                              if (ok && exp.isSplit) fetchSplitBalances();
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                
                {expenses.length === 0 && !loading && (
                  <div className="text-center text-gray-500 text-sm py-10">No transactions found in this range.</div>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'recurring' && (
           <div className="space-y-4">
              {recurringExpenses.length === 0 ? (
                 <p className="text-center text-gray-500 text-sm py-10">No active recurring expenses.</p>
              ) : (
                 recurringExpenses.map(r => (
                   <div key={r._id} className="bg-white dark:bg-[#1A2130] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                     <div>
                       <h3 className="font-bold text-sm">{r.description}</h3>
                       <p className="text-xs text-gray-500 capitalize">{r.frequency} • Next run: {new Date(r.nextRunDate).toLocaleDateString()}</p>
                     </div>
                     <div className="flex items-center gap-3">
                       <span className="font-bold">{currency.symbol}{r.amount.toFixed(2)}</span>
                       <button onClick={() => deleteRecurringExpense(r._id)} className="text-red-500 p-1 bg-red-50 rounded-lg hover:bg-red-100">
                         <Trash2 size={16} />
                       </button>
                     </div>
                   </div>
                 ))
              )}
           </div>
        )}
      </div>

      {/* FAB - New Entry Button */}
      <button
        onClick={() => setIsFormOpen(true)}
        className="fixed bottom-[96px] right-4 z-40 w-14 h-14 rounded-full bg-primary shadow-[0_4px_20px_rgba(0,82,255,0.45)] flex items-center justify-center text-white hover:bg-blue-700 active:scale-95 transition-all"
        title="New Entry"
      >
        <Plus size={26} />
      </button>

      {/* Bottom Sheet Modal */}
      {isFormOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setIsFormOpen(false);
              // Reset form state when dismissed via backdrop
              setAmount('');
              setDescription('');
              setParticipants([]);
              setIsSplit(false);
              setNewParticipant('');
            }}
          />

          {/* Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-[#0B101B] rounded-t-[2rem] p-6 shadow-2xl animate-slide-up max-h-[92vh] overflow-y-auto pb-10">
            {/* Header */}
            {activeTab === 'recurring' ? (
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2"><RefreshCw size={18} className="text-primary" /> New Recurring Charge</h3>
                <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-white p-1"><X size={22} /></button>
              </div>
            ) : (
              <div className="flex justify-between items-center mb-4">
                <div className="flex bg-[#1A2130] rounded-lg p-1">
                  <button onClick={() => setType('expense')} className={cn("px-3 py-1 text-xs font-medium rounded-md transition", type === 'expense' ? "bg-gray-700 text-white shadow" : "text-gray-400")}>Expense</button>
                  <button onClick={() => setType('income')} className={cn("px-3 py-1 text-xs font-medium rounded-md transition", type === 'income' ? "bg-green-600 text-white shadow" : "text-gray-400")}>Income</button>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-white p-1"><X size={22} /></button>
              </div>
            )}

            <div className="flex items-center text-gray-400 text-5xl font-semibold mb-6 border-b border-gray-800 pb-2">
              <span className="mr-2">{currency.symbol}</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-transparent text-gray-500 outline-none w-full placeholder-gray-600 focus:text-white transition-colors" placeholder="0.00" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-[#1A2130] p-4 rounded-xl">
                <Pencil size={18} className="text-gray-400" />
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (e.g., Netflix)" className="bg-transparent text-sm text-white outline-none w-full placeholder-gray-500" />
              </div>

              {activeTab === 'recurring' && (
                <div className="flex gap-3">
                  <select value={frequency} onChange={e => setFrequency(e.target.value)} className="flex-1 bg-[#1A2130] text-sm text-gray-200 outline-none p-4 rounded-xl">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  <input type="date" value={nextRunDate} onChange={e => setNextRunDate(e.target.value)} className="flex-1 bg-[#1A2130] text-sm text-gray-200 outline-none p-4 rounded-xl" />
                </div>
              )}

              {activeTab === 'transactions' && type === 'expense' && (
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer ml-1">
                  <input type="checkbox" checked={isSplit} onChange={(e) => setIsSplit(e.target.checked)} className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-primary" />
                  Split this expense with friends
                </label>
              )}

              {activeTab === 'transactions' && isSplit && type === 'expense' && (
                <div className="bg-[#1A2130] p-4 rounded-xl space-y-3">
                  <label className="text-xs font-semibold text-gray-400 block">Select Group (Optional)</label>
                  <div className="flex gap-2">
                    <select className="flex-1 border border-gray-700 rounded-lg px-2 py-2 text-xs outline-none bg-[#0B101B] text-white focus:border-primary transition-colors cursor-pointer"
                      onChange={(e) => {
                        if (e.target.value === "") return;
                        const group = groups.find(g => g._id === e.target.value) || savedGroups.find(g => g.name === e.target.value);
                        if (group) {
                          const memberNames = group.members.filter(m => typeof m === 'object' ? m._id !== user._id : m !== user._id).map(m => m.name || m);
                          setParticipants([...new Set([...participants, ...memberNames])]);
                        }
                        e.target.value = "";
                      }}>
                      <option value="" className="bg-gray-800">+ Add Group...</option>
                      {savedGroups.map(g => <option key={g.name} value={g.name} className="bg-gray-800">{g.name}</option>)}
                      {groups.map(g => <option key={g._id} value={g._id} className="bg-gray-800">{g.name}</option>)}
                    </select>
                    <select className="flex-1 border border-gray-700 rounded-lg px-2 py-2 text-xs outline-none bg-[#0B101B] text-white focus:border-primary transition-colors cursor-pointer"
                      onChange={(e) => {
                        if (e.target.value === "") return;
                        if (!participants.includes(e.target.value)) setParticipants([...participants, e.target.value]);
                        e.target.value = "";
                      }}>
                      <option value="" className="bg-gray-800">+ Add Friend...</option>
                      {friends.map(f => <option key={f._id} value={f.name} className="bg-gray-800">{f.name}</option>)}
                    </select>
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-gray-400">Involved ({participants.length + 1})</label>
                    {participants.length > 0 && (
                      <button onClick={async () => {
                        const groupName = prompt("Enter a name for this group:");
                        if (groupName?.trim()) {
                          await updatePreferences({ groups: [...savedGroups, { name: groupName.trim(), members: participants }] });
                          setSelectedGroup(groupName.trim());
                        }
                      }} className="text-[10px] font-bold text-primary uppercase tracking-wider hover:text-blue-400 bg-blue-900/20 px-2 py-1 rounded-md">Save as Group</button>
                    )}
                  </div>
                  <div className="flex items-center border border-gray-700 rounded-lg px-3 py-2 bg-[#0B101B] focus-within:border-primary">
                    <input type="text" value={newParticipant} onChange={(e) => setNewParticipant(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && newParticipant.trim() && !participants.includes(newParticipant.trim())) { setParticipants([...participants, newParticipant.trim()]); setNewParticipant(''); } }}
                      placeholder="Or type a name... (Enter)" className="w-full text-sm outline-none bg-transparent text-white placeholder-gray-600" />
                    <button onClick={() => { if (newParticipant.trim() && !participants.includes(newParticipant.trim())) { setParticipants([...participants, newParticipant.trim()]); setNewParticipant(''); } }} className="p-1 text-primary w-6 h-6 flex items-center justify-center hover:bg-gray-800 rounded"><Plus size={16} /></button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <div className="flex items-center gap-2 bg-primary/20 text-primary px-3 py-1.5 rounded-full border border-primary/30"><span className="text-xs font-medium">You</span></div>
                    {participants.map((p, i) => (
                      <div key={i} className="flex items-center gap-1 bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-full group cursor-pointer hover:border-red-500/50">
                        <span className="text-xs font-medium text-gray-300">{p}</span>
                        <button onClick={() => setParticipants(participants.filter(x => x !== p))} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100">&times;</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <div className="flex-1 relative bg-[#1A2130] p-4 rounded-xl flex items-center justify-between focus-within:ring-1 focus-within:ring-primary">
                  <select value={category} onChange={handleCategoryChange} className="w-full h-full absolute inset-0 opacity-0 cursor-pointer">
                    {currentCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    <option value="ADD_NEW">+ Add New...</option>
                  </select>
                  <span className="text-sm font-medium text-gray-200 truncate pr-2">{category}</span>
                  <ChevronDown size={18} className="text-gray-500 pointer-events-none flex-shrink-0" />
                </div>
                <div className="flex-1 relative bg-[#1A2130] p-4 rounded-xl flex items-center justify-between focus-within:ring-1 focus-within:ring-primary">
                  <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className="w-full h-full absolute inset-0 opacity-0 cursor-pointer">
                    {paymentModes.map(mode => <option key={mode} value={mode}>{mode}</option>)}
                  </select>
                  <span className="text-sm font-medium text-gray-200 truncate pr-2">{paymentMode}</span>
                  <ChevronDown size={18} className="text-gray-500 pointer-events-none flex-shrink-0" />
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveExpense}
              disabled={loading}
              className={cn("w-full text-white font-semibold py-4 rounded-xl mt-6 shadow-lg disabled:opacity-50 transition-colors", type === 'income' ? 'bg-green-600 hover:bg-green-500' : 'bg-primary')}
            >
              {loading ? 'Saving...' : (activeTab === 'recurring' ? 'Start Recurring Charge' : `Save ${type === 'income' ? 'Income' : 'Expense'}`)}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ExpenseItem({ icon: Icon, title, category, mode, amount, time, isIncome, isSplit, onDelete }) {
  return (
    <div className="group flex items-center justify-between bg-white dark:bg-[#1A2130] p-4 rounded-2xl shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon size={18} className="text-gray-700 dark:text-gray-300" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h4>
            {isSplit && (
              <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full">Split</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
            <span>{category}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full mx-1"></span>
            <span>{mode}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <span className={`block text-sm font-bold ${isIncome ? "text-green-600" : "text-gray-900 dark:text-white"}`}>{amount}</span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">{time}</span>
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 flex-shrink-0"
            title="Delete transaction"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}