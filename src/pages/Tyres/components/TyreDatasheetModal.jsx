import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, History, FileText, Edit2, ArchiveX, Printer, Paperclip, Package, MapPin } from 'lucide-react';
import TyreQRCard from './TyreQRCard';

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

const positionLabel = (id) =>
  layoutPositions.find(p => p.id === id)?.label ?? id;

/* ── Stock age helper ──────────────────────────────────────────────────────── */
function storedSince(purchaseDate) {
  if (!purchaseDate) return 'Unknown';
  const start = new Date(purchaseDate);
  const now   = new Date();
  let years  = now.getFullYear() - start.getFullYear();
  let months = now.getMonth()    - start.getMonth();
  if (months < 0) { years -= 1; months += 12; }
  if (years === 0 && months === 0) {
    const d = Math.floor((now - start) / 86400000);
    return d < 1 ? 'Today' : `${d} day${d > 1 ? 's' : ''}`;
  }
  if (years === 0) return `${months} Month${months > 1 ? 's' : ''}`;
  if (months === 0) return `${years} Year${years > 1 ? 's' : ''}`;
  return `${years} Yr ${months} Mo`;
}

/* ── Health config ─────────────────────────────────────────────────────────── */
const HEALTH = {
  Good:   { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', fill: 'bg-emerald-500', bar: 'bg-emerald-400' },
  Medium: { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   fill: 'bg-amber-400',   bar: 'bg-amber-400'   },
  Poor:   { bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-700',     fill: 'bg-red-500',     bar: 'bg-red-400'     },
};

/* ── Tooltip wrapper ───────────────────────────────────────────────────────── */
function Tip({ label, children }) {
  return (
    <div className="relative group">
      {children}
      <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap
        bg-slate-900 text-white text-[10px] font-semibold px-2 py-1 rounded-md opacity-0
        group-hover:opacity-100 transition-opacity duration-150 z-20 shadow-lg">
        {label}
      </span>
    </div>
  );
}

/* ── Header action button ──────────────────────────────────────────────────── */
function HeaderBtn({ icon: Icon, label, onClick, rounded }) {
  return (
    <Tip label={label}>
      <button
        onClick={onClick}
        aria-label={label}
        className={`p-2 bg-white/10 hover:bg-white/25 text-white/60 hover:text-white
          transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2
          focus:ring-white/30 ${rounded ? 'rounded-full' : 'rounded-lg'}`}
      >
        <Icon className="w-3.5 h-3.5" />
      </button>
    </Tip>
  );
}

/* ── Spec row ──────────────────────────────────────────────────────────────── */
function SpecRow({ label, value, accent, truncate }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 gap-4">
      <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider shrink-0">{label}</span>
      <span
        className={`text-xs font-semibold text-right leading-tight
          ${accent ? 'text-emerald-600 font-mono' : 'text-slate-800'}
          ${truncate ? 'truncate max-w-[140px]' : ''}`}
        title={truncate ? String(value) : undefined}
      >
        {value}
      </span>
    </div>
  );
}

/* ── Mini ODO card ─────────────────────────────────────────────────────────── */
function MiniCard({ label, value, accent }) {
  return (
    <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-3">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm font-black font-mono ${accent ? 'text-blue-600' : 'text-slate-800'}`}>{value}</p>
    </div>
  );
}

/* ── Main modal ────────────────────────────────────────────────────────────── */
export default function TyreDatasheetModal({ isOpen, onClose, tyreData }) {
  if (!isOpen || !tyreData) return null;

  // ── Map database fields to the structure expected by this component ──
  const mappedTyre = {
    id: tyreData.tyre_number || tyreData.old_tyre_number || tyreData.id,
    make: tyreData.brand || tyreData.make,
    model: tyreData.model,
    tyreSize: tyreData.tyre_size || tyreData.tyreSize,
    material: tyreData.material_type || tyreData.material,
    health: tyreData.tyre_health || tyreData.health || 'Good',
    runningKm: Number(tyreData.running_km || tyreData.runningKm || 0),
    expectedLife: Number(tyreData.expected_life_km || tyreData.expectedLife || 0),
    fittedOdo: Number(tyreData.fitted_odometer || tyreData.fittedOdo || 0),
    presentOdo: Number(tyreData.fitted_odometer || tyreData.fittedOdo || 0) +
                Number(tyreData.running_km || tyreData.runningKm || 0),
    truckNo: tyreData.vehicle_number || tyreData.truckNo || '—',
    position: tyreData.tyre_position || tyreData.position || '—',
    fittedDate: tyreData.date_of_issue || tyreData.fittedDate || tyreData.purchase_date || '',
    purchaseDate: tyreData.purchase_date || tyreData.purchaseDate || '',
    vendor: tyreData.vendor_name || tyreData.vendor || '',
    cost: Number(tyreData.tyre_cost || tyreData.cost || 0),
    status: tyreData.status || tyreData.tyre_status || 'In Stock',
    attachments: (() => {
      try {
        if (!tyreData.tyre_files) return [];
        return typeof tyreData.tyre_files === 'string'
          ? JSON.parse(tyreData.tyre_files)
          : tyreData.tyre_files;
      } catch {
        return [];
      }
    })()
  };

  const isStock =

    mappedTyre.status === 'In Stock' ||

    mappedTyre.status === 'OLD_STOCK' ||

    mappedTyre.status === 'RETREADING' ||

    mappedTyre.status === 'REUSABLE';
  const remainingLife = isStock ? 0 : Math.max((mappedTyre.expectedLife || 0) - (mappedTyre.runningKm || 0), 0);
  const runningPct    = isStock ? 0 : Math.min(((mappedTyre.runningKm || 0) / (mappedTyre.expectedLife || 1)) * 100, 100);
  const lifeUsedPct   = Math.round(runningPct);
  const hs            = HEALTH[mappedTyre.health] || HEALTH.Good;
  const attachCount   = mappedTyre.attachments?.length ?? 0;

  /* ── Lifecycle steps ─────────────────────────────────────────────────────── */
  const STEPS = isStock
    ? [
        { label: 'Purchased', done: true },
        { label: 'Registered', done: true },
        { label: 'In Stock', done: true, current: true },
      ]
    : [
        { label: 'Purchased',  done: true },
        { label: 'Mounted',    done: true },
        { label: 'Inspection', done: true },
        { label: 'Active',     done: true, current: true },
      ];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          exit={{    opacity: 0, scale: 0.96, y: 18 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
          style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.24)' }}
        >

          {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
          <div className="shrink-0 bg-gradient-to-r from-[#0f172a] to-[#1a2744] px-6 py-4 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5">
                <h3 className="text-[15px] font-black text-white tracking-tight leading-none">Tyre Data Sheet</h3>
                {isStock ? (
                  <span className="inline-flex items-center px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[9.5px] font-black uppercase tracking-widest rounded-full leading-none">
                    IN STOCK
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9.5px] font-black uppercase tracking-widest rounded-full leading-none">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-blue-400/80 font-semibold tracking-[0.1em] uppercase leading-none mt-0.5">
                Serial: {mappedTyre.id}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <HeaderBtn icon={Edit2}    label="Edit Tyre" />
              <HeaderBtn icon={ArchiveX} label="Move to Old Stock" />
              <HeaderBtn icon={Printer}  label="Print Report" />
              <div className="w-px h-4 bg-white/20 mx-1.5" />
              <HeaderBtn icon={X} label="Close" onClick={onClose} rounded />
            </div>
          </div>

          {/* ══ SCROLLABLE BODY ═════════════════════════════════════════════════ */}
          <div
            className="overflow-y-auto flex-1 p-5 bg-gray-50/70 space-y-4"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}
          >

            {/* ── Metric Cards ─────────────────────────────────────────────── */}
            {isStock ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                <div className="bg-white rounded-xl border border-gray-100 border-t-2 border-t-blue-400 shadow-sm px-4 py-3.5
                  flex flex-col items-center justify-center text-center gap-1.5
                  transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Package className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stock Status</p>
                  <p className="text-lg font-black text-blue-600 tracking-tight leading-none">In Stock</p>
                  <span className="text-[10px] font-semibold text-blue-400 bg-blue-50 px-2 py-0.5 rounded-full ring-1 ring-blue-200">Warehouse Inventory</span>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 border-t-2 border-t-amber-400 shadow-sm px-4 py-3.5
                  flex flex-col items-center justify-center text-center gap-1.5
                  transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <History className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stored Since</p>
                  <p className="text-lg font-black text-slate-800 tracking-tight leading-none">
                    {storedSince(mappedTyre.fittedDate || mappedTyre.purchaseDate)}
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium">{mappedTyre.fittedDate || mappedTyre.purchaseDate || '—'}</span>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 border-t-2 border-t-slate-400 shadow-sm px-4 py-3.5
                  flex flex-col items-center justify-center text-center gap-1.5
                  transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-slate-500" />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</p>
                  <p className="text-lg font-black text-slate-800 tracking-tight leading-none">Warehouse</p>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Central Stock</span>
                </div>

              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                <div className="bg-white rounded-xl border border-gray-100 border-t-2 border-t-blue-400 shadow-sm px-4 py-3.5
                  flex flex-col items-center justify-center text-center gap-1.5
                  transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Running</p>
                  <p className="text-2xl font-black text-gray-800 tracking-tight leading-none">
                    {(mappedTyre.runningKm || 0).toLocaleString()}
                    <span className="text-xs font-bold text-gray-400 ml-1">km</span>
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 border-t-2 border-t-slate-400 shadow-sm px-4 py-3.5
                  flex flex-col items-center justify-center text-center gap-1.5 relative overflow-hidden
                  transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <div className="absolute top-0 left-0 h-[3px] w-full bg-gray-100">
                    <div className={`h-full ${hs.bar} transition-all duration-700`} style={{ width: `${runningPct}%` }} />
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mt-0.5">
                    <History className="w-4 h-4 text-slate-500" />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Est. Remaining</p>
                  <p className="text-2xl font-black text-blue-600 tracking-tight leading-none">
                    {remainingLife.toLocaleString()}
                    <span className="text-xs font-bold text-blue-400 ml-1">km</span>
                  </p>
                </div>

                <div className={`${hs.bg} ${hs.border} border border-t-2 rounded-xl shadow-sm px-4 py-3.5
                  flex flex-col items-center justify-center text-center gap-1
                  transition-all duration-200 hover:-translate-y-1 hover:shadow-lg`}>
                  <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center">
                    <div className={`w-3.5 h-3.5 rounded-full ${hs.fill}`} />
                  </div>
                  <p className={`text-[10px] font-bold ${hs.text} opacity-70 uppercase tracking-widest`}>Current Health</p>
                  <p className={`text-2xl font-black ${hs.text} tracking-tight uppercase leading-none`}>{mappedTyre.health}</p>
                  <div className="w-full mt-1">
                    <div className="h-1.5 w-full bg-white/50 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${hs.bar} transition-all duration-700`} style={{ width: `${lifeUsedPct}%` }} />
                    </div>
                    <p className={`text-[10px] font-semibold ${hs.text} opacity-60 mt-0.5`}>{lifeUsedPct}% Life Used</p>
                  </div>
                </div>

              </div>
            )}

            {/* ── Full Specification ────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <h4 className="text-sm font-bold text-slate-800 tracking-tight">Full Specification</h4>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">

                {/* QR */}
                <div>
                  <TyreQRCard tyreId={mappedTyre.id} />
                </div>

                {/* Left column — always visible */}
                <div>
                  <SpecRow label="Tyre Serial No" value={mappedTyre.id} />
                  <SpecRow label="Brand / Make"   value={mappedTyre.make} />
                  <SpecRow label="Model"          value={mappedTyre.model} />
                  <SpecRow label="Tyre Size"      value={mappedTyre.tyreSize || '—'} />
                  <SpecRow label="Material Type"  value={mappedTyre.material || '—'} />
                  <SpecRow label="Expected Life"  value={mappedTyre.expectedLife ? `${mappedTyre.expectedLife.toLocaleString()} km` : '—'} />
                </div>

                {/* Right column */}
                <div>
                  <SpecRow label="Vendor"        value={mappedTyre.vendor || 'Unknown Provider'} />
                  <SpecRow label="Purchase Date" value={mappedTyre.fittedDate || mappedTyre.purchaseDate || '—'} />
                  <SpecRow label="Tyre Cost"     value={mappedTyre.cost ? `₹ ${mappedTyre.cost.toLocaleString('en-IN')}` : '—'} accent />
                  {isStock ? (
                    <>
                      <SpecRow label="Stock Status"     value="In Stock" />
                      <SpecRow label="Warehouse Zone"   value="Central Warehouse" />
                      <SpecRow label="Purchase Age"     value={storedSince(mappedTyre.fittedDate || mappedTyre.purchaseDate)} />
                    </>
                  ) : (
                    <>
                      <SpecRow
                        label="Current Truck"
                        value={mappedTyre.truckNo && mappedTyre.truckNo !== '—' ? mappedTyre.truckNo : 'Not Mounted Yet'}
                        truncate
                      />
                      <SpecRow
                        label="Tyre Position"
                        value={mappedTyre.position && mappedTyre.position !== '—' ? positionLabel(mappedTyre.position) : '—'}
                      />
                    </>
                  )}
                </div>

                {/* Mounted-only operational mini cards */}
                {!isStock && (
                  <div className="md:col-start-2 md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <MiniCard label="Fitted ODO"   value={mappedTyre.fittedOdo  ? `${mappedTyre.fittedOdo.toLocaleString()} km`  : '—'} />
                    <MiniCard label="Present ODO"  value={mappedTyre.presentOdo ? `${mappedTyre.presentOdo.toLocaleString()} km` : '—'} />
                    <MiniCard label="Running KM"   value={mappedTyre.runningKm  ? `${mappedTyre.runningKm.toLocaleString()} km`  : '—'} accent />
                    <MiniCard label="Mounted Date" value={mappedTyre.fittedDate || '—'} />
                  </div>
                )}

              </div>
            </div>

            {/* ── Lifecycle Timeline ───────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Lifecycle</p>
              <div className="flex items-start justify-between">
                {STEPS.map((step, i) => (
                  <React.Fragment key={step.label}>
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black border-2 transition-all duration-200
                        ${step.current
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
                          : 'bg-emerald-500 border-emerald-500 text-white'}`}
                      >
                        {i + 1}
                      </div>
                      <span className={`text-[10px] font-semibold mt-1.5 whitespace-nowrap
                        ${step.current ? 'text-blue-600' : 'text-emerald-600'}`}>
                        {step.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="flex-1 h-[2px] mt-3.5 bg-emerald-300 rounded-full" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* ── Bottom: ODO + Attachments ────────────────────────────────── */}
            <div className={`grid gap-4 ${isStock ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>

              {/* Present Odometer — mounted only */}
              {!isStock && (
                <div className="bg-slate-50 rounded-2xl border border-slate-100 shadow-sm p-5
                  flex items-center justify-between
                  transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Present Odometer</p>
                    <p className="text-2xl font-black text-slate-800 font-mono mt-1.5 leading-none">
                      {(mappedTyre.presentOdo || 0).toLocaleString()}
                      <span className="text-sm font-bold text-slate-400 ml-1">km</span>
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-200/70 flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5 text-slate-500" />
                  </div>
                </div>
              )}

              {/* Bill & Attachments */}
              <div className="bg-blue-50/50 rounded-2xl border border-blue-100 shadow-sm p-5
                flex items-center justify-between
                transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Paperclip className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Bill & Picture</p>
                    <p className="text-sm font-semibold text-slate-700 mt-1 leading-tight">
                      {attachCount > 0
                        ? `${attachCount} Attachment${attachCount > 1 ? 's' : ''} Available`
                        : <span className="text-slate-400 font-medium">No attachments uploaded</span>}
                    </p>
                  </div>
                </div>
                {attachCount > 0 && (
                      <button
                        onClick={() => {
                          mappedTyre.attachments.forEach(file => {
                            window.open(
                              `${import.meta.env.VITE_API_URL}/uploads/${file}`,
                              '_blank'
                            );
                          });
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700
                          text-white text-xs font-bold rounded-xl shadow-sm shrink-0 ml-3
                          transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                      >
                        <FileText className="w-3.5 h-3.5" /> View
                      </button>
                )}
              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}