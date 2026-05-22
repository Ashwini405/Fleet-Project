import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Search, Eye, ChevronDown,
  ChevronLeft, ChevronRight, Shield, Hash, Truck, Calendar,
} from 'lucide-react';

const PAGE_SIZES = [5, 10, 20, 50];

const catStyles = {
  Battery:      'bg-blue-100   text-blue-700',
  Tyres:        'bg-indigo-100 text-indigo-700',
  Engine:       'bg-red-100    text-red-700',
  Electrical:   'bg-yellow-100 text-yellow-700',
  Brakes:       'bg-pink-100   text-pink-700',
  'AC System':  'bg-cyan-100   text-cyan-700',
  Suspension:   'bg-lime-100   text-lime-700',
  'Fuel System':'bg-amber-100  text-amber-700',
  Other:        'bg-slate-100  text-slate-600',
};

const DropSel = ({ value, onChange, children }) => (
  <div className="relative">
    <select value={value} onChange={onChange}
      className="appearance-none border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-sm font-semibold text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm cursor-pointer">
      {children}
    </select>
    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
  </div>
);

const Meta = ({ icon: Icon, children }) => (
  <span className="flex items-center gap-1 text-xs text-slate-500 font-medium whitespace-nowrap">
    <Icon className="w-3 h-3 text-slate-400 shrink-0" />{children}
  </span>
);

export default function ClaimsTab({ onAdd, onView, refreshRef }) {
  const [claims,   setClaims]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [fWarranty,setFWarranty]= useState('All Warranties');
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const resetPage = () => setPage(1);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res  = await fetch('http://localhost:5001/api/warranty-claims');
      const data = await res.json();
      if (data.success) setClaims(data.data || []);
    } catch (err) {
      console.error('FETCH CLAIMS ERROR:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClaims(); }, []);

  // Expose fetchClaims so parent can trigger refresh after add
  useEffect(() => {
    if (refreshRef) refreshRef.current = fetchClaims;
  }, [refreshRef]);

  const uniqueWarranties = useMemo(() => [
    'All Warranties',
    ...new Set(claims.map(c => c.warranty_number).filter(Boolean)),
  ], [claims]);

  const filtered = claims.filter(c => {
    const q = search.toLowerCase();
    const sMatch = !search || [
      c.claim_number, c.warranty_number, c.category,
      c.vehicle_no, c.complaint_number, c.complaint_docket,
    ].some(f => (f || '').toLowerCase().includes(q));
    const wMatch = fWarranty === 'All Warranties' || c.warranty_number === fWarranty;
    return sMatch && wMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const pageData   = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const goPage     = p => { if (p >= 1 && p <= totalPages) setPage(p); };

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
            <h2 className="text-lg font-black text-slate-800">Warranty Claims</h2>
            <p className="text-xs text-slate-400 font-medium">View and manage all warranty claims</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search claim, warranty, vehicle..."
              value={search}
              onChange={e => { setSearch(e.target.value); resetPage(); }}
              className="pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm w-60 placeholder-slate-300"
            />
            {search && (
              <button onClick={() => { setSearch(''); resetPage(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 text-lg leading-none">×</button>
            )}
          </div>

          {/* Warranty filter */}
          <DropSel value={fWarranty} onChange={e => { setFWarranty(e.target.value); resetPage(); }}>
            {uniqueWarranties.map(w => <option key={w}>{w}</option>)}
          </DropSel>

          {/* Add */}
          <button onClick={onAdd}
            className="flex items-center gap-2 px-5 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-bold shadow-sm transition-colors whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add Claim
          </button>
        </div>
      </div>

      {/* ── COLUMN LABELS ── */}
      <div className="hidden sm:grid items-center gap-4 px-5 py-2.5 bg-slate-50 border-b border-slate-100"
        style={{ gridTemplateColumns: '2fr 1.2fr 1.2fr 1.5fr 1.2fr 1.2fr 36px' }}>
        {['Claim / Warranty', 'Category', 'Vehicle', 'Complaint', 'Submit Date', 'Sent to Vendor', ''].map((h, i) => (
          <span key={i} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</span>
        ))}
      </div>

      {/* ── CARD LIST ── */}
      <div className="divide-y divide-slate-50">
        {loading ? (
          <div className="py-20 text-center text-sm font-semibold text-slate-400">Loading claims...</div>
        ) : pageData.length === 0 ? (
          <div className="py-20 text-center text-sm font-semibold text-slate-400">No claim records found.</div>
        ) : (
          pageData.map((c, idx) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => onView?.(c)}
              className="grid grid-cols-1 sm:grid-cols-1 items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
              style={{ gridTemplateColumns: '2fr 1.2fr 1.2fr 1.5fr 1.2fr 1.2fr 36px' }}
            >
              {/* Col 1 — Claim # + Warranty # */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-black text-slate-800 font-mono leading-none truncate">
                  {c.claim_number}
                </span>
                <span className="text-[11px] font-semibold text-green-700 truncate">
                  {c.warranty_number || '—'}
                </span>
              </div>

              {/* Col 2 — Category badge */}
              <div>
                {c.category ? (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide ${catStyles[c.category] || catStyles.Other}`}>
                    {c.category}
                  </span>
                ) : <span className="text-xs text-slate-300">—</span>}
              </div>

              {/* Col 3 — Vehicle + Serial */}
              <div className="flex flex-col gap-1">
                <Meta icon={Truck}>{c.vehicle_no || '—'}</Meta>
                <Meta icon={Hash}>{c.serial_no  || '—'}</Meta>
              </div>

              {/* Col 4 — Complaint # + Docket */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-700 truncate">
                  {c.complaint_number || '—'}
                </span>
                <span className="text-[11px] text-slate-400 truncate">
                  {c.complaint_docket || '—'}
                </span>
              </div>

              {/* Col 5 — Submit Date */}
              <div>
                <Meta icon={Calendar}>
                  {(c.claim_date || c.submit_date)
                    ? new Date(c.claim_date || c.submit_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : <span className="text-slate-300">Not set</span>}
                </Meta>
              </div>

              {/* Col 6 — Date Sent to Vendor */}
              <div>
                <Meta icon={Calendar}>
                  {c.date_sent_to_vendor
                    ? new Date(c.date_sent_to_vendor).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'}
                </Meta>
              </div>

              {/* Col 7 — View button */}
              <div onClick={e => e.stopPropagation()}>
                <button onClick={() => onView?.(c)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-green-700 hover:border-green-300 hover:bg-green-50 transition-colors">
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
          <button onClick={() => goPage(safePage - 1)} disabled={safePage === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:border-green-400 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>

          {visiblePages().map((p, i, arr) => (
            <React.Fragment key={p}>
              {i > 0 && arr[i - 1] !== p - 1 && (
                <span className="px-1 text-[11px] text-slate-300 font-bold select-none">…</span>
              )}
              <button onClick={() => goPage(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold border transition-colors
                  ${p === safePage ? 'bg-green-700 text-white border-green-700' : 'bg-white border-slate-200 text-slate-600 hover:border-green-400 hover:text-green-600'}`}>
                {p}
              </button>
            </React.Fragment>
          ))}

          <button onClick={() => goPage(safePage + 1)} disabled={safePage === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:border-green-400 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="relative">
          <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); resetPage(); }}
            className="appearance-none border border-slate-200 rounded-xl pl-3 pr-8 py-1.5 text-xs font-bold text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer shadow-sm">
            {PAGE_SIZES.map(s => <option key={s} value={s}>{s} / page</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
