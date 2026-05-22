import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCcw, Gauge, Plus, FileText, ArrowLeftRight, PackageCheck, Archive, MinusCircle, CheckCircle, Wrench, Trash2, RotateCcw, ClipboardCheck, Clock } from 'lucide-react';
import MountTyreModal from './MountTyreModal';
import RemoveTyreModal from './RemoveTyreModal';
import ReplaceTyreModal from './ReplaceTyreModal';
import TyreDatasheetModal from './TyreDatasheetModal';
import { axleLayouts, posLabel, AXLE_TYPE_STYLES } from '../data/axleLayouts';
import TyreConfigCards from './TyreConfigCards';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const HEALTH = {
  Good: { border: 'border-green-400', bg: 'bg-green-50', badge: 'bg-green-500', glow: 'shadow-green-200', text: 'text-green-700', popupBorder: 'border-green-400', popupBg: 'from-green-50' },
  Medium: { border: 'border-orange-400', bg: 'bg-orange-50', badge: 'bg-orange-500', glow: 'shadow-orange-200', text: 'text-orange-700', popupBorder: 'border-orange-400', popupBg: 'from-orange-50' },
  Poor: { border: 'border-red-400', bg: 'bg-red-50', badge: 'bg-red-500', glow: 'shadow-red-200', text: 'text-red-700', popupBorder: 'border-red-400', popupBg: 'from-red-50' },
};
const healthColor = { Good: 'bg-green-500', Medium: 'bg-yellow-500', Poor: 'bg-red-500' };
const healthBorder = { Good: 'border-green-400', Medium: 'border-yellow-400', Poor: 'border-red-400' };

function TyreOpsPopup({ tyre, truckData, onClose, onRemove, onReplace, onViewDetails, onSendOldStock, onFromInventory }) {
  const h = HEALTH[tyre.health] || HEALTH.Good;
  const runKm = tyre.presentOdo - tyre.fittedOdo;
  const lifePct = Math.round((runKm / tyre.expectedLife) * 100);
  const treadPct = Math.max(0, 100 - lifePct);

  const details = [
    ['Tyre No', tyre.id],
    ['Brand / Model', `${tyre.make} ${tyre.model}`],
    ['Truck No', truckData.id],
    ['Axle Position', tyre.position],
    ['Mounted Date', tyre.fittedDate],
    ['Fitted Odo', `${tyre.fittedOdo.toLocaleString()} km`],
    ['Current Odo', `${tyre.presentOdo.toLocaleString()} km`],
    ['Running KM', `${runKm.toLocaleString()} km`],
    ['Tread Left', `${treadPct}%`],
    ['Health Status', tyre.health],
    ['Material', tyre.material],
    ['Expected Life', `${tyre.expectedLife.toLocaleString()} km`],
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 6 }}
      transition={{ duration: 0.15 }}
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-xl"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl border-2 ${h.popupBorder} w-[340px] overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        {/* Popup Header */}
        <div className={`bg-gradient-to-r ${h.popupBg} to-white px-4 py-3 border-b ${h.popupBorder}`}>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-800">{tyre.id}</span>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full text-white ${h.badge}`}>
                  {tyre.health === 'Poor' ? 'CRITICAL' : tyre.health.toUpperCase()}
                </span>
              </div>
              <div className="text-[10px] text-gray-500 font-semibold mt-0.5">
                {tyre.position} · {truckData.id}
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10 transition-colors">
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>

          {/* 3 Summary Cards */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              ['Running KM', `${(runKm / 1000).toFixed(1)}k`, h.text],
              ['Tread Left', `${treadPct}%`, treadPct < 30 ? 'text-red-600' : treadPct < 60 ? 'text-orange-600' : 'text-green-600'],
              ['Health', tyre.health, h.text],
            ].map(([label, val, cls]) => (
              <div key={label} className="bg-white/80 rounded-lg p-2 text-center shadow-sm border border-white">
                <div className={`text-sm font-black ${cls}`}>{val}</div>
                <div className="text-[8px] text-gray-400 font-semibold uppercase">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail Grid */}
        <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-1">
          {details.map(([k, v]) => (
            <div key={k} className="flex flex-col border-b border-gray-50 pb-1">
              <span className="text-[8px] text-gray-400 font-semibold uppercase">{k}</span>
              <span className="text-[10px] text-slate-700 font-bold truncate">{v}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="px-4 pb-4 pt-1 flex flex-col gap-1.5">
          <div className="grid grid-cols-3 gap-1.5">
            <ActionBtn icon={<FileText className="w-3 h-3" />} label="Full Details" cls="bg-slate-800 hover:bg-slate-700 text-white" onClick={() => { onClose(); onViewDetails(tyre); }} />
            <ActionBtn icon={<MinusCircle className="w-3 h-3" />} label="Remove" cls="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200" onClick={() => { onClose(); onRemove(tyre); }} />
            <ActionBtn icon={<ArrowLeftRight className="w-3 h-3" />} label="Replace" cls="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200" onClick={() => { onClose(); onReplace(tyre); }} />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <ActionBtn icon={<Archive className="w-3 h-3" />} label="Send to Old Stock" cls="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200" onClick={() => { onClose(); onSendOldStock(tyre); }} />
            <ActionBtn icon={<PackageCheck className="w-3 h-3" />} label="From Inventory" cls="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200" onClick={() => { onClose(); onFromInventory(tyre.position); }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ActionBtn({ icon, label, cls, onClick }) {
  return (
    <button onClick={onClick} className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[10px] font-bold transition-all hover:scale-[1.02] active:scale-95 ${cls}`}>
      {icon}{label}
    </button>
  );
}

// ── TyreBlock — defined outside component so it never remounts on state change ──
function TyreBlock({ posId, tyre, onMount, onPopup, activePopupId }) {
  const label = posLabel(posId);

  if (!tyre) {
    return (
      <div
        onClick={() => onMount(posId)}
        className="w-[86px] rounded-2xl border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center gap-1 py-3 cursor-pointer hover:border-blue-400 hover:bg-blue-50 hover:shadow-md transition-all group"
        style={{ minHeight: '104px' }}
      >
        <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 group-hover:border-blue-400 flex items-center justify-center transition-colors">
          <Plus className="w-3 h-3 text-gray-300 group-hover:text-blue-400" />
        </div>
        <span className="text-[8px] font-bold text-gray-400 group-hover:text-blue-500 uppercase mt-1">Empty</span>
        <span className="text-[7px] text-gray-300 group-hover:text-blue-400 font-semibold text-center px-1 leading-tight">{label}</span>
        <span className="text-[8px] font-black text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">+ Mount</span>
      </div>
    );
  }

  const h = HEALTH[tyre.health] || HEALTH.Good;
  const runKm = tyre.presentOdo - tyre.fittedOdo;
  const lifePct = Math.round((runKm / tyre.expectedLife) * 100);
  const treadPct = Math.max(0, 100 - lifePct);
  const isPoor = tyre.health === 'Poor';
  const isActive = activePopupId === tyre.id;

  return (
    <div className="relative group">
      <motion.div
        onClick={() => onPopup(isActive ? null : tyre)}
        animate={isPoor ? { boxShadow: ['0 0 0px #ef444430', '0 0 14px #ef444460', '0 0 0px #ef444430'] } : {}}
        transition={isPoor ? { duration: 1.4, repeat: Infinity } : {}}
        className={`w-[86px] rounded-2xl border-2 ${h.border} ${h.bg} flex flex-col items-start p-2.5 cursor-pointer
          transition-all duration-150 hover:scale-105 hover:shadow-lg hover:z-10
          ${isActive ? 'ring-2 ring-blue-500 ring-offset-2 scale-105 shadow-lg shadow-blue-200' : 'shadow-sm'}`}
        style={{ minHeight: '104px' }}
      >
        <div className="flex items-center justify-between w-full mb-0.5">
          <span className="text-[8px] font-black text-slate-700 truncate leading-none">{tyre.id}</span>
          <span className={`text-[6px] font-black px-1 py-0.5 rounded-full text-white leading-none ${h.badge}`}>
            {tyre.health === 'Poor' ? 'CRIT' : tyre.health.toUpperCase()}
          </span>
        </div>
        <div className="text-[8px] font-bold text-slate-500 leading-none mb-1 truncate w-full">{tyre.make}</div>
        <div className={`text-[10px] font-black leading-none ${h.text}`}>{(runKm / 1000).toFixed(1)}k km</div>
        <div className="w-full mt-1 mb-0.5">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-[6px] text-gray-400 font-semibold">TREAD</span>
            <span className={`text-[7px] font-black ${h.text}`}>{treadPct}%</span>
          </div>
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${h.badge}`} style={{ width: `${treadPct}%` }} />
          </div>
        </div>
        <div className="text-[6px] text-gray-400 leading-none mt-auto pt-0.5 border-t border-gray-200/60 w-full">
          {label} · {tyre.fittedDate}
        </div>
      </motion.div>

      {/* Hover Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 pointer-events-none
        opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
        <div className="bg-slate-900 text-white rounded-lg px-2.5 py-1.5 shadow-xl text-center">
          <div className="text-[10px] font-black">{tyre.id}</div>
          <div className={`text-[9px] font-bold ${h.text.replace('700', '300')}`}>
            {tyre.health.toUpperCase()} · {treadPct}%
          </div>
          <div className="text-[9px] text-gray-300">{runKm.toLocaleString()} km</div>
        </div>
        <div className="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mt-1" />
      </div>
    </div>
  );
}

// ── AxleRow — shaft line + type badge ────────────────────────────────────────
function AxleRow({ axle, children }) {
  const typeCls = AXLE_TYPE_STYLES[axle.type] || AXLE_TYPE_STYLES.rear;
  return (
    <div className="relative w-full">
      {/* Axle shaft — vertically centred behind the tyre blocks */}
      <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-slate-600 -translate-y-1/2 z-0 rounded-full shadow-sm" />
      <div className="flex justify-between items-center w-full relative z-10">{children}</div>
      <div className="flex items-center justify-center gap-1.5 mt-2">
        <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${typeCls}`}>
          {axle.type}
        </span>
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{axle.label}</span>
      </div>
    </div>
  );
}

export default function TruckTyreLayoutModal({ isOpen, onClose, truckData }) {
  if (!isOpen || !truckData) return null;

  const [activeTyres, setActiveTyres] = useState([]);
  const [activityLog] = useState([]); // Not yet implemented – backend pending
  const [activePopup, setActivePopup] = useState(null);
  const [selectedTyre, setSelectedTyre] = useState(null);
  const [mountSlot, setMountSlot] = useState(null);
  const [removingTyre, setRemovingTyre] = useState(null);
  const [replaceTyre, setReplaceTyre] = useState(null);
  const [viewingTyre, setViewingTyre] = useState(null);
  const [removeToast, setRemoveToast] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // 🔁 force re-fetch

  // Fetch mounted tyres from database (now a reusable function)
  const fetchTyres = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/tyres`
      );
      const data = await response.json();
      if (data.success) {
        console.log('ALL TYRES FROM DB:', data.data);
        const mountedTyres = data.data
          .filter(
            tyre =>
              String(tyre.status || '')
                .trim()
                .toLowerCase() === 'mounted'
          )

          .map(tyre => ({
            id: tyre.tyre_number,
            make: tyre.brand,
            model: tyre.model,
            truckNo: String(
              tyre.vehicle_number ||
              tyre.vehicle_no ||
              ''
            ).trim(),
            position:
              tyre.tyre_position ||
              '',
            fittedDate: tyre.date_of_issue,
            fittedOdo: Number(tyre.fitted_odometer || 0),
            presentOdo: Number(tyre.fitted_odometer || 0) + Number(tyre.running_km || 0),
            expectedLife: Number(tyre.expected_life_km || 0),
            health: tyre.tyre_health || 'Good',
            tyreSize: tyre.tyre_size,
            material: tyre.material_type,
            runningKm: Number(tyre.running_km || 0)
          }));
        setActiveTyres(mountedTyres);

        // Fetch tyre activity timeline for this vehicle
        try {
          const activityResponse = await fetch(`${API_URL}/api/tyres/activity/${truckData.id}`);
          const activityData = await activityResponse.json();
          if (activityData.success) {
            const formatted = activityData.data.map(item => ({
              id: item.id,
              tyreNo: item.tyre_number,
              type: item.activity_type,
              position: item.tyre_position,
              timestamp: item.created_at
            }));
            // setRecentActivity will be available in component state
            if (typeof setRecentActivity === 'function') setRecentActivity(formatted);
          }
        } catch (err) {
          console.error('Error fetching tyre activities:', err);
        }
      }
    } catch (error) {
      console.error('Error fetching tyres:', error);
    }
  };

  // Load tyres on mount and whenever refreshKey changes
  useEffect(() => {
    fetchTyres();
  }, [refreshKey]);

  // Normalized filter for truck tyres
  const truckTyres = activeTyres.filter((tyre) => {
    const tyreTruck = String(
      tyre.truckNo ||
      tyre.vehicle_number ||
      ''
    )
      .trim()
      .toLowerCase();

    const targetTruck = String(
      truckData.vehicle_no ||
      truckData.vehicleNumber ||
      truckData.id ||
      ''
    )
      .trim()
      .toLowerCase();

    return tyreTruck === targetTruck;
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const layout =
    axleLayouts[
    truckData.wheelConfiguration ||
    truckData.wheel_configuration
    ] ?? axleLayouts['10 Wheeler'];

  const handleViewDetails = (tyre) => {
    const runKm = tyre.presentOdo - tyre.fittedOdo;
    const lifePct = Math.round((runKm / tyre.expectedLife) * 100);
    setViewingTyre({
      ...tyre,
      runningKm: runKm,
      health: lifePct > 80 ? 'Critical' : lifePct > 50 ? 'Medium' : 'Good',
    });
  };

  // Placeholder for send to old stock – will be replaced with real API
  const handleSendOldStock = (tyre) => {
    alert('Send to Old Stock API pending');
    setRemoveToast(`${tyre.id} moved to Old Stock (demo)`);
    setTimeout(() => setRemoveToast(null), 3500);
  };

  const handleFromInventory = (posId) => {
    setMountSlot(posId);
  };

  // Placeholder for remove confirmation
  const handleRemoveConfirm = (tyreId, removalData) => {
    alert('Remove tyre backend pending');
    setRemovingTyre(null);
    setRemoveToast(`${tyreId} removed → ${removalData.storeLocation} (demo)`);
    setTimeout(() => setRemoveToast(null), 3500);
  };

  const handleReplaceClose = async () => {
    setReplaceTyre(null);
    setActivePopup(null);
    setSelectedTyre(null);
    await fetchTyres();
    setRefreshKey(prev => prev + 1);
  };

  const formatTimestamp = (iso) => new Date(iso).toLocaleString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

 const getTyreByPosition = (posId) => {

  const positionMap = {

    frontleft: 'FL',
    frontright: 'FR',

    frontleft2: 'FL2',
    frontright2: 'FR2',

    axle1leftouter: 'L1_OUTER',
    axle1leftinner: 'L1_INNER',
    axle1rightinner: 'R1_INNER',
    axle1rightouter: 'R1_OUTER',

    axle2leftouter: 'L2_OUTER',
    axle2leftinner: 'L2_INNER',
    axle2rightinner: 'R2_INNER',
    axle2rightouter: 'R2_OUTER',
  };

  const normalizedLayoutPos = String(posId || '')
    .trim()
    .toUpperCase();

  return truckTyres.find((t) => {

    const tyrePos = String(t.position || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '');

    const normalizedTyrePos =
      positionMap[tyrePos] || tyrePos.toUpperCase();

    return normalizedTyrePos === normalizedLayoutPos;
  });
};


  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{ width: '96vw', maxWidth: '1400px', maxHeight: '92vh' }}
        >
          {/* Header */}
          <div className="flex justify-between items-start px-5 py-3 bg-[#0f172a] text-white shrink-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-base font-black tracking-tight">Vehicle Axle Layout</h3>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ring-1 ${layout.color ?? 'text-slate-600 bg-slate-50 ring-slate-200'}`}>
                  {layout.label}
                </span>
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">
                  {truckData.id}
                </span>
                <span className="text-[10px] text-gray-400 font-semibold">{truckData.model}</span>
              </div>
              <TyreConfigCards truckData={{
                ...truckData, totalTyres:
                  truckData.totalTyres ||
                  truckData.total_tyres ||
                  layout.totalTyres
              }} size="sm" />
            </div>
            <button onClick={onClose} className="ml-4 shrink-0 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 3-Column Body */}
          <div className="flex-1 overflow-hidden grid grid-cols-[minmax(420px,1.8fr)_1.1fr_260px] gap-0 bg-slate-50 min-h-0">

            {/* CENTER — Dynamic Axle Layout */}
            <div className="p-5 flex flex-col items-center justify-start border-r border-slate-200 overflow-y-auto relative bg-white" style={{ scrollbarWidth: 'thin' }}>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-4">Axle Diagram · {truckData.id}</p>
              <div className="relative bg-slate-50 rounded-2xl border border-slate-200 px-6 py-5 w-full max-w-[560px]">
                {/* Chassis spine — spans full height of the axle rows container */}
                <div className="absolute left-1/2 top-0 bottom-0 w-2.5 bg-slate-700 -translate-x-1/2 z-0 rounded-full shadow-inner" />
                <div className="relative z-10 flex flex-col gap-8 py-2">
                  {layout.axles.map((axle) => (
                    <AxleRow key={axle.label} axle={axle}>
                      {/* Left side — outer tyre first */}
                      <div className="flex gap-1.5">
                        {axle.left.map(posId => (
                          <TyreBlock
                            key={posId}
                            posId={posId}
                            tyre={getTyreByPosition(posId)}
                            onMount={setMountSlot}
                            onPopup={setActivePopup}
                            activePopupId={activePopup?.id}
                          />
                        ))}
                      </div>
                      {/* Right side — inner tyre first */}
                      <div className="flex gap-1.5">
                        {axle.right.map(posId => (
                          <TyreBlock
                            key={posId}
                            posId={posId}
                            tyre={getTyreByPosition(posId)}
                            onMount={setMountSlot}
                            onPopup={setActivePopup}
                            activePopupId={activePopup?.id}
                          />
                        ))}
                      </div>
                    </AxleRow>
                  ))}
                </div>

                <AnimatePresence>
                  {activePopup && (
                    <TyreOpsPopup
                      tyre={activePopup}
                      truckData={truckData}
                      onClose={() => setActivePopup(null)}
                      onRemove={(t) => setRemovingTyre(t)}
                      onReplace={(t) => setReplaceTyre(t)}
                      onViewDetails={handleViewDetails}
                      onSendOldStock={handleSendOldStock}
                      onFromInventory={handleFromInventory}
                    />
                  )}
                </AnimatePresence>
              </div>
              <p className="text-[8px] text-gray-400 mt-3">Click tyre → operations &nbsp;·&nbsp; Click empty slot → mount</p>
            </div>

            {/* LEFT — Tyre Details */}
            <div className="p-3 overflow-y-auto border-r border-slate-200 bg-white" style={{ scrollbarWidth: 'thin' }}>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tyre Details</p>

              {selectedTyre && (
                <div className={`mb-2 p-2.5 rounded-xl border-2 ${healthBorder[selectedTyre.health]} bg-white shadow-sm`}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-800 font-mono">{selectedTyre.id}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full text-white ${healthColor[selectedTyre.health]}`}>{selectedTyre.health}</span>
                    </div>
                    <span className="text-[9px] text-gray-400 font-bold uppercase">{selectedTyre.position}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[9px]">
                    {[
                      ['Make', selectedTyre.make],
                      ['Model', selectedTyre.model],
                      ['Fitted', selectedTyre.fittedDate],
                      ['Vendor', selectedTyre.vendor || '—'],
                      ['Fitted Odo', `${selectedTyre.fittedOdo.toLocaleString()} km`],
                      ['Present Odo', `${selectedTyre.presentOdo.toLocaleString()} km`],
                      ['Run KM', `${(selectedTyre.presentOdo - selectedTyre.fittedOdo).toLocaleString()} km`],
                      ['Life Used', `${Math.round(((selectedTyre.presentOdo - selectedTyre.fittedOdo) / selectedTyre.expectedLife) * 100)}%`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b border-gray-50 py-0.5">
                        <span className="text-gray-400 font-semibold">{k}</span>
                        <span className="text-slate-700 font-bold truncate ml-1">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-[9px]">
                  <thead>
                    <tr className="bg-slate-800 text-white">
                      {['ID', 'Pos', 'Make', 'KM', 'Life', 'H'].map(h => (
                        <th key={h} className="px-1.5 py-1.5 text-left font-bold uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {truckTyres.map((t, i) => {
                      const runKm = t.presentOdo - t.fittedOdo;
                      const lifePct = Math.round((runKm / t.expectedLife) * 100);
                      const isActive = selectedTyre?.id === t.id;
                      return (
                        <tr key={t.id} onClick={() => setSelectedTyre(isActive ? null : t)}
                          className={`cursor-pointer border-b border-gray-50 transition-colors ${isActive ? 'bg-blue-50 ring-1 ring-inset ring-blue-200' : i % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-100'}`}>
                          <td className="px-1.5 py-1 font-bold text-slate-700 font-mono">{t.id}</td>
                          <td className="px-1.5 py-1 text-gray-500">{t.position}</td>
                          <td className="px-1.5 py-1 text-gray-600">{t.make}</td>
                          <td className="px-1.5 py-1 font-semibold text-blue-600">{(runKm / 1000).toFixed(1)}k</td>
                          <td className="px-1.5 py-1">
                            <div className="flex items-center gap-1">
                              <div className="w-8 h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${lifePct > 80 ? 'bg-red-500' : lifePct > 50 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(lifePct, 100)}%` }} />
                              </div>
                              <span className="text-gray-500">{lifePct}%</span>
                            </div>
                          </td>
                          <td className="px-1.5 py-1">
                            <span className={`px-1 py-0.5 rounded-full text-white text-[7px] font-bold ${healthColor[t.health]}`}>{t.health[0]}</span>
                          </td>
                        </tr>
                      );
                    })}
                    {truckTyres.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-gray-400 text-[9px]">No tyres assigned</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT — Legend, Summary, Actions, Timeline */}
            <div className="p-3 flex flex-col gap-2 overflow-y-auto bg-white" style={{ scrollbarWidth: 'thin' }}>
              {/* Health Legend */}
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Health Legend</p>
                <div className="bg-slate-50 rounded-xl border border-gray-100 p-2.5 flex flex-col gap-1.5">
                  {[['Good', 'bg-green-500', '> 70% tread'], ['Medium', 'bg-orange-500', '30–70%'], ['Poor', 'bg-red-500', '< 30% critical']].map(([label, color, desc]) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded shrink-0 ${color}`} />
                      <span className="text-[10px] font-bold text-slate-700">{label}</span>
                      <span className="text-[9px] text-gray-400 ml-auto">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fleet Summary */}
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Fleet Summary</p>
                <div className="bg-slate-50 rounded-xl border border-gray-100 p-2 grid grid-cols-2 gap-1.5">
                  {[
                    ['Fitted', truckTyres.length, 'text-slate-800'],
                    ['Empty', truckData.totalTyres - truckTyres.length, 'text-orange-600'],
                    ['Good', truckTyres.filter(t => t.health === 'Good').length, 'text-emerald-600'],
                    ['Attn', truckTyres.filter(t => t.health !== 'Good').length, 'text-red-600'],
                  ].map(([label, val, cls]) => (
                    <div key={label} className="text-center bg-white rounded-lg py-1.5">
                      <div className={`text-base font-black ${cls}`}>{val}</div>
                      <div className="text-[8px] text-gray-400 font-semibold uppercase">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

             

              {/* Activity Timeline */}
              <div className="flex-1 min-h-0">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Activity Timeline</p>
                <div className="bg-slate-50 rounded-xl border border-gray-100 overflow-hidden flex flex-col">
                  {recentActivity.length === 0 ? (
                    <div className="flex items-center justify-center gap-2 py-5 text-slate-400">
                      <Clock className="w-4 h-4 opacity-40" />
                      <p className="text-[10px] font-semibold">No activities yet</p>
                    </div>
                  ) : (
                    <div className="relative pl-7 pr-2.5 py-2.5 space-y-1.5 max-h-[260px] overflow-y-auto"
                      style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
                      <div className="absolute left-[14px] top-2.5 bottom-2.5 w-px bg-slate-200" />
                      {recentActivity.map((activity) => {
                        const EVENT_CONFIG = {
                          mounted: { dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700', icon: <Wrench className="w-2 h-2" />, label: 'Mounted' },
                          removed: { dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700', icon: <MinusCircle className="w-2 h-2" />, label: 'Removed' },
                          replaced: { dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700', icon: <ArrowLeftRight className="w-2 h-2" />, label: 'Replaced' },
                          remounted: { dot: 'bg-slate-500', badge: 'bg-slate-100 text-slate-700', icon: <RotateCcw className="w-2 h-2" />, label: 'Re-Mount' },
                          retreading: { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700', icon: <RefreshCcw className="w-2 h-2" />, label: 'Retread' },
                          scrap: { dot: 'bg-red-500', badge: 'bg-red-100 text-red-700', icon: <Trash2 className="w-2 h-2" />, label: 'Scrap' },
                          inspection: { dot: 'bg-sky-500', badge: 'bg-sky-100 text-sky-700', icon: <ClipboardCheck className="w-2 h-2" />, label: 'Inspect' },
                        };
                        const cfg = EVENT_CONFIG[activity.type] || { dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600', icon: null, label: activity.type };
                        return (
                          <div key={activity.id} className="relative">
                            <div className={`absolute -left-[18px] top-2.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm ${cfg.dot}`} />
                            <div className="rounded-lg border border-slate-100 bg-white px-2.5 py-2 hover:border-slate-200 hover:shadow-sm transition-all duration-150">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <span className="text-[10px] font-black text-slate-800 font-mono">{activity.tyreNo}</span>
                                <span className={`flex items-center gap-0.5 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full ${cfg.badge}`}>
                                  {cfg.icon}{cfg.label}
                                </span>
                              </div>
                              <div className="text-[9px] text-slate-500">{activity.position || '—'}</div>
                              <div className="text-[8px] text-gray-400">{formatTimestamp(activity.timestamp)}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="border-t border-slate-100 px-2.5 py-1.5">
                    <button className="w-full text-[9px] font-bold uppercase tracking-wide text-slate-400 hover:text-slate-700 transition-colors">
                      View Full History
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </motion.div>
      </div>
      <TyreDatasheetModal isOpen={!!viewingTyre} onClose={() => setViewingTyre(null)} tyreData={viewingTyre} />
      <MountTyreModal
        isOpen={!!mountSlot}
        onClose={async () => {
          setMountSlot(null);
          await fetchTyres();
          setRefreshKey(prev => prev + 1);
        }}
        truckData={truckData}
        positionId={mountSlot}
        onSuccess={async () => {
          await fetchTyres();
          setRefreshKey(prev => prev + 1);
        }}
      />
      <AnimatePresence>
        {removingTyre && (
          <RemoveTyreModal
            tyre={removingTyre}
            onConfirm={handleRemoveConfirm}
            onClose={() => setRemovingTyre(null)}
          />
        )}
      </AnimatePresence>
      <ReplaceTyreModal
        isOpen={!!replaceTyre}
        onClose={handleReplaceClose}
        truckData={truckData}
        positionId={replaceTyre?.position}
        currentTyre={replaceTyre}
        onSuccess={() => {
          fetchTyres();
          setRefreshKey(prev => prev + 1);
        }}
      />

      {/* Remove toast */}
      <AnimatePresence>
        {removeToast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="fixed top-5 right-5 z-[70] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-bold text-white bg-orange-600"
          >
            <CheckCircle className="w-4 h-4" />{removeToast}
            <button onClick={() => setRemoveToast(null)}><X className="w-3.5 h-3.5 opacity-70" /></button>
          </motion.div>
        )}
      </AnimatePresence>

    </AnimatePresence>
  );
}