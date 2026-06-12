import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Eye, Download, FileText, Pencil, Save, XCircle, UploadCloud, ChevronDown } from 'lucide-react';

// ── Constants (mirrors AddWarrantyModal) ─────────────────────────────────────
const CATEGORIES = ['Battery', 'Engine', 'Tyres', 'Brakes', 'Transmission', 'Electrical', 'AC System', 'Suspension', 'Fuel System', 'Other'];

const BRANDS_BY_CATEGORY = {
  Battery:      ['Amaron', 'Exide', 'Bosch'],
  Engine:       ['Tata', 'Cummins', 'Ashok Leyland', 'Mahindra'],
  Tyres:        ['MRF', 'Apollo', 'Ceat', 'Bridgestone'],
  Brakes:       ['Bosch', 'Tata', 'Wabco'],
  Transmission: ['ZF', 'Eaton', 'Tata'],
  Electrical:   ['Bosch', 'Denso', 'Valeo'],
  'AC System':  ['Carrier', 'Voltas', 'Mahindra'],
  Suspension:   ['Gabriel', 'Monroe', 'Tata'],
  'Fuel System':['Bosch', 'Delphi', 'Denso'],
  Other:        ['Tata', 'Mahindra', 'Bosch'],
};

const MODELS_BY_CATEGORY = {
  Battery:      ['HD Battery 150Ah', 'Pro Series 180Ah', 'SuperMax 200Ah', 'HeavyDuty 120Ah'],
  Engine:       ['Cummins X15', 'Tata Turbo Engine', 'Ashok Leyland H Series', 'Mahindra mHawk'],
  Tyres:        ['MRF ZLX', 'Apollo EnduRace', 'Ceat LoadMax', 'Bridgestone R150'],
  Brakes:       ['Bosch Brake Pro', 'Tata Air Brake Kit', 'Wabco ABS Module'],
  Transmission: ['ZF 16S', 'Eaton Fuller 10-Speed', 'Tata GBS40'],
  Electrical:   ['Bosch Alternator 24V', 'Denso Starter Motor', 'Valeo Wiper System'],
  'AC System':  ['Carrier ACX', 'Voltas HeavyCool', 'Mahindra CoolMax'],
  Suspension:   ['Gabriel HD Shock', 'Monroe OESpectrum', 'Tata Leaf Spring Kit'],
  'Fuel System':['Bosch Common Rail', 'Delphi Fuel Pump', 'Denso Injector Set'],
  Other:        ['Generic Part A', 'Generic Part B'],
};

const catStyles = {
  Battery:      'bg-blue-100   text-blue-700',
  Tyres:        'bg-indigo-100 text-indigo-700',
  Parts:        'bg-orange-100 text-orange-600',
  Lubricants:   'bg-purple-100 text-purple-700',
  Engine:       'bg-red-100    text-red-700',
  Electrical:   'bg-yellow-100 text-yellow-700',
  Brakes:       'bg-pink-100   text-pink-700',
  'AC System':  'bg-cyan-100   text-cyan-700',
  Suspension:   'bg-lime-100   text-lime-700',
  'Fuel System':'bg-amber-100  text-amber-700',
  Other:        'bg-slate-100  text-slate-600',
};

const statusStyles = {
  Active:          'bg-green-50  text-green-600  border border-green-200',
  Expired:         'bg-red-50    text-red-500    border border-red-200',
  Replaced:        'bg-slate-100 text-slate-500  border border-slate-200',
  'Expiring Soon': 'bg-orange-50 text-orange-500 border border-orange-200',
  Claimed:         'bg-purple-50 text-purple-600 border border-purple-200',
  Void:            'bg-slate-100 text-slate-400  border border-slate-200',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
};

const toInputDate = (d) => {
  if (!d) return '';
  // Slice the date part directly to avoid UTC timezone shift
  try { return String(d).slice(0, 10); }
  catch { return ''; }
};

const buildFileUrl = (val) => {
  if (!val) return null;
  const clean = String(val).replace(/^["'[\]]+|["'[\]]+$/g, '').replace(/^uploads\//, '');
  return `http://localhost:5001/${clean}`;
};

const getDisplayFileName = (val) => {
  if (!val) return 'Document';
  const clean = String(val).replace(/^["'[\]]+|["'[\]]+$/g, '');
  const name = clean.split(/[/\\]/).pop() || 'Document';
  return name.length > 35 ? name.slice(0, 32) + '...' : name;
};

// ── Shared style strings ──────────────────────────────────────────────────────
const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-slate-300';
const selectCls = inputCls + ' appearance-none pr-7 cursor-pointer';

// ── Sub-components ────────────────────────────────────────────────────────────
const SectionTitle = ({ children }) => (
  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 pb-1.5 border-b border-slate-100">{children}</p>
);

// Readonly display box
const Field = ({ label, children }) => (
  <div>
    <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
    <div className="border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-sm font-medium text-slate-700 min-h-[36px] flex items-center">
      {children || <span className="text-slate-300">—</span>}
    </div>
  </div>
);

// Editable input
const Inp = ({ label, required, ...props }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 mb-1">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <input {...props} className={inputCls} />
  </div>
);

// Editable select
const Sel = ({ label, required, value, onChange, disabled, children }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 mb-1">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <div className="relative">
      <select value={value} onChange={onChange} disabled={disabled}
        className={selectCls + (disabled ? ' opacity-50 cursor-not-allowed bg-slate-50' : '')}>
        {children}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  </div>
);

// Upload box (edit mode)
const UploadBox = ({ label, onChange, fileName }) => (
  <label className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center bg-white hover:border-green-400 hover:bg-green-50/30 transition-colors cursor-pointer group block">
    <UploadCloud className="w-4 h-4 mx-auto mb-1 text-green-600 group-hover:scale-110 transition-transform" />
    <p className="text-xs font-semibold text-slate-600">{label}</p>
    <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, PDF · Max 5MB</p>
    {fileName && <p className="mt-1 text-[11px] font-semibold text-green-700 truncate">{fileName}</p>}
    <input type="file" hidden onChange={onChange} />
  </label>
);

// Attachment view card (view mode)
const AttachCard = ({ label, fileVal }) => {
  const url  = buildFileUrl(fileVal);
  const name = getDisplayFileName(fileVal);
  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white">
      <p className="text-xs font-semibold text-slate-500 mb-2">{label}</p>
      {url ? (
        <>
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 mb-2">
            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px] text-slate-600 font-medium truncate">{name}</span>
          </div>
          <div className="flex gap-2">
            <a href={url} target="_blank" rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-green-700 hover:bg-green-50 transition-colors">
              <Eye className="w-3.5 h-3.5" /> View
            </a>
            <a href={url} download
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              <Download className="w-3.5 h-3.5" /> Download
            </a>
          </div>
        </>
      ) : (
        <p className="text-xs text-slate-300 text-center py-3">No file uploaded</p>
      )}
    </div>
  );
};

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function ViewWarrantyModal({ isOpen, onClose, itemData, onUpdated }) {
  const [editing, setEditing]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [showrooms, setShowrooms] = useState([]);
  const [fd, setFd]             = useState({});
  const [files, setFiles]       = useState({ warrantyCard: null, invoiceFile: null });

  // Populate form when itemData changes or edit mode opens
  useEffect(() => {
    if (!itemData) return;
    const d = itemData;
    setFd({
      category:       d.category       || '',
      brand:          d.brand          || '',
      model:          d.model          || '',
      serial_no:      d.serial_no      || '',
      vehicle_id:     d.vehicle_id     || '',
      vehicle_no:     d.vehicle_no     || '',
      dealerShowroom: d.dealer_showroom || '',
      odometer:       d.odometer       || '',
      startDate:      toInputDate(d.start_date),
      endDate:        toInputDate(d.end_date),
      warrantyPeriod: d.warranty_period || '',
      description:    d.description || d.item_description || '',
    });
    setFiles({ warrantyCard: null, invoiceFile: null });
    setEditing(false);
  }, [itemData]);

  // Fetch vehicles and showrooms for the edit form
  useEffect(() => {
    fetch('http://localhost:5001/api/vehicles')
      .then(r => r.json())
      .then(data => { if (data.success) setVehicles(data.data || []); })
      .catch(err => console.error('FETCH VEHICLES ERROR:', err));

    fetch('http://localhost:5001/api/showrooms')
      .then(r => r.json())
      .then(data => { if (data.success) setShowrooms(data.data || []); })
      .catch(err => console.error('FETCH SHOWROOMS ERROR:', err));
  }, []);

  if (!isOpen || !itemData) return null;

  const d      = itemData;
  const status = d.warranty_status || '—';
  const set    = (f, v) => setFd(p => ({ ...p, [f]: v }));

  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setFd(p => ({ ...p, category: cat, brand: '', model: '' }));
  };

  const handleVehicleChange = (e) => {
    const selected = vehicles.find(v => v.id === Number(e.target.value));
    setFd(p => ({
      ...p,
      vehicle_id:     selected?.id              || '',
      vehicle_no:     selected?.vehicle_no      || '',
      dealerShowroom: selected?.dealer_showroom || p.dealerShowroom || '',
    }));
  };

  const handleSave = async () => {
    const warrantyId = d.id;
    if (!warrantyId) {
      alert('Cannot update: warranty ID is missing.');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('category',        fd.category);
      formData.append('brand',           fd.brand);
      formData.append('model',           fd.model);
      formData.append('serial_no',       fd.serial_no);
      formData.append('vehicle_id',      fd.vehicle_id);
      formData.append('vehicle_no',      fd.vehicle_no);
      formData.append('dealer_showroom',  fd.dealerShowroom);
      formData.append('odometer',        fd.odometer);
      formData.append('start_date',      fd.startDate);
      formData.append('end_date',        fd.endDate);
      formData.append('warranty_period', fd.warrantyPeriod);
      formData.append('description',     fd.description);
      if (files.warrantyCard) formData.append('warranty_card', files.warrantyCard);
      if (files.invoiceFile)  formData.append('invoice_file',  files.invoiceFile);

      const res = await fetch(`http://localhost:5001/api/warranties/${warrantyId}`, { method: 'PUT', body: formData });

      if (!res.ok) {
        const text = await res.text();
        console.error('Server response:', res.status, text);
        alert(`Server error ${res.status}: ${res.statusText}`);
        return;
      }

      const data = await res.json();
      if (data.success) {
        setEditing(false);
        onUpdated?.();
      } else {
        alert(data.message || 'Failed to update warranty');
      }
    } catch (err) {
      console.error('UPDATE WARRANTY ERROR:', err);
      alert('Server Error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form back to original data
    setFd({
      category:       d.category       || '',
      brand:          d.brand          || '',
      model:          d.model          || '',
      serial_no:      d.serial_no      || '',
      vehicle_id:     d.vehicle_id     || '',
      vehicle_no:     d.vehicle_no     || '',
      dealerShowroom: d.dealer_showroom || '',
      odometer:       d.odometer       || '',
      startDate:      toInputDate(d.start_date),
      endDate:        toInputDate(d.end_date),
      warrantyPeriod: d.warranty_period || '',
      description:    d.description || d.item_description || '',
    });
    setFiles({ warrantyCard: null, invoiceFile: null });
    setEditing(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.16 }}
          className="w-full max-w-3xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[92vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#1a4731] px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  {editing ? 'Edit Warranty' : 'Warranty Details'}
                </h2>
                <p className="text-[11px] text-green-300 font-mono mt-0.5">{d.warranty_number || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!editing && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusStyles[status] || statusStyles.Void}`}>
                  {status}
                </span>
              )}
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
              )}
              <button onClick={onClose}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors ml-1">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 bg-white">

            {/* ── VIEW MODE ── */}
            {!editing && (
              <>
                <div>
                  <SectionTitle>Basic Details</SectionTitle>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Category">
                      {d.category && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide ${catStyles[d.category] || catStyles.Other}`}>
                          {d.category}
                        </span>
                      )}
                    </Field>
                    <Field label="Vehicle Number">{d.vehicle_no}</Field>
                    <Field label="Brand">{d.brand}</Field>
                    <Field label="Model">{d.model}</Field>
                    <Field label="Dealer / Showroom">{d.dealer_showroom || '—'}</Field>
                    <Field label="Serial Number">
                      <span className="font-mono text-xs">{d.serial_no}</span>
                    </Field>
                  </div>
                </div>

                <div>
                  <SectionTitle>Warranty Details</SectionTitle>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Start Date">{formatDate(d.start_date)}</Field>
                    <Field label="End Date">{formatDate(d.end_date)}</Field>
                    <Field label="Odometer (KM)">{d.odometer ? `${Number(d.odometer).toLocaleString()} km` : null}</Field>
                    <Field label="Warranty Period">{d.warranty_period}</Field>
                  </div>
                </div>

                <div>
                  <SectionTitle>Attachments</SectionTitle>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <AttachCard label="Warranty Card" fileVal={d.warranty_card} />
                    <AttachCard label="Invoice / Bill" fileVal={d.invoice_file} />
                  </div>
                </div>

                <div>
                  <SectionTitle>Description / Notes</SectionTitle>
                  <div className="border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 text-sm text-slate-700 min-h-[72px] leading-relaxed">
                    {d.description || d.item_description || <span className="text-slate-300">No description provided.</span>}
                  </div>
                </div>
              </>
            )}

            {/* ── EDIT MODE ── */}
            {editing && (
              <>
                <div>
                  <SectionTitle>Basic Details</SectionTitle>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Sel label="Category" required value={fd.category} onChange={handleCategoryChange}>
                      <option value="">Select Category</option>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </Sel>
                    <Sel label="Truck / Vehicle" required value={fd.vehicle_id} onChange={handleVehicleChange}>
                      <option value="">Select Vehicle</option>
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_no}</option>)}
                    </Sel>
                    <Sel label="Brand" required value={fd.brand} onChange={e => set('brand', e.target.value)} disabled={!fd.category}>
                      <option value="">{fd.category ? 'Select Brand' : 'Select category first'}</option>
                      {(BRANDS_BY_CATEGORY[fd.category] || []).map(b => <option key={b}>{b}</option>)}
                    </Sel>
                    <Sel label="Model" required value={fd.model} onChange={e => set('model', e.target.value)} disabled={!fd.category}>
                      <option value="">{fd.category ? 'Select Model' : 'Select category first'}</option>
                      {(MODELS_BY_CATEGORY[fd.category] || []).map(m => <option key={m}>{m}</option>)}
                    </Sel>
                    <Sel label="Dealer / Showroom" value={fd.dealerShowroom} onChange={e => set('dealerShowroom', e.target.value)}>
                      <option value="">Select Showroom</option>
                      {showrooms.map(s => (
                        <option key={s.id} value={s.showroom_name}>{s.showroom_name}</option>
                      ))}
                    </Sel>
                    <Inp label="Serial Number" value={fd.serial_no} onChange={e => set('serial_no', e.target.value)} placeholder="e.g. SN1234567890" />
                  </div>
                </div>

                <div>
                  <SectionTitle>Warranty Details</SectionTitle>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Inp label="Start Date" required type="date" value={fd.startDate} onChange={e => set('startDate', e.target.value)} />
                    <Inp label="End Date"   required type="date" value={fd.endDate}   onChange={e => set('endDate',   e.target.value)} />
                    <Inp label="Odometer (KM)" type="number" value={fd.odometer} onChange={e => set('odometer', e.target.value)} placeholder="e.g. 45680" />
                    <Inp label="Warranty Period" value={fd.warrantyPeriod} onChange={e => set('warrantyPeriod', e.target.value)} placeholder="e.g. 24 Months" />
                  </div>
                </div>

                <div>
                  <SectionTitle>Attachments</SectionTitle>
                  <p className="text-[11px] text-slate-400 mb-2">Upload a new file to replace the existing one. Leave empty to keep current.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <UploadBox
                      label="Warranty Card"
                      fileName={files.warrantyCard?.name || getDisplayFileName(d.warranty_card)}
                      onChange={e => setFiles(p => ({ ...p, warrantyCard: e.target.files[0] }))}
                    />
                    <UploadBox
                      label="Invoice / Bill"
                      fileName={files.invoiceFile?.name || getDisplayFileName(d.invoice_file)}
                      onChange={e => setFiles(p => ({ ...p, invoiceFile: e.target.files[0] }))}
                    />
                  </div>
                </div>

                <div>
                  <SectionTitle>Description / Notes</SectionTitle>
                  <textarea
                    value={fd.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="Add any notes or description (optional)..."
                    rows={3}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none placeholder-slate-300"
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between bg-white shrink-0">
            {editing ? (
              <>
                <button onClick={handleCancelEdit}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                  <XCircle className="w-4 h-4" /> Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-[#1a4731] hover:bg-[#153d28] text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button onClick={onClose}
                className="ml-auto px-5 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Close
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
