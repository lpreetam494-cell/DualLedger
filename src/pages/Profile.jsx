import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, Banknote, Moon, Shield, ChevronRight, Download, X, Activity, PieChart } from 'lucide-react';
import { useStore } from '../store/useStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Profile() {
  const navigate = useNavigate();
  const { theme, toggleTheme, expenses, currency, setCurrency, user, logout, toggleNotifications, updatePreferences } = useStore();
  const [infoOpen, setInfoOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [budgetsOpen, setBudgetsOpen] = useState(false);
  const [localBudgets, setLocalBudgets] = useState({});

  const handleCurrencyToggle = () => {
    const currencies = [
      { label: 'USD ($)', symbol: '$' },
      { label: 'EUR (€)', symbol: '€' },
      { label: 'GBP (£)', symbol: '£' },
      { label: 'INR (₹)', symbol: '₹' }
    ];
    const currentIndex = currencies.findIndex(c => c.label === currency.label);
    const nextIndex = (currentIndex + 1) % currencies.length;
    setCurrency(currencies[nextIndex]);
  };

  const handleExportCSV = () => {
    if (!expenses || expenses.length === 0) return alert('No expenses to export');

    const headers = ['Date', 'Description', 'Category', 'Mode', 'Amount', 'Split'];
    const csvRows = [];
    csvRows.push(headers.join(','));

    expenses.forEach(exp => {
      const row = [
        new Date(exp.date).toLocaleDateString(),
        `"${(exp.description || '').replace(/"/g, '""')}"`,
        `"${(exp.category || '').replace(/"/g, '""')}"`,
        `"${(exp.paymentMode || '').replace(/"/g, '""')}"`,
        exp.amount,
        exp.isSplit ? 'Yes' : 'No'
      ];
      csvRows.push(row.join(','));
    });

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'DualLedger_Expenses.csv');
    a.click();
  };

  return (
    <div className="p-6 space-y-6 min-h-screen dark:bg-dark pb-32">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm border border-gray-200 dark:border-gray-800">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <h1 className="text-sm font-bold dark:text-white">DualLedger</h1>
        </div>
        <button className="p-2" onClick={toggleNotifications}>
          <Bell size={20} className="text-gray-800 dark:text-white" />
        </button>
      </div>

      <div className="flex flex-col items-center pt-4 pb-2">
        <div className="w-24 h-24 bg-[#1F2123] rounded-full flex items-center justify-center mb-4 border-4 border-white dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="w-full h-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-4xl">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
        <h2 className="text-2xl font-bold dark:text-white">{user ? user.name : 'Guest'}</h2>
        <p className="text-sm text-gray-500 mt-1">{user ? user.email : 'Not logged in'}</p>
      </div>

      <div>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-4">ACCOUNT & DATA</p>
        <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-sm overflow-hidden transition-colors border border-transparent dark:border-dark-border">
          <SettingItem icon={User} title="Personal Information" subtitle="Update your details" hasArrow borderBottom cursor="pointer" onClick={() => setInfoOpen(true)} />
          <SettingItem 
            icon={Banknote} 
            title="Currency" 
            subtitle={currency.label} 
            cursor="pointer" 
            onClick={handleCurrencyToggle} 
            borderBottom 
          />
          <SettingItem 
            icon={Download} 
            title="Export Data" 
            subtitle="Download expenses as CSV" 
            onClick={handleExportCSV}
            cursor="pointer"
          />
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-4">PREFERENCES</p>
        <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-sm overflow-hidden transition-colors border border-transparent dark:border-dark-border">
          <SettingItem 
            icon={Moon} 
            title="Dark Mode" 
            subtitle="Toggle appearance" 
            cursor="pointer"
            onClick={toggleTheme}
            rightElement={
              <div className={cn("w-10 h-6 rounded-full p-1 relative transition-colors duration-300", theme === 'dark' ? 'bg-primary' : 'bg-gray-200')}>
                <div className={cn("w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-transform duration-300", theme === 'dark' ? 'translate-x-4' : 'translate-x-0')}></div>
              </div>
            } 
            borderBottom 
          />
          <SettingItem icon={Shield} title="Security & Privacy" subtitle="Password, 2FA" hasArrow cursor="pointer" onClick={() => setSecurityOpen(true)} />
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-4">PLANNING</p>
        <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-sm overflow-hidden transition-colors border border-transparent dark:border-dark-border">
          <SettingItem 
            icon={Activity} 
            title="Category Budgets" 
            subtitle="Set spending limits" 
            hasArrow 
            cursor="pointer" 
            onClick={() => {
              const currentBudgets = user?.preferences?.budgets || {};
              setLocalBudgets(currentBudgets);
              setBudgetsOpen(true);
            }} 
          />
        </div>
      </div>

      <div className="pt-2">
        <button 
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full bg-white dark:bg-dark-surface text-red-600 font-semibold py-4 rounded-3xl shadow-sm border-2 border-transparent hover:border-red-100 dark:hover:border-red-900 transition-colors"
        >
          Log Out
        </button>
      </div>

      {/* Modals */}
      {infoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setInfoOpen(false)}></div>
          <div className="bg-white dark:bg-dark-surface w-full max-w-sm rounded-[2rem] shadow-2xl relative z-10 overflow-hidden transform transition-all border border-transparent dark:border-dark-border">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold dark:text-white">Personal Info</h2>
              <button onClick={() => setInfoOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full"><X size={18} className="text-gray-600 dark:text-gray-300" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Full Name</label>
                <div className="w-full bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 text-sm">{user?.name}</div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Email Address</label>
                <div className="w-full bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 text-sm">{user?.email}</div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Account ID</label>
                <div className="w-full bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 text-xs font-mono text-gray-400">{user?._id}</div>
              </div>
              <button className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-400 font-semibold rounded-xl" disabled>Update (Coming Soon)</button>
            </div>
          </div>
        </div>
      )}

      {budgetsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setBudgetsOpen(false)}></div>
          <div className="bg-white dark:bg-dark-surface w-full max-w-sm rounded-[2rem] shadow-2xl relative z-10 overflow-hidden transform transition-all flex flex-col max-h-[80vh] border border-transparent dark:border-dark-border">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold dark:text-white">Category Budgets</h2>
              <button onClick={() => setBudgetsOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full"><X size={18} className="text-gray-600 dark:text-gray-300" /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto no-scrollbar flex-1">
              <p className="text-xs text-gray-500 mb-2">Set monthly spending limits for your expense categories. 0 means no limit.</p>
              {(user?.preferences?.expenseCategories || ['Food & Dining', 'Transportation', 'Groceries', 'Housing', 'Entertainment']).map(cat => (
                <div key={cat} className="flex items-center justify-between gap-4">
                  <label className="text-sm font-medium dark:text-gray-200 truncate flex-1">{cat}</label>
                  <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 px-3 py-2 w-32">
                    <span className="text-gray-400 text-xs mr-1">{currency.symbol}</span>
                    <input 
                      type="number" 
                      value={localBudgets[cat] || ''} 
                      onChange={(e) => setLocalBudgets({...localBudgets, [cat]: parseFloat(e.target.value) || 0})}
                      placeholder="0"
                      className="w-full bg-transparent text-sm outline-none dark:text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-gray-800">
              <button 
                onClick={async () => {
                  const success = await updatePreferences({ budgets: localBudgets });
                  if (success) setBudgetsOpen(false);
                }}
                className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20"
              >
                Save Budgets
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingItem({ icon: Icon, title, subtitle, hasArrow, rightElement, borderBottom, onClick, cursor }) {
  return (
    <div 
      className={cn("flex items-center justify-between p-4", borderBottom && "border-b border-gray-50 dark:border-gray-800", cursor === "pointer" && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors")}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center transition-colors">
          <Icon size={18} className="text-gray-800 dark:text-gray-200" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white transition-colors">{title}</h4>
          <p className="text-[10px] text-gray-500">{subtitle}</p>
        </div>
      </div>
      <div>
        {hasArrow && <ChevronRight size={18} className="text-gray-400" />}
        {rightElement}
      </div>
    </div>
  );
}
