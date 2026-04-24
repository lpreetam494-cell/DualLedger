import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Utensils, CarFront, ShoppingBag, Home as HomeIcon, Building2, Layers } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useStore } from '../store/useStore';
import Logo from '../components/Logo';

const currencies = [
  { label: 'USD', symbol: '$' },
  { label: 'EUR', symbol: '€' },
  { label: 'GBP', symbol: '£' },
  { label: 'INR', symbol: '₹' },
  { label: 'JPY', symbol: '¥' },
];

export default function Home() {
  const navigate = useNavigate();
  const { user, insights, fetchInsights, loading, currency, setCurrency, toggleNotifications } = useStore();

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const totalSpent = insights?.totalSpent || 0;
  const currentBalance = insights?.currentBalance || 0;
  const totalIncome = insights?.totalIncome || 0;
  const categories = insights?.categories || [];
  const dayTrends = insights?.dayTrends || [];

  const budgets = user?.preferences?.budgets || {};
  const totalBudget = Object.values(budgets).reduce((acc, val) => acc + Number(val), 0);
  const spendingPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  
  const getProgressColor = (percent) => {
    if (percent < 50) return 'bg-green-500';
    if (percent < 85) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Transform dayTrends to what recharts needs
  const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const trendData = daysMap.map((day, index) => {
    // MongoDB dayOfWeek 1=Sun, 2=Mon... index is 0=Sun. So dayOfWeek = index + 1
    const found = dayTrends.find(d => d._id === index + 1);
    return { name: day, value: found ? found.totalSpent : 0 };
  });

  const getCategoryIcon = (category) => {
    switch(category?.toLowerCase()) {
      case 'food & dining': return Utensils;
      case 'transportation': return CarFront;
      case 'groceries': return ShoppingBag;
      case 'housing': return HomeIcon;
      default: return Layers;
    }
  };

  return (
    <div className="p-6 space-y-6 pb-32">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8" color="#0052FF" />
          <h1 className="text-xl font-extrabold tracking-tight dark:text-white">DualLedger</h1>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={currency.label} 
            onChange={(e) => {
              const selected = currencies.find(c => c.label === e.target.value);
              if (selected) setCurrency(selected);
            }}
            className="bg-gray-100 dark:bg-dark-surface text-xs font-semibold px-2 py-1.5 rounded-lg outline-none cursor-pointer dark:text-white border-r-4 border-transparent"
          >
            {currencies.map(c => <option key={c.label} value={c.label}>{c.label} ({c.symbol})</option>)}
          </select>
          <button onClick={toggleNotifications} className="p-2 bg-white dark:bg-dark-surface rounded-full shadow-sm border border-transparent dark:border-dark-border">
            <Bell size={20} className="text-gray-800 dark:text-white" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface p-6 rounded-[2rem] shadow-soft border border-transparent dark:border-dark-border">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Balance</p>
        <h2 className="text-4xl font-extrabold tracking-tight mb-6 dark:text-white">{currency.symbol}{currentBalance.toFixed(2)}</h2>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/transactions')}
            className="flex-1 bg-black text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition"
          >
            Add<br />Transaction
          </button>
          <button 
            onClick={() => navigate('/split')}
            className="flex-1 bg-primary text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition shadow-[0_4px_14px_0_rgba(0,82,255,0.39)]"
          >
            Split<br />Expense
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 bg-gray-100 dark:bg-dark-surface p-5 rounded-[2rem] border border-transparent dark:border-dark-border">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Monthly Spending</p>
          <div className="flex items-baseline gap-2 mb-4">
            <h3 className="text-xl font-bold dark:text-white">{currency.symbol}{totalSpent.toFixed(2)}</h3>
            {totalBudget > 0 && <span className="text-xs text-gray-400">/ {currency.symbol}{totalBudget.toFixed(0)}</span>}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-2 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${totalBudget > 0 ? getProgressColor(spendingPercentage) : "bg-black dark:bg-primary"}`} style={{ width: `${totalBudget > 0 ? Math.min(spendingPercentage, 100) : 65}%` }}></div>
          </div>
          <p className="text-[10px] text-gray-500 text-right">{totalBudget > 0 ? `${spendingPercentage.toFixed(0)}% used` : 'Current cycle'}</p>
        </div>

        <div className="flex-1 bg-gray-100 dark:bg-dark-surface p-5 rounded-[2rem] border border-transparent dark:border-dark-border">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Income</p>
          <h3 className="text-xl font-bold mb-2 dark:text-white">{currency.symbol}{totalIncome.toFixed(2)}</h3>
          <p className="text-[10px] text-gray-500">Current cycle</p>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl shadow-soft border border-transparent dark:border-dark-border">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold dark:text-white">Spending Trends</h3>
            <p className="text-xs text-gray-500">By Day</p>
          </div>
        </div>
        <div className="h-32 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={localStorage.getItem('theme') === 'dark' ? '#60A5FA' : '#000'} 
                  strokeWidth={2} 
                  dot={{ r: 4, strokeWidth: 2, fill: localStorage.getItem('theme') === 'dark' ? '#16181D' : '#fff' }} 
                  activeDot={{ r: 6, fill: localStorage.getItem('theme') === 'dark' ? '#60A5FA' : '#000' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-medium">
          {daysMap.map(day => <span key={day}>{day}</span>)}
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-4 dark:text-white">Categories</h3>
        <div className="space-y-3">
          {categories.slice(0, 4).map((cat) => (
            <CategoryItem 
              key={cat._id}
              icon={getCategoryIcon(cat._id)} 
              title={cat._id} 
              subtitle={`${((cat.totalSpent / (totalSpent || 1)) * 100).toFixed(0)}% of expenses`} 
              amount={`${currency.symbol}${cat.totalSpent.toFixed(2)}`} 
            />
          ))}
          {categories.length === 0 && !loading && <p className="text-xs text-gray-500">No categories found yet.</p>}
        </div>
      </div>
    </div>
  );
}

function CategoryItem({ icon: Icon, title, subtitle, amount }) {
  return (
    <div className="flex items-center justify-between p-2">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-100 dark:bg-dark-surface rounded-2xl flex items-center justify-center border border-transparent dark:border-dark-border">
          <Icon size={20} className="text-gray-800 dark:text-gray-200" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h4>
          <p className="text-[10px] text-gray-500">{subtitle}</p>
        </div>
      </div>
      <span className="text-sm font-bold text-gray-900 dark:text-white">{amount}</span>
    </div>
  );
}
