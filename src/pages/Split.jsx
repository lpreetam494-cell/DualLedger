import React, { useEffect, useState } from 'react';
import { Bell, Banknote, Utensils, ShoppingBag, Plus } from 'lucide-react';
import { useStore } from '../store/useStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Split() {
  const { splitBalances, fetchSplitBalances, addExpense, loading, currency, user, toggleNotifications, updatePreferences, groups, friends, fetchGroups, fetchFriends } = useStore();
  
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('0.00');
  const [participants, setParticipants] = useState([]);
  const [newParticipant, setNewParticipant] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('');
  
  const savedGroups = user?.preferences?.groups || [];

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
    fetchGroups();
    fetchFriends();
  }, [fetchSplitBalances, fetchGroups, fetchFriends]);

  const handleSaveSplit = async () => {
    if (!desc || amount === '0.00' || participants.length === 0) {
      alert("Please enter a description, a valid amount, and add at least one participant to split with.");
      return;
    }
    
    setIsSaving(true);
    try {
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
        await fetchSplitBalances(); // refresh debts immediately
      } else {
        alert('Failed to add split expense!');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const netBalances = splitBalances?.netBalances || {};
  const settlements = splitBalances?.settlements || [];

  // Calculate my balance
  const myBalance = netBalances[user?._id] || 0;
  const iOwe = myBalance < 0 ? Math.abs(myBalance) : 0;
  const imOwed = myBalance > 0 ? myBalance : 0;

  return (
    <div className="p-6 space-y-6 pb-24 min-h-screen dark:bg-[#0B101B]">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm border border-gray-200 dark:border-gray-800">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <h1 className="text-sm font-bold dark:text-white">DualLedger</h1>
        </div>
        <button onClick={toggleNotifications} className="p-2">
          <Bell size={20} className="text-gray-800 dark:text-white" />
        </button>
      </div>

      <div>
        <h2 className="text-3xl font-extrabold tracking-tight dark:text-white">Group Balances</h2>
        <p className="text-sm text-gray-500 mb-4">Debt Simplification & Settle Up</p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 bg-white dark:bg-[#1A2130] p-5 rounded-[2rem] shadow-sm flex flex-col justify-between transition-colors">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">YOU OWE</p>
            <h3 className="text-2xl font-bold text-red-600 mb-1">{currency.symbol}{iOwe.toFixed(2)}</h3>
          </div>

          <div className="flex-1 bg-white dark:bg-[#1A2130] p-5 rounded-[2rem] shadow-sm flex flex-col justify-between transition-colors">
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

      <div className="bg-white dark:bg-[#1A2130] p-6 rounded-[2rem] shadow-sm transition-colors">
        <h3 className="font-bold mb-4 dark:text-white">Add Split Expense</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Description</label>
            <input type="text" value={desc} onChange={(e)=>setDesc(e.target.value)} placeholder="e.g. Dinner" className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary dark:bg-[#0B101B] dark:text-white transition-colors" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Amount</label>
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus-within:border-primary dark:bg-[#0B101B] transition-colors">
              <span className="text-gray-500 mr-2">{currency.symbol}</span>
              <input type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="0.00" className="w-full text-sm outline-none bg-transparent dark:text-white" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Select Group (Optional)</label>
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus-within:border-primary dark:bg-[#0B101B] transition-colors mb-4">
              <select 
                value={selectedGroup}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedGroup(val);
                  if (val) {
                    const group = savedGroups.find(g => g.name === val);
                    if (group) setParticipants(group.members);
                  } else {
                    setParticipants([]);
                  }
                }}
                className="w-full text-sm outline-none bg-transparent dark:text-white cursor-pointer"
              >
                <option value="" className="dark:bg-gray-800">-- Manual Selection --</option>
                {savedGroups.map(g => (
                  <option key={g.name} value={g.name} className="dark:bg-gray-800">{g.name} ({g.members.length} members)</option>
                ))}
              </select>
            </div>

            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Involved ({participants.length + 1})</label>
              {participants.length > 0 && (
                <button 
                  onClick={async () => {
                    const groupName = prompt("Enter a name for this group:");
                    if (groupName && groupName.trim()) {
                      const newGroup = { name: groupName.trim(), members: participants };
                      await updatePreferences({ groups: [...savedGroups, newGroup] });
                      setSelectedGroup(groupName.trim());
                    }
                  }}
                  className="text-[10px] font-bold text-primary uppercase tracking-wider hover:text-blue-700 transition-colors bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md"
                >
                  Save as Group
                </button>
              )}
            </div>
            
            <div className="flex gap-2 mb-3">
               <select 
                 className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm outline-none bg-white dark:bg-[#0B101B] dark:text-white focus:border-primary transition-colors"
                 onChange={(e) => {
                   if (e.target.value === "") return;
                   const group = groups.find(g => g._id === e.target.value);
                   if (group) {
                     // Filter out user themselves, map back to names/emails if populated
                     const memberNames = group.members.filter(m => typeof m === 'object' ? m._id !== user._id : m !== user._id).map(m => m.name || m);
                     const uniqueMembers = [...new Set([...participants, ...memberNames])];
                     setParticipants(uniqueMembers);
                   }
                   e.target.value = "";
                 }}
               >
                 <option value="" className="dark:bg-gray-800">+ Add Group...</option>
                 {groups.map(g => <option key={g._id} value={g._id} className="dark:bg-gray-800">{g.name}</option>)}
               </select>

               <select 
                 className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm outline-none bg-white dark:bg-[#0B101B] dark:text-white focus:border-primary transition-colors"
                 onChange={(e) => {
                   if (e.target.value === "") return;
                   const name = e.target.value;
                   if (!participants.includes(name)) setParticipants([...participants, name]);
                   e.target.value = "";
                 }}
               >
                 <option value="" className="dark:bg-gray-800">+ Add Friend...</option>
                 {friends.map(f => <option key={f._id} value={f.name} className="dark:bg-gray-800">{f.name}</option>)}
               </select>
            </div>

            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 mb-3 bg-white dark:bg-[#0B101B] focus-within:border-primary transition-colors">
              <input 
                type="text" 
                value={newParticipant}
                onChange={(e) => setNewParticipant(e.target.value)}
                onKeyDown={handleAddParticipant}
                placeholder="Or type a name manually... (Press Enter)"
                className="w-full text-sm outline-none bg-transparent dark:text-white"
              />
              <button onClick={handleAddParticipant} className="p-1 text-primary rounded outline-none w-6 h-6 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800">
                <Plus size={16} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full">
                <span className="text-xs font-medium">You</span>
              </div>
              {participants.map((p, i) => (
                <div key={i} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full group cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{p}</span>
                  <button onClick={() => removeParticipant(p)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleSaveSplit} disabled={isSaving} className="w-full bg-primary text-white font-semibold py-3 rounded-xl mt-2 shadow-[0_4px_14px_0_rgba(0,82,255,0.39)] disabled:opacity-50">
            {isSaving ? 'Saving...' : 'Save & Split Equally'}
          </button>
        </div>
      </div>
    </div>
  );
}
