import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, MapPin, FileText, Clock, AlertTriangle, CheckCircle, Info } from 'lucide-react';

// Static positions – no longer imported from dummyData
const layoutPositions = [
  { id: 'FL', label: 'Front Left' },
  { id: 'FR', label: 'Front Right' },
  { id: 'RL', label: 'Rear Left' },
  { id: 'RR', label: 'Rear Right' },
  { id: 'RLO', label: 'Rear Left Outer' },
  { id: 'RLI', label: 'Rear Left Inner' },
  { id: 'RRO', label: 'Rear Right Outer' },
  { id: 'RRI', label: 'Rear Right Inner' }
];

const posLabel = (id) => layoutPositions.find(p => p.id === id)?.label ?? id ?? '—';

const STATUS_STYLE = {
  SCRAP:      { badge: 'bg-red-100    text-red-700    ring-1 ring-red-300',    dot: 'bg-red-500',    topBorder: '#ef4444' },
  RETREADING: { badge: 'bg-amber-100  text-amber-700  ring-1 ring-amber-300',  dot: 'bg-amber-500',  topBorder: '#f59e0b' },
  REUSABLE:   { badge: 'bg-blue-100   text-blue-700   ring-1 ring-blue-300',   dot: 'bg-blue-500',   topBorder: '#3b82f6' },
  OLD_STOCK:  { badge: 'bg-slate-100  text-slate-600  ring-1 ring-slate-300',  dot: 'bg-slate-400',  topBorder: '#94a3b8' },
};
const STATUS_LABELS = { SCRAP: 'Scrap', RETREADING: 'Retreading', REUSABLE: 'Reusable', OLD_STOCK: 'Old Stock' };

function SpecRow({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 gap-4">
      <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider shrink-0">{label}</span>
      <span className={`text-sm font-semibold text-right leading-tight ${accent ? 'text-emerald-600 font-mono' : 'text-slate-800'}`}>
        {value ?? '—'}
      </span>
    </div>
  );
}

function recommendation(tyre) {
  const tread = tyre.remainingTread;
  const over  = tyre.expectedLife && tyre.runningKm > tyre.expectedLife;
  if (over || (tread != null && tread <= 10))
    return { label: 'Recommended for Scrap', icon: AlertTriangle, color: 'bg-red-50 border-red-200 text-red-700' };
  if (tread != null && tread > 40 && (tyre.condition === 'Good' || !tyre.condition))
    return { label: 'Suitable for Reuse — Good condition tyre', icon: CheckCircle, color: 'bg-blue-50 border-blue-200 text-blue-700' };
  if (tread != null && tread > 10 && tread <= 40)
    return { label: 'Suitable for Retreading', icon: Info, color: 'bg-amber-50 border-amber-200 text-amber-700' };
  return null;
}

const LIFECYCLE_STEPS = ['Purchased', 'Mounted', 'Active Running', 'Removed', 'Old Stock'];

// Derive best-guess dates for each lifecycle stage from available tyre data
function getLifecycleDates(tyre) {
  const removed = tyre.removedDate || tyre.entryDate || null;
  return [
    tyre.purchaseDate  || null,   // Purchased
    tyre.fittedDate    || null,   // Mounted
    tyre.fittedDate    || null,   // Active Running (same start as mounted)
    removed,                      // Removed
    removed,                      // Old Stock (same as removed)
  ];
}

function fmtDate(d) {
  if (!d) return null;
  // accepts YYYY-MM-DD
  const [y, m, day] = d.split('-');
  return `${day}-${m}-${y}`;
}

export default function OldTyreDetailsModal({ tyre, onClose }) {
  if (!tyre) return null;

  // ── Map database fields to the structure expected by this component ──
  const mappedTyre = {
    tyreNo: tyre.old_tyre_number || tyre.tyre_number || tyre.tyreNo || tyre.id,
    make: tyre.brand || tyre.make || '—',
    model: tyre.model || '—',
    tyreSize: tyre.tyre_size || tyre.tyreSize || '—',
    material: tyre.material_type || tyre.material || '—',
    runningKm: Number(tyre.running_km || tyre.runningKm || 0),
    expectedLife: Number(tyre.expected_life_km || tyre.expectedLife || 0),
    remainingTread: Number(tyre.remaining_tread_percent || tyre.remainingTread || 0),
    storeLocation: tyre.store_location || tyre.storeLocation || '—',
    vehicleNo: tyre.vehicle_number || tyre.vehicleNo || '—',
    lastPosition: tyre.last_position || tyre.lastPosition || '—',
    removalReason: tyre.removal_reason || tyre.removalReason || '—',
    removedDate: tyre.removed_date || tyre.removedDate || tyre.entryDate || '—',
    condition: tyre.tyre_health || tyre.condition || '—',
    notes: tyre.notes || '',
    status: tyre.tyre_status || tyre.status || 'OLD_STOCK',
    purchaseDate: tyre.purchase_date || tyre.purchaseDate || null,
    fittedDate: tyre.date_of_issue || tyre.fittedDate || null,
  };

  const st = STATUS_STYLE[mappedTyre.status] || STATUS_STYLE.OLD_STOCK;
  const statusLabel = STATUS_LABELS[mappedTyre.status] || mappedTyre.status;
  const tread = mappedTyre.remainingTread != null ? `${mappedTyre.remainingTread}%` : '—';
  const removedDate = mappedTyre.removedDate || '—';
  const rec = recommendation(mappedTyre);

  const treadColor = mappedTyre.remainingTread != null
    ? mappedTyre.remainingTread <= 10
      ? 'text-red-600'
      : mappedTyre.remainingTread <= 40
        ? 'text-orange-500'
        : 'text-emerald-600'
    : 'text-gray-400';

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
          style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.22)' }}
        >
          {/* Sticky Header */}
          <div className="shrink-0 px-6 py-5 bg-gradient-to-r from-[#0f172a] to-[#1e293b] flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-[16px] font-black text-white tracking-tight">Old Tyre Details</h3>
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${st.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{statusLabel}
                </span>
              </div>
              <p className="text-[11px] text-blue-400 font-semibold tracking-widest mt-0.5 font-mono uppercase">
                {mappedTyre.tyreNo}
              </p>
            </div>
            <button onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:rotate-90 shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="overflow-y-auto flex-1 p-5 space-y-4 bg-gray-50/60"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>

            {/* Smart Recommendation Banner */}
            {rec && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-2.5 border rounded-xl px-4 py-3 ${rec.color}`}>
                <rec.icon className="w-4 h-4 shrink-0" />
                <p className="text-xs font-semibold">{rec.label}</p>
              </motion.div>
            )}

            {/* Top Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl border border-gray-100 border-t-2 border-t-blue-400 shadow-sm p-4 flex flex-col items-center text-center gap-1.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Final Ran KM</p>
                <p className="text-xl font-black text-gray-800 leading-none font-mono">
                  {(mappedTyre.runningKm || 0).toLocaleString()}
                  <span className="text-xs font-bold text-gray-400 ml-1">km</span>
                </p>
              </div>

              <div className={`rounded-2xl border border-t-2 shadow-sm p-4 flex flex-col items-center text-center gap-1.5 ${st.badge}`}
                style={{ borderTopColor: st.topBorder }}>
                <div className="w-8 h-8 rounded-xl bg-white/60 flex items-center justify-center">
                  <span className={`w-3.5 h-3.5 rounded-full ${st.dot}`} />
                </div>
                <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Status</p>
                <p className="text-base font-black uppercase leading-none">{statusLabel}</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 border-t-2 border-t-emerald-400 shadow-sm p-4 flex flex-col items-center text-center gap-1.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tread Left</p>
                <p className={`text-xl font-black leading-none ${treadColor}`}>{tread}</p>
              </div>
            </div>

            {/* Full Specification */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <h4 className="text-sm font-bold text-slate-800">Full Specification</h4>
              </div>
              <div className="px-5 py-1">
                <SpecRow label="Tyre Number"    value={mappedTyre.tyreNo} />
                <SpecRow label="Brand"          value={mappedTyre.make} />
                <SpecRow label="Model"          value={mappedTyre.model} />
                <SpecRow label="Tyre Size"      value={mappedTyre.tyreSize} />
                <SpecRow label="Material"       value={mappedTyre.material} />
                <SpecRow label="Expected Life"  value={mappedTyre.expectedLife ? `${mappedTyre.expectedLife.toLocaleString()} km` : '—'} />
                <SpecRow label="Store Location" value={mappedTyre.storeLocation} />
              </div>
            </div>

            {/* Removal Details */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <h4 className="text-sm font-bold text-slate-800">Removal Details</h4>
              </div>
              <div className="px-5 py-1">
                <SpecRow label="Removed Vehicle"  value={mappedTyre.vehicleNo} />
                <SpecRow label="Last Position"    value={mappedTyre.lastPosition ? posLabel(mappedTyre.lastPosition) : '—'} />
                <SpecRow label="Removal Reason"   value={mappedTyre.removalReason} />
                <SpecRow label="Removed Date"     value={removedDate} />
                <SpecRow label="Tyre Condition"   value={mappedTyre.condition} />
                {mappedTyre.notes && <SpecRow label="Remarks" value={mappedTyre.notes} />}
              </div>
            </div>

            {/* Lifecycle Timeline */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Lifecycle</p>
              <div className="flex items-start overflow-x-auto pb-1">
                {LIFECYCLE_STEPS.map((step, i) => {
                  const isLast    = i === LIFECYCLE_STEPS.length - 1;
                  const isCurrent = isLast;
                  const dates     = getLifecycleDates(mappedTyre);
                  const date      = fmtDate(dates[i]);
                  return (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center shrink-0 min-w-[64px]">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all
                          ${isCurrent
                            ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-200'
                            : 'bg-emerald-500 border-emerald-500 text-white'}`}>
                          {i + 1}
                        </div>
                        <span className={`text-[10px] font-semibold mt-1.5 whitespace-nowrap text-center
                          ${isCurrent ? 'text-orange-600' : 'text-emerald-600'}`}>
                          {step}
                        </span>
                        {date && (
                          <span className="text-[9px] font-medium text-gray-400 mt-0.5 whitespace-nowrap">
                            {date}
                          </span>
                        )}
                      </div>
                      {!isLast && (
                        <div className="flex-1 h-[3px] mx-2 min-w-[20px] bg-emerald-300 rounded-full mt-3.5" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Sticky Footer */}
          <div className="shrink-0 flex items-center justify-end px-5 py-3.5 border-t border-slate-100 bg-white">
            <button onClick={onClose}
              className="h-9 px-5 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200">
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}