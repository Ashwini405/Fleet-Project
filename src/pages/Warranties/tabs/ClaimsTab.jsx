import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Search, Eye, ChevronDown, ChevronLeft,
  ChevronRight, Shield, Calendar, RotateCcw, Truck
} from 'lucide-react';

// ── Constants (statuses, priorities, page sizes) ────────────────────────────
const ALL_STATUSES = [
  'All Status', 'Submitted', 'Under Review', 'Approved',
  'Rejected', 'Resolved', 'Pending Parts'
];
const ALL_PRIORITIES = ['All Priorities', 'High', 'Medium', 'Low'];
const PAGE_SIZES = [5, 10, 20, 50];

const statusStyles = {
  'Submitted':    'bg-blue-50   text-blue-600   border border-blue-200',
  'Under Review': 'bg-purple-50 text-purple-600 border border-purple-200',
  'Approved':     'bg-green-50  text-green-600  border border-green-200',
  'Rejected':     'bg-red-50    text-red-500    border border-red-200',
  'Resolved':     'bg-teal-50   text-teal-600   border border-teal-200',
  'Pending Parts':'bg-orange-50 text-orange-500 border border-orange-200',
  'Draft':        'bg-slate-100 text-slate-500  border border-slate-200',
};

const priorityStyles = {
  High:   'bg-red-50    text-red-600   border border-red-200',
  Medium: 'bg-orange-50 text-orange-500 border border-orange-200',
  Low:    'bg-green-50  text-green-600  border border-green-200',
};

// ── Dropdown component ──────────────────────────────────────────────────────
const DropSel = ({ value, onChange, children, minW = '140px' }) => (
  <div className="relative" style={{ minWidth: minW }}>
    <select
      value={value} onChange={onChange}
      className="w-full appearance-none border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm cursor-pointer"
    >
      {children}
    </select>
    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
  </div>
);

// ── Column headers ───────────────────────────────────────────────────────────
const COLS = [
  { key:'id',            label:'Claim ID'         },
  { key:'warrantyRef',   label:'Warranty Ref'     },
  { key:'item',          label:'Item Title'       },
  { key:'vehicle',       label:'Vehicle'          },
  { key:'issueType',     label:'Issue Type'       },
  { key:'priority',      label:'Priority'         },
  { key:'vendor',        label:'Vendor / Supplier'},
  { key:'claimAmount',   label:'Claim Amount (₹)' },
  { key:'status',        label:'Status'           },
  { key:'submittedDate', label:'Submitted Date'   },
  { key:'actions',       label:'Actions'          },
];

// Helper to get unique values for dynamic filters
const getUnique = (arr) => [...new Set(arr.filter(Boolean))];

export default function ClaimsTab({ onAdd, onView }) {
  // ── State ────────────────────────────────────────────────────────────────
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search,     setSearch]     = useState('');
  const [fWarranty,  setFWarranty]  = useState('All Warranties');
  const [fStatus,    setFStatus]    = useState('All Status');
  const [fIssueType, setFIssueType] = useState('All Issue Types');
  const [fPriority,  setFPriority]  = useState('All Priorities');
  const [dateFrom,   setDateFrom]   = useState('');
  const [dateTo,     setDateTo]     = useState('');
  const [page,       setPage]       = useState(1);
  const [pageSize,   setPageSize]   = useState(10);

  const resetPage = () => setPage(1);

  // ── Fetch claims from database ───────────────────────────────────────────
  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/warranty-claims');
      const data = await response.json();
      if (data.success) {
        const formatted = data.data.map(c => ({
          ...c,
          dbId: c.id,
          id: c.claim_number,
          warrantyRef: c.warranty_number,
          serial: c.serial_no,
          item: c.item_title,
          vehicle: c.vehicle_no,
          odometer: c.odometer ? `${c.odometer} KM` : '—',
          issueType: c.issue_type,
          priority: c.priority,
          vendor: c.vendor_name,
          claimAmount: Number(c.claim_available_amount || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2
          }),
          status: c.claim_status,
          submittedDate: c.claim_date || null
        }));
        setClaims(formatted);
      }
    } catch (error) {
      console.error('FETCH CLAIMS ERROR:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  // ── Dynamic filter options ───────────────────────────────────────────────
  const ALL_WARRANTIES = [
    'All Warranties',
    ...getUnique(claims.map(c => c.warrantyRef))
  ];
  const ALL_ISSUE_TYPES = [
    'All Issue Types',
    ...getUnique(claims.map(c => c.issueType))
  ];

  // ── Filtering logic ──────────────────────────────────────────────────────
  const filtered = claims.filter(c => {
    const q = search.toLowerCase();
    const sMatch = !search || [
      c.id, c.warrantyRef, c.item, c.vehicle,
      c.issueType, c.vendor
    ].some(f => (f || '').toLowerCase().includes(q));

    const submitted = c.submittedDate ? new Date(c.submittedDate) : null;
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate   = dateTo   ? new Date(dateTo)   : null;
    const dateMatch =
      (!fromDate || (submitted && submitted >= fromDate)) &&
      (!toDate   || (submitted && submitted <= toDate));

    return sMatch && dateMatch &&
      (fWarranty  === 'All Warranties'  || c.warrantyRef === fWarranty) &&
      (fStatus    === 'All Status'      || c.status      === fStatus) &&
      (fIssueType === 'All Issue Types' || c.issueType   === fIssueType) &&
      (fPriority  === 'All Priorities'  || c.priority    === fPriority);
  });

  // ── Pagination ───────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const pageData   = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const goPage     = p => { if (p >= 1 && p <= totalPages) setPage(p); };

  const visiblePages = () => {
    const s = new Set([1, totalPages]);
    for (let i = Math.max(1, safePage - 1); i <= Math.min(totalPages, safePage + 1); i++) s.add(i);
    return [...s].sort((a, b) => a - b);
  };

  const resetFilters = () => {
    setSearch('');
    setFWarranty('All Warranties');
    setFStatus('All Status');
    setFIssueType('All Issue Types');
    setFPriority('All Priorities');
    setDateFrom('');
    setDateTo('');
    resetPage();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-green-700 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">Warranty Claim Overview</h2>
            <p className="text-xs text-slate-400 font-medium">View and manage all warranty claims</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search claim ID, warranty, item, vehicle..."
              value={search}
              onChange={e => { setSearch(e.target.value); resetPage(); }}
              className="pl-9 pr-9 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm w-80 placeholder-slate-300"
            />
            {search && (
              <button onClick={() => { setSearch(''); resetPage(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 text-xl leading-none">
                ×
              </button>
            )}
          </div>
          <DropSel value={fStatus} onChange={e => { setFStatus(e.target.value); resetPage(); }} minW="130px">
            {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
          </DropSel>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-bold shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Claim
          </button>
        </div>
      </div>

      {/* ── FILTER BAR ─────────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-slate-100 bg-white">
        <div className="flex items-end gap-5 flex-wrap">

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Warranty</span>
            <DropSel value={fWarranty} onChange={e => { setFWarranty(e.target.value); resetPage(); }} minW="150px">
              {ALL_WARRANTIES.map(w => <option key={w}>{w}</option>)}
            </DropSel>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Claim Status</span>
            <DropSel value={fStatus} onChange={e => { setFStatus(e.target.value); resetPage(); }} minW="140px">
              {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
            </DropSel>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Issue Type</span>
            <DropSel value={fIssueType} onChange={e => { setFIssueType(e.target.value); resetPage(); }} minW="160px">
              {ALL_ISSUE_TYPES.map(t => <option key={t}>{t}</option>)}
            </DropSel>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Priority</span>
            <DropSel value={fPriority} onChange={e => { setFPriority(e.target.value); resetPage(); }} minW="130px">
              {ALL_PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </DropSel>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Date Range</span>
            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-white shadow-sm">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="w-28 text-sm font-medium text-slate-700 focus:outline-none bg-transparent"
              />
              <span className="text-slate-400 font-medium">-</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="w-28 text-sm font-medium text-slate-700 focus:outline-none bg-transparent"
              />
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          </div>

          <button onClick={resetFilters}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 shadow-sm transition-colors whitespace-nowrap self-end">
            <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
          </button>
        </div>
      </div>

      {/* ── TABLE ──────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" style={{ minWidth: 1300 }}>
          <thead>
            <tr className="border-b-2 border-slate-100 bg-white">
              {COLS.map(col => (
                <th key={col.key}
                  className="py-4 px-5 text-xs font-black text-slate-900 uppercase tracking-wider whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11} className="py-24 text-center text-sm font-semibold text-slate-400">
                  Loading claims...
                </td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-24 text-center text-sm font-semibold text-slate-400">
                  No claim records found matching your criteria.
                </td>
              </tr>
            ) : (
              pageData.map((c, idx) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors group cursor-pointer h-[78px]"
                  onClick={() => onView?.(c)}
                >
                  {/* Claim ID */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <span className="text-sm font-bold text-slate-800">{c.id}</span>
                  </td>

                  {/* Warranty Ref + Serial */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <span className="text-sm font-bold text-green-600 block">{c.warrantyRef}</span>
                    <span className="text-xs text-slate-400 font-mono mt-0.5 block">{c.serial}</span>
                  </td>

                  {/* Item Title */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <span className="text-sm font-medium text-slate-700">{c.item}</span>
                  </td>

                  {/* Vehicle (single line, no odometer) */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-sm font-bold text-slate-700">{c.vehicle}</span>
                    </div>
                  </td>

                  {/* Issue Type */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <span className="text-sm font-medium text-slate-600">{c.issueType}</span>
                  </td>

                  {/* Priority badge */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${priorityStyles[c.priority] || priorityStyles.Low}`}>
                      {c.priority}
                    </span>
                  </td>

                  {/* Vendor */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <span className="text-sm font-medium text-slate-600">{c.vendor}</span>
                  </td>

                  {/* Claim Amount */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">₹ {c.claimAmount}</span>
                  </td>

                  {/* Status badge */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${statusStyles[c.status] || statusStyles.Draft}`}>
                      {c.status}
                    </span>
                  </td>

                  {/* Submitted Date */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <span className="text-sm font-medium text-slate-500 whitespace-nowrap">
                      {c.submittedDate ? new Date(c.submittedDate).toLocaleDateString('en-GB') : '—'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => onView?.(c)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-green-700 hover:border-green-400 hover:bg-green-50 transition-colors"
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

      {/* ── FOOTER / PAGINATION ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 flex-wrap gap-3">

        <span className="text-sm font-medium text-slate-400">
          {filtered.length === 0
            ? 'No entries found'
            : `Showing ${(safePage-1)*pageSize+1} to ${Math.min(safePage*pageSize, filtered.length)} of ${filtered.length} entries`}
        </span>

        <div className="flex items-center gap-1.5">
          <button onClick={() => goPage(safePage-1)} disabled={safePage===1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:border-green-400 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>

          {visiblePages().map((p, i, arr) => (
            <React.Fragment key={p}>
              {i>0 && arr[i-1]!==p-1 && (
                <span className="text-slate-300 text-sm font-bold px-1">…</span>
              )}
              <button onClick={() => goPage(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold border transition-colors
                  ${p===safePage
                    ? 'bg-green-700 text-white border-green-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-green-400 hover:text-green-600'}`}>
                {p}
              </button>
            </React.Fragment>
          ))}

          <button onClick={() => goPage(safePage+1)} disabled={safePage===totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:border-green-400 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="relative">
          <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); resetPage(); }}
            className="appearance-none border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-sm font-semibold text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer shadow-sm">
            {PAGE_SIZES.map(s => <option key={s} value={s}>{s} / page</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

    </div>
  );
}