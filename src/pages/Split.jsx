import React, { useEffect, useState } from 'react';
import { Bell, Banknote, Utensils, ShoppingBag, Plus } from 'lucide-react';
import { useStore } from '../store/useStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Split() {
  const { splitBalances, fetchSplitBalances, addExpense, loading, currency, user, toggleNotifications } = useStore();
  
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('0.00');
  const [participants, setParticipants] = useState([]);
  const [newParticipant, setNewParticipant] = useState('');

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

  useEffect(() => {
    fetchSplitBalances();
  }, [fetchSplitBalances]);

  const handleSaveSplit = async () => {
    if (!desc || amount === '0.00' || participants.length === 0) {
      alert("Please enter a description, a valid amount, and add at least one participant to split with.");
      return;
    }
    
    // Dynamic split equal distribution
    const totalAmount = parseFloat(amount);
    const splitCount = participants.length + 1; // Participants + You
    const splitAmount = totalAmount / splitCount;

    const splitDetails = participants.map(name => ({
      userId: name,
      amountOwed: splitAmount
    }));

    const success = await addExpense({
      amount: totalAmount,
      description: desc,
      category: 'General',
      paymentMode: 'Split',
      isSplit: true,
      splitDetails: splitDetails
    });
    
    if (success) {
      setDesc('');
      setAmount('0.00');
      setParticipants([]);
      fetchSplitBalances(); // refresh debts
    } else {
      alert('Failed to add split expense!');
    }
  };

  const netBalances = splitBalances?.netBalances || {};
  const settlements = splitBalances?.settlements || [];

  // Calculate my balance
  const myBalance = netBalances[user?._id] || 0;
  const iOwe = myBalance < 0 ? Math.abs(myBalance) : 0;
  const imOwed = myBalance > 0 ? myBalance : 0;

  return (
    <div className="p-6 space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Profile" className="w-8 h-8 rounded-full border border-gray-200" />
          <h1 className="text-sm font-bold">DualLedger</h1>
        </div>
        <button onClick={toggleNotifications} className="p-2">
          <Bell size={20} className="text-gray-800" />
        </button>
      </div>

      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Group Balances</h2>
        <p className="text-sm text-gray-500 mb-4">Debt Simplification & Settle Up</p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 bg-white p-5 rounded-[2rem] shadow-sm flex flex-col justify-between">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">YOU OWE</p>
            <h3 className="text-2xl font-bold text-red-600 mb-1">{currency.symbol}{iOwe.toFixed(2)}</h3>
          </div>

          <div className="flex-1 bg-white p-5 rounded-[2rem] shadow-sm flex flex-col justify-between">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">YOU ARE OWED</p>
            <h3 className="text-2xl font-bold text-primary mb-1">{currency.symbol}{imOwed.toFixed(2)}</h3>
          </div>
        </div>

        <div className="bg-[#0B101B] p-6 rounded-[2rem] shadow-md text-white">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">SUGGESTED SETTLEMENTS</h3>
          {settlements.length === 0 ? (
            <p className="text-sm text-gray-400">All debts are settled!</p>
          ) : (
            <div className="space-y-3">
              {settlements.map((s, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <span className="text-sm">{s.from === user?._id ? 'You' : s.from} pays {s.to === user?._id ? 'You' : s.to}</span>
                  <span className="font-bold">{currency.symbol}{s.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm">
        <h3 className="font-bold mb-4">Add Split Expense</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Description</label>
            <input type="text" value={desc} onChange={(e)=>setDesc(e.target.value)} placeholder="e.g. Dinner" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Amount</label>
            <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 focus-within:border-primary">
              <span className="text-gray-500 mr-2">{currency.symbol}</span>
              <input type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="0.00" className="w-full text-sm outline-none bg-transparent" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-2">Involved ({participants.length + 1})</label>
            
            <div className="flex items-center border border-gray-200 rounded-xl px-4 py-2 mb-3 bg-white focus-within:border-primary">
              <input 
                type="text" 
                value={newParticipant}
                onChange={(e) => setNewParticipant(e.target.value)}
                onKeyDown={handleAddParticipant}
                placeholder="Add friend's name... (Press Enter)"
                className="w-full text-sm outline-none bg-transparent"
              />
              <button onClick={handleAddParticipant} className="p-1 text-primary rounded outline-none w-6 h-6 flex items-center justify-center hover:bg-gray-100">
                <Plus size={16} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full">
                <span className="text-xs font-medium">You</span>
              </div>
              {participants.map((p, i) => (
                <div key={i} className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full group cursor-pointer hover:bg-red-50 transition-colors">
                  <span className="text-xs font-medium text-gray-700">{p}</span>
                  <button onClick={() => removeParticipant(p)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleSaveSplit} disabled={loading} className="w-full bg-primary text-white font-semibold py-3 rounded-xl mt-2 shadow-[0_4px_14px_0_rgba(0,82,255,0.39)] disabled:opacity-50">
            {loading ? 'Saving...' : 'Save & Split Equally'}
          </button>
        </div>
      </div>
    </div>
  );
}
