import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw, PackageCheck, XCircle, AlertTriangle, Clock,
  Search, X, Archive, MoreVertical, Eye, ArrowRight,
} from 'lucide-react';
import { Toast, useToast, StickyTable, StickyThead, EmptyState } from '../components/ERPUtils';
import RetreadingCompletedModal from '../components/RetreadingCompletedModal';

const todayStr = () => new Date().toISOString().split('T')[0];

const STATUS_STYLE = {
  IN_PROGRESS: { badge: 'bg-amber-100 text-amber-700 ring-1 ring-amber-300',     dot: 'bg-amber-500',   label: 'In Progress' },
  RETURNED:    { badge: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300', dot: 'bg-emerald-500', label: 'Returned'    },
  CANCELLED:   { badge: 'bg-red-100 text-red-700 ring-1 ring-red-300',            dot: 'bg-red-500',     label: 'Cancelled'   },
  REJECTED:    { badge: 'bg-rose-100 text-rose-700 ring-1 ring-rose-300',          dot: 'bg-rose-500',    label: 'Rejected'    },
};

const CONDITION_STYLE = {
  Excellent: 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200',
  Good:      'text-blue-700 bg-blue-50 ring-1 ring-blue-200',
  Average:   'text-amber-700 bg-amber-50 ring-1 ring-amber-200',
  Poor:      'text-red-700 bg-red-50 ring-1 ring-red-200',
};

function isOverdue(r) {
  return r.status === 'IN_PROGRESS' && r.expectedReturnDate && r.expectedReturnDate < todayStr();
}

// ── Actions dropdown ──────────────────────────────────────────────────────────
function ActionMenu({ record, onView, onMarkReturned, onCancel, onReject }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className="relative flex justify-center" ref={ref}>
      <button onClick={() => setOpen(p => !p)}
        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
        <MoreVertical className="w-3.5 h-3.5 text-slate-600" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-8 z-30 bg-white rounded-xl shadow-xl border border-gray-200 py-1 min-w-[170px]"
          >
            <button onClick={() => { onView(); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              <Eye className="w-3.5 h-3.5 text-slate-400" /> View Details
            </button>
            {record.status === 'IN_PROGRESS' && (
              <>
                <button onClick={() => { onMarkReturned(); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors">
                  <PackageCheck className="w-3.5 h-3.5 text-emerald-500" /> Mark Returned
                </button>
                <button onClick={() => { onReject(); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors">
                  <XCircle className="w-3.5 h-3.5 text-rose-400" /> Reject
                </button>
                <div className="my-1 border-t border-gray-100" />
                <button onClick={() => { onCancel(); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors">
                  <XCircle className="w-3.5 h-3.5 text-red-400" /> Cancel
                </button>
              </>
            )}
            {record.status === 'REJECTED' && (
              <button onClick={() => { onMarkReturned(); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors">
                <RotateCcw className="w-3.5 h-3.5 text-amber-500" /> Send Again
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── View Details modal ────────────────────────────────────────────────────────
function ViewRetreadingModal({ record, onClose }) {
  if (!record) return null;
  const ov = isOverdue(record);
  const st = STATUS_STYLE[record.status] || STATUS_STYLE.IN_PROGRESS;
  const costDiff = record.actualCost != null && record.expectedCost
    ? record.actualCost - record.expectedCost : null;

  const rows = [
    ['Tyre No',        record.tyreNo,        'mono'],
    ['Brand / Model',  `${record.brand || ''} ${record.model || ''}`.trim() || '—', ''],
    ['Tyre Size',      record.tyreSize || '—', 'mono'],
    ['Vehicle No',     record.vehicleNo || '—', ''],
    ['Last Position',  record.lastPosition || '—', ''],
    ['Running KM',     record.runningKm ? `${record.runningKm.toLocaleString()} km` : '—', 'mono'],
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl w-full overflow-hidden flex flex-col"
        style={{ maxWidth: '480px', maxHeight: '90vh', boxShadow: '0 32px 80px rgba(0,0,0,0.2)' }}
      >
        <div className="shrink-0 px-5 py-4 bg-gradient-to-r from-[#0f172a] to-[#1e293b] flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <h3 className="text-[15px] font-black text-white">Retreading Details</h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{record.tyreNo} · {record.vendorName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:rotate-90">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ scrollbarWidth: 'thin' }}>

          {/* Status + overdue */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${st.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
            </span>
            {ov && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full ring-1 ring-red-200">
                <AlertTriangle className="w-3 h-3" /> Overdue
              </span>
            )}
          </div>

          {/* Tyre info */}
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Tyre Information</p>
            <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100">
              {rows.map(([label, val, style]) => (
                <div key={label} className="flex justify-between items-center px-4 py-2.5">
                  <span className="text-[11px] font-semibold text-slate-400">{label}</span>
                  <span className={`text-xs font-bold text-slate-700 ${style === 'mono' ? 'font-mono' : ''}`}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Retreading info */}
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Retreading Info</p>
            <div className="bg-amber-50 rounded-xl border border-amber-100 divide-y divide-amber-100">
              {[
                ['Vendor',          record.vendorName],
                ['Sent Date',       record.sentDate],
                ['Expected Return', record.expectedReturnDate],
                ['Expected Cost',   `₹${(record.expectedCost || 0).toLocaleString()}`],
                record.notes ? ['Notes', record.notes] : null,
              ].filter(Boolean).map(([label, val]) => (
                <div key={label} className="flex justify-between items-center px-4 py-2.5">
                  <span className="text-[11px] font-semibold text-slate-500">{label}</span>
                  <span className="text-xs font-bold text-slate-700 text-right max-w-[55%]">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Return info — only if returned */}
          {record.status === 'RETURNED' && (
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Return Details</p>
              <div className="bg-emerald-50 rounded-xl border border-emerald-100 divide-y divide-emerald-100">
                {[
                  ['Return Date',    record.returnDate],
                  ['Actual Cost',    `₹${(record.actualCost || 0).toLocaleString()}`],
                  ['New Tread %',    `${record.newTreadPercent}%`],
                  ['Condition',      record.condition],
                  record.remarks ? ['Remarks', record.remarks] : null,
                ].filter(Boolean).map(([label, val]) => (
                  <div key={label} className="flex justify-between items-center px-4 py-2.5">
                    <span className="text-[11px] font-semibold text-slate-500">{label}</span>
                    <span className={`text-xs font-bold ${
                      label === 'Condition' && CONDITION_STYLE[val]
                        ? `px-2 py-0.5 rounded-full ${CONDITION_STYLE[val]}`
                        : 'text-slate-700'
                    }`}>{val}</span>
                  </div>
                ))}
                {costDiff !== null && (
                  <div className="flex justify-between items-center px-4 py-2.5">
                    <span className="text-[11px] font-semibold text-slate-500">Cost Variance</span>
                    <span className={`text-xs font-bold ${costDiff > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {costDiff > 0 ? `+₹${costDiff.toLocaleString()} over` : `-₹${Math.abs(costDiff).toLocaleString()} saved`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lifecycle flow */}
          <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 pt-1">
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full ring-1 ring-slate-200">Old Stock</span>
            <ArrowRight className="w-3 h-3" />
            <span className={`px-2 py-0.5 rounded-full ring-1 ${record.status !== 'IN_PROGRESS' ? 'bg-slate-100 text-slate-400 ring-slate-200' : 'bg-amber-50 text-amber-600 ring-amber-200'}`}>Retreading</span>
            <ArrowRight className="w-3 h-3" />
            <span className={`px-2 py-0.5 rounded-full ring-1 ${record.status === 'RETURNED' ? 'bg-blue-50 text-blue-600 ring-blue-200' : 'bg-slate-100 text-slate-400 ring-slate-200'}`}>Reusable</span>
          </div>
        </div>

        <div className="shrink-0 px-5 py-4 border-t border-slate-100 bg-slate-50/60">
          <button onClick={onClose}
            className="w-full h-10 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all">
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Tab ──────────────────────────────────────────────────────────────────
export default function RetreadingTab({ records = [], onRecordUpdate, onRejected }) {
  const { toasts, push, dismiss } = useToast();
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [completing, setCompleting]     = useState(null);
  const [viewing, setViewing]           = useState(null);

  const filtered = useMemo(() => records.filter(r => {
    const matchSearch = !search ||
      r.tyreNo?.toLowerCase().includes(search.toLowerCase()) ||
      r.vendorName?.toLowerCase().includes(search.toLowerCase()) ||
      r.brand?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchSearch && matchStatus;
  }), [records, search, filterStatus]);

  const counts = {
    total:      records.length,
    inProgress: records.filter(r => r.status === 'IN_PROGRESS').length,
    returned:   records.filter(r => r.status === 'RETURNED').length,
    overdue:    records.filter(r => isOverdue(r)).length,
    rejected:   records.filter(r => r.status === 'REJECTED').length,
  };

  const handleRetreadingComplete = (updated) => {
    onRecordUpdate?.(updated);
    push(`${updated.tyreNo} returned — moved to Reusable Stock`, 'success');
    setCompleting(null);
  };

  const handleCancel = (record) => {
    onRecordUpdate?.({ ...record, status: 'CANCELLED' });
    push(`${record.tyreNo} retreading cancelled`, 'warning');
  };

  const handleReject = (record) => {
    onRecordUpdate?.({ ...record, status: 'REJECTED' });
    onRejected?.(record.tyreNo);
    push(`${record.tyreNo} rejected by vendor — moved back to Old Stock`, 'error');
  };

  return (
    <div className="space-y-4">
      <Toast toasts={toasts} onDismiss={dismiss} />

      {/* Dashboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Sent',  value: counts.total,      icon: RotateCcw,    bg: 'bg-slate-800', text: 'text-white',       sub: 'text-slate-400',   iconBg: 'bg-white/10',    iconColor: 'text-white',       border: 'border-slate-700' },
          { label: 'In Progress', value: counts.inProgress,  icon: Clock,        bg: 'bg-white',     text: 'text-amber-700',   sub: 'text-amber-400',   iconBg: 'bg-amber-100',   iconColor: 'text-amber-600',  border: 'border-amber-200',  accent: 'border-t-2 border-t-amber-500'   },
          { label: 'Returned',    value: counts.returned,    icon: PackageCheck, bg: 'bg-white',     text: 'text-emerald-700', sub: 'text-emerald-400', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', border: 'border-emerald-200', accent: 'border-t-2 border-t-emerald-500' },
          { label: 'Overdue',     value: counts.overdue,     icon: AlertTriangle, bg: 'bg-white',    text: 'text-red-700',     sub: 'text-red-400',     iconBg: 'bg-red-100',     iconColor: 'text-red-600',    border: 'border-red-200',    accent: 'border-t-2 border-t-red-500'     },
        ].map(card => (
          <motion.div key={card.label}
            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
            transition={{ duration: 0.18 }}
            className={`${card.bg} ${card.accent || ''} rounded-2xl border ${card.border} shadow-sm p-4 flex items-center gap-3`}>
            <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0`}>
              <card.icon className={`w-4 h-4 ${card.iconColor}`} />
            </div>
            <div className="min-w-0">
              <p className={`text-2xl font-black leading-none ${card.text}`}>{card.value}</p>
              <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${card.sub}`}>{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Retreading Tracker</h2>
        <p className="text-xs text-gray-500 mt-0.5">Track tyres sent for retreading and manage returns</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Filters */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/60 flex flex-wrap items-center gap-2.5">
          <div className="flex-1 min-w-[180px] max-w-xs relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input type="text" placeholder="Tyre No, Vendor, Brand..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 h-[38px] bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="w-36 px-3 h-[38px] bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all">
            <option value="all">All Status</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RETURNED">Returned</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          {(search || filterStatus !== 'all') && (
            <button onClick={() => { setSearch(''); setFilterStatus('all'); }}
              className="flex items-center gap-1.5 h-[38px] px-3.5 bg-white border border-gray-200 text-gray-500 hover:text-gray-800 rounded-xl text-sm font-semibold transition-all">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        <StickyTable minWidth="920px">
          <StickyThead>
            <tr className="border-b border-gray-200 bg-slate-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <th className="py-2.5 px-3 whitespace-nowrap">Tyre No</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Brand / Model</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Vendor</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Sent Date</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Exp. Return</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">Exp. Cost</th>
              <th className="py-2.5 px-3 text-right whitespace-nowrap">Actual Cost</th>
              <th className="py-2.5 px-3 text-center whitespace-nowrap">Status</th>
              <th className="py-2.5 px-3 text-center whitespace-nowrap">Actions</th>
            </tr>
          </StickyThead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="9">
                <EmptyState icon={Archive}
                  title={records.length === 0 ? 'No retreading records yet' : 'No records match filters'}
                  subtitle={records.length === 0 ? 'Send a tyre for retreading from Old Tyres Stock' : undefined} />
              </td></tr>
            ) : filtered.map((rec, idx) => {
              const st = STATUS_STYLE[rec.status] || STATUS_STYLE.IN_PROGRESS;
              const ov = isOverdue(rec);
              return (
                <motion.tr key={rec.id}
                  initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`border-b border-gray-100 transition-colors ${ov ? 'bg-red-50/30' : idx % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'} hover:bg-slate-50/70`}>

                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="text-xs font-bold text-slate-800 font-mono">{rec.tyreNo}</span>
                    {ov && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <AlertTriangle className="w-2.5 h-2.5 text-red-500" />
                        <span className="text-[9px] font-bold text-red-600">Overdue</span>
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="text-xs font-semibold text-gray-800 leading-tight">{rec.brand || '—'}</div>
                    <div className="text-[10px] text-gray-400">{rec.model || ''} {rec.tyreSize ? `· ${rec.tyreSize}` : ''}</div>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="text-xs font-semibold text-gray-700">{rec.vendorName}</span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="text-[11px] font-medium text-gray-500 tabular-nums">{rec.sentDate}</span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`text-[11px] font-medium tabular-nums ${ov ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                      {rec.expectedReturnDate}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <span className="text-xs font-bold text-gray-700 font-mono">₹{(rec.expectedCost || 0).toLocaleString()}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    {rec.actualCost != null
                      ? <span className="text-xs font-bold text-emerald-600 font-mono">₹{rec.actualCost.toLocaleString()}</span>
                      : <span className="text-xs text-gray-300 font-bold">—</span>}
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${st.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />{st.label}
                      </span>
                      {rec.status === 'RETURNED' && rec.condition && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${CONDITION_STYLE[rec.condition] || ''}`}>
                          {rec.condition}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <ActionMenu
                      record={rec}
                      onView={() => setViewing(rec)}
                      onMarkReturned={() => setCompleting(rec)}
                      onCancel={() => handleCancel(rec)}
                      onReject={() => handleReject(rec)}
                    />
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </StickyTable>

        {filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/40">
            <p className="text-xs text-gray-400 font-medium">
              Showing <span className="font-bold text-gray-600">{filtered.length}</span> of{' '}
              <span className="font-bold text-gray-600">{records.length}</span> records
            </p>
          </div>
        )}
      </div>

      <RetreadingCompletedModal
        record={completing}
        onClose={() => setCompleting(null)}
        onConfirm={handleRetreadingComplete}
      />
      <ViewRetreadingModal record={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
