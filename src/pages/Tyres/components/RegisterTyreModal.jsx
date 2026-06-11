import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, FileText, MapPin, ShoppingBag,
  CheckCircle, Upload, Trash2, AlertCircle, ChevronDown,
  Gauge, Activity, ShieldCheck,
} from 'lucide-react';
import axios from 'axios';
import { layoutPositions } from '../data/dummyData';
import { createVendorTransaction } from '../../../services/vendorTransactionService';
import { useVendorLedger } from '../../../context/VendorLedgerContext';


// ─── Static Data ────────────────────────────────────────────────────────────
const BRAND_MODELS = {
  Apollo: {
    EnduRace: ['295/90R20', '315/80R22.5'],
    'Amazer XL': ['12R22.5'],
    Duramile: ['11R22.5'],
    'Cargo Marathon': ['1000x20'],
  },
  MRF: {
    Milaze: ['295/90R20', '315/80R22.5'],
    Zapper: ['12R22.5'],
    Wanderer: ['11R22.5'],
    Superlug: ['1000x20'],
  },
  Ceat: {
    Winmile: ['295/90R20'],
    Loadmax: ['12R22.5'],
    GrippXL: ['11R22.5'],
    MileXL: ['1000x20'],
  },
  'JK Tyre': {
    'Jet Xtra': ['295/90R20'],
    'UX Royale': ['315/80R22.5'],
    Blaze: ['12R22.5'],
    Challenger: ['1000x20'],
  },
  Bridgestone: {
    R154: ['295/90R20'],
    M749: ['315/80R22.5'],
    Duravis: ['12R22.5'],
    L355: ['11R22.5'],
  },
  Michelin: {
    'X Multi': ['295/90R20'],
    'X Works': ['315/80R22.5'],
    Agilis: ['12R22.5'],
    'XZL Cargo': ['1000x20'],
  },
  Goodyear: {
    Fuelmax: ['295/90R20'],
    Kmax: ['315/80R22.5'],
    Wrangler: ['12R22.5'],
    'Cargo G28': ['11R22.5'],
  },
  Continental: {
    'Conti Hybrid': ['295/90R20'],
    'Conti Cross': ['315/80R22.5'],
    HSR2: ['12R22.5'],
    HDR2: ['11R22.5'],
  },
};
const MATERIALS = ['Radial', 'Radial Tubeless', 'Bias Ply', 'Tube Type'];
const STATUSES = ['In Stock', 'Mounted'];
const PLACEMENTS = layoutPositions.map(p => ({ id: p.id, label: p.label }));
// Tyre vendors — matches TyresVendorPage SAMPLE_VENDORS
// When backend ready: fetch from /api/vendors?category=tyres
const TYRE_VENDORS = [
  { id: 'tv1', name: 'MRF Tyres Dealer'        },
  { id: 'tv2', name: 'Apollo Tyres Distributor' },
  { id: 'tv3', name: 'JK Retreading Works'      },
  { id: 'tv4', name: 'ABC Scrap Traders'        },
];

const EMPTY_FORM = {
  serialNo: '', brand: '', model: '', tyreSize: '', material: '',
  status: 'In Stock', truckId: '', placement: '', dateOfIssue: '',
  fittedOdo: '', expectedLife: '',
  vendor: '', vendorId: '', purchaseDate: '', invoiceNo: '', tyreCost: '',
  files: [],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0];

function healthInfo(expectedLife, runningKm) {
  if (!expectedLife || expectedLife <= 0) return { label: 'GOOD', color: 'green' };
  const pct = (runningKm / expectedLife) * 100;
  if (pct < 50) return { label: 'GOOD', color: 'green' };
  if (pct <= 80) return { label: 'MEDIUM', color: 'yellow' };
  return { label: 'POOR', color: 'red' };
}

const healthBadge = {
  green: 'bg-green-100  text-green-700  border-green-200',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  red: 'bg-red-100    text-red-700    border-red-200',
};

// ─── Sub-components (unchanged UI) ──────────────────────────────────────────
function Label({ children, required }) {
  return (
    <label className="block text-[10.5px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
      {children}{required && <span className="text-rose-400 text-[10px] ml-0.5 font-black">*</span>}
    </label>
  );
}

function Input({ error, className = '', ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-3.5 bg-white border rounded-xl text-sm font-medium text-slate-800
        focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-slate-400
        h-[44px]
        ${error
          ? 'border-red-300 focus:ring-red-100 bg-red-50/20'
          : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-100/70'
        }
        ${className}`}
    />
  );
}

function Select({ error, children, className = '', ...props }) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`w-full pl-3.5 pr-9 bg-white border rounded-xl text-sm font-medium text-slate-800
          focus:outline-none focus:ring-2 transition-all duration-200 appearance-none cursor-pointer
          h-[44px]
          ${error
            ? 'border-red-300 focus:ring-red-100 bg-red-50/20'
            : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-100/70'
          }
          ${props.disabled ? 'opacity-40 cursor-not-allowed bg-slate-50' : ''}
          ${className}`}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
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
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md
                    transition-shadow duration-300 flex flex-col">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900
                        flex items-center justify-center shrink-0 shadow-sm">
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-[12.5px] font-extrabold text-slate-800 tracking-tight">{title}</span>
      </div>
      <div className="px-5 py-4 space-y-4 flex-1">{children}</div>
    </div>
  );
}

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ show, serialNo, truckId }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 60, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 60, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          className="fixed top-5 right-5 z-[200] flex items-start gap-3 bg-emerald-600 text-white pl-4 pr-5 py-4 rounded-2xl shadow-2xl shadow-emerald-600/30 border border-emerald-500/40 min-w-[260px]"
        >
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-extrabold leading-tight">Tyre Registered Successfully</p>
            <div className="mt-1.5 space-y-0.5">
              {serialNo && (
                <p className="text-[11px] text-emerald-100 flex items-center gap-1.5">
                  <span className="opacity-60">Serial:</span>
                  <span className="font-bold font-mono tracking-wide">{serialNo}</span>
                </p>
              )}
              {truckId ? (
                <p className="text-[11px] text-emerald-100 flex items-center gap-1.5">
                  <span className="opacity-60">Truck:</span>
                  <span className="font-bold">{truckId}</span>
                </p>
              ) : (
                <p className="text-[11px] text-emerald-100 opacity-70">Added to stock inventory</p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Upload helpers ───────────────────────────────────────────────────────────
const ALLOWED_TYPES = {
  'application/pdf': { label: 'PDF', icon: 'pdf' },
  'image/png': { label: 'PNG', icon: 'image' },
  'image/jpeg': { label: 'JPG', icon: 'image' },
  'image/webp': { label: 'WEBP', icon: 'image' },
};
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILE_COUNT = 5;

function FileIcon({ type }) {
  if (type === 'application/pdf')
    return (
      <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
        <FileText className="w-3.5 h-3.5 text-red-500" />
      </div>
    );
  return (
    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
      <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
    </div>
  );
}

function UploadZone({ files, onChange }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [fileErrors, setFileErrors] = useState([]);

  const addFiles = useCallback((incoming) => {
    const errs = [];
    const toAdd = [];

    Array.from(incoming).forEach(f => {
      if (!ALLOWED_TYPES[f.type]) {
        errs.push(`"${f.name}" — unsupported file type`);
        return;
      }
      if (f.size > MAX_FILE_SIZE) {
        errs.push(`"${f.name}" — exceeds 10 MB limit`);
        return;
      }
      const isDupe = files.some(existing => existing.file.name === f.name && existing.file.size === f.size);
      if (isDupe) {
        errs.push(`"${f.name}" — already uploaded`);
        return;
      }
      toAdd.push({ file: f, id: Math.random().toString(36).slice(2), preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null });
    });

    setFileErrors(errs);
    if (toAdd.length === 0) return;

    onChange(prev => {
      const remaining = MAX_FILE_COUNT - prev.length;
      if (remaining <= 0) {
        setFileErrors(e => [...e, `Maximum ${MAX_FILE_COUNT} files allowed`]);
        return prev;
      }
      return [...prev, ...toAdd.slice(0, remaining)];
    });
  }, [files, onChange]);

  const onDrop = (e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); };
  const atLimit = files.length >= MAX_FILE_COUNT;

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); if (!atLimit) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !atLimit && inputRef.current.click()}
        className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center
          text-center transition-all duration-200
          ${atLimit
            ? 'border-slate-100 bg-slate-50 cursor-not-allowed opacity-60'
            : dragging
              ? 'border-blue-500 bg-blue-50/80 scale-[1.01] shadow-sm shadow-blue-100 cursor-copy'
              : 'border-slate-200 hover:border-blue-200 hover:bg-blue-50/40 cursor-pointer'}`}
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 transition-all duration-200
          ${dragging ? 'bg-blue-100 scale-110' : 'bg-slate-100'}`}>
          <Upload className={`w-4 h-4 transition-colors duration-200 ${dragging ? 'text-blue-500' : 'text-slate-400'}`} />
        </div>
        <p className="text-xs font-bold text-blue-600">
          {atLimit ? `Maximum ${MAX_FILE_COUNT} files reached` : 'Click to upload or drag & drop'}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">PDF, JPG, PNG, WEBP · Max 10 MB · Up to {MAX_FILE_COUNT} files</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      <AnimatePresence>
        {fileErrors.map((err, i) => (
          <motion.p
            key={err}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-[11px] text-red-500 font-semibold flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3 shrink-0" />{err}
          </motion.p>
        ))}
      </AnimatePresence>

      {files.length > 0 && (
        <>
          <ul className="space-y-2">
            <AnimatePresence>
              {files.map(({ file, id, preview }) => (
                <motion.li
                  key={id}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                >
                  {preview
                    ? <img src={preview} alt={file.name} className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0" />
                    : <FileIcon type={file.type} />}

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-700 truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {ALLOWED_TYPES[file.type]?.label} · {(file.size / 1024).toFixed(0)} KB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => { onChange(prev => prev.filter(f => f.id !== id)); setFileErrors([]); }}
                    className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center
                      text-slate-400 hover:text-red-500 hover:border-red-200 transition-all duration-200 shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <p className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0 text-amber-500" />
            Ensure invoice details match the uploaded bill
          </p>
        </>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function RegisterTyreModal({ isOpen, onClose, onRegister, existingSerials = [] }) {
  const { addVendorTransaction } = useVendorLedger();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [activeTyres, setActiveTyres] = useState([]);

  // Fetch vehicles & tyres from database
  useEffect(() => {
    fetchVehicles();
    fetchActiveTyres();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/vehicles');
      setVehicles(res.data.data);
    } catch (error) {
      console.log('Vehicle Fetch Error:', error);
    }
  };

  const fetchActiveTyres = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/tyres');
      setActiveTyres(res.data.data);
    } catch (error) {
      console.log('Tyre Fetch Error:', error);
    }
  };

  const set = (field, value) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'brand') {
        next.model = '';
        next.tyreSize = '';
      }
      if (field === 'model') {
        next.tyreSize = '';
      }
      if (field === 'status' && value === 'In Stock') {
        next.truckId = ''; next.placement = ''; next.fittedOdo = '';
      }
      // Auto-fill fitted ODO from vehicle's current odometer when vehicle selected
      if (field === 'truckId' && prev.status === 'Mounted') {
        const vehicle = vehicles.find(v => String(v.id) === String(value));
        next.fittedOdo =
  vehicle
  ? String(vehicle.current_odometer || 0)
  : '';
      }
      return next;
    });
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // ── Derived values ──────────────────────────────────────────────────────────
  const availableModels = form.brand ? Object.keys(BRAND_MODELS[form.brand] || {}) : [];
  const availableSizes = (form.brand && form.model) ? (BRAND_MODELS[form.brand]?.[form.model] || []) : [];
  const selectedVehicle = vehicles.find(v => String(v.id) === String(form.truckId));
  const currentOdo =
  selectedVehicle?.current_odometer ?? 0;
  const isMounted = form.status === 'Mounted';

  // Tyres already mounted on this vehicle
  const truckMountedCount = form.truckId
    ? activeTyres.filter(t => t.vehicle_id === form.truckId && t.status === 'Mounted').length
    : 0;
  const truckCapacity = selectedVehicle?.total_tyres ?? 0;
  const truckIsFull = truckCapacity > 0 && truckMountedCount >= truckCapacity;
  const truckWarnMsg = form.truckId && !truckIsFull && truckMountedCount > 0
    ? `${truckMountedCount} of ${truckCapacity} tyres already mounted on this vehicle`
    : null;

  const fittedOdoNum = parseInt(form.fittedOdo) || 0;
  const expectedLifeNum = parseInt(form.expectedLife) || 0;
  const runningKm = 0;
  const remainingLife = Math.max(0, expectedLifeNum);
  const health = healthInfo(expectedLifeNum, runningKm);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    const serialUpper = form.serialNo.trim().toUpperCase();
    if (!form.serialNo.trim()) e.serialNo = 'Serial number is required';
    else if (form.serialNo.trim().length < 5) e.serialNo = 'Minimum 5 characters';
    else if (existingSerials.includes(serialUpper)) e.serialNo = 'Serial number already exists';
    else if (activeTyres.some(t => t.serial_no?.toUpperCase() === serialUpper))
      e.serialNo = 'This tyre is already registered';
    if (!form.brand) e.brand = 'Brand is required';
    if (!form.model) e.model = 'Model is required';
    if (!form.tyreSize) e.tyreSize = 'Tyre size is required';
    if (!form.status) e.status = 'Status is required';
    if (isMounted && !form.truckId) e.truckId = 'Assign a vehicle when mounted';
    else if (isMounted && form.truckId && truckIsFull) e.truckId = `Vehicle is full — ${truckMountedCount}/${truckCapacity} tyres already mounted`;
    if (isMounted && !form.placement) e.placement = 'Select tyre placement';
    if (!form.dateOfIssue) e.dateOfIssue = 'Date of issue is required';
    else if (form.dateOfIssue > today()) e.dateOfIssue = 'Cannot be a future date';
    if (!form.expectedLife) e.expectedLife = 'Expected life is required';
    else if (expectedLifeNum <= 10000) e.expectedLife = 'Must be greater than 10,000 km';
    if (isMounted && form.fittedOdo && fittedOdoNum > currentOdo) e.fittedOdo = `Cannot exceed vehicle current ODO (${currentOdo.toLocaleString()} km)`;
    if (isMounted && form.fittedOdo && fittedOdoNum < currentOdo * 0.5) e.fittedOdo = `Value seems too low — vehicle ODO is ${currentOdo.toLocaleString()} km`;
    // Invoice number
    const invoiceVal = form.invoiceNo.trim();
    if (invoiceVal) {
      if (invoiceVal.length < 5) e.invoiceNo = 'Minimum 5 characters';
      else if (invoiceVal.length > 30) e.invoiceNo = 'Maximum 30 characters';
      else if (!/^[A-Za-z0-9\-]+$/.test(invoiceVal)) e.invoiceNo = 'Only letters, numbers and hyphens allowed';
    }
    // Tyre cost
    const costVal = parseFloat(form.tyreCost);
    if (form.tyreCost) {
      if (isNaN(costVal) || costVal <= 0) e.tyreCost = 'Enter a valid positive amount';
    }
    // Purchase date
    if (form.purchaseDate && form.purchaseDate > today()) e.purchaseDate = 'Cannot be a future date';
    if (form.purchaseDate && form.dateOfIssue && form.purchaseDate > form.dateOfIssue)
      e.purchaseDate = 'Purchase date cannot be after date of issue';
    return e;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleRegister = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    // 1. Always fire frontend callback (updates local tyre state)
    if (onRegister) onRegister(form);

    // 2. Always create vendor ledger transaction if vendor + cost filled
    if (form.vendorId && form.tyreCost) {
      const vendor = TYRE_VENDORS.find(v => v.id === form.vendorId);
      createVendorTransaction({
        vendorId:      form.vendorId,
        vendorName:    vendor?.name || form.vendor,
        date:          form.purchaseDate || form.dateOfIssue,
        type:          'Tyre Purchase',
        ref:           form.invoiceNo || `TYR-${Date.now()}`,
        desc:          `${form.brand} ${form.model} ${form.tyreSize} — ${form.serialNo}`,
        debit:         parseFloat(form.tyreCost),
        onTransaction: addVendorTransaction,
      });
    }

    // 3. Show toast & reset
    setToast(true);
    setTimeout(() => {
      setToast(false);
      onClose();
      setForm(EMPTY_FORM);
      setErrors({});
    }, 2000);

    // 4. Try backend (optional — fails silently when not running)
    try {
      const sv = vehicles.find(v => String(v.id) === String(form.truckId));
      const formData = new FormData();
      formData.append('tyre_number',      `TYR-${Date.now()}`);
      formData.append('serial_no',        form.serialNo);
      formData.append('brand',            form.brand);
      formData.append('model',            form.model);
      formData.append('tyre_size',        form.tyreSize);
      formData.append('material_type',    form.material);
      formData.append('status',           form.status);
      formData.append('vehicle_id',       form.truckId || '');
      formData.append('vehicle_number',   sv?.vehicle_no || '');
      formData.append('tyre_position',    form.placement);
      formData.append('date_of_issue',    form.dateOfIssue);
      formData.append('fitted_odometer',  form.fittedOdo);
      formData.append('expected_life_km', form.expectedLife);
      formData.append('running_km',       '0');
      formData.append('remaining_life_km',form.expectedLife);
      formData.append('tyre_health',      health.label);
      formData.append('vendor_name',      form.vendor);
      formData.append('purchase_date',    form.purchaseDate);
      formData.append('invoice_number',   form.invoiceNo);
      formData.append('tyre_cost',        form.tyreCost || 0);
      form.files.forEach(f => formData.append('tyre_files', f.file));
      await axios.post('http://localhost:5001/api/tyres', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    } catch { /* backend not running — frontend already updated */ }
  };

  const handleDraft = () => {
    try { localStorage.setItem('tyre_draft', JSON.stringify(form)); } catch { }
    onClose();
  };

  const handleClose = () => { onClose(); setErrors({}); };

  if (!isOpen) return null;

  return (
    <>
      <Toast show={toast} serialNo={form.serialNo} truckId={form.truckId} />
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="bg-white rounded-3xl shadow-2xl w-full flex flex-col overflow-hidden"
            style={{ maxWidth: '1400px', maxHeight: '92vh' }}
          >
            {/* Header (unchanged) */}
            <div className="flex items-center justify-between px-6 py-3.5 shrink-0"
              style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)' }}>
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner shrink-0">
                  <Plus className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-[15px] font-extrabold text-white tracking-tight leading-none">Register New Tyre</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-black tracking-widest uppercase
                      bg-emerald-500/20 text-emerald-300 border border-emerald-500/40
                      shadow-[0_0_8px_rgba(52,211,153,0.2)] leading-none">
                      NEW TYRE
                    </span>
                  </div>
                  <p className="text-[11px] text-white/50 mt-1 font-medium">Fleet Tyre Management System</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center
                  text-white/60 hover:text-white border border-white/10 hover:border-white/20
                  transition-all duration-200 hover:rotate-90 hover:scale-110
                  hover:shadow-[0_0_12px_rgba(0,0,0,0.4)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Body - scrollable content (unchanged except data sources) */}
            <div
              className="flex-1 overflow-y-auto bg-slate-50/60 p-4"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e1 transparent',
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* Section 1: Identification */}
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
                      {Object.keys(BRAND_MODELS).map(b => <option key={b} value={b}>{b}</option>)}
                    </Select>
                    <FieldError msg={errors.brand} />
                  </div>
                  <div>
                    <Label required>Model</Label>
                    <Select value={form.model} error={errors.model} onChange={e => set('model', e.target.value)} disabled={!form.brand}>
                      <option value="">{form.brand ? 'Select Model' : 'Select brand first'}</option>
                      {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                    </Select>
                    <FieldError msg={errors.model} />
                  </div>
                  <div>
                    <Label required>Tyre Size</Label>
                    <Select value={form.tyreSize} error={errors.tyreSize} onChange={e => set('tyreSize', e.target.value)} disabled={!form.model}>
                      <option value="">
                        {!form.brand ? 'Select brand first' : !form.model ? 'Select model first' : availableSizes.length === 0 ? 'No sizes available' : 'Select Size'}
                      </option>
                      {availableSizes.map(s => <option key={s} value={s}>{s}</option>)}
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

                {/* Section 2: Placement & Life */}
                <SectionCard icon={MapPin} title="Placement & Life">
                  <div>
                    <Label required>Current Status</Label>
                    <Select value={form.status} error={errors.status} onChange={e => set('status', e.target.value)}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </Select>
                    <FieldError msg={errors.status} />
                  </div>

                  <div>
                    <Label required={isMounted}>Assign Vehicle</Label>
                    <Select
                      value={form.truckId}
                      error={errors.truckId}
                      disabled={!isMounted}
                      onChange={e => set('truckId', e.target.value)}
                    >
                      <option value="">{isMounted ? 'Select Vehicle' : 'Select Mounted to assign'}</option>
                      {isMounted && vehicles.map(v => {
                        const mounted = activeTyres.filter(a => a.vehicle_id === v.id && a.status === 'Mounted').length;
                        const totalTyres = Number(v.total_tyres || 0);
                        const full = totalTyres > 0 && mounted >= totalTyres;
                        return (
                          <option key={v.id} value={v.id}>
                            {v.vehicle_no} — {v.make || v.model}{full ? ' (Full)' : ` (${mounted}/${v.total_tyres || 0})`}
                          </option>
                        );
                      })}
                    </Select>
                    <FieldError msg={errors.truckId} />
                    <AnimatePresence>
                      {truckWarnMsg && !errors.truckId && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="mt-1.5 text-[11px] text-amber-600 font-semibold flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3 shrink-0 text-amber-500" />{truckWarnMsg}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

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

                  {isMounted && (
                    <div>
                      <Label>Fitted Odometer (km)</Label>
                      <Input
                        type="number"
                        value={form.fittedOdo}
                        error={errors.fittedOdo}
                        readOnly={!!selectedVehicle}
                        onChange={e => set('fittedOdo', e.target.value)}
                        className={`font-mono ${selectedVehicle ? 'bg-slate-50 text-slate-500 cursor-default' : ''}`}
                      />
                      {selectedVehicle ? (
                        <p className="mt-1 text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                          Auto-filled from vehicle current odometer ({currentOdo.toLocaleString()} km)
                        </p>
                      ) : (
                        <p className="mt-1 text-[10px] text-slate-400">Select a vehicle to auto-fill</p>
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

                  {/* Live Health Card */}
                  <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100 p-4">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Live Tyre Preview</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white rounded-xl p-3 border border-blue-100 text-center shadow-sm">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-1.5">
                          <Gauge className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Running KM</p>
                        <p className="text-[13px] font-black text-slate-800 mt-0.5 font-mono">{runningKm.toLocaleString()}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-blue-100 text-center shadow-sm">
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center mx-auto mb-1.5">
                          <Activity className="w-4 h-4 text-indigo-600" />
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Remaining</p>
                        <p className="text-[13px] font-black text-slate-800 mt-0.5 font-mono">{remainingLife.toLocaleString()}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-blue-100 text-center shadow-sm">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1.5
                          ${health.color === 'green' ? 'bg-green-100' : health.color === 'yellow' ? 'bg-yellow-100' : 'bg-red-100'}`}>
                          <ShieldCheck className={`w-4 h-4
                            ${health.color === 'green' ? 'text-green-600' : health.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'}`} />
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Health</p>
                        <span className={`mt-1 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[9.5px] font-black border shadow-sm ${healthBadge[health.color]}`}>
                          {health.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </SectionCard>

                {/* Section 3: Purchase Details */}
                <SectionCard icon={ShoppingBag} title="Purchase Details">
                  <div>
                    <Label>Vendor</Label>
                    <Select
                      value={form.vendorId}
                      onChange={e => {
                        const v = TYRE_VENDORS.find(tv => tv.id === e.target.value);
                        set('vendorId', e.target.value);
                        set('vendor', v?.name || '');
                      }}
                    >
                      <option value="">Select Vendor</option>
                      {TYRE_VENDORS.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </Select>
                  </div>

                  <div>
                    <Label>Purchase Date</Label>
                    <Input
                      type="date"
                      value={form.purchaseDate}
                      error={errors.purchaseDate}
                      max={form.dateOfIssue || today()}
                      onChange={e => set('purchaseDate', e.target.value)}
                    />
                    {form.dateOfIssue && (
                      <p className="mt-1 text-[10px] text-slate-400">
                        Must be on or before date of issue ({new Date(form.dateOfIssue).toLocaleDateString('en-GB')})
                      </p>
                    )}
                    <FieldError msg={errors.purchaseDate} />
                  </div>

                  <div>
                    <Label>Invoice Number</Label>
                    <Input
                      placeholder="e.g. INV-2024-0091"
                      value={form.invoiceNo}
                      error={errors.invoiceNo}
                      maxLength={30}
                      onChange={e => set('invoiceNo', e.target.value.trim().toUpperCase())}
                      className="font-mono"
                    />
                    {form.invoiceNo && !errors.invoiceNo && (
                      <p className="mt-1 text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        Valid invoice format
                      </p>
                    )}
                    <FieldError msg={errors.invoiceNo} />
                  </div>

                  <div>
                    <Label>Tyre Cost</Label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500 pointer-events-none">₹</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={form.tyreCost}
                        error={errors.tyreCost}
                        min="0"
                        onChange={e => set('tyreCost', e.target.value)}
                        className="pl-8 font-mono"
                      />
                    </div>
                    {form.tyreCost && !errors.tyreCost && parseFloat(form.tyreCost) < 1000 && (
                      <p className="mt-1 text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0 text-amber-500" />
                        Tyre cost seems unusually low
                      </p>
                    )}
                    {form.tyreCost && !errors.tyreCost && parseFloat(form.tyreCost) > 100000 && (
                      <p className="mt-1 text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0 text-amber-500" />
                        Please verify tyre cost
                      </p>
                    )}
                    {form.tyreCost && !errors.tyreCost && parseFloat(form.tyreCost) >= 1000 && parseFloat(form.tyreCost) <= 100000 && (
                      <p className="mt-1 text-[10px] text-slate-400">
                        ₹{parseFloat(form.tyreCost).toLocaleString('en-IN')}
                      </p>
                    )}
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

            {/* Footer (unchanged) */}
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200/80 bg-white/90 backdrop-blur-sm shrink-0">
              <p className="text-[10.5px] text-slate-400 font-semibold hidden sm:block">
                Fields marked <span className="text-rose-400">*</span> are required
              </p>
              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  onClick={handleClose}
                  className="h-10 px-5 text-sm font-bold text-slate-500 bg-white border border-slate-200
                    rounded-xl hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700
                    transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDraft}
                  className="h-10 px-5 text-sm font-bold text-slate-100 bg-slate-600 border border-slate-500
                    rounded-xl hover:bg-slate-700 transition-all duration-200 shadow-sm"
                >
                  Save Draft
                </button>
                <button
                  onClick={handleRegister}
                  className="h-10 px-6 text-sm font-extrabold text-white rounded-xl
                    transition-all duration-200 shadow-md shadow-blue-600/25
                    hover:shadow-lg hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0
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