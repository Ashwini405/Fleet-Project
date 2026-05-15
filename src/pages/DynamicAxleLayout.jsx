import React, { useState } from 'react';
import { FiPlus, FiAlertTriangle, FiCheckCircle, FiClock } from 'react-icons/fi';
import { axleLayouts, posLabel, AXLE_TYPE_STYLES } from '../Tyres/data/axleLayouts';

// ── Health helpers ────────────────────────────────────────────────────────────
const HEALTH = {
  Good:   { bar: 'bg-green-500',  text: 'text-green-700',  badge: 'bg-green-100 text-green-700 border-green-200',  dot: 'bg-green-500'  },
  Medium: { bar: 'bg-amber-400',  text: 'text-amber-600',  badge: 'bg-amber-100 text-amber-700 border-amber-200',  dot: 'bg-amber-400'  },
  Poor:   { bar: 'bg-red-500',    text: 'text-red-600',    badge: 'bg-red-100 text-red-700 border-red-200',        dot: 'bg-red-500'    },
};

function getHealth(treadPct) {
  if (treadPct > 60) return 'Good';
  if (treadPct >= 30) return 'Medium';
  return 'Poor';
}

// ── Single tyre slot ──────────────────────────────────────────────────────────
function TyreSlot({ posId, tyre, onSlotClick, selectedPos }) {
  const label = posLabel(posId);
  const isSelected = selectedPos === posId;

  if (!tyre) {
    return (
      <button
        onClick={() => onSlotClick(posId, null)}
        title={`Mount tyre at ${label}`}
        className={`w-[72px] min-h-[96px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all
          ${isSelected
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-slate-300 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
          }`}
      >
        <div className="w-5 h-5 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center">
          <FiPlus className="w-2.5 h-2.5 text-slate-400" />
        </div>
        <span className="text-[8px] font-bold text-slate-400 uppercase">Empty</span>
        <span className="text-[7px] text-slate-300 font-semibold text-center px-1 leading-tight">{label}</span>
      </button>
    );
  }

  const treadPct = parseInt(tyre.tread) || 0;
  const health = tyre.health || getHealth(treadPct);
  const h = HEALTH[health] || HEALTH.Good;

  return (
    <button
      onClick={() => onSlotClick(posId, tyre)}
      title={`${tyre.serial || tyre.id} — ${label}`}
      className={`w-[72px] min-h-[96px] rounded-xl border-2 flex flex-col items-start p-2 transition-all text-left
        ${isSelected
          ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200 ring-offset-1 scale-105 shadow-md'
          : 'border-slate-200 bg-white hover:border-indigo-300 hover:scale-[1.03] hover:shadow-sm'
        }`}
    >
      {/* Tyre ID */}
      <span className="text-[8px] font-black text-slate-700 truncate w-full leading-none mb-0.5">
        {tyre.serial || tyre.id}
      </span>
      {/* Brand */}
      <span className="text-[7px] text-slate-400 truncate w-full leading-none mb-1">
        {tyre.brand || tyre.make}
      </span>
      {/* Tread bar */}
      <div className="w-full mb-1">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-[6px] text-slate-400 font-semibold uppercase">Tread</span>
          <span className={`text-[7px] font-black ${h.text}`}>{treadPct}%</span>
        </div>
        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${h.bar}`} style={{ width: `${treadPct}%` }} />
        </div>
      </div>
      {/* KM */}
      {tyre.km && (
        <span className="text-[6px] text-slate-400 leading-none">{tyre.km} km</span>
      )}
      {/* Health dot */}
      <div className="mt-auto pt-1 w-full flex justify-end">
        <span className={`w-2 h-2 rounded-full ${h.dot}`} />
      </div>
    </button>
  );
}

// ── Axle row with shaft line ──────────────────────────────────────────────────
function AxleRow({ axle, mountedTyres, onSlotClick, selectedPos }) {
  const typeCls = AXLE_TYPE_STYLES[axle.type] || AXLE_TYPE_STYLES.rear;
  const getTyre = (posId) => mountedTyres.find(t => (t.position || t.pos) === posId);

  return (
    <div className="relative w-full">
      {/* Shaft line */}
      <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-slate-500 -translate-y-1/2 z-0 rounded-full" />

      {/* Tyre blocks */}
      <div className="relative z-10 flex items-center justify-between">
        {/* Left side */}
        <div className="flex gap-1.5">
          {axle.left.map(posId => (
            <TyreSlot
              key={posId}
              posId={posId}
              tyre={getTyre(posId)}
              onSlotClick={onSlotClick}
              selectedPos={selectedPos}
            />
          ))}
        </div>

        {/* Axle label — centre */}
        <div className="flex flex-col items-center gap-1 px-3 shrink-0">
          <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${typeCls}`}>
            {axle.type}
          </span>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
            {axle.label}
          </span>
        </div>

        {/* Right side */}
        <div className="flex gap-1.5">
          {axle.right.map(posId => (
            <TyreSlot
              key={posId}
              posId={posId}
              tyre={getTyre(posId)}
              onSlotClick={onSlotClick}
              selectedPos={selectedPos}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Selected tyre detail panel ────────────────────────────────────────────────
function TyreDetailPanel({ posId, tyre, onMount }) {
  if (!posId) return (
    <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400 py-10">
      <FiCheckCircle className="w-8 h-8 opacity-30" />
      <p className="text-xs font-semibold">Select a tyre slot to view details</p>
    </div>
  );

  if (!tyre) return (
    <div className="flex flex-col items-center justify-center h-full gap-3 py-10">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
        <FiPlus className="w-5 h-5 text-slate-400" />
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-slate-700">{posLabel(posId)}</p>
        <p className="text-xs text-slate-400 mt-0.5">No tyre mounted</p>
      </div>
      <button
        onClick={() => onMount(posId)}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
      >
        <FiPlus className="w-3.5 h-3.5" /> Mount Tyre
      </button>
    </div>
  );

  const treadPct = parseInt(tyre.tread) || 0;
  const health = tyre.health || getHealth(treadPct);
  const h = HEALTH[health] || HEALTH.Good;

  const rows = [
    ['Position',     posLabel(posId)],
    ['Serial / ID',  tyre.serial || tyre.id || '—'],
    ['Brand',        tyre.brand || tyre.make || '—'],
    ['Model',        tyre.model || '—'],
    ['Tread',        `${treadPct}%`],
    ['KM Run',       tyre.km || '—'],
    ['Mounted Date', tyre.mountedDate || tyre.fittedDate || '—'],
    ['Health',       health],
  ];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black text-slate-800 font-mono">{tyre.serial || tyre.id}</p>
          <p className="text-[10px] text-slate-500">{posLabel(posId)}</p>
        </div>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${h.badge}`}>
          <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${h.dot}`} />
          {health}
        </span>
      </div>

      {/* Tread bar */}
      <div>
        <div className="flex justify-between text-[9px] mb-1">
          <span className="text-slate-500 font-semibold uppercase tracking-wider">Tread Remaining</span>
          <span className={`font-black ${h.text}`}>{treadPct}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${h.bar}`} style={{ width: `${treadPct}%` }} />
        </div>
      </div>

      {/* Detail rows */}
      <div className="bg-slate-50 rounded-lg divide-y divide-slate-100">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between items-center px-3 py-1.5">
            <span className="text-[10px] text-slate-500 font-medium">{k}</span>
            <span className="text-[10px] text-slate-800 font-bold">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main exported component ───────────────────────────────────────────────────
/**
 * DynamicAxleLayout
 * @param {object}   vehicle        — vehicle record with wheel_configuration field
 * @param {array}    mountedTyres   — array of tyre objects with .position matching layout posIds
 * @param {boolean}  interactiveMode — if true, slots are clickable
 * @param {function} onMountTyre    — called with posId when user clicks empty slot
 */
export default function DynamicAxleLayout({
  vehicle,
  mountedTyres = [],
  interactiveMode = true,
  onMountTyre,
}) {
  const [selectedPos, setSelectedPos] = useState(null);
  const [selectedTyre, setSelectedTyre] = useState(null);

  const wheelConfig = vehicle?.wheel_configuration || vehicle?.wheelConfiguration;
  const layout = axleLayouts[wheelConfig];

  // Stats
  const totalSlots  = layout?.totalTyres ?? 0;
  const mounted     = mountedTyres.length;
  const empty       = totalSlots - mounted;
  const goodCount   = mountedTyres.filter(t => (t.health || getHealth(parseInt(t.tread) || 0)) === 'Good').length;
  const poorCount   = mountedTyres.filter(t => (t.health || getHealth(parseInt(t.tread) || 0)) === 'Poor').length;

  const handleSlotClick = (posId, tyre) => {
    if (!interactiveMode) return;
    if (selectedPos === posId) {
      setSelectedPos(null);
      setSelectedTyre(null);
    } else {
      setSelectedPos(posId);
      setSelectedTyre(tyre);
    }
  };

  const handleMount = (posId) => {
    onMountTyre?.(posId);
  };

  // No config saved yet
  if (!layout) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
        <FiAlertTriangle className="w-8 h-8 opacity-40" />
        <p className="text-sm font-semibold text-slate-600">No wheel configuration set</p>
        <p className="text-xs text-slate-400">
          Go to <span className="font-bold">Edit Vehicle → Tyre &amp; Axle Configuration</span> and select a wheel type.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6">

      {/* LEFT — Axle diagram */}
      <div className="flex flex-col gap-4">

        {/* Stats bar */}
        <div className="flex flex-wrap items-center gap-4 px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-xs">
          {[
            ['Config',   wheelConfig,          'text-slate-800'],
            ['Slots',    totalSlots,            'text-slate-800'],
            ['Mounted',  mounted,               'text-indigo-700'],
            ['Empty',    empty,                 'text-orange-600'],
            ['Good',     goodCount,             'text-green-700'],
            ['Critical', poorCount,             'text-red-600'],
          ].map(([label, val, cls]) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">{label}:</span>
              <span className={`font-bold ${cls}`}>{val}</span>
            </div>
          ))}
          {/* Layout type badge */}
          <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ${layout.color}`}>
            {layout.layoutType}
          </span>
        </div>

        {/* Diagram */}
        <div className="relative bg-slate-50 border border-slate-200 rounded-2xl px-8 py-6 overflow-x-auto">
          {/* Chassis spine */}
          <div className="absolute left-1/2 top-0 bottom-0 w-3 bg-slate-700 -translate-x-1/2 z-0 rounded-full shadow-inner" />

          <div className="relative z-10 flex flex-col gap-10 py-2 min-w-[360px]">
            {layout.axles.map((axle) => (
              <AxleRow
                key={axle.label}
                axle={axle}
                mountedTyres={mountedTyres}
                onSlotClick={handleSlotClick}
                selectedPos={selectedPos}
              />
            ))}
          </div>
        </div>

        <p className="text-[10px] text-slate-400 text-center">
          Click a tyre slot to view details · Click empty slot to mount
        </p>
      </div>

      {/* RIGHT — Detail panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
          {selectedPos ? 'Slot Details' : 'Tyre Details'}
        </p>
        <TyreDetailPanel
          posId={selectedPos}
          tyre={selectedTyre}
          onMount={handleMount}
        />
      </div>

    </div>
  );
}
