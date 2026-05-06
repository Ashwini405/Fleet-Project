import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const categories = ['All', 'Spares', 'Lubricants', 'Tyres', 'Electrical', 'Batteries', 'Tools', 'Others'];
const statusOptions = ['All', 'In Stock', 'Low Stock', 'Critical', 'Out of Stock'];

export default function FiltersToolbar({ filters, setFilters, vendorOptions, warehouseList, onClear }) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const set = (key, val) => setFilters((prev) => ({ ...prev, [key]: val }));

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => set('search', searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleClear = () => { setSearchInput(''); onClear(); };

  // Active filter chips
  const activeFilters = [];
  if (filters.category !== 'All') activeFilters.push({ key: 'category', label: filters.category, value: 'All' });
  if (filters.status !== 'All') activeFilters.push({ key: 'status', label: filters.status, value: 'All' });
  if (filters.vendor !== 'All') activeFilters.push({ key: 'vendor', label: filters.vendor, value: 'All' });
  if (filters.warehouse !== 'All') activeFilters.push({ key: 'warehouse', label: filters.warehouse, value: 'All' });
  if (filters.showExpiring) activeFilters.push({ key: 'showExpiring', label: 'Expiring Soon', value: false });
  if (filters.showCritical) activeFilters.push({ key: 'showCritical', label: 'Critical Only', value: false });
  if (filters.showLowStock) activeFilters.push({ key: 'showLowStock', label: 'Low Stock', value: false });

  const hasActive = activeFilters.length > 0 || filters.search.trim() !== '';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-2 px-4 pt-4 pb-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search part name, SKU, vendor, warehouse, vehicle..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
          />
        </div>

        {/* Category */}
        <select value={filters.category} onChange={(e) => set('category', e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition">
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>

        {/* Status */}
        <select value={filters.status} onChange={(e) => set('status', e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition">
          {statusOptions.map((s) => <option key={s}>{s}</option>)}
        </select>

        {/* Vendor */}
        <select value={filters.vendor} onChange={(e) => set('vendor', e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition">
          <option value="All">All Vendors</option>
          {vendorOptions.map((v) => <option key={v}>{v}</option>)}
        </select>

        {/* Warehouse */}
        <select value={filters.warehouse} onChange={(e) => set('warehouse', e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition">
          <option value="All">All Warehouses</option>
          {warehouseList.map((w) => <option key={w}>{w}</option>)}
        </select>

        {hasActive && (
          <button onClick={handleClear} className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 transition">
            <X className="h-3.5 w-3.5" /> Clear All
          </button>
        )}
      </div>

      {/* Toggle chips */}
      <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
        {[['showExpiring', 'Expiring Soon'], ['showCritical', 'Critical Only'], ['showLowStock', 'Low Stock']].map(([key, label]) => (
          <button key={key} onClick={() => set(key, !filters[key])}
            className={`rounded-full px-3 py-1 text-[11px] font-bold border transition ${filters[key] ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Active filter chips */}
      <AnimatePresence>
        {activeFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-100 bg-slate-50 px-4 py-3"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 shrink-0">
                <Filter className="h-3 w-3 text-slate-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Active Filters ({activeFilters.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <AnimatePresence>
                  {activeFilters.map(({ key, label, value }) => (
                    <motion.button
                      key={key}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => set(key, value)}
                      className="inline-flex items-center gap-1 rounded-full bg-indigo-100 border border-indigo-200 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 hover:bg-indigo-200 transition"
                    >
                      {label}
                      <X className="h-2.5 w-2.5" />
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
