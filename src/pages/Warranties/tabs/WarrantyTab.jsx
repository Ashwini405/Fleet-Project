import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Eye, ChevronDown, ChevronLeft, ChevronRight, Shield } from 'lucide-react';

// ── Constants (categories, status styles, etc. remain unchanged) ──
const CATEGORIES = [
  'Battery', 'Tyres', 'Parts', 'Lubricants',
  'Engine', 'Electrical', 'Brakes', 'Other',
];

const PAGE_SIZES = [5, 10, 20, 50];

const catStyles = {
  Battery:    'bg-blue-100   text-blue-700',
  Tyres:      'bg-indigo-100 text-indigo-700',
  Parts:      'bg-orange-100 text-orange-600',
  Lubricants: 'bg-purple-100 text-purple-700',
  Engine:     'bg-red-100    text-red-700',
  Electrical: 'bg-yellow-100 text-yellow-700',
  Brakes:     'bg-pink-100   text-pink-700',
  Other:      'bg-slate-100  text-slate-600',
};

const statusStyles = {
  Active:          'bg-green-50  text-green-600  border border-green-200',
  Expired:         'bg-red-50    text-red-500    border border-red-200',
  Replaced:        'bg-slate-100 text-slate-600  border border-slate-200',
  'Expiring Soon': 'bg-orange-50 text-orange-500 border border-orange-200',
  Claimed:         'bg-purple-50 text-purple-600 border border-purple-200',
  Void:            'bg-slate-100 text-slate-500  border border-slate-200',
};

const COLUMNS = [
  { key: 'warranty_number', label: 'Warranty Number' },
  { key: 'item',            label: 'Item Title'      },
  { key: 'category',        label: 'Category'        },
  { key: 'brand',           label: 'Brand'           },
  { key: 'model',           label: 'Model'           },
  { key: 'serial',          label: 'Serial Number'   },
  { key: 'vehicle',         label: 'Vehicle'         },
  { key: 'purchaseDate',    label: 'Purchase Date'   },
  { key: 'startDate',       label: 'Start Date'      },
  { key: 'endDate',         label: 'End Date'        },
  { key: 'period',          label: 'Warranty Period' },
  { key: 'type',            label: 'Warranty Type'   },
  { key: 'status',          label: 'Status'          },
  { key: 'claim',           label: 'Claim Available' },
  { key: 'actions',         label: 'Actions'         },
];

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

export default function WarrantyTab({ warrantiesData, onAdd, onView }) {
  // ── State (now using real API data) ─────────────────────────────────────
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,    setSearch]    = useState('');
  const [filterCat, setFilterCat] = useState('All Categories');
  const [filterVeh, setFilterVeh] = useState('All Vehicles');
  const [page,      setPage]      = useState(1);
  const [pageSize,  setPageSize]  = useState(10);

  const resetPage = () => setPage(1);

  // ── Fetch warranties from backend ────────────────────────────────────────
  const fetchWarranties = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/warranties');
      const data = await response.json();
      if (data.success) {
        // ✅ FIX: Spread the whole object, then add/override computed display fields
        const formatted = data.data.map(w => ({
          ...w,   // Keep all original DB fields (vendor_name, uploads, reminders, etc.)

          // UI display fields (mapped from backend snake_case)
          item: w.item_title,
          serial: w.serial_no,
          vehicle: w.vehicle_no,

          // Formatted dates for table display
          purchaseDate: w.purchase_date
            ? new Date(w.purchase_date).toLocaleDateString('en-GB')
            : '—',
          startDate: w.start_date
            ? new Date(w.start_date).toLocaleDateString('en-GB')
            : '—',
          endDate: w.end_date
            ? new Date(w.end_date).toLocaleDateString('en-GB')
            : '—',

          // Other renamed fields
          period: w.warranty_period,
          type: w.warranty_type,
          status: w.warranty_status,
          claim: w.claim_available,
        }));
        setWarranties(formatted);
      }
    } catch (error) {
      console.error('FETCH WARRANTIES ERROR:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarranties();
  }, []);

  // ── Filtering (now uses real `warranties` state) ────────────────────────
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

  // ── Unique vehicles for filter (extracted from warranty records) ────────
  const uniqueVehicles = useMemo(() => [
    'All Vehicles',
    ...new Set(warranties.map(w => w.vehicle).filter(Boolean))
  ], [warranties]);

  // ── Pagination ──────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const pageData   = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const goPage = (p) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  const visiblePages = () => {
    const pagesSet = new Set([1, totalPages]);
    for (let i = Math.max(1, safePage - 1); i <= Math.min(totalPages, safePage + 1); i++)
      pagesSet.add(i);
    return [...pagesSet].sort((a, b) => a - b);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-wrap gap-4">

        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-700 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">Warranty Registry Overview</h2>
            <p className="text-xs text-slate-400 font-medium">View and manage all item warranties</p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 flex-wrap">

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search item title, serial number..."
              value={search}
              onChange={e => { setSearch(e.target.value); resetPage(); }}
              className="pl-9 pr-9 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm w-64 placeholder-slate-300"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); resetPage(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 text-lg leading-none"
              >×</button>
            )}
          </div>

          {/* Category */}
          <DropSelect value={filterCat} onChange={e => { setFilterCat(e.target.value); resetPage(); }}>
            <option>All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </DropSelect>

          {/* Vehicle (dynamic from DB) */}
          <DropSelect value={filterVeh} onChange={e => { setFilterVeh(e.target.value); resetPage(); }}>
            {uniqueVehicles.map(v => <option key={v} value={v}>{v}</option>)}
          </DropSelect>

          {/* Add */}
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-5 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-bold shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Warranty
          </button>
        </div>
      </div>

      {/* ── TABLE ────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" style={{ minWidth: 1300 }}>
          <thead>
            <tr className="border-b border-slate-100 bg-white">
              {COLUMNS.map(col => (
                <th
                  key={col.key}
                  className="py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={COLUMNS.length} className="py-20 text-center text-sm font-semibold text-slate-400">
                  Loading warranties...
                </td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="py-20 text-center text-sm font-semibold text-slate-400">
                  No warranty records found matching your criteria.
                </td>
              </tr>
            ) : (
              pageData.map((w, idx) => (
                <motion.tr
                  key={w.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                  onClick={() => onView?.(w)}
                >
                  {/* Warranty Number */}
                  <td className="py-4 px-4">
                    <span className="text-sm font-black text-green-700">{w.warranty_number}</span>
                  </td>

                  {/* Item Title */}
                  <td className="py-4 px-4">
                    <span className="text-sm font-bold text-slate-800 leading-tight block">{w.item}</span>
                  </td>

                  {/* Category */}
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide whitespace-nowrap ${catStyles[w.category] || catStyles.Other}`}>
                      {w.category}
                    </span>
                  </td>

                  {/* Brand */}
                  <td className="py-4 px-4 text-sm font-medium text-slate-600 whitespace-nowrap">{w.brand}</td>

                  {/* Model */}
                  <td className="py-4 px-4 text-sm font-medium text-slate-600 whitespace-nowrap">{w.model}</td>

                  {/* Serial Number */}
                  <td className="py-4 px-4">
                    <span className="text-xs font-mono font-semibold text-slate-600">{w.serial}</span>
                  </td>

                  {/* Vehicle */}
                  <td className="py-4 px-4">
                    <span className="text-sm font-bold text-slate-700 whitespace-nowrap">{w.vehicle}</span>
                  </td>

                  {/* Purchase Date */}
                  <td className="py-4 px-4 text-sm font-medium text-slate-500 whitespace-nowrap">
                    {w.purchaseDate}
                  </td>

                  {/* Start Date */}
                  <td className="py-4 px-4 text-sm font-medium text-slate-500 whitespace-nowrap">
                    {w.startDate}
                  </td>

                  {/* End Date */}
                  <td className="py-4 px-4 text-sm font-medium text-slate-500 whitespace-nowrap">
                    {w.endDate}
                  </td>

                  {/* Warranty Period */}
                  <td className="py-4 px-4 text-sm font-medium text-slate-500 whitespace-nowrap">
                    {w.period}
                  </td>

                  {/* Warranty Type */}
                  <td className="py-4 px-4 text-sm font-medium text-slate-500 whitespace-nowrap">
                    {w.type}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold whitespace-nowrap ${statusStyles[w.status] || statusStyles.Void}`}>
                      {w.status}
                    </span>
                  </td>

                  {/* Claim Available */}
                  <td className="py-4 px-4">
                    <span className={`text-sm font-bold ${w.claim === 'Yes' ? 'text-green-600' : 'text-slate-400'}`}>
                      {w.claim}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => onView?.(w)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-green-700 hover:border-green-300 hover:bg-green-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── FOOTER / PAGINATION ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 flex-wrap gap-3">

        {/* Entry count */}
        <span className="text-xs font-semibold text-slate-400">
          {filtered.length === 0
            ? 'No entries found'
            : `Showing ${(safePage - 1) * pageSize + 1} to ${Math.min(safePage * pageSize, filtered.length)} of ${filtered.length} entries`
          }
        </span>

        {/* Page numbers */}
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
                    : 'bg-white border-slate-200 text-slate-600 hover:border-green-400 hover:text-green-600'
                  }`}
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

        {/* Per-page */}
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