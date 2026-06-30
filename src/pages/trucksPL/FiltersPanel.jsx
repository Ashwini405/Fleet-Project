import React from 'react';
import { FiX } from 'react-icons/fi';

const STATUS_OPTIONS = ['Excellent', 'Good', 'Average', 'Low Margin', 'Loss'];

export default function FiltersPanel({ filters, onChange, onReset, onClose, data }) {
  const plants  = [...new Set(data.map(r => r.plant))].sort();
  const models  = [...new Set(data.map(r => r.vehicleModel))].sort();
  const drivers = [...new Set(data.map(r => r.driver))].sort();

  const set = (key, val) => onChange({ ...filters, [key]: val });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-5 mb-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-black text-slate-800">Advanced Filters</p>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Reset All
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <FiX className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Running Plant */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
            Running Plant
          </label>
          <select
            value={filters.plant}
            onChange={e => set('plant', e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700"
          >
            <option value="">All Plants</option>
            {plants.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Vehicle Model */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
            Vehicle Model
          </label>
          <select
            value={filters.model}
            onChange={e => set('model', e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700"
          >
            <option value="">All Models</option>
            {models.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Profit Status */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
            Profit Status
          </label>
          <select
            value={filters.status}
            onChange={e => set('status', e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Driver */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
            Driver
          </label>
          <select
            value={filters.driver}
            onChange={e => set('driver', e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700"
          >
            <option value="">All Drivers</option>
            {drivers.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Min Revenue */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
            Min Revenue (₹)
          </label>
          <input
            type="number"
            placeholder="e.g. 200000"
            value={filters.minRevenue}
            onChange={e => set('minRevenue', e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700"
          />
        </div>

        {/* Max Revenue */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
            Max Revenue (₹)
          </label>
          <input
            type="number"
            placeholder="e.g. 700000"
            value={filters.maxRevenue}
            onChange={e => set('maxRevenue', e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700"
          />
        </div>

        {/* Min Profit */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
            Min Profit (₹)
          </label>
          <input
            type="number"
            placeholder="e.g. 50000"
            value={filters.minProfit}
            onChange={e => set('minProfit', e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700"
          />
        </div>

        {/* Max Profit */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
            Max Profit (₹)
          </label>
          <input
            type="number"
            placeholder="e.g. 500000"
            value={filters.maxProfit}
            onChange={e => set('maxProfit', e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700"
          />
        </div>

      </div>
    </div>
  );
}
