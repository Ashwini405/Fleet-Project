import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const PERIODS = ['Last 30 Days', 'This Month', 'This Quarter', 'This Year'];
const INR_short = (v) => v >= 1000000 ? `₹${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : `₹${v}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-bold text-slate-700 mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-bold text-slate-800">₹{Number(p.value).toLocaleString('en-IN')}</span>
        </div>
      ))}
    </div>
  );
};

export function AnalyticsWidget({ data }) {
  const [period, setPeriod] = useState('This Year');
  const [chartType, setChartType] = useState('area');

  const chartData = useMemo(() => {
    const all = data.monthly;
    if (period === 'This Quarter') return all.slice(-3);
    if (period === 'This Month')   return all.slice(-1);
    if (period === 'Last 30 Days') return all.slice(-2);
    return all;
  }, [period, data]);

  const mapped = chartData.map(d => ({
    ...d,
    profit: d.revenue - d.expenses,
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-sm">Revenue & Expense Analytics</h3>
            <p className="text-[11px] text-slate-400 font-medium">Monthly financial performance</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Chart type toggle */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {['area', 'bar'].map(t => (
              <button
                key={t}
                onClick={() => setChartType(t)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${chartType === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
              >
                {t === 'area' ? 'Area' : 'Bar'}
              </button>
            ))}
          </div>
          {/* Period pills */}
          <div className="flex flex-wrap gap-1">
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${period === p ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-4 py-5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={mapped} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gPro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={INR_short} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={52} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
              <Area type="monotone" dataKey="revenue"  name="Revenue"  stroke="#6366f1" strokeWidth={2.5} fill="url(#gRev)" dot={false} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2.5} fill="url(#gExp)" dot={false} />
              <Area type="monotone" dataKey="profit"   name="Profit"   stroke="#10b981" strokeWidth={2.5} fill="url(#gPro)" dot={false} />
            </AreaChart>
          ) : (
            <BarChart data={mapped} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={INR_short} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={52} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
              <Bar dataKey="revenue"  name="Revenue"  fill="#6366f1" radius={[4,4,0,0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4,4,0,0]} />
              <Bar dataKey="profit"   name="Profit"   fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Footer totals */}
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 grid grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue',  val: mapped.reduce((s, d) => s + d.revenue, 0),  color: 'text-indigo-700' },
          { label: 'Total Expenses', val: mapped.reduce((s, d) => s + d.expenses, 0), color: 'text-red-600'    },
          { label: 'Net Profit',     val: mapped.reduce((s, d) => s + d.profit, 0),   color: 'text-emerald-700' },
        ].map(item => (
          <div key={item.label} className="text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
            <p className={`text-base font-black ${item.color}`}>₹{Number(item.val).toLocaleString('en-IN')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
