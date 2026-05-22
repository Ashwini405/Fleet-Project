import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Search, Eye, ChevronDown, ChevronLeft,
  ChevronRight, Shield, Truck, Calendar, Hash, Tag,
} from 'lucide-react';

const CATEGORIES = [
  'Battery', 'Tyres', 'Parts', 'Lubricants',
  'Engine', 'Electrical', 'Brakes', 'AC System', 'Suspension', 'Fuel System', 'Other',
];

const PAGE_SIZES = [5, 10, 20, 50];

const catStyles = {
  Battery:      'bg-blue-100   text-blue-700',
  Tyres:        'bg-indigo-100 text-indigo-700',
  Parts:        'bg-orange-100 text-orange-600',
  Lubricants:   'bg-purple-100 text-purple-700',
  Engine:       'bg-red-100    text-red-700',
  Electrical:   'bg-yellow-100 text-yellow-700',
  Brakes:       'bg-pink-100   text-pink-700',
  'AC System':  'bg-cyan-100   text-cyan-700',
  Suspension:   'bg-lime-100   text-lime-700',
  'Fuel System':'bg-amber-100  text-amber-700',
  Other:        'bg-slate-100  text-slate-600',
};

const statusStyles = {
  Active:          'bg-green-50  text-green-600  border border-green-200',
  Expired:         'bg-red-50    text-red-500    border border-red-200',
  Replaced:        'bg-slate-100 text-slate-500  border border-slate-200',
  'Expiring Soon': 'bg-orange-50 text-orange-500 border border-orange-200',
  Claimed:         'bg-purple-50 text-purple-600 border border-purple-200',
  Void:            'bg-slate-100 text-slate-400  border border-slate-200',
};

const DropSelect = ({ value, onChange, children }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      className="appearance-none border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-sm font-semibold text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm cursor-pointer"
    >
      {children}
    </select>
    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
  </div>
);

const Meta = ({ icon: Icon, children }) => (
  <span className="flex items-center gap-1 text-xs text-slate-500 font-medium whitespace-nowrap">
    <Icon className="w-3 h-3 text-slate-400 shrink-0" />
    {children}
  </span>
);

export default function WarrantyTab({ onAdd, onView, refreshRef }) {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterCat, setFilterCat]   = useState('All Categories');
  const [filterVeh, setFilterVeh]   = useState('All Vehicles');
  const [page, setPage]             = useState(1);
  const [pageSize, setPageSize]     = useState(10);

  const resetPage = () => setPage(1);

  const fetchWarranties = async () => {
    try {
      setLoading(true);
      const res  = await fetch('http://localhost:5001/api/warranties');
      const data = await res.json();
      if (data.success) {
        const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '—';
        setWarranties(
          data.data.map(w => ({
            ...w,
            item:        w.item_title,
            serial:      w.serial_no,
            vehicle:     w.vehicle_no,
            purchaseDate: fmt(w.purchase_date),
            startDate:   fmt(w.start_date),
            endDate:     fmt(w.end_date),
            period:      w.warranty_period,
            type:        w.warranty_type,
            status:      w.warranty_status,
            claim:       w.claim_available,
          }))
        );
      }
    } catch (err) {
      console.error('FETCH WARRANTIES ERROR:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWarranties(); }, []);

  // Expose fetchWarranties so parent can trigger a refresh after edit/add
  useEffect(() => {
    if (refreshRef) refreshRef.current = fetchWarranties;
  }, [refreshRef]);

  const filtered = warranties.filter(w => {
    const q = search.toLowerCase();
    const sMatch = !search
      || (w.item   || '').toLowerCase().includes(q)
      || (w.serial || '').toLowerCase().includes(q)
      || (w.warranty_number || '').toLowerCase().includes(q);
    const cMatch = filterCat === 'All Categories' || w.category === filterCat;
    const vMatch = filterVeh === 'All Vehicles'   || w.vehicle  === filterVeh;
    return sMatch && cMatch && vMatch;
  });

  const uniqueVehicles = useMemo(() => [
    'All Vehicles',
    ...new Set(warranties.map(w => w.vehicle).filter(Boolean)),
  ], [warranties]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const pageData   = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const goPage = (p) => { if (p >= 1 && p <= totalPages) setPage(p); };

  const visiblePages = () => {
    const s = new Set([1, totalPages]);
    for (let i = Math.max(1, safePage - 1); i <= Math.min(totalPages, safePage + 1); i++) s.add(i);
    return [...s].sort((a, b) => a - b);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-700 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">Warranty Registry</h2>
            <p className="text-xs text-slate-400 font-medium">View and manage all item warranties</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search title, serial, number..."
              value={search}
              onChange={e => { setSearch(e.target.value); resetPage(); }}
              className="pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm w-60 placeholder-slate-300"
            />
            {search && (
              <button onClick={() => { setSearch(''); resetPage(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 text-lg leading-none">
                ×
              </button>
            )}
          </div>

          <DropSelect value={filterCat} onChange={e => { setFilterCat(e.target.value); resetPage(); }}>
            <option>All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </DropSelect>

          <DropSelect value={filterVeh} onChange={e => { setFilterVeh(e.target.value); resetPage(); }}>
            {uniqueVehicles.map(v => <option key={v} value={v}>{v}</option>)}
          </DropSelect>

          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-5 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-bold shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Warranty
          </button>
        </div>
      </div>

      {/* ── COLUMN LABELS ── */}
      <div className="hidden sm:grid items-center gap-4 px-5 py-2.5 bg-slate-50 border-b border-slate-100" style={{ gridTemplateColumns: '2fr 2fr 140px 2fr 110px 36px' }}>
        {['Warranty / Category', 'Item · Brand · Model', 'Serial Number', 'Vehicle · Dates', 'Status', ''].map((h, i) => (
          <span key={i} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</span>
        ))}
      </div>

      {/* ── CARD LIST ── */}
      <div className="divide-y divide-slate-50">
        {loading ? (
          <div className="py-20 text-center text-sm font-semibold text-slate-400">Loading warranties...</div>
        ) : pageData.length === 0 ? (
          <div className="py-20 text-center text-sm font-semibold text-slate-400">No warranty records found.</div>
        ) : (
          pageData.map((w, idx) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => onView?.(w)}
              className="grid grid-cols-1 items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer group sm:grid" style={{ gridTemplateColumns: '2fr 2fr 140px 2fr 110px 36px' }}
            >
              {/* Col 1 — Warranty # + Category */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-black text-green-700 font-mono tracking-tight leading-none">
                  {w.warranty_number}
                </span>
                <span className={`self-start inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide ${catStyles[w.category] || catStyles.Other}`}>
                  {w.category}
                </span>
              </div>

              {/* Col 2 — Item · Brand · Model */}
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-slate-800 leading-tight truncate">
                  {w.item || '—'}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <Meta icon={Tag}>{w.brand}</Meta>
                  <span className="text-slate-200 text-xs">·</span>
                  <span className="text-xs text-slate-500 font-medium truncate">{w.model}</span>
                </div>
              </div>

              {/* Col 3 — Serial */}
              <div className="flex items-center gap-1.5">
                <Meta icon={Hash}>{w.serial || '—'}</Meta>
              </div>

              {/* Col 4 — Vehicle + Dates */}
              <div className="flex flex-col gap-1">
                <Meta icon={Truck}>{w.vehicle || '—'}</Meta>
                <Meta icon={Calendar}>
                  {w.startDate} → {w.endDate}
                </Meta>
              </div>

              {/* Col 5 — Status */}
              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold whitespace-nowrap ${statusStyles[w.status] || statusStyles.Void}`}>
                  {w.status || '—'}
                </span>
              </div>

              {/* Col 6 — Action */}
              <div onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => onView?.(w)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-green-700 hover:border-green-300 hover:bg-green-50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* ── FOOTER / PAGINATION ── */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 flex-wrap gap-3">
        <span className="text-xs font-semibold text-slate-400">
          {filtered.length === 0
            ? 'No entries found'
            : `Showing ${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, filtered.length)} of ${filtered.length} entries`}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => goPage(safePage - 1)}
            disabled={safePage === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:border-green-400 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {visiblePages().map((p, i, arr) => (
            <React.Fragment key={p}>
              {i > 0 && arr[i - 1] !== p - 1 && (
                <span className="px-1 text-[11px] text-slate-300 font-bold select-none">…</span>
              )}
              <button
                onClick={() => goPage(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold border transition-colors
                  ${p === safePage
                    ? 'bg-green-700 text-white border-green-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-green-400 hover:text-green-600'}`}
              >
                {p}
              </button>
            </React.Fragment>
          ))}

          <button
            onClick={() => goPage(safePage + 1)}
            disabled={safePage === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:border-green-400 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="relative">
          <select
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); resetPage(); }}
            className="appearance-none border border-slate-200 rounded-xl pl-3 pr-8 py-1.5 text-xs font-bold text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer shadow-sm"
          >
            {PAGE_SIZES.map(s => <option key={s} value={s}>{s} / page</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
