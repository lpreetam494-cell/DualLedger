import React, { useState, useEffect } from 'react';
import { Calendar, Layers, CreditCard, Utensils, CarFront, ShoppingCart, Pencil, ChevronDown, CircleAlert, Building2, Plus } from 'lucide-react';
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
  const { user, expenses, fetchExpenses, addExpense, loading, currency, updatePreferences, fetchSplitBalances } = useStore();
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('0.00');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  
  const [isSplit, setIsSplit] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [newParticipant, setNewParticipant] = useState('');

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
    fetchExpenses();
  }, [fetchExpenses]);

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

  const handlePaymentChange = async (e) => {
    const val = e.target.value;
    if (val === 'ADD_NEW') {
      const newMode = prompt("Enter new payment mode:");
      if (newMode && newMode.trim()) {
        if (!paymentModes.includes(newMode.trim())) {
          await updatePreferences({ paymentModes: [...paymentModes, newMode.trim()] });
        }
        setPaymentMode(newMode.trim());
      } else {
        setPaymentMode(paymentModes[0]);
      }
    } else {
      setPaymentMode(val);
    }
  };

  const handleAddParticipant = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      if (newParticipant.trim() && !participants.includes(newParticipant.trim())) {
        setParticipants([...participants, newParticipant.trim()]);
        setNewParticipant('');
      }
    }
  };

  const removeParticipant = (name) => {
    setParticipants(participants.filter(p => p !== name));
  };

  const handleSaveExpense = async () => {
    if (!amount || amount === '0.00' || !description) {
      alert('Please enter a valid amount and description.');
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
      setAmount('0.00');
      setDescription('');
      setParticipants([]);
      setIsSplit(false);
      setNewParticipant('');
      if (isSplit) {
        fetchSplitBalances();
      }
    } else {
      alert('Failed to save expense. Please verify your fields or check if you are logged in.');
    }
  };

  // Group expenses by date (simplified)
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
    <div className="min-h-screen pb-[400px]">
      <div className="p-6">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Transactions</h1>
        <p className="text-sm text-gray-600 mb-6">Track and manage your daily outflow and income.</p>

        <div className="flex gap-2 mb-8">
          <button className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-sm text-xs font-semibold text-gray-700 border border-gray-100">
            <Calendar size={14} className="text-black" />
            This Month
          </button>
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
                      time={format(new Date(exp.date), 'hh:mm a')} 
                    />
                  ))}
                </div>
              </div>
            ))}
            
            {expenses.length === 0 && !loading && (
              <div className="text-center text-gray-500 text-sm py-10">No transactions found. Add one below!</div>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-[80px] w-full max-w-md px-4 z-40">
        <div className="bg-[#0B101B] rounded-[2rem] p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold">New Entry</h3>
            <div className="flex bg-[#1A2130] rounded-lg p-1">
              <button 
                onClick={() => setType('expense')}
                className={cn("px-3 py-1 text-xs font-medium rounded-md transition", type === 'expense' ? "bg-gray-700 text-white shadow" : "text-gray-400")}
              >
                Expense
              </button>
              <button 
                onClick={() => setType('income')}
                className={cn("px-3 py-1 text-xs font-medium rounded-md transition", type === 'income' ? "bg-green-600 text-white shadow" : "text-gray-400")}
              >
                Income
              </button>
            </div>
          </div>
          
          <div className="flex items-center text-gray-400 text-5xl font-semibold mb-6 border-b border-gray-800 pb-2">
            <span className="mr-2">{currency.symbol}</span>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              className="bg-transparent text-gray-500 outline-none w-full placeholder-gray-600 focus:text-white transition-colors" 
              placeholder="0.00"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-[#1A2130] p-4 rounded-xl">
              <Pencil size={18} className="text-gray-400" />
              <input 
                type="text" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (e.g., Coffee)" 
                className="bg-transparent text-sm text-white outline-none w-full placeholder-gray-500" 
              />
            </div>
            
            {type === 'expense' && (
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer ml-1">
                <input 
                  type="checkbox" 
                  checked={isSplit} 
                  onChange={(e) => setIsSplit(e.target.checked)}
                  className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-primary focus:ring-primary focus:ring-offset-gray-900"
                />
                Split this expense with friends
              </label>
            )}

            {isSplit && type === 'expense' && (
              <div className="bg-[#1A2130] p-4 rounded-xl space-y-3">
                <label className="text-xs font-semibold text-gray-400 block">Involved ({participants.length + 1})</label>
                
                <div className="flex items-center border border-gray-700 rounded-lg px-3 py-2 bg-[#0B101B] focus-within:border-primary transition-colors">
                  <input 
                    type="text" 
                    value={newParticipant}
                    onChange={(e) => setNewParticipant(e.target.value)}
                    onKeyDown={handleAddParticipant}
                    placeholder="Add friend's name... (Press Enter)"
                    className="w-full text-sm outline-none bg-transparent text-white placeholder-gray-600"
                  />
                  <button onClick={handleAddParticipant} className="p-1 text-primary rounded outline-none w-6 h-6 flex items-center justify-center hover:bg-gray-800">
                    <Plus size={16} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <div className="flex items-center gap-2 bg-primary/20 text-primary px-3 py-1.5 rounded-full border border-primary/30">
                    <span className="text-xs font-medium">You</span>
                  </div>
                  {participants.map((p, i) => (
                    <div key={i} className="flex items-center gap-1 bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-full group cursor-pointer hover:border-red-500/50 hover:bg-red-500/10 transition-colors">
                      <span className="text-xs font-medium text-gray-300">{p}</span>
                      <button onClick={() => removeParticipant(p)} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <div className="flex-1 relative bg-[#1A2130] p-4 rounded-xl flex items-center justify-between focus-within:ring-1 focus-within:ring-primary transition-all">
                <select 
                  value={category} 
                  onChange={handleCategoryChange} 
                  className="w-full h-full absolute inset-0 opacity-0 cursor-pointer"
                >
                  {currentCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  <option value="ADD_NEW">+ Add New...</option>
                </select>
                <span className="text-sm font-medium text-gray-200 truncate pr-2">{category}</span>
                <ChevronDown size={18} className="text-gray-500 pointer-events-none flex-shrink-0" />
              </div>
              <div className="flex-1 relative bg-[#1A2130] p-4 rounded-xl flex items-center justify-between focus-within:ring-1 focus-within:ring-primary transition-all">
                <select 
                  value={paymentMode} 
                  onChange={handlePaymentChange} 
                  className="w-full h-full absolute inset-0 opacity-0 cursor-pointer"
                >
                  {paymentModes.map(mode => <option key={mode} value={mode}>{mode}</option>)}
                  <option value="ADD_NEW">+ Add New...</option>
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
            {loading ? 'Saving...' : `Save ${type === 'income' ? 'Income' : 'Expense'}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function ExpenseItem({ icon: Icon, title, category, mode, amount, time, isIncome }) {
  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
          <Icon size={20} className="text-gray-800" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
          <div className="flex items-center gap-1 text-[10px] text-gray-500">
            <span>{category}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full mx-1"></span>
            <span>{mode}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <span className={cn("block text-sm font-bold", isIncome ? "text-green-600" : "text-gray-900")}>{amount}</span>
        <span className="text-[10px] text-gray-500">{time}</span>
      </div>
    </div>
  );
}