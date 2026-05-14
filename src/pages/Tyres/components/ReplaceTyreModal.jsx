import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, CheckCircle, AlertCircle, Wrench, Package, RefreshCw, ChevronDown, ArrowLeftRight, MinusCircle, AlertTriangle } from 'lucide-react';
import { dummyStockTyres, dummyOldTyres, layoutPositions } from '../data/dummyData';
import { useTyreLifecycle } from '../index';

const today = () => new Date().toISOString().split('T')[0];

const POSITION_LABELS = Object.fromEntries(layoutPositions.map(p => [p.id, p.label]));

const STATUS_CONFIG = {
  'In Stock':  { bg: 'bg-blue-50',   text: 'text-blue-700',   ring: 'ring-blue-200',   dot: 'bg-blue-500'   },
  'REUSABLE':  { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', dot: 'bg-emerald-500' },
};

const REASONS    = ['Worn Out','Puncture','Sidewall Damage','Rotation','Retreading','Burst','Preventive Replacement'];
const CONDITIONS = ['Good','Medium','Poor','Critical'];
const NEXT_ACTIONS = [
  { value: 'Move To Old Stock',   label: 'Move To Old Stock',   color: 'text-slate-700  bg-slate-100  ring-slate-300'  },
  { value: 'Send For Retreading', label: 'Send For Retreading', color: 'text-amber-700  bg-amber-50   ring-amber-300'  },
  { value: 'Scrap Tyre',          label: 'Scrap Tyre',          color: 'text-red-700    bg-red-50     ring-red-300'    },
  { value: 'Reusable Spare',      label: 'Reusable Spare',      color: 'text-blue-700   bg-blue-50    ring-blue-300'   },
];
const ACTION_LOCATION = {
  'Move To Old Stock':   'Warehouse Stock',
  'Send For Retreading': 'Retreading Area',
  'Scrap Tyre':          'Scrap Yard',
  'Reusable Spare':      'Reusable Storage',
};

function calcHealth(runningKm, expectedLife) {
  if (!expectedLife) return 'Good';
  const rem = ((expectedLife - runningKm) / expectedLife) * 100;
  if (rem > 60) return 'Good';
  if (rem >= 30) return 'Medium';
  return 'Critical';
}

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

const selectCls = (err) =>
  `w-full pl-3.5 pr-9 h-[38px] bg-white border rounded-xl text-sm font-medium text-slate-800
   appearance-none focus:outline-none focus:ring-2 transition-all duration-200 cursor-pointer
   ${err ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-100'}`;

export default function ReplaceTyreModal({ isOpen, onClose, truckData, positionId, currentTyre }) {
  const { activeTyres, replaceTyre } = useTyreLifecycle();

  const [step, setStep] = useState(1); // 1: Current Tyre Summary, 2: Remove Settings, 3: Select Replacement, 4: Mount Settings
  const [search, setSearch]         = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedReplacement, setSelectedReplacement] = useState(null);

  // Remove form
  const [removeForm, setRemoveForm] = useState({
    removalDate:    today(),
    currentOdo:     String(truckData?.currentOdo ?? ''),
    reason:         '',
    condition:      '',
    remainingTread: '',
    nextAction:     '',
    storeLocation:  '',
    notes:          '',
  });

  // Mount form
  const [mountForm, setMountForm] = useState({
    mountedDate: today(),
    fittedOdo:   String(truckData?.currentOdo ?? ''),
    notes:       '',
  });

  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);

  // Build combined tyre pool: stock + reusable old tyres
  const mountedIds = new Set(activeTyres.map(t => t.id));
  mountedIds.delete(currentTyre?.id); // Allow current tyre to be replaced

  const stockPool = dummyStockTyres
    .filter(t => !mountedIds.has(t.id))
    .map(t => ({ ...t, _source: 'stock', _status: 'In Stock', runningKm: 0, remainingTread: 100 }));

  const oldPool = dummyOldTyres
    .filter(t => t.status === 'REUSABLE' && !mountedIds.has(t.tyreNo))
    .map(t => ({
      id: t.tyreNo, make: t.make, model: t.model, tyreSize: t.tyreSize,
      material: t.material, vendor: t.vehicleNo,
      runningKm: t.runningKm, remainingTread: t.remainingTread,
      _source: 'old', _status: 'REUSABLE',
    }));

  const allTyres = [...stockPool, ...oldPool];

  const uniqueSizes  = [...new Set(allTyres.map(t => t.tyreSize).filter(Boolean))];
  const uniqueBrands = [...new Set(allTyres.map(t => t.make).filter(Boolean))];

  const requiredSize = truckData?.tyreSize || null;

  const filtered = useMemo(() => allTyres.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !search || [t.id, t.make, t.model, t.tyreSize].some(v => v?.toLowerCase().includes(q));
    const matchSize   = !sizeFilter   || t.tyreSize === sizeFilter;
    const matchBrand  = !brandFilter  || t.make === brandFilter;
    const matchStatus = !statusFilter || t._status === statusFilter;
    return matchSearch && matchSize && matchBrand && matchStatus;
  }), [allTyres, search, sizeFilter, brandFilter, statusFilter]);

  const posLabel = POSITION_LABELS[positionId] || positionId;

  // Current tyre calculations
  const currentRunningKm = currentTyre ? currentTyre.presentOdo - currentTyre.fittedOdo : 0;
  const currentLifePct = currentTyre ? Math.round((currentRunningKm / currentTyre.expectedLife) * 100) : 0;
  const currentTreadPct = Math.max(0, 100 - currentLifePct);
  const currentHealth = currentTyre ? calcHealth(currentRunningKm, currentTyre.expectedLife) : 'Good';

  const setRemove = (k, v) => {
    setRemoveForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const setMount = (k, v) => {
    setMountForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const validateRemove = () => {
    const e = {};
    if (!removeForm.removalDate)                                          e.removalDate  = 'Required';
    else if (removeForm.removalDate > today())                            e.removalDate  = 'Cannot be a future date';
    if (!removeForm.currentOdo)                                           e.currentOdo   = 'Required';
    else if (parseInt(removeForm.currentOdo) < (currentTyre?.fittedOdo ?? 0))   e.currentOdo   = `Must be ≥ fitted ODO (${currentTyre?.fittedOdo?.toLocaleString()} km)`;
    if (!removeForm.reason)      e.reason      = 'Select a reason';
    if (!removeForm.condition)   e.condition   = 'Select condition';
    if (!removeForm.nextAction)  e.nextAction  = 'Select next action';
    if (!removeForm.storeLocation) e.storeLocation = 'Select store location';
    return e;
  };

  const validateMount = () => {
    const e = {};
    if (!selectedReplacement) e.replacement = 'Select a replacement tyre';
    if (!mountForm.mountedDate) e.mountedDate = 'Select mounted date';
    else if (mountForm.mountedDate > today()) e.mountedDate = 'Cannot be a future date';
    if (!mountForm.fittedOdo) e.fittedOdo = 'Enter fitted odometer';
    else if (parseInt(mountForm.fittedOdo) < 0) e.fittedOdo = 'Cannot be negative';
    return e;
  };

  const selectReplacement = (t) => {
    if (requiredSize && t.tyreSize !== requiredSize) return; // incompatible
    setSelectedReplacement(prev => prev?.id === t.id ? null : t);
    setErrors(p => ({ ...p, replacement: '' }));
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      const e = validateRemove();
      if (Object.keys(e).length) { setErrors(e); return; }
      setStep(3);
    } else if (step === 3) {
      const e = validateMount();
      if (Object.keys(e).length) { setErrors(e); return; }
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleConfirm = () => {
    replaceTyre(currentTyre.id, selectedReplacement._source, selectedReplacement.id, {
      make:         selectedReplacement.make,
      model:        selectedReplacement.model,
      material:    selectedReplacement.material || '',
      expectedLife: 100000,
      truckId:     truckData.id,
      placement:   positionId,
      fittedDate:  mountForm.mountedDate,
      fittedOdo:   parseInt(mountForm.fittedOdo),
    }, {
      removalDate: removeForm.removalDate,
      currentOdo:  parseInt(removeForm.currentOdo),
      reason:      removeForm.reason,
      condition:   removeForm.condition,
      remainingTread: removeForm.remainingTread,
      nextAction:  removeForm.nextAction,
      storeLocation: removeForm.storeLocation,
      notes:       removeForm.notes,
    });
    setDone(true);
  };

  const handleClose = () => {
    setStep(1);
    setSearch(''); setSizeFilter(''); setBrandFilter(''); setStatusFilter('');
    setSelectedReplacement(null);
    setRemoveForm({
      removalDate:    today(),
      currentOdo:     String(truckData?.currentOdo ?? ''),
      reason:         '',
      condition:      '',
      remainingTread: '',
      nextAction:     '',
      storeLocation:  '',
      notes:          '',
    });
    setMountForm({
      mountedDate: today(),
      fittedOdo:   String(truckData?.currentOdo ?? ''),
      notes:       '',
    });
    setErrors({});
    setDone(false);
    onClose();
  };

  if (!isOpen || !truckData || !currentTyre) return null;

  const steps = [
    { id: 1, label: 'Current Tyre', icon: <Package className="w-4 h-4" /> },
    { id: 2, label: 'Remove Settings', icon: <MinusCircle className="w-4 h-4" /> },
    { id: 3, label: 'Select Replacement', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: 4, label: 'Mount Settings', icon: <Wrench className="w-4 h-4" /> },
  ];

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
          style={{ width: '92vw', maxWidth: '900px', maxHeight: '92vh', boxShadow: '0 32px 80px rgba(0,0,0,0.25)' }}
        >
          {/* ── Header ── */}
          <div className="shrink-0 px-5 py-4 bg-gradient-to-r from-[#0f172a] to-[#1e293b] flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-blue-400" />
                <h3 className="text-[15px] font-black text-white tracking-tight">Replace Tyre Workflow</h3>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Replace {currentTyre.id} on {truckData.id} · {posLabel}</p>
            </div>
            <button onClick={handleClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:rotate-90">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper */}
          <div className="shrink-0 px-5 py-3 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center justify-between">
              {steps.map((s, i) => (
                <div key={s.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                    step >= s.id ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-slate-300 text-slate-400'
                  }`}>
                    {s.icon}
                  </div>
                  <div className="ml-2">
                    <div className={`text-xs font-bold ${step >= s.id ? 'text-blue-700' : 'text-slate-400'}`}>{s.label}</div>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${step > s.id ? 'bg-blue-500' : 'bg-slate-300'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {done ? (
            /* ── Success State ── */
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <p className="text-base font-black text-slate-800">Tyre Replaced Successfully</p>
                <p className="text-xs text-slate-400 mt-1">
                  {currentTyre.id} → {selectedReplacement?.id} on {truckData.id} · {posLabel}
                </p>
              </div>
              <div className="text-[11px] text-slate-500 bg-slate-50 rounded-xl px-4 py-2 border border-slate-100">
                Old tyre removed · New tyre mounted · Axle layout updated
              </div>
              <button onClick={handleClose}
                className="h-10 px-8 text-sm font-bold text-white bg-slate-800 rounded-xl hover:bg-slate-700 transition-all">
                Close
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>

                {/* Step 1: Current Tyre Summary */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                      <h4 className="text-sm font-black text-slate-800 mb-3">Current Tyre Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">Tyre Number</span>
                            <span className="text-sm font-bold text-slate-800">{currentTyre.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">Brand / Model</span>
                            <span className="text-sm font-bold text-slate-800">{currentTyre.make} {currentTyre.model}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">Current Position</span>
                            <span className="text-sm font-bold text-slate-800">{posLabel}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">Running KM</span>
                            <span className="text-sm font-bold text-slate-800">{currentRunningKm.toLocaleString()} km</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">Tread %</span>
                            <span className="text-sm font-bold text-slate-800">{currentTreadPct}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">Health</span>
                            <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                              currentHealth === 'Good' ? 'bg-green-100 text-green-700' :
                              currentHealth === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>{currentHealth}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">Mounted Date</span>
                            <span className="text-sm font-bold text-slate-800">{currentTyre.fittedDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recommendation Banner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h4 className="text-sm font-black text-blue-800 mb-2">Recommendation</h4>
                      <div className="flex items-center gap-2">
                        {currentTreadPct < 20 ? (
                          <div className="flex items-center gap-2 text-red-700">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-sm font-bold">Recommended Scrap</span>
                          </div>
                        ) : currentTreadPct < 50 ? (
                          <div className="flex items-center gap-2 text-amber-700">
                            <RefreshCw className="w-4 h-4" />
                            <span className="text-sm font-bold">Suitable for Retreading</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-bold">Suitable for Reuse</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Remove Settings */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Removal Date" required>
                        <input type="date" value={removeForm.removalDate} max={today()}
                          onChange={e => setRemove('removalDate', e.target.value)}
                          className={inputCls(errors.removalDate)} />
                        <Err msg={errors.removalDate} />
                      </Field>

                      <Field label="Current Odometer (km)" required>
                        <input type="number" value={removeForm.currentOdo}
                          onChange={e => setRemove('currentOdo', e.target.value)}
                          className={inputCls(errors.currentOdo) + ' font-mono'} />
                        <Err msg={errors.currentOdo} />
                      </Field>

                      <Field label="Removal Reason" required>
                        <div className="relative">
                          <select value={removeForm.reason} onChange={e => setRemove('reason', e.target.value)} className={selectCls(errors.reason)}>
                            <option value="">Select Reason</option>
                            {REASONS.map(r => <option key={r}>{r}</option>)}
                          </select>
                        </div>
                        <Err msg={errors.reason} />
                      </Field>

                      <Field label="Tyre Condition" required>
                        <div className="relative">
                          <select value={removeForm.condition} onChange={e => setRemove('condition', e.target.value)} className={selectCls(errors.condition)}>
                            <option value="">Select Condition</option>
                            {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <Err msg={errors.condition} />
                      </Field>

                      <Field label="Remaining Tread %">
                        <input type="number" min="0" max="100" placeholder="0–100"
                          value={removeForm.remainingTread} onChange={e => setRemove('remainingTread', e.target.value)}
                          className={inputCls(false) + ' font-mono'} />
                      </Field>

                      <Field label="Next Action" required>
                        <div className="relative">
                          <select value={removeForm.nextAction} onChange={e => setRemove('nextAction', e.target.value)} className={selectCls(errors.nextAction)}>
                            <option value="">Select Action</option>
                            {NEXT_ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                          </select>
                        </div>
                        {removeForm.nextAction && (
                          <span className={`mt-1.5 inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ${NEXT_ACTIONS.find(a=>a.value===removeForm.nextAction)?.color}`}>
                            {removeForm.nextAction}
                          </span>
                        )}
                        <Err msg={errors.nextAction} />
                      </Field>

                      <Field label="Store Location" required>
                        <div className="relative">
                          <select value={removeForm.storeLocation} onChange={e => setRemove('storeLocation', e.target.value)} className={selectCls(errors.storeLocation)}>
                            <option value="">Select Location</option>
                            {['Scrap Yard','Retreading Area','Warehouse Stock','Reusable Storage'].map(l => <option key={l}>{l}</option>)}
                          </select>
                        </div>
                        <Err msg={errors.storeLocation} />
                      </Field>

                      <Field label="Notes">
                        <textarea rows={2} value={removeForm.notes} onChange={e => setRemove('notes', e.target.value)}
                          placeholder="Optional notes..."
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100 transition-all resize-none" />
                      </Field>
                    </div>
                  </div>
                )}

                {/* Step 3: Select Replacement Tyre */}
                {step === 3 && (
                  <div className="space-y-4">
                    {/* Top Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        ['Truck', truckData.id],
                        ['Position', posLabel],
                        ['Required Size', truckData.tyreSize || 'Any'],
                        ['Status', 'Selecting Replacement'],
                      ].map(([k, v]) => (
                        <div key={k} className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{k}</div>
                          <div className="text-xs font-black text-slate-800 mt-0.5 truncate">{v}</div>
                        </div>
                      ))}
                    </div>

                    {/* Filters */}
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

                    {/* Tyre Selection */}
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Available Tyres <span className="text-slate-300">({filtered.length})</span>
                      </p>
                      {errors.replacement && <Err msg={errors.replacement} />}

                      {filtered.length === 0 ? (
                        <div className="flex flex-col items-center py-10 gap-2 text-slate-400">
                          <Package className="w-8 h-8 opacity-30" />
                          <p className="text-xs font-semibold">No available tyres found</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-1"
                          style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
                          {filtered.map(t => {
                            const isSelected = selectedReplacement?.id === t.id;
                            const incompatible = requiredSize && t.tyreSize !== requiredSize;
                            const cfg = STATUS_CONFIG[t._status] || STATUS_CONFIG['In Stock'];
                            return (
                              <motion.div
                                key={t.id}
                                whileHover={!incompatible ? { scale: 1.01 } : {}}
                                onClick={() => !incompatible && selectReplacement(t)}
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
                  </div>
                )}

                {/* Step 4: New Mount Settings */}
                {step === 4 && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                      <h4 className="text-sm font-black text-slate-800 mb-3">Replacement Tyre</h4>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedReplacement._source === 'old' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                          {selectedReplacement._source === 'old'
                            ? <RefreshCw className="w-5 h-5 text-amber-600" />
                            : <Package className="w-5 h-5 text-blue-600" />}
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-800">{selectedReplacement.id}</div>
                          <div className="text-xs text-slate-500">{selectedReplacement.make} {selectedReplacement.model}</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Mounted Date" required>
                        <input type="date" value={mountForm.mountedDate} max={today()}
                          onChange={e => setMount('mountedDate', e.target.value)}
                          className={inputCls(errors.mountedDate)} />
                        <Err msg={errors.mountedDate} />
                      </Field>

                      <Field label="Fitted Odometer (km)" required>
                        <input type="number" value={mountForm.fittedOdo} min="0"
                          onChange={e => setMount('fittedOdo', e.target.value)}
                          className={inputCls(errors.fittedOdo) + ' font-mono'} />
                        <Err msg={errors.fittedOdo} />
                      </Field>

                      <div className="sm:col-span-2">
                        <Field label="Notes">
                          <textarea value={mountForm.notes} onChange={e => setMount('notes', e.target.value)} rows={2}
                            placeholder="Optional notes..."
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100 transition-all resize-none hover:border-slate-300" />
                        </Field>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* ── Sticky Footer ── */}
              <div className="shrink-0 flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/60">
                <div className="text-[10px] text-slate-400 font-medium">
                  Step {step} of 4 · {steps.find(s => s.id === step)?.label}
                </div>
                <div className="flex items-center gap-2.5">
                  {step > 1 && (
                    <button onClick={handleBack}
                      className="h-10 px-4 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200">
                      Back
                    </button>
                  )}
                  {step < 4 ? (
                    <button onClick={handleNext}
                      className="h-10 px-6 text-sm font-extrabold text-white rounded-xl flex items-center gap-2
                        transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                      style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}>
                      Next
                    </button>
                  ) : (
                    <button onClick={handleConfirm}
                      className="h-10 px-6 text-sm font-extrabold text-white rounded-xl flex items-center gap-2
                        transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                      style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
                      <ArrowLeftRight className="w-4 h-4" /> Replace Tyre
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}