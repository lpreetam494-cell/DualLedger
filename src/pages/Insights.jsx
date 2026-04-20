import React, { useEffect } from 'react';
import { TrendingUp, CalendarDays, MoreHorizontal } from 'lucide-react';
import { BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useStore } from '../store/useStore';

export default function Insights() {
  const { insights, fetchInsights, loading, currency } = useStore();

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const totalSpent = insights?.totalSpent || 0;
  const dayTrends = insights?.dayTrends || [];
  const peakDay = insights?.peakSpendingDay || "None";

  // Transform dayTrends to what recharts needs
  const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chartData = daysMap.map((day, index) => {
    const found = dayTrends.find(d => d._id === index + 1);
    return { name: day, value: found ? found.totalSpent : 0 };
  });

  return (
    <div className="p-6 space-y-6 pb-24">
      <div>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">ANALYTICS OVERVIEW</p>
        <h1 className="text-3xl font-extrabold tracking-tight mb-4">Monthly Insights</h1>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Spent</p>
            <h2 className="text-3xl font-bold">{currency.symbol}{totalSpent.toFixed(2)}</h2>
          </div>
          <button className="text-gray-400">
            <MoreHorizontal size={20} />
          </button>
        </div>
        <div className="h-48 w-full">
          {loading ? (
             <div className="h-full flex items-center justify-center">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 500 }} tickFormatter={(value) => `${currency.symbol}${value}`} dx={-10} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={24}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === peakDay.substring(0,3) ? '#0052FF' : '#E5E7EB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="w-10 h-10 bg-[#E5EDFF] rounded-full flex items-center justify-center mb-3">
            <span className="text-primary font-serif font-bold italic text-lg">i</span>
          </div>
          <h3 className="font-bold mb-1">Peak Spending</h3>
          <p className="text-sm text-gray-600 leading-relaxed pr-8">
            Your highest spending day consistently lands on <span className="font-bold text-gray-900">{peakDay}s</span>.
          </p>
          <div className="absolute right-2 top-4 opacity-10">
            <CalendarDays size={60} />
          </div>
        </div>
      </div>
    </div>
  );
}
