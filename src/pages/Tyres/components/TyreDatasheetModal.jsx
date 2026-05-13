import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, History, FileText, Edit2, ArchiveX, Printer, Paperclip } from 'lucide-react';
import TyreQRCard from './TyreQRCard';
import { layoutPositions } from '../data/dummyData';

const positionLabel = (id) =>
  layoutPositions.find(p => p.id === id)?.label ?? id;

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
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 gap-4">
      <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider shrink-0">{label}</span>
      <span className={`text-sm font-semibold text-right leading-tight
        ${accent ? 'text-emerald-600 font-mono' : 'text-slate-800'}
        ${truncate ? 'truncate max-w-[140px]' : ''}`}
        title={truncate ? String(value) : undefined}
      >
        {value}
      </span>
    </div>
  );
}

/* ── Lifecycle steps ───────────────────────────────────────────────────────── */
const STEPS = [
  { label: 'Purchased' },
  { label: 'Mounted'   },
  { label: 'Inspection'},
  { label: 'Active', current: true },
];

/* ── Main modal ────────────────────────────────────────────────────────────── */
export default function TyreDatasheetModal({ isOpen, onClose, tyreData }) {
  if (!isOpen || !tyreData) return null;

  const remainingLife = Math.max(tyreData.expectedLife - tyreData.runningKm, 0);
  const runningPct    = Math.min((tyreData.runningKm / tyreData.expectedLife) * 100, 100);
  const lifeUsedPct   = Math.round(runningPct);
  const hs            = HEALTH[tyreData.health] || HEALTH.Good;
  const attachCount   = tyreData.attachments?.length ?? 0;

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

          {/* ══ STICKY HEADER ══════════════════════════════════════════════════ */}
          <div className="shrink-0 sticky top-0 z-10 bg-gradient-to-r from-[#0f172a] to-[#1a2744] px-7 py-5 flex items-center justify-between">

            {/* Left — title block */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5">
                <h3 className="text-[17px] font-black text-white tracking-tight leading-none">
                  Tyre Data Sheet
                </h3>
                <span className="px-2 py-0.5 bg-emerald-500 text-[10px] text-white font-bold uppercase tracking-widest rounded-md leading-none">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-blue-400 font-semibold tracking-[0.12em] uppercase leading-none mt-0.5">
                Serial ID: {tyreData.id}
              </p>
            </div>

            {/* Right — actions */}
            <div className="flex items-center gap-1.5">
              <HeaderBtn icon={Edit2}   label="Edit Tyre"        />
              <HeaderBtn icon={ArchiveX} label="Move to Old Stock" />
              <HeaderBtn icon={Printer} label="Print Report"     />
              <div className="w-px h-5 bg-white/20 mx-1" />
              <HeaderBtn icon={X} label="Close" onClick={onClose} rounded />
            </div>
          </div>

          {/* ══ SCROLLABLE BODY ════════════════════════════════════════════════ */}
          <div
            className="overflow-y-auto flex-1 p-6 bg-gray-50/70 space-y-4"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}
          >

            {/* ── Metric Cards ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* Total Running */}
              <div className="bg-white rounded-2xl border border-gray-100 border-t-2 border-t-blue-400 shadow-sm p-5
                flex flex-col items-center justify-center text-center gap-2
                transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Running</p>
                <p className="text-3xl font-black text-gray-800 tracking-tight leading-none">
                  {tyreData.runningKm.toLocaleString()}
                  <span className="text-sm font-bold text-gray-400 ml-1">km</span>
                </p>
              </div>

              {/* Est. Remaining */}
              <div className="bg-white rounded-2xl border border-gray-100 border-t-2 border-t-slate-400 shadow-sm p-5
                flex flex-col items-center justify-center text-center gap-2 relative overflow-hidden
                transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                {/* progress stripe */}
                <div className="absolute top-0 left-0 h-[3px] w-full bg-gray-100 rounded-full">
                  <div className={`h-full rounded-full ${hs.bar} transition-all duration-700`} style={{ width: `${runningPct}%` }} />
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mt-1">
                  <History className="w-5 h-5 text-slate-500" />
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Est. Remaining</p>
                <p className="text-3xl font-black text-blue-600 tracking-tight leading-none">
                  {remainingLife.toLocaleString()}
                  <span className="text-sm font-bold text-blue-400 ml-1">km</span>
                </p>
              </div>

              {/* Current Health */}
              <div className={`${hs.bg} ${hs.border} border border-t-2 rounded-2xl shadow-sm p-5
                flex flex-col items-center justify-center text-center gap-1.5
                transition-all duration-200 hover:-translate-y-1 hover:shadow-lg`}>
                <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center">
                  <div className={`w-4 h-4 rounded-full ${hs.fill}`} />
                </div>
                <p className={`text-[10px] font-bold ${hs.text} opacity-70 uppercase tracking-widest`}>Current Health</p>
                <p className={`text-2xl font-black ${hs.text} tracking-tight uppercase leading-none`}>
                  {tyreData.health}
                </p>
                {/* mini progress bar */}
                <div className="w-full mt-1">
                  <div className="h-1.5 w-full bg-white/50 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${hs.bar} transition-all duration-700`} style={{ width: `${lifeUsedPct}%` }} />
                  </div>
                  <p className={`text-[10px] font-semibold ${hs.text} opacity-60 mt-1`}>{lifeUsedPct}% Life Used</p>
                </div>
              </div>

            </div>

            {/* ── Full Specification ────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-3.5 border-b border-gray-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <h4 className="text-sm font-bold text-slate-800 tracking-tight">Full Specification</h4>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* QR */}
                <div className="md:row-span-2">
                  <TyreQRCard tyreId={tyreData.id} />
                </div>

                {/* Left column */}
                <div>
                  <SpecRow label="Tyre Serial No" value={tyreData.id} />
                  <SpecRow label="Brand / Make"   value={tyreData.make} />
                  <SpecRow label="Model"          value={tyreData.model} />
                  <SpecRow label="Material Type"  value={tyreData.material || 'Radial Steel'} />
                  <SpecRow label="Date of Issue"  value={tyreData.fittedDate} />
                </div>

                {/* Right column */}
                <div>
                  <SpecRow label="Expected Life"    value={`${tyreData.expectedLife.toLocaleString()} km`} />
                  <SpecRow label="Vendor"           value={tyreData.vendor || 'Unknown Provider'} />
                  <SpecRow label="Tyre Cost"        value={`₹ ${(tyreData.cost || 14500).toLocaleString()}`} accent />
                  <SpecRow label="Current Location" value={`${tyreData.truckNo} (${positionLabel(tyreData.position)})`} truncate />
                  <SpecRow label="Fitted Odometer"  value={`${tyreData.fittedOdo.toLocaleString()} km`} />
                </div>

              </div>
            </div>

            {/* ── Lifecycle Timeline ───────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Lifecycle</p>
              <div className="flex items-center overflow-x-auto pb-1">
                {STEPS.map((step, i) => (
                  <React.Fragment key={step.label}>
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black border-2 transition-all duration-200
                        ${step.current
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200 scale-110'
                          : 'bg-emerald-500 border-emerald-500 text-white'}`}
                      >
                        {i + 1}
                      </div>
                      <span className={`text-[10px] font-semibold mt-2 whitespace-nowrap
                        ${step.current ? 'text-blue-600' : 'text-emerald-600'}`}>
                        {step.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="flex-1 h-[3px] mx-2 min-w-[28px] bg-emerald-300 rounded-full" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* ── Bottom Cards ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Present Odometer */}
              <div className="bg-slate-50 rounded-2xl border border-slate-100 shadow-sm p-5
                flex items-center justify-between
                transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 min-h-[88px]">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Present Odometer</p>
                  <p className="text-2xl font-black text-slate-800 font-mono mt-1.5 leading-none">
                    {tyreData.presentOdo.toLocaleString()}
                    <span className="text-sm font-bold text-slate-400 ml-1">km</span>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-200/70 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 text-slate-500" />
                </div>
              </div>

              {/* Bill & Attachments */}
              <div className="bg-blue-50/50 rounded-2xl border border-blue-100 shadow-sm p-5
                flex items-center justify-between
                transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 min-h-[88px]">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Paperclip className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Bill &amp; Picture</p>
                    <p className="text-sm font-semibold text-slate-700 mt-1 leading-tight">
                      {attachCount > 0
                        ? `${attachCount} Attachment${attachCount > 1 ? 's' : ''} Available`
                        : <span className="text-slate-400 font-medium">No attachments uploaded</span>}
                    </p>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700
                  text-white text-xs font-bold rounded-xl shadow-sm shrink-0 ml-3
                  transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <FileText className="w-3.5 h-3.5" /> View
                </button>
              </div>

            </div>

          </div>{/* end scrollable body */}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
