import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, CheckCircle, AlertCircle, Wrench, Package, RefreshCw, ChevronDown } from 'lucide-react';
import { useTyreLifecycle } from '../index';
import { posLabel as axlePosLabel } from '../data/axleLayouts';

const today = () => new Date().toISOString().split('T')[0];

const STATUS_CONFIG = {
  'In Stock':  { bg: 'bg-blue-50',   text: 'text-blue-700',   ring: 'ring-blue-200',   dot: 'bg-blue-500'   },
  'REUSABLE':  { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', dot: 'bg-emerald-500' },
};

function Err({ msg }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-[11px] text-red-500 font-semibold flex items-center gap-1">
      <AlertCircle className="w-3 h-3 shrink-0" />{msg}
    </p>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-[10.5px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = (err) =>
  `w-full px-3.5 h-[38px] bg-white border rounded-xl text-sm font-medium text-slate-800
   focus:outline-none focus:ring-2 transition-all duration-200
   ${err ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-100'}`;

export default function MountTyreModal({ isOpen, onClose, truckData, positionId }) {
  const { activeTyres, stockTyres, oldTyres, mountTyreToTruck } = useTyreLifecycle();

  const [search, setSearch]           = useState('');
  const [sizeFilter, setSizeFilter]   = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTyre, setSelectedTyre] = useState(null);
  const [mountedDate, setMountedDate]   = useState(today());
  const [fittedOdo, setFittedOdo]       = useState('');
  const [notes, setNotes]               = useState('');
  const [errors, setErrors]             = useState({});
  const [done, setDone]                 = useState(false);

  // Reset all form state whenever the modal opens for a new position
  const prevPosRef = useRef(null);
  if (isOpen && positionId !== prevPosRef.current) {
    prevPosRef.current = positionId;
    // Synchronously reset so first render is clean
    if (search || sizeFilter || brandFilter || statusFilter || selectedTyre || done) {
      setSearch(''); setSizeFilter(''); setBrandFilter(''); setStatusFilter('');
      setSelectedTyre(null); setErrors({}); setDone(false);
    }
    const odoStr = String(truckData?.currentOdo ?? '');
    if (fittedOdo !== odoStr) setFittedOdo(odoStr);
    if (mountedDate !== today()) setMountedDate(today());
  }

  // Build combined tyre pool from live context state
  const allTyres = useMemo(() => {
    const mountedIds = new Set(activeTyres.map(t => t.id));
    const stockPool = stockTyres
      .filter(t => !mountedIds.has(t.id))
      .map(t => ({ ...t, _source: 'stock', _status: 'In Stock', runningKm: 0, remainingTread: 100 }));
    const oldPool = oldTyres
      .filter(t => t.status === 'REUSABLE' && !mountedIds.has(t.tyreNo))
      .map(t => ({
        id: t.tyreNo, make: t.make, model: t.model, tyreSize: t.tyreSize,
        material: t.material, vendor: t.vehicleNo,
        runningKm: t.runningKm, remainingTread: t.remainingTread,
        _source: 'old', _status: 'REUSABLE',
      }));
    return [...stockPool, ...oldPool];
  }, [activeTyres, stockTyres, oldTyres]);

  const uniqueSizes  = useMemo(() => [...new Set(allTyres.map(t => t.tyreSize).filter(Boolean))], [allTyres]);
  const uniqueBrands = useMemo(() => [...new Set(allTyres.map(t => t.make).filter(Boolean))], [allTyres]);

  const requiredSize = truckData?.tyreSize || null;

  const filtered = useMemo(() => allTyres.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !search || [t.id, t.make, t.model, t.tyreSize].some(v => v?.toLowerCase().includes(q));
    const matchSize   = !sizeFilter   || t.tyreSize === sizeFilter;
    const matchBrand  = !brandFilter  || t.make === brandFilter;
    const matchStatus = !statusFilter || t._status === statusFilter;
    return matchSearch && matchSize && matchBrand && matchStatus;
  }), [allTyres, search, sizeFilter, brandFilter, statusFilter]);

  const posLabel = axlePosLabel(positionId);

  const validate = () => {
    const e = {};
    if (!selectedTyre)  e.tyre        = 'Select a tyre to mount';
    if (!mountedDate)   e.mountedDate = 'Select mounted date';
    else if (mountedDate > today()) e.mountedDate = 'Cannot be a future date';
    if (!fittedOdo)     e.fittedOdo   = 'Enter fitted odometer';
    else if (parseInt(fittedOdo) < 0) e.fittedOdo = 'Cannot be negative';
    return e;
  };

  const handleConfirm = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    mountTyreToTruck(selectedTyre._source, selectedTyre.id, {
      make:         selectedTyre.make,
      model:        selectedTyre.model,
      material:     selectedTyre.material || '',
      expectedLife: 100000,
      truckId:      truckData.id,
      placement:    positionId,
      fittedDate:   mountedDate,
      fittedOdo:    parseInt(fittedOdo),
    });
    setDone(true);
  };

  // Reset state then close — parent just calls setMountSlot(null)
  const handleClose = () => {
    prevPosRef.current = null;
    setSearch(''); setSizeFilter(''); setBrandFilter(''); setStatusFilter('');
    setSelectedTyre(null); setMountedDate(today());
    setFittedOdo(String(truckData?.currentOdo ?? ''));
    setNotes(''); setErrors({}); setDone(false);
    onClose();
  };

  const selectTyre = (t) => {
    if (requiredSize && t.tyreSize !== requiredSize) return;
    setSelectedTyre(prev => prev?.id === t.id ? null : t);
    setErrors(p => ({ ...p, tyre: '' }));
  };

  if (!isOpen || !truckData) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm"
        onClick={e => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ width: '92vw', maxWidth: '860px', maxHeight: '92vh', boxShadow: '0 32px 80px rgba(0,0,0,0.25)' }}
        >
          {/* ── Header ── */}
          <div className="shrink-0 px-5 py-4 bg-gradient-to-r from-[#0f172a] to-[#1e293b] flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-400" />
                <h3 className="text-[15px] font-black text-white tracking-tight">Mount Tyre To Vehicle</h3>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Assign a tyre to the selected axle position.</p>
            </div>
            <button onClick={handleClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:rotate-90">
              <X className="w-4 h-4" />
            </button>
          </div>

          {done ? (
            /* ── Success State ── */
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <p className="text-base font-black text-slate-800">Tyre Mounted Successfully</p>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedTyre?.id} → {truckData.id} · {posLabel}
                </p>
              </div>
              <div className="text-[11px] text-slate-500 bg-slate-50 rounded-xl px-4 py-2 border border-slate-100">
                Tyre Mounted · Mounted on {truckData.id} · Position: {posLabel}
              </div>
              <button onClick={handleClose}
                className="h-10 px-8 text-sm font-bold text-white bg-slate-800 rounded-xl hover:bg-slate-700 transition-all">
                Close
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>

                {/* ── Top Summary ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    ['Truck', truckData.id],
                    ['Position', posLabel],
                    ['Required Size', truckData.tyreSize || 'Any'],
                    ['Status', 'Empty Slot'],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{k}</div>
                      <div className="text-xs font-black text-slate-800 mt-0.5 truncate">{v}</div>
                    </div>
                  ))}
                </div>

                {/* ── Filters ── */}
                <div className="flex flex-wrap gap-2 items-end">
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Search</label>
                    <div className="relative">
                      <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input type="text" placeholder="Tyre No, Brand..." value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-7 pr-3 h-[34px] bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                    </div>
                  </div>
                  {[
                    ['Size', sizeFilter, setSizeFilter, uniqueSizes, 'All Sizes'],
                    ['Brand', brandFilter, setBrandFilter, uniqueBrands, 'All Brands'],
                    ['Status', statusFilter, setStatusFilter, ['In Stock', 'REUSABLE'], 'All Status'],
                  ].map(([label, val, setter, opts, placeholder]) => (
                    <div key={label} className="min-w-[110px]">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</label>
                      <div className="relative">
                        <select value={val} onChange={e => setter(e.target.value)}
                          className="w-full pl-2.5 pr-7 h-[34px] bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 appearance-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer">
                          <option value="">{placeholder}</option>
                          {opts.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                  ))}
                  {(search || sizeFilter || brandFilter || statusFilter) && (
                    <button onClick={() => { setSearch(''); setSizeFilter(''); setBrandFilter(''); setStatusFilter(''); }}
                      className="h-[34px] px-3 text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all self-end">
                      Clear
                    </button>
                  )}
                </div>

                {/* ── Tyre Selection Cards ── */}
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Available Tyres <span className="text-slate-300">({filtered.length})</span>
                  </p>
                  {errors.tyre && <Err msg={errors.tyre} />}

                  {filtered.length === 0 ? (
                    <div className="flex flex-col items-center py-10 gap-2 text-slate-400">
                      <Package className="w-8 h-8 opacity-30" />
                      <p className="text-xs font-semibold">No available tyres found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1"
                      style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
                      {filtered.map(t => {
                        const isSelected = selectedTyre?.id === t.id;
                        const incompatible = requiredSize && t.tyreSize !== requiredSize;
                        const cfg = STATUS_CONFIG[t._status] || STATUS_CONFIG['In Stock'];
                        return (
                          <motion.div
                            key={t.id}
                            whileHover={!incompatible ? { scale: 1.01 } : {}}
                            onClick={() => !incompatible && selectTyre(t)}
                            className={`relative rounded-xl border-2 p-3 transition-all duration-150 cursor-pointer
                              ${incompatible ? 'opacity-40 cursor-not-allowed border-slate-100 bg-slate-50' :
                                isSelected ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100' :
                                'border-slate-100 bg-white hover:border-blue-300 hover:shadow-sm'}`}
                          >
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                <CheckCircle className="w-3 h-3 text-white" />
                              </div>
                            )}
                            {incompatible && (
                              <div className="absolute top-2 right-2 text-[8px] font-bold text-red-400 bg-red-50 px-1.5 py-0.5 rounded-full ring-1 ring-red-200">
                                Size Mismatch
                              </div>
                            )}
                            <div className="flex items-start gap-2.5">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${t._source === 'old' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                                {t._source === 'old'
                                  ? <RefreshCw className="w-4 h-4 text-amber-600" />
                                  : <Package className="w-4 h-4 text-blue-600" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-black text-slate-800 font-mono">{t.id}</span>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ring-1 ${cfg.bg} ${cfg.text} ${cfg.ring}`}>
                                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${cfg.dot}`} />
                                    {t._status === 'REUSABLE' ? 'Reusable' : 'In Stock'}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-0.5">{t.make} {t.model}</p>
                                <div className="grid grid-cols-3 gap-x-2 mt-1.5">
                                  {[
                                    ['Size', t.tyreSize || '—'],
                                    ['Run KM', t.runningKm ? `${(t.runningKm / 1000).toFixed(1)}k` : '0'],
                                    ['Tread', `${t.remainingTread ?? 100}%`],
                                  ].map(([k, v]) => (
                                    <div key={k}>
                                      <div className="text-[8px] text-slate-400 font-semibold uppercase">{k}</div>
                                      <div className="text-[10px] font-bold text-slate-700">{v}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ── Form Fields ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                  <Field label="Mounted Date" required>
                    <input type="date" value={mountedDate} max={today()}
                      onChange={e => { setMountedDate(e.target.value); setErrors(p => ({ ...p, mountedDate: '' })); }}
                      className={inputCls(errors.mountedDate)} />
                    <Err msg={errors.mountedDate} />
                  </Field>

                  <Field label="Fitted Odometer (km)" required>
                    <input type="number" value={fittedOdo} min="0"
                      onChange={e => { setFittedOdo(e.target.value); setErrors(p => ({ ...p, fittedOdo: '' })); }}
                      className={inputCls(errors.fittedOdo) + ' font-mono'} />
                    <Err msg={errors.fittedOdo} />
                  </Field>

                  <div className="sm:col-span-2">
                    <Field label="Notes / Remarks">
                      <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                        placeholder="Optional notes..."
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100 transition-all resize-none hover:border-slate-300" />
                    </Field>
                  </div>
                </div>

              </div>

              {/* ── Sticky Footer ── */}
              <div className="shrink-0 flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/60">
                <div className="text-[10px] text-slate-400 font-medium">
                  {selectedTyre
                    ? <span className="text-blue-600 font-bold">{selectedTyre.id} selected · {selectedTyre.make} {selectedTyre.model}</span>
                    : 'No tyre selected'}
                </div>
                <div className="flex items-center gap-2.5">
                  <button onClick={handleClose}
                    className="h-10 px-5 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200">
                    Cancel
                  </button>
                  <button onClick={handleConfirm}
                    className="h-10 px-6 text-sm font-extrabold text-white rounded-xl flex items-center gap-2
                      transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}>
                    <Wrench className="w-4 h-4" /> Confirm Mount
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
