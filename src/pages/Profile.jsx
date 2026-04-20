import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, Banknote, Moon, Shield, ChevronRight, Download } from 'lucide-react';
import { useStore } from '../store/useStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Profile() {
  const navigate = useNavigate();
  const { theme, toggleTheme, expenses, currency, setCurrency, user, logout } = useStore();

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
        `"${exp.description}"`,
        `"${exp.category}"`,
        `"${exp.paymentMode}"`,
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
    <div className="p-6 space-y-6 min-h-screen dark:bg-[#0B101B]">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Profile" className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-800" />
          <h1 className="text-sm font-bold dark:text-white">DualLedger</h1>
        </div>
        <button className="p-2">
          <Bell size={20} className="text-gray-800 dark:text-white" />
        </button>
      </div>

      <div className="flex flex-col items-center pt-4 pb-2">
        <div className="w-24 h-24 bg-[#1F2123] rounded-full flex items-center justify-center mb-4 border-4 border-white dark:border-gray-800 shadow-sm overflow-hidden">
          <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Large Profile" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-2xl font-bold dark:text-white">{user ? user.name : 'Guest'}</h2>
        <p className="text-sm text-gray-500 mt-1">{user ? user.email : 'Not logged in'}</p>
      </div>

      <div>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-4">ACCOUNT & DATA</p>
        <div className="bg-white dark:bg-[#1A2130] rounded-3xl shadow-sm overflow-hidden transition-colors">
          <SettingItem icon={User} title="Personal Information" subtitle="Update your details" hasArrow borderBottom />
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
        <div className="bg-white dark:bg-[#1A2130] rounded-3xl shadow-sm overflow-hidden transition-colors">
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
          <SettingItem icon={Shield} title="Security & Privacy" subtitle="Password, 2FA" hasArrow />
        </div>
      </div>

      <div className="pt-2">
        <button 
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full bg-white dark:bg-[#1A2130] text-red-600 font-semibold py-4 rounded-3xl shadow-sm border-2 border-transparent hover:border-red-100 dark:hover:border-red-900 transition-colors"
        >
          Log Out
        </button>
      </div>
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
