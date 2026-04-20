import React, { useEffect } from 'react';
import { Bell, Utensils, CarFront, ShoppingBag, Home as HomeIcon, Building2, Layers } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useStore } from '../store/useStore';

export default function Home() {
  const { insights, fetchInsights, loading, currency } = useStore();

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const totalSpent = insights?.totalSpent || 0;
  const categories = insights?.categories || [];
  const dayTrends = insights?.dayTrends || [];

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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Profile" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
          <h1 className="text-xl font-bold">DualLedger</h1>
        </div>
        <button className="p-2 bg-white rounded-full shadow-sm">
          <Bell size={20} className="text-gray-800" />
        </button>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-soft">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Balance</p>
        <h2 className="text-4xl font-extrabold tracking-tight mb-2">{currency.symbol}124,590.00</h2>
        <div className="flex items-center gap-2 mb-6">
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-md">+2.4%</span>
          <span className="text-xs text-gray-500">vs last month</span>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 bg-black text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition">
            Add<br />Expense
          </button>
          <button className="flex-1 bg-primary text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition shadow-[0_4px_14px_0_rgba(0,82,255,0.39)]">
            Split<br />Expense
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 bg-gray-100 p-5 rounded-3xl">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Monthly Spending</p>
          <h3 className="text-xl font-bold mb-4">{currency.symbol}{totalSpent.toFixed(2)}</h3>
          <div className="w-full bg-gray-200 rounded-full h-1 mb-2">
            <div className="bg-black h-1 rounded-full w-[65%]"></div>
          </div>
          <p className="text-[10px] text-gray-500 text-right">Current cycle</p>
        </div>

        <div className="flex-1 bg-gray-100 p-5 rounded-3xl">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Savings</p>
          <h3 className="text-xl font-bold mb-2">{currency.symbol}32,100.00</h3>
          <p className="text-[10px] text-gray-500">+ {currency.symbol}1,200 this month</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-soft">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold">Spending Trends</h3>
            <p className="text-xs text-gray-500">By Day</p>
          </div>
        </div>
        <div className="h-32 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <Line type="monotone" dataKey="value" stroke="#000" strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, fill: '#000' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-medium">
          {daysMap.map(day => <span key={day}>{day}</span>)}
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-4">Categories</h3>
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
        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
          <Icon size={20} className="text-gray-800" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
          <p className="text-[10px] text-gray-500">{subtitle}</p>
        </div>
      </div>
      <span className="text-sm font-bold text-gray-900">{amount}</span>
    </div>
  );
}
