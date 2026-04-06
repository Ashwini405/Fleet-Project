import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiFilter } from 'react-icons/fi';

const consumptionData = [
  { month: 'Jun', consumption: 3200 },
  { month: 'Jul', consumption: 3800 },
  { month: 'Aug', consumption: 4100 },
  { month: 'Sep', consumption: 3900 },
  { month: 'Oct', consumption: 4500 },
  { month: 'Nov', consumption: 4520 },
];

const costTrendData = [
  { month: 'Jun', cost: 290000, rate: 94.5 },
  { month: 'Jul', cost: 350000, rate: 95.0 },
  { month: 'Aug', cost: 385000, rate: 95.5 },
  { month: 'Sep', cost: 370000, rate: 96.0 },
  { month: 'Oct', cost: 430000, rate: 96.5 },
  { month: 'Nov', cost: 436180, rate: 96.5 },
];

export default function FuelAnalytics() {
  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-200">
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">Fleet Analytics</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <FiFilter className="text-slate-400 w-4 h-4" />
            <select className="text-sm font-bold border-none focus:ring-0 p-0 text-slate-700 bg-transparent cursor-pointer">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <span className="text-sm font-medium text-slate-600">Vehicle:</span>
            <select className="text-sm font-bold border-none focus:ring-0 p-0 text-indigo-700 bg-transparent cursor-pointer">
              <option>All Fleet Group</option>
              <option>Nandyala Fleet</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-indigo-500">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Distance Run</p>
          <h3 className="text-3xl font-black text-slate-800">86,540 <span className="text-base text-slate-500 font-bold">KM</span></h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Average Fleet Mileage</p>
          <h3 className="text-3xl font-black text-emerald-600">3.82 <span className="text-base text-emerald-500 font-bold">KMPL</span></h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-rose-500">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Fuel Cost</p>
          <h3 className="text-3xl font-black text-slate-800"><span className="text-base text-slate-500 font-bold">₹</span> 22,61,180</h3>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        
        {/* Monthly Fuel Consumption */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-6">Monthly Fuel Consumption (Liters)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consumptionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip 
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="consumption" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Trend */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-6">Cost & Rate Tren (₹)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={costTrendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line yAxisId="left" type="monotone" name="Total Cost (₹)" dataKey="cost" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" name="Diesel Rate (₹/L)" dataKey="rate" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
