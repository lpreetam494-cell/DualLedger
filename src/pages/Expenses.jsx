import React, { useState, useEffect } from 'react';
import { Calendar, Layers, CreditCard, Utensils, CarFront, ShoppingCart, Pencil, ChevronDown, CircleAlert, Building2 } from 'lucide-react';
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

export default function Expenses() {
  const { expenses, fetchExpenses, addExpense, loading, currency } = useStore();
  const [amount, setAmount] = useState('0.00');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [paymentMode, setPaymentMode] = useState('Credit Card');

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleSaveExpense = async () => {
    if (!amount || amount === '0.00' || !description) return;
    
    const success = await addExpense({
      amount: parseFloat(amount),
      description,
      category,
      paymentMode,
      isSplit: false
    });

    if (success) {
      setAmount('0.00');
      setDescription('');
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
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Expenses</h1>
        <p className="text-sm text-gray-600 mb-6">Track and manage your daily outflow.</p>

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
                      amount={`-${currency.symbol}${exp.amount.toFixed(2)}`} 
                      time={format(new Date(exp.date), 'hh:mm a')} 
                    />
                  ))}
                </div>
              </div>
            ))}
            
            {expenses.length === 0 && !loading && (
              <div className="text-center text-gray-500 text-sm py-10">No expenses found. Add one below!</div>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-[80px] w-full max-w-md px-4 z-40">
        <div className="bg-[#0B101B] rounded-[2rem] p-6 shadow-2xl">
          <h3 className="text-white font-semibold mb-4">New Entry</h3>
          
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
            
            <div className="flex gap-3">
              <div className="flex-1 flex items-center justify-between bg-[#1A2130] p-4 rounded-xl">
                <span className="text-sm font-medium text-gray-200">{category}</span>
                <ChevronDown size={18} className="text-gray-500" />
              </div>
              <div className="flex-1 flex items-center justify-between bg-[#1A2130] p-4 rounded-xl">
                <span className="text-sm font-medium text-gray-200">{paymentMode}</span>
                <ChevronDown size={18} className="text-gray-500" />
              </div>
            </div>
          </div>

          <button 
            onClick={handleSaveExpense}
            disabled={loading}
            className="w-full bg-primary text-white font-semibold py-4 rounded-xl mt-6 shadow-[0_4px_14px_0_rgba(0,82,255,0.39)] disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Expense'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ExpenseItem({ icon: Icon, title, category, mode, amount, time }) {
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
        <span className="block text-sm font-bold text-gray-900">{amount}</span>
        <span className="text-[10px] text-gray-500">{time}</span>
      </div>
    </div>
  );
}