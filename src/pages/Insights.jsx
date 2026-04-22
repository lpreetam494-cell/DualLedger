import React, { useEffect, useMemo } from 'react';
import { TrendingUp, CalendarDays, MoreHorizontal, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis, PieChart, Pie, Tooltip, Legend } from 'recharts';
import { useStore } from '../store/useStore';

export default function Insights() {
  const { user, insights, fetchInsights, expenses, fetchExpenses, loading, currency } = useStore();

  useEffect(() => {
    fetchInsights();
    fetchExpenses();
  }, [fetchInsights, fetchExpenses]);

  const totalSpent = insights?.totalSpent || 0;
  const dayTrends = insights?.dayTrends || [];
  const peakDay = insights?.peakSpendingDay || "None";
  const budgets = user?.preferences?.budgets || {};

  // Transform dayTrends to what recharts needs
  const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chartData = daysMap.map((day, index) => {
    const found = dayTrends.find(d => d._id === index + 1);
    return { name: day, value: found ? found.totalSpent : 0 };
  });

  // Calculate Category Data from Expenses
  const categoryData = useMemo(() => {
    const expensesOnly = expenses.filter(e => e.type === 'expense');
    const grouped = {};
    expensesOnly.forEach(e => {
      grouped[e.category] = (grouped[e.category] || 0) + e.amount;
    });
    
    return Object.entries(grouped)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // top 5
  }, [expenses]);

  const COLORS = ['#0052FF', '#00C2FF', '#818CF8', '#C084FC', '#F472B6'];

  return (
    <div className="p-6 space-y-6 pb-32">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-4">Analytics</h1>
        <p className="text-gray-500 text-sm">Understand your spending habits.</p>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-xs text-gray-500 mb-1 font-bold tracking-wider uppercase">Total Spent (Current Cycle)</p>
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
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={24}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === peakDay.substring(0,3) ? '#0052FF' : '#E5E7EB'} />
                  ))}
                </Bar>
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Category Breakdown & Limits */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm">
         <div className="flex justify-between items-center mb-4">
           <div className="flex items-center gap-2">
             <PieChartIcon size={20} className="text-primary" />
             <h3 className="font-bold">Top Categories</h3>
           </div>
           {Object.keys(budgets).length > 0 && <Activity size={16} className="text-red-400" />}
         </div>

         {categoryData.length === 0 ? (
           <p className="text-sm text-gray-500 italic text-center py-4">No expense data to analyze yet.</p>
         ) : (
           <>
             <div className="h-56 w-full relative mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `${currency.symbol}${value.toFixed(2)}`}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
             </div>

             {/* Dynamic Budget Limits */}
             <div className="space-y-4 pt-4 border-t border-gray-100">
               {categoryData.map((data) => {
                 const budget = budgets[data.name];
                 if (!budget) return null;
                 const percent = (data.value / budget) * 100;
                 const isOver = percent > 100;
                 
                 let color = 'bg-green-500';
                 if (percent > 90) color = 'bg-red-500';
                 else if (percent > 75) color = 'bg-yellow-500';

                 return (
                    <div key={data.name}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-semibold text-gray-700">{data.name} Limit</span>
                        <span className={`font-semibold ${isOver ? 'text-red-500' : 'text-gray-500'}`}>
                           {currency.symbol}{data.value.toFixed(0)} / {currency.symbol}{budget}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${Math.min(percent, 100)}%` }}></div>
                      </div>
                    </div>
                 );
               })}
             </div>
           </>
         )}
      </div>

      {/* Peak Spending */}
      <div className="space-y-4">
        <div className="bg-[#0B101B] p-5 rounded-[2rem] shadow-sm relative overflow-hidden text-white">
          <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center mb-3 text-primary">
             <CalendarDays size={20} />
          </div>
          <h3 className="font-bold mb-1">Peak Spending</h3>
          <p className="text-sm text-gray-400 leading-relaxed pr-8">
            Your highest spending day consistently lands on <span className="font-bold text-white">{peakDay}s</span>.
          </p>
          <div className="absolute right-[-10px] top-4 opacity-10">
            <TrendingUp size={80} />
          </div>
        </div>
      </div>
    </div>
  );
}
