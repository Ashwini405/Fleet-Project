import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, FileText, MapPin, ShoppingBag,
  CheckCircle, Upload, Trash2, AlertCircle, ChevronDown,
  Gauge, Activity, ShieldCheck,
} from 'lucide-react';
import { dummyTrucks, layoutPositions } from '../data/dummyData';

// ─── Static Data ────────────────────────────────────────────────────────────
const BRAND_MODELS = {
  Apollo:     ['EnduRace', 'Amar Deluxe', 'Alnac 4G', 'Amazer 4G'],
  MRF:        ['Milaze', 'Zapper', 'Meteor', 'Wanderer'],
  Ceat:       ['Milaze X3', 'Gripp XL', 'Winmiler', 'Buland'],
  'JK Tyre':  ['UX Royale', 'Ranger', 'Taximaxx', 'Jet Xtra'],
  Bridgestone:['R152', 'M749', 'L317', 'R227'],
  Michelin:   ['X Multi', 'X Line Energy', 'X Works', 'Agilis'],
};

const TYRE_SIZES   = ['295/90R20', '1000x20', '12R22.5', '11R22.5', '315/80R22.5'];
const MATERIALS    = ['Radial Steel', 'Tubeless', 'Nylon'];
const STATUSES     = ['In Stock', 'Mounted'];
const PLACEMENTS   = layoutPositions.map(p => ({ id: p.id, label: p.label }));
const VENDORS_LIST = ['Tyre World', 'Apollo Dealer', 'MRF Distributor', 'Highway Auth', 'Global Tyres'];

const EMPTY_FORM = {
  serialNo: '', brand: '', model: '', tyreSize: '', material: '',
  status: 'In Stock', truckId: '', placement: '', dateOfIssue: '',
  fittedOdo: '', expectedLife: '',
  vendor: '', purchaseDate: '', invoiceNo: '', tyreCost: '',
  files: [],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0];

function healthInfo(expectedLife, runningKm) {
  if (!expectedLife || expectedLife <= 0) return { label: 'GOOD', color: 'green' };
  const pct = (runningKm / expectedLife) * 100;
  if (pct < 50)  return { label: 'GOOD',   color: 'green'  };
  if (pct <= 80) return { label: 'MEDIUM', color: 'yellow' };
  return             { label: 'POOR',   color: 'red'    };
}

const healthBadge = {
  green:  'bg-green-100  text-green-700  border-green-200',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  red:    'bg-red-100    text-red-700    border-red-200',
};

// ─── Sub-components ──────────────────────────────────────────────────────────
function Label({ children, required }) {
  return (
    <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

// Unified 52px height, rounded-xl, smooth focus ring
function Input({ error, className = '', ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-4 bg-white border rounded-xl text-sm font-medium text-slate-800
        focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-slate-300
        h-[52px]
        ${error
          ? 'border-red-400 focus:ring-red-100 bg-red-50/30'
          : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-100'
        }
        ${className}`}
    />
  );
}

// Select wrapped with ChevronDown icon — consistent with Input height
function Select({ error, children, className = '', ...props }) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`w-full pl-4 pr-10 bg-white border rounded-xl text-sm font-medium text-slate-800
          focus:outline-none focus:ring-2 transition-all duration-200 appearance-none cursor-pointer
          h-[52px]
          ${error
            ? 'border-red-400 focus:ring-red-100 bg-red-50/30'
            : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-100'
          }
          ${props.disabled ? 'opacity-40 cursor-not-allowed bg-slate-50' : ''}
          ${className}`}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
    </div>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-1.5 text-[11px] text-red-500 font-semibold flex items-center gap-1"
    >
      <AlertCircle className="w-3 h-3 shrink-0" />{msg}
    </motion.p>
  );
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-lg
                    transition-shadow duration-300 flex flex-col">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900
                        flex items-center justify-center shrink-0 shadow-sm">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-[13px] font-extrabold text-slate-800 tracking-tight">{title}</span>
      </div>
      <div className="px-6 py-5 space-y-5 flex-1">{children}</div>
    </div>
  );
}

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 60, scale: 0.95 }}
          animate={{ opacity: 1, x: 0,  scale: 1    }}
          exit={{    opacity: 0, x: 60, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          className="fixed top-6 right-6 z-[200] flex items-center gap-3 bg-emerald-500 text-white pl-4 pr-5 py-3.5 rounded-2xl shadow-2xl shadow-emerald-500/30 border border-emerald-400/40"
        >
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-extrabold leading-tight">Tyre Registered Successfully</p>
            <p className="text-[11px] text-emerald-100 mt-0.5">Record saved to fleet database</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── File Upload Zone ─────────────────────────────────────────────────────────
function UploadZone({ files, onChange }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const addFiles = useCallback((incoming) => {
    const valid = Array.from(incoming).filter(f =>
      ['application/pdf', 'image/png', 'image/jpeg'].includes(f.type) && f.size <= 10 * 1024 * 1024
    );
    onChange(prev => [...prev, ...valid.map(f => ({ file: f, id: Math.random().toString(36).slice(2) }))]);
  }, [onChange]);

  const onDrop = (e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current.click()}
        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center
          text-center cursor-pointer transition-all duration-200
          ${dragging
            ? 'border-blue-400 bg-blue-50 scale-[1.01]'
            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50/80'}`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 transition-all duration-200
          ${dragging ? 'bg-blue-100' : 'bg-slate-100'}`}>
          <Upload className={`w-5 h-5 transition-colors duration-200 ${dragging ? 'text-blue-500' : 'text-slate-400'}`} />
        </div>
        <p className="text-xs font-bold text-blue-600">Click to upload or drag & drop</p>
        <p className="text-[11px] text-slate-400 mt-1">PDF, PNG, JPG — max 10 MB each</p>
        <input ref={inputRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg" className="hidden"
          onChange={(e) => addFiles(e.target.files)} />
      </div>

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map(({ file, id }) => (
            <motion.li
              key={id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">{file.name}</p>
                  <p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onChange(prev => prev.filter(f => f.id !== id)); }}
                className="ml-2 w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-all duration-200 shrink-0"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function RegisterTyreModal({ isOpen, onClose, existingSerials = [] }) {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [toast, setToast]   = useState(false);

  const set = (field, value) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'brand') next.model = '';
      if (field === 'status' && value === 'In Stock') {
        next.truckId = ''; next.placement = ''; next.fittedOdo = '';
      }
      return next;
    });
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // ── Derived values ──────────────────────────────────────────────────────────
  const selectedTruck  = dummyTrucks.find(t => t.id === form.truckId);
  const currentOdo     = selectedTruck?.currentOdo ?? 0;
  const fittedOdoNum   = parseInt(form.fittedOdo)   || 0;
  const expectedLifeNum= parseInt(form.expectedLife) || 0;
  const runningKm      = form.status === 'Mounted' && fittedOdoNum > 0 ? Math.max(0, currentOdo - fittedOdoNum) : 0;
  const remainingLife  = Math.max(0, expectedLifeNum - runningKm);
  const health         = healthInfo(expectedLifeNum, runningKm);
  const isMounted      = form.status === 'Mounted';

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.serialNo.trim())                                    e.serialNo     = 'Serial number is required';
    else if (form.serialNo.trim().length < 5)                     e.serialNo     = 'Minimum 5 characters';
    else if (existingSerials.includes(form.serialNo.toUpperCase())) e.serialNo   = 'Serial number already exists';
    if (!form.brand)                                              e.brand        = 'Brand is required';
    if (!form.model)                                              e.model        = 'Model is required';
    if (!form.tyreSize)                                           e.tyreSize     = 'Tyre size is required';
    if (!form.status)                                             e.status       = 'Status is required';
    if (isMounted && !form.truckId)                               e.truckId      = 'Assign a truck when mounted';
    if (isMounted && !form.placement)                             e.placement    = 'Select tyre placement';
    if (!form.dateOfIssue)                                        e.dateOfIssue  = 'Date of issue is required';
    else if (form.dateOfIssue > today())                          e.dateOfIssue  = 'Cannot be a future date';
    if (!form.expectedLife)                                       e.expectedLife = 'Expected life is required';
    else if (expectedLifeNum <= 10000)                            e.expectedLife = 'Must be greater than 10,000 km';
    if (isMounted && form.fittedOdo && fittedOdoNum > currentOdo) e.fittedOdo   = `Cannot exceed current ODO (${currentOdo.toLocaleString()} km)`;
    if (form.tyreCost && parseFloat(form.tyreCost) <= 0)          e.tyreCost     = 'Cost must be greater than 0';
    if (form.purchaseDate && form.purchaseDate > today())         e.purchaseDate = 'Cannot exceed today';
    return e;
  };

  const handleRegister = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setToast(true);
    setTimeout(() => { setToast(false); onClose(); setForm(EMPTY_FORM); setErrors({}); }, 2200);
  };

  const handleDraft = () => {
    try { localStorage.setItem('tyre_draft', JSON.stringify(form)); } catch {}
    onClose();
  };

  const handleClose = () => { onClose(); setErrors({}); };

  if (!isOpen) return null;

  return (
    <>
      <Toast show={toast} />
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="bg-white rounded-3xl shadow-2xl w-full flex flex-col overflow-hidden"
            style={{ maxWidth: '1400px', maxHeight: '95vh' }}
          >
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-7 py-5 shrink-0"
              style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)' }}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner shrink-0">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-extrabold text-white tracking-tight">Register New Tyre</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase
                      bg-emerald-500/20 text-emerald-300 border border-emerald-500/40
                      shadow-[0_0_10px_rgba(52,211,153,0.25)]">
                      New Tyre
                    </span>
                  </div>
                  <p className="text-[11px] text-white/40 mt-0.5 font-medium">Fleet Tyre Management System</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center
                  text-white/60 hover:text-white border border-white/10 hover:border-white/20
                  transition-all duration-200 hover:rotate-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── Body ───────────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto bg-slate-50/60 p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                {/* ── SECTION 1: Identification ─────────────────────────── */}
                <SectionCard icon={FileText} title="Identification">

                  <div>
                    <Label required>Tyre Serial No</Label>
                    <Input
                      placeholder="e.g. TYR-10234"
                      value={form.serialNo}
                      error={errors.serialNo}
                      onChange={e => set('serialNo', e.target.value.toUpperCase())}
                      className="font-mono"
                    />
                    <FieldError msg={errors.serialNo} />
                  </div>

                  <div>
                    <Label required>Brand / Make</Label>
                    <Select value={form.brand} error={errors.brand} onChange={e => set('brand', e.target.value)}>
                      <option value="">Select Brand</option>
                      {Object.keys(BRAND_MODELS).map(b => <option key={b}>{b}</option>)}
                    </Select>
                    <FieldError msg={errors.brand} />
                  </div>

                  <div>
                    <Label required>Model</Label>
                    <Select value={form.model} error={errors.model} onChange={e => set('model', e.target.value)} disabled={!form.brand}>
                      <option value="">{form.brand ? 'Select Model' : 'Select brand first'}</option>
                      {(BRAND_MODELS[form.brand] || []).map(m => <option key={m}>{m}</option>)}
                    </Select>
                    <FieldError msg={errors.model} />
                  </div>

                  <div>
                    <Label required>Tyre Size</Label>
                    <Select value={form.tyreSize} error={errors.tyreSize} onChange={e => set('tyreSize', e.target.value)}>
                      <option value="">Select Size</option>
                      {TYRE_SIZES.map(s => <option key={s}>{s}</option>)}
                    </Select>
                    <FieldError msg={errors.tyreSize} />
                  </div>

                  <div>
                    <Label>Material Type</Label>
                    <Select value={form.material} onChange={e => set('material', e.target.value)}>
                      <option value="">Select Material</option>
                      {MATERIALS.map(m => <option key={m}>{m}</option>)}
                    </Select>
                  </div>

                </SectionCard>

                {/* ── SECTION 2: Placement & Life ───────────────────────── */}
                <SectionCard icon={MapPin} title="Placement & Life">

                  <div>
                    <Label required>Current Status</Label>
                    <Select value={form.status} error={errors.status} onChange={e => set('status', e.target.value)}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </Select>
                    <FieldError msg={errors.status} />
                  </div>

                  {/* Assign Truck — required only when Mounted */}
                  <div>
                    <Label required={isMounted}>Assign Truck</Label>
                    <Select
                      value={form.truckId}
                      error={errors.truckId}
                      disabled={!isMounted}
                      onChange={e => set('truckId', e.target.value)}
                    >
                      <option value="">{isMounted ? 'Select Truck' : 'Select Mounted to assign'}</option>
                      {dummyTrucks.map(t => <option key={t.id} value={t.id}>{t.id} — {t.model}</option>)}
                    </Select>
                    <FieldError msg={errors.truckId} />
                  </div>

                  {/* Tyre Placement — required only when Mounted */}
                  <div>
                    <Label required={isMounted}>Tyre Placement</Label>
                    <Select
                      value={form.placement}
                      error={errors.placement}
                      disabled={!isMounted}
                      onChange={e => set('placement', e.target.value)}
                    >
                      <option value="">{isMounted ? 'Select Position' : 'Select Mounted to assign'}</option>
                      {PLACEMENTS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                    </Select>
                    <FieldError msg={errors.placement} />
                  </div>

                  <div>
                    <Label required>Date of Issue</Label>
                    <Input type="date" value={form.dateOfIssue} error={errors.dateOfIssue}
                      max={today()} onChange={e => set('dateOfIssue', e.target.value)} />
                    <FieldError msg={errors.dateOfIssue} />
                  </div>

                  {/* Fitted ODO — only when Mounted */}
                  {isMounted && (
                    <div>
                      <Label>Fitted Odometer (km)</Label>
                      <Input type="number" placeholder="e.g. 45000" value={form.fittedOdo} error={errors.fittedOdo}
                        onChange={e => set('fittedOdo', e.target.value)} className="font-mono" />
                      {selectedTruck && (
                        <p className="mt-1 text-[10px] text-slate-400">
                          Current ODO: <span className="font-bold text-slate-600">{currentOdo.toLocaleString()} km</span>
                        </p>
                      )}
                      <FieldError msg={errors.fittedOdo} />
                    </div>
                  )}

                  <div>
                    <Label required>Expected Life (km)</Label>
                    <Input type="number" placeholder="100000" value={form.expectedLife} error={errors.expectedLife}
                      onChange={e => set('expectedLife', e.target.value)} className="font-mono" />
                    <FieldError msg={errors.expectedLife} />
                  </div>

                  {/* ── Live Health Card ──────────────────────────────────── */}
                  <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100 p-4">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Live Tyre Preview</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white rounded-xl p-3 border border-blue-100 text-center shadow-sm">
                        <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-1.5">
                          <Gauge className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Running KM</p>
                        <p className="text-sm font-black text-slate-800 mt-0.5 font-mono">{runningKm.toLocaleString()}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-blue-100 text-center shadow-sm">
                        <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center mx-auto mb-1.5">
                          <Activity className="w-3.5 h-3.5 text-indigo-600" />
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Remaining</p>
                        <p className="text-sm font-black text-slate-800 mt-0.5 font-mono">{remainingLife.toLocaleString()}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-blue-100 text-center shadow-sm">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center mx-auto mb-1.5
                          ${ health.color === 'green' ? 'bg-green-100' : health.color === 'yellow' ? 'bg-yellow-100' : 'bg-red-100' }`}>
                          <ShieldCheck className={`w-3.5 h-3.5
                            ${ health.color === 'green' ? 'text-green-600' : health.color === 'yellow' ? 'text-yellow-600' : 'text-red-600' }`} />
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Health</p>
                        <span className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black border ${healthBadge[health.color]}`}>
                          {health.label}
                        </span>
                      </div>
                    </div>
                  </div>

                </SectionCard>

                {/* ── SECTION 3: Purchase Details ───────────────────────── */}
                <SectionCard icon={ShoppingBag} title="Purchase Details">

                  <div>
                    <Label>Vendor</Label>
                    <Select value={form.vendor} onChange={e => set('vendor', e.target.value)}>
                      <option value="">Select Vendor</option>
                      {VENDORS_LIST.map(v => <option key={v}>{v}</option>)}
                    </Select>
                  </div>

                  <div>
                    <Label>Purchase Date</Label>
                    <Input type="date" value={form.purchaseDate} error={errors.purchaseDate}
                      max={today()} onChange={e => set('purchaseDate', e.target.value)} />
                    <FieldError msg={errors.purchaseDate} />
                  </div>

                  <div>
                    <Label>Invoice Number</Label>
                    <Input placeholder="e.g. INV-2024-0091" value={form.invoiceNo}
                      onChange={e => set('invoiceNo', e.target.value)} />
                  </div>

                  <div>
                    <Label>Tyre Cost</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500 pointer-events-none">₹</span>
                      <Input type="number" placeholder="0.00" value={form.tyreCost} error={errors.tyreCost}
                        onChange={e => set('tyreCost', e.target.value)} className="pl-8 font-mono" />
                    </div>
                    <FieldError msg={errors.tyreCost} />
                  </div>

                  <div>
                    <Label>Upload Bill & Image</Label>
                    <UploadZone files={form.files} onChange={updater =>
                      setForm(prev => ({ ...prev, files: typeof updater === 'function' ? updater(prev.files) : updater }))
                    } />
                  </div>

                </SectionCard>

              </div>
            </div>

            {/* ── Footer ─────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-7 py-4 border-t border-slate-200 bg-white shrink-0">
              <p className="text-[11px] text-slate-400 font-semibold hidden sm:block">
                Fields marked <span className="text-red-500">*</span> are required
              </p>
              <div className="flex items-center gap-3 ml-auto">
                <button
                  onClick={handleClose}
                  className="h-11 px-5 text-sm font-bold text-slate-600 bg-white border-2 border-slate-200
                    rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDraft}
                  className="h-11 px-5 text-sm font-bold text-slate-100 bg-slate-700 border border-slate-600
                    rounded-xl hover:bg-slate-800 transition-all duration-200"
                >
                  Save Draft
                </button>
                <button
                  onClick={handleRegister}
                  className="h-11 px-7 text-sm font-extrabold text-white rounded-xl
                    transition-all duration-200 shadow-lg shadow-blue-600/30
                    hover:shadow-blue-600/50 hover:-translate-y-0.5 active:translate-y-0
                    flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
                >
                  <Plus className="w-4 h-4" /> Register Tyre
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      </AnimatePresence>
    </>
  );
}
