import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, PackagePlus, ChevronRight, Copy, Check, Zap, AlertTriangle, AlertCircle, CheckCircle2, PackageX, UploadCloud, Trash2, Tag, Boxes, Building2, CalendarClock, TrendingUp, User2, Barcode } from 'lucide-react';

const getStockStatus = (stock, minStock, reorderLevel) => {
  const s = Number(stock);
  const min = Number(minStock);
  const reorder = Number(reorderLevel);
  if (s === 0) return { label: 'Out of Stock', color: 'slate', icon: PackageX, insight: 'No units available. Immediate procurement required.' };
  if (s <= min) return { label: 'Low Stock', color: 'yellow', icon: AlertTriangle, insight: 'Stock is at or below minimum level. Consider restocking soon.' };
  if (s <= reorder) return { label: 'Critical', color: 'red', icon: AlertCircle, insight: 'Stock will trigger reorder alerts. Raise a purchase order.' };
  return { label: 'In Stock', color: 'emerald', icon: CheckCircle2, insight: 'Stock level is healthy and within safe limits.' };
};

const STATUS_STYLES = {
  slate:   { badge: 'bg-slate-100 text-slate-600 border-slate-200',   bar: 'bg-slate-400',   card: 'bg-slate-50 border-slate-200',   icon: 'text-slate-500' },
  yellow:  { badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', bar: 'bg-yellow-400',  card: 'bg-yellow-50 border-yellow-200',  icon: 'text-yellow-600' },
  red:     { badge: 'bg-red-100 text-red-700 border-red-200',          bar: 'bg-red-500',     card: 'bg-red-50 border-red-200',        icon: 'text-red-600' },
  emerald: { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500', card: 'bg-emerald-50 border-emerald-200', icon: 'text-emerald-600' },
};

const categories = ['Spares', 'Lubricants', 'Tyres', 'Electrical', 'Batteries', 'Tools', 'Others'];
const units = ['pcs', 'liters', 'kg', 'set', 'box', 'roll'];
const vehicleTypes = ['All', 'Truck', 'Bus', 'Car', 'Two-Wheeler'];
const STEPS = ['Basic', 'Inventory', 'Fleet & Vendor', 'Warehouse'];

const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">{label}</label>
    {children}
    {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}
  </div>
);

const Input = ({ error, ...props }) => (
  <input {...props} className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${error ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200 bg-slate-50 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'}`} />
);

const Select = ({ children, ...props }) => (
  <select {...props} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
    {children}
  </select>
);

const generateSKU = (brand, name) => {
  const b = brand.trim().replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();
  const n = name.trim().replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();
  if (!b && !n) return '';
  const rand = Math.floor(1000 + Math.random() * 9000);
  return [b, n, rand].filter(Boolean).join('-');
};

export default function AddInventoryModal({ isOpen, onClose, onAdd, onEdit, editItem, vendors, warehouseList }) {
  const isEditMode = !!editItem;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '', sku: '', category: 'Spares', description: '', brand: '',
    openingStock: 0, minStock: 5, reorderLevel: 10, unit: 'pcs', costPrice: 0, sellingPrice: 0,
    vehicleType: 'All', compatibleVehicles: '', serviceInterval: '',
    preferredVendor: vendors[0] || '', gst: '', vendorContact: '',
    warehouse: warehouseList?.[0] || 'Main Warehouse', rack: '', bin: '',
    expiryDate: '', warranty: '', notes: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [skuManual, setSkuManual] = useState(false);
  const [autoSku, setAutoSku] = useState('');
  const [copied, setCopied] = useState(false);
  const [partImage, setPartImage] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [vehicleTags, setVehicleTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const fileInputRef = useRef(null);
  const tagInputRef = useRef(null);
  const skuRandRef = useRef(Math.floor(1000 + Math.random() * 9000));

  // Pre-fill form when editItem changes
  useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name || '',
        sku: editItem.partCode || '',
        category: editItem.category || 'Spares',
        description: editItem.description || '',
        brand: editItem.brand || '',
        openingStock: editItem.openingStock ?? 0,
        minStock: editItem.minStock ?? 5,
        reorderLevel: editItem.reorderLevel ?? 10,
        unit: editItem.unit || 'pcs',
        costPrice: editItem.costPrice ?? 0,
        sellingPrice: editItem.sellingPrice ?? 0,
        vehicleType: editItem.vehicleType || 'All',
        compatibleVehicles: '',
        serviceInterval: editItem.serviceInterval || '',
        preferredVendor: editItem.preferredVendor || vendors[0] || '',
        gst: editItem.gst || '',
        vendorContact: editItem.vendorContact || '',
        warehouse: editItem.warehouse || warehouseList?.[0] || 'Main Warehouse',
        rack: editItem.rack || '',
        bin: editItem.bin || '',
        expiryDate: editItem.expiryDate || '',
        warranty: editItem.warranty || '',
        notes: editItem.notes || '',
      });
      setSkuManual(true);
      setAutoSku(editItem.partCode || '');
      setVehicleTags(editItem.compatibleVehicles || []);
      setStep(0);
      setSaved(false);
    }
  }, [editItem]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // Auto-generate SKU live when brand or name changes
  useEffect(() => {
    if (skuManual) return;
    const b = form.brand.trim().replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();
    const n = form.name.trim().replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();
    if (!b && !n) { setAutoSku(''); return; }
    const generated = [b, n, skuRandRef.current].filter(Boolean).join('-');
    setAutoSku(generated);
  }, [form.brand, form.name, skuManual]);

  const handleSkuChange = (v) => {
    if (v === '') {
      setSkuManual(false);
      set('sku', '');
    } else {
      setSkuManual(true);
      set('sku', v);
    }
  };

  const activeSku = skuManual ? form.sku : autoSku;

  const handleCopySku = () => {
    if (!activeSku) return;
    navigator.clipboard.writeText(activeSku).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => setPartImage(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleImageFile(e.dataTransfer.files[0]);
  };

  if (!isOpen) return null;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.brand.trim()) e.brand = 'Required';
    if (form.costPrice < 0) e.costPrice = 'Must be positive';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setForm({ name: '', sku: '', category: 'Spares', description: '', brand: '', openingStock: 0, minStock: 5, reorderLevel: 10, unit: 'pcs', costPrice: 0, sellingPrice: 0, vehicleType: 'All', compatibleVehicles: '', serviceInterval: '', preferredVendor: vendors[0] || '', gst: '', vendorContact: '', warehouse: warehouseList?.[0] || 'Main Warehouse', rack: '', bin: '', expiryDate: '', warranty: '', notes: '' });
    setSkuManual(false); setAutoSku(''); setPartImage(null); setVehicleTags([]); setTagInput('');
    skuRandRef.current = Math.floor(1000 + Math.random() * 9000);
    setStep(0); setErrors({});
  };

  const handleSubmit = () => {
    if (!validate()) { setStep(0); return; }
    setSaving(true);
    setTimeout(() => {
      if (isEditMode) {
        onEdit && onEdit(editItem.id, { ...form, sku: activeSku, compatibleVehicles: vehicleTags });
      } else {
        onAdd({ ...form, sku: activeSku, compatibleVehicles: vehicleTags });
      }
      setSaving(false);
      setSaved(true);
    }, 1400);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[90vh] flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600">
            <div className="flex items-center gap-3">
              <PackagePlus className="h-5 w-5 text-white" />
              <div>
                <h2 className="text-base font-bold text-white">{isEditMode ? 'Edit Part' : 'Add New Part'}</h2>
                <p className="text-xs text-indigo-200">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-xl bg-white/20 p-2 text-white hover:bg-white/30 transition"><X className="h-4 w-4" /></button>
          </div>

          {/* Step indicator */}
          <div className="flex border-b border-slate-100">
            {STEPS.map((s, i) => (
              <button key={s} onClick={() => setStep(i)} className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition ${i === step ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : i < step ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:bg-slate-50'}`}>
                {i < step ? '✓ ' : ''}{s}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {/* SUCCESS SCREEN */}
            <AnimatePresence>
              {saved && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center justify-center py-10 gap-5"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                    className="h-20 w-20 rounded-full bg-emerald-100 border-4 border-emerald-200 flex items-center justify-center shadow-lg"
                  >
                    <Check className="h-9 w-9 text-emerald-600" strokeWidth={3} />
                  </motion.div>
                  <div className="text-center">
                    <p className="text-lg font-black text-slate-800">{isEditMode ? 'Part Updated Successfully!' : 'Part Added Successfully!'}</p>
                    <p className="text-xs text-slate-400 mt-1">{form.name || 'Part'} has been {isEditMode ? 'updated' : 'added to inventory'}.</p>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => { setSaved(false); resetForm(); onClose(); }}
                      className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                    >
                      {isEditMode ? 'Close' : 'View Inventory'}
                    </button>
                    {!isEditMode && (
                    <button
                      onClick={() => { setSaved(false); resetForm(); }}
                      className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition shadow-sm"
                    >
                      + Add Another Part
                    </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!saved && (<>
            {step === 0 && (
              <div className="grid grid-cols-2 gap-4">

                {/* Image Upload */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Part Image</label>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e.target.files[0])} />

                  <AnimatePresence mode="wait">
                    {partImage ? (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <div className="relative shrink-0">
                          <img src={partImage} alt="Part" className="h-16 w-16 rounded-full object-cover border-2 border-indigo-200 shadow-md" />
                          <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 text-white" />
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-700">Image uploaded</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Click remove to change the image</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPartImage(null)}
                          className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="dropzone"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 transition ${
                          dragOver
                            ? 'border-indigo-400 bg-indigo-50'
                            : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50'
                        }`}
                      >
                        <motion.div
                          animate={dragOver ? { scale: 1.15 } : { scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                          className="rounded-full bg-indigo-100 p-3"
                        >
                          <UploadCloud className="h-5 w-5 text-indigo-500" />
                        </motion.div>
                        <p className="text-xs font-semibold text-slate-600">
                          {dragOver ? 'Drop to upload' : 'Drag & drop or click to upload'}
                        </p>
                        <p className="text-[10px] text-slate-400">PNG, JPG, WEBP — max 5MB</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="col-span-2"><Field label="Part Name *" error={errors.name}><Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Brake Pads" error={errors.name} /></Field></div>
                <Field label="Brand *" error={errors.brand}><Input value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="e.g. Bosch" error={errors.brand} /></Field>
                <Field label="SKU / Part Code">
                  <div className="relative">
                    <Input
                      value={skuManual ? form.sku : autoSku}
                      onChange={(e) => handleSkuChange(e.target.value)}
                      placeholder="Auto-generated from Brand + Name"
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition font-mono ${
                        !skuManual && autoSku ? 'border-violet-200 bg-violet-50 text-violet-700' : 'border-slate-200 bg-slate-50'
                      } focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100`}
                    />
                    {activeSku && (
                      <button
                        type="button"
                        onClick={handleCopySku}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                        title="Copy SKU"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    {!skuManual && autoSku ? (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1.5"
                      >
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-bold text-violet-700">
                          <Zap className="h-2.5 w-2.5" /> Auto-generated
                        </span>
                        <span className="font-mono text-[11px] font-bold text-violet-600 tracking-widest">{autoSku}</span>
                      </motion.div>
                    ) : (
                      <p className="text-[10px] text-slate-400">Unique inventory identifier. Leave empty to auto-generate.</p>
                    )}
                    {skuManual && (
                      <button
                        type="button"
                        onClick={() => { setSkuManual(false); set('sku', ''); }}
                        className="ml-auto text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition"
                      >
                        Reset to auto
                      </button>
                    )}
                  </div>
                </Field>
                <Field label="Category"><Select value={form.category} onChange={(e) => set('category', e.target.value)}>{categories.map((c) => <option key={c}>{c}</option>)}</Select></Field>
                <Field label="Unit"><Select value={form.unit} onChange={(e) => set('unit', e.target.value)}>{units.map((u) => <option key={u}>{u}</option>)}</Select></Field>
                <div className="col-span-2"><Field label="Description"><textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} placeholder="Brief description..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none" /></Field></div>
              </div>
            )}

            {step === 1 && (() => {
              const status = getStockStatus(form.openingStock, form.minStock, form.reorderLevel);
              const st = STATUS_STYLES[status.color];
              const StatusIcon = status.icon;
              return (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Opening Stock"><Input type="number" min="0" value={form.openingStock} onChange={(e) => set('openingStock', Number(e.target.value))} /></Field>
                  <Field label="Minimum Stock"><Input type="number" min="0" value={form.minStock} onChange={(e) => set('minStock', Number(e.target.value))} /></Field>
                  <Field label="Reorder Level"><Input type="number" min="0" value={form.reorderLevel} onChange={(e) => set('reorderLevel', Number(e.target.value))} /></Field>

                  {/* Live Stock Status Badge */}
                  <div className="col-span-2">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={status.label}
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                        className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${st.card}`}
                      >
                        <StatusIcon className={`mt-0.5 h-4 w-4 shrink-0 ${st.icon}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide ${st.badge}`}>
                              {status.label}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {form.openingStock} {form.unit} opening · min {form.minStock} · reorder at {form.reorderLevel}
                            </span>
                          </div>
                          <p className={`mt-1 text-[11px] font-medium ${st.icon}`}>{status.insight}</p>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <Field label="Cost Price (₹)" error={errors.costPrice}><Input type="number" min="0" value={form.costPrice} onChange={(e) => set('costPrice', Number(e.target.value))} error={errors.costPrice} /></Field>
                  <Field label="Selling Price (₹)"><Input type="number" min="0" value={form.sellingPrice} onChange={(e) => set('sellingPrice', Number(e.target.value))} /></Field>

                  {/* Live Inventory Value + Profit Card */}
                  {(form.costPrice > 0 || form.sellingPrice > 0) && (() => {
                    const invValue = form.openingStock * form.costPrice;
                    const profit = form.sellingPrice - form.costPrice;
                    const profitPct = form.costPrice > 0 ? ((profit / form.costPrice) * 100).toFixed(1) : 0;
                    const isProfit = profit >= 0;
                    const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');
                    return (
                      <motion.div
                        key="inv-calc"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="col-span-2 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-4"
                      >
                        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-3">Live Calculations</p>
                        <div className="grid grid-cols-2 gap-3">
                          {/* Inventory Value */}
                          <div className="rounded-lg bg-white border border-indigo-100 px-3 py-2.5">
                            <p className="text-[10px] text-slate-400 font-medium mb-1">Inventory Value</p>
                            <AnimatePresence mode="wait">
                              <motion.p
                                key={invValue}
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="text-base font-black text-indigo-700"
                              >
                                {fmt(invValue)}
                              </motion.p>
                            </AnimatePresence>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {form.openingStock} × {fmt(form.costPrice)}
                            </p>
                          </div>

                          {/* Profit Margin */}
                          <div className={`rounded-lg bg-white border px-3 py-2.5 ${
                            isProfit ? 'border-emerald-100' : 'border-red-100'
                          }`}>
                            <p className="text-[10px] text-slate-400 font-medium mb-1">Profit Margin</p>
                            <AnimatePresence mode="wait">
                              <motion.p
                                key={profit}
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className={`text-base font-black ${
                                  isProfit ? 'text-emerald-600' : 'text-red-600'
                                }`}
                              >
                                {isProfit ? '+' : ''}{fmt(profit)}
                              </motion.p>
                            </AnimatePresence>
                            <p className={`text-[10px] mt-0.5 font-semibold ${
                              isProfit ? 'text-emerald-500' : 'text-red-400'
                            }`}>
                              {isProfit ? '▲' : '▼'} {Math.abs(profitPct)}% {isProfit ? 'margin' : 'loss'}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })()}

                  <Field label="Expiry Date"><Input type="date" value={form.expiryDate} onChange={(e) => set('expiryDate', e.target.value)} /></Field>
                  <Field label="Warranty"><Input value={form.warranty} onChange={(e) => set('warranty', e.target.value)} placeholder="e.g. 1 Year" /></Field>
                </div>
              );
            })()}

            {step === 2 && (() => {
              const allVehicles = ['AP21TY4455','KA01AA0001','TS09AB9988','MH12CD5678','TN07GH3321','DL01AB1234'];
              const suggestions = allVehicles.filter(
                (v) => v.toLowerCase().includes(tagInput.toLowerCase()) && !vehicleTags.includes(v)
              );
              const addTag = (val) => {
                const v = val.trim().toUpperCase();
                if (!v || vehicleTags.includes(v)) return;
                setVehicleTags((p) => [...p, v]);
                setTagInput('');
                setShowSuggestions(false);
                tagInputRef.current?.focus();
              };
              const removeTag = (v) => setVehicleTags((p) => p.filter((t) => t !== v));
              return (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Vehicle Type"><Select value={form.vehicleType} onChange={(e) => set('vehicleType', e.target.value)}>{vehicleTypes.map((v) => <option key={v}>{v}</option>)}</Select></Field>
                  <Field label="Service Interval"><Input value={form.serviceInterval} onChange={(e) => set('serviceInterval', e.target.value)} placeholder="e.g. Every 10,000 km" /></Field>

                  {/* Tag Input */}
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Compatible Vehicles</label>
                    <div
                      className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 flex flex-wrap gap-1.5 cursor-text focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition"
                      onClick={() => tagInputRef.current?.focus()}
                    >
                      <AnimatePresence>
                        {vehicleTags.map((tag) => (
                          <motion.span
                            key={tag}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.7 }}
                            transition={{ duration: 0.15 }}
                            className="inline-flex items-center gap-1 rounded-lg bg-indigo-100 border border-indigo-200 px-2 py-0.5 text-[11px] font-bold text-indigo-700"
                          >
                            {tag}
                            <button type="button" onClick={(e) => { e.stopPropagation(); removeTag(tag); }} className="ml-0.5 rounded text-indigo-400 hover:text-red-500 transition">
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                      <input
                        ref={tagInputRef}
                        value={tagInput}
                        onChange={(e) => { setTagInput(e.target.value); setShowSuggestions(true); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); } if (e.key === 'Backspace' && !tagInput) removeTag(vehicleTags[vehicleTags.length - 1]); }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        placeholder={vehicleTags.length === 0 ? 'Type vehicle number, press Enter…' : ''}
                        className="flex-1 min-w-[140px] bg-transparent text-sm outline-none text-slate-700 placeholder:text-slate-400"
                      />
                    </div>

                    {/* Suggestions Dropdown */}
                    <AnimatePresence>
                      {showSuggestions && suggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.12 }}
                          className="mt-1 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-10 relative"
                        >
                          {suggestions.map((v) => (
                            <button
                              key={v}
                              type="button"
                              onMouseDown={() => addTag(v)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                              {v}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <p className="mt-1 text-[10px] text-slate-400">Press Enter or select from suggestions to add a vehicle.</p>
                  </div>

                  <Field label="Preferred Vendor"><Select value={form.preferredVendor} onChange={(e) => set('preferredVendor', e.target.value)}>{vendors.map((v) => <option key={v}>{v}</option>)}</Select></Field>
                  <Field label="GST Number"><Input value={form.gst} onChange={(e) => set('gst', e.target.value)} placeholder="Vendor GST" /></Field>
                  <div className="col-span-2"><Field label="Vendor Contact"><Input value={form.vendorContact} onChange={(e) => set('vendorContact', e.target.value)} placeholder="+91 XXXXX XXXXX" /></Field></div>
                </div>
              );
            })()}

            {step === 3 && (() => {
              const status = getStockStatus(form.openingStock, form.minStock, form.reorderLevel);
              const st = STATUS_STYLES[status.color];
              const invValue = form.openingStock * form.costPrice;
              const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');
              const activeSKU = skuManual ? form.sku : autoSku;
              const CATEGORY_COLORS = { Spares: 'bg-blue-100 text-blue-700', Lubricants: 'bg-amber-100 text-amber-700', Tyres: 'bg-slate-100 text-slate-700', Electrical: 'bg-yellow-100 text-yellow-700', Batteries: 'bg-red-100 text-red-700', Tools: 'bg-violet-100 text-violet-700', Others: 'bg-slate-100 text-slate-600' };
              return (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Warehouse"><Select value={form.warehouse} onChange={(e) => set('warehouse', e.target.value)}>{(warehouseList || []).map((w) => <option key={w}>{w}</option>)}</Select></Field>
                  <Field label="Storage Rack"><Input value={form.rack} onChange={(e) => set('rack', e.target.value)} placeholder="e.g. R-A1" /></Field>
                  <Field label="Bin Number"><Input value={form.bin} onChange={(e) => set('bin', e.target.value)} placeholder="e.g. B-01" /></Field>
                  <div className="col-span-2"><Field label="Notes"><textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} placeholder="Additional notes..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none" /></Field></div>

                  {/* ── SUMMARY CARD ── */}
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Part Summary</p>
                    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 shadow-sm overflow-hidden">

                      {/* Top identity row */}
                      <div className="flex items-center gap-4 px-4 pt-4 pb-3 border-b border-indigo-100">
                        {/* Image or placeholder */}
                        <div className="shrink-0">
                          {partImage
                            ? <img src={partImage} alt="part" className="h-14 w-14 rounded-xl object-cover border-2 border-indigo-200 shadow" />
                            : <div className="h-14 w-14 rounded-xl bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center"><PackagePlus className="h-6 w-6 text-indigo-400" /></div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-800 truncate">{form.name || <span className="text-slate-300">Part Name</span>}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{form.brand || '—'}</p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {activeSKU && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-violet-100 border border-violet-200 px-2 py-0.5 text-[10px] font-bold text-violet-700 font-mono">
                                <Barcode className="h-2.5 w-2.5" />{activeSKU}
                              </span>
                            )}
                            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${CATEGORY_COLORS[form.category] || 'bg-slate-100 text-slate-600'}`}>
                              {form.category}
                            </span>
                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${st.badge}`}>
                              {status.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Metrics grid */}
                      <div className="grid grid-cols-3 divide-x divide-indigo-100 border-b border-indigo-100">
                        {[
                          { icon: Boxes, label: 'Opening Stock', value: `${form.openingStock} ${form.unit}`, color: 'text-indigo-700' },
                          { icon: TrendingUp, label: 'Inventory Value', value: fmt(invValue), color: 'text-emerald-700' },
                          { icon: Tag, label: 'Cost Price', value: fmt(form.costPrice), color: 'text-slate-700' },
                        ].map(({ icon: Icon, label, value, color }) => (
                          <div key={label} className="flex flex-col items-center py-3 px-2 gap-0.5">
                            <Icon className={`h-3.5 w-3.5 mb-1 ${color}`} />
                            <p className={`text-sm font-black ${color}`}>{value}</p>
                            <p className="text-[9px] text-slate-400 font-medium text-center">{label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Detail rows */}
                      <div className="px-4 py-3 space-y-2">
                        {[
                          { icon: User2,        label: 'Vendor',    value: form.preferredVendor || '—' },
                          { icon: Building2,    label: 'Warehouse', value: [form.warehouse, form.rack, form.bin].filter(Boolean).join(' · ') || '—' },
                          { icon: CalendarClock,label: 'Expiry',    value: form.expiryDate || 'Not set' },
                        ].map(({ icon: Icon, label, value }) => (
                          <div key={label} className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 text-slate-400 font-medium"><Icon className="h-3 w-3" />{label}</span>
                            <span className="font-semibold text-slate-700 text-right max-w-[55%] truncate">{value}</span>
                          </div>
                        ))}
                        {vehicleTags.length > 0 && (
                          <div className="flex items-start justify-between text-xs pt-0.5">
                            <span className="text-slate-400 font-medium shrink-0">Vehicles</span>
                            <div className="flex flex-wrap gap-1 justify-end">
                              {vehicleTags.map((t) => (
                                <span key={t} className="rounded-md bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600">{t}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
            </>)}
          </div>

          {/* Footer */}
          {!saved && (
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
            <button onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
            <div className="flex gap-2">
              {step > 0 && <button onClick={() => setStep((s) => s - 1)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 transition">Back</button>}
              {step < STEPS.length - 1
                ? <button onClick={() => setStep((s) => s + 1)} className="flex items-center gap-1 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition">Next <ChevronRight className="h-4 w-4" /></button>
                : <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition disabled:opacity-70 disabled:cursor-not-allowed min-w-[130px] justify-center">
                    {saving
                      ? <><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> {isEditMode ? 'Saving…' : 'Saving Part…'}</>
                      : isEditMode ? 'Save Changes' : 'Save Part'
                    }
                  </button>
              }
            </div>
          </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
