import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { inventoryValueTrend, monthlyUsageData, categoryDistribution, vendorSpendData, warehouseData } from '../data/dummyData';
import { TrendingUp, BarChart3, PieChart as PieIcon, Activity } from 'lucide-react';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'];

const tabs = ['Value Trend', 'Monthly Usage', 'Category Split', 'Vendor Spend', 'Warehouse'];

export default function InventoryAnalytics({ summary }) {
  const [activeTab, setActiveTab] = useState('Value Trend');

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900">Inventory Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time stock intelligence & trends</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {tabs.map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${activeTab === t ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        {activeTab === 'Value Trend' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-xs text-slate-500 mb-4">Inventory value over last 6 months</p>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={inventoryValueTrend}>
                <defs>
                  <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Value']} />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#valGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {activeTab === 'Monthly Usage' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-xs text-slate-500 mb-4">Parts consumed per category per month</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyUsageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="spares" fill="#6366f1" radius={[3, 3, 0, 0]} name="Spares" />
                <Bar dataKey="lubricants" fill="#f59e0b" radius={[3, 3, 0, 0]} name="Lubricants" />
                <Bar dataKey="tyres" fill="#10b981" radius={[3, 3, 0, 0]} name="Tyres" />
                <Bar dataKey="electrical" fill="#3b82f6" radius={[3, 3, 0, 0]} name="Electrical" />
                <Bar dataKey="batteries" fill="#ef4444" radius={[3, 3, 0, 0]} name="Batteries" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {activeTab === 'Category Split' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col md:flex-row items-center gap-6">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {categoryDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`, 'Share']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 min-w-[160px]">
              {categoryDistribution.map((c) => (
                <div key={c.name} className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full shrink-0" style={{ background: c.color }} />
                  <span className="text-xs text-slate-700 flex-1">{c.name}</span>
                  <span className="text-xs font-bold text-slate-900">{c.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'Vendor Spend' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-xs text-slate-500 mb-4">Total spend per vendor (₹)</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={vendorSpendData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <YAxis dataKey="vendor" type="category" tick={{ fontSize: 10 }} width={110} />
                <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Spend']} />
                <Bar dataKey="spend" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {activeTab === 'Warehouse' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-xs text-slate-500 mb-4">Stock distribution across warehouses</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {warehouseData.map((w, i) => (
                <div key={w.name} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-700">{w.name}</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">₹{(w.value / 1000).toFixed(0)}K</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{w.parts} part types</p>
                  <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${w.utilization}%`, background: COLORS[i] }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{w.utilization}% utilization</p>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={warehouseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Value']} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {warehouseData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
    </div>
  );
}
