import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, AlertCircle, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { layoutPositions } from '../data/dummyData';

const today = () => new Date().toISOString().split('T')[0];

const BRANDS    = ['Apollo','MRF','Ceat','JK Tyre','Bridgestone','Michelin','Goodyear','Continental'];
const SIZES     = ['295/90R20','1000x20','12R22.5','11R22.5','315/80R22.5'];
const MATERIALS = ['Radial','Radial Tubeless','Bias Ply','Tube Type'];
const REASONS   = ['Worn Out','Burst','Puncture','Sidewall Damage','Rotation','Imported Old Record'];
const STATUSES  = [
  { value: 'SCRAP',      label: 'Scrap'      },
  { value: 'REUSABLE',   label: 'Reusable'   },
  { value: 'RETREADING', label: 'Retreading' },
  { value: 'OLD_STOCK',  label: 'Old Stock'  },
];
const LOCATIONS = ['Scrap Yard','Retreading Area','Reusable Storage','Warehouse Old Stock'];
const PLACEMENTS = layoutPositions.map(p => ({ id: p.id, label: p.label }));

const EMPTY = {
  tyreNo: '', brand: '', model: '', tyreSize: '', material: '',
  vehicleId: null, vehicleNo: '', lastPosition: '', removedDate: '',
  runningKm: '', expectedLife: '', remainingTread: '',
  status: 'OLD_STOCK', storeLocation: '', removalReason: '', notes: '',
};

function Err({ msg }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-[11px] text-red-500 font-semibold flex items-center gap-1">
      <AlertCircle className="w-3 h-3 shrink-0" />{msg}
    </p>
  );
}

function Label({ children, required }) {
  return (
    <label className="block text-[10.5px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
      {children}{required && <span className="text-rose-400 ml-0.5">*</span>}
    </label>
  );
}

const inputCls = (err) =>
  `w-full px-3.5 h-[44px] bg-white border rounded-xl text-sm font-medium text-slate-800
   focus:outline-none focus:ring-2 transition-all duration-200
   ${err ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-100'}`;

const selectCls = (err) =>
  `w-full pl-3.5 pr-9 h-[44px] bg-white border rounded-xl text-sm font-medium text-slate-800
   appearance-none focus:outline-none focus:ring-2 transition-all duration-200 cursor-pointer
   ${err ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-100'}`;

function Sel({ err, value, onChange, children }) {
  return (
    <div className="relative">
      <select value={value} onChange={onChange} className={selectCls(err)}>{children}</select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
    </div>
  );
}

function SectionHead({ title }) {
  return <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-2 pb-1 border-b border-slate-100">{title}</p>;
}

export default function AddOldTyreModal({ isOpen, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [oldTyres, setOldTyres] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  // Fetch existing old tyres for duplicate check and vehicles for dropdown
  useEffect(() => {
    if (isOpen) {
      fetchOldTyres();
      fetchVehicles();
    }
  }, [isOpen]);

  const fetchOldTyres = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/old-tyres');
      setOldTyres(res.data.data || []);
    } catch (error) {
      console.log('Fetch Old Tyres Error:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/vehicles');
      setVehicles(res.data.data || []);
    } catch (error) {
      console.log('Fetch Vehicles Error:', error);
    }
  };

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    const no = form.tyreNo.trim().toUpperCase();
    if (!no) e.tyreNo = 'Tyre number is required';
    else if (oldTyres.some(t => String(t.old_tyre_number || '').toUpperCase() === no))
      e.tyreNo = 'Tyre number already exists in old stock';
    if (!form.brand) e.brand = 'Brand is required';
    if (!form.model.trim()) e.model = 'Model is required';
    if (!form.tyreSize) e.tyreSize = 'Tyre size is required';
    if (!form.removedDate) e.removedDate = 'Removed date is required';
    else if (form.removedDate > today()) e.removedDate = 'Cannot be a future date';
    if (!form.runningKm) e.runningKm = 'Total ran KM is required';
    else if (parseInt(form.runningKm) < 0) e.runningKm = 'Cannot be negative';
    if (form.remainingTread !== '' && (parseInt(form.remainingTread) < 0 || parseInt(form.remainingTread) > 100))
      e.remainingTread = 'Must be 0–100';
    if (!form.status) e.status = 'Status is required';
    if (!form.storeLocation) e.storeLocation = 'Store location is required';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    try {
      await axios.post('http://localhost:5001/api/old-tyres', {
        old_tyre_number: form.tyreNo.trim().toUpperCase(),
        brand: form.brand,
        model: form.model.trim(),
        tyre_size: form.tyreSize,
        material_type: form.material,
        vehicle_id: form.vehicleId || null,
        vehicle_number: form.vehicleNo || null,
        last_position: form.lastPosition || null,
        removed_date: form.removedDate,
        removal_reason: form.removalReason || null,
        running_km: form.runningKm,
        expected_life_km: form.expectedLife || null,
        remaining_tread_percent: form.remainingTread || null,
        tyre_status: form.status,
        store_location: form.storeLocation,
        notes: form.notes || null,
      });

      setForm(EMPTY);
      setErrors({});
      onClose();
    } catch (error) {
      console.log('Create Old Tyre Error:', error);
    }
  };

  const handleClose = () => {
    setForm(EMPTY);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={e => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden"
          style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.22)' }}
        >
          {/* Header */}
          <div className="shrink-0 px-6 py-5 bg-gradient-to-r from-[#0f172a] to-[#1e293b] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <Plus className="w-4 h-4 text-orange-400" />
                <h3 className="text-[15px] font-black text-white tracking-tight">Add Old Tyre</h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Manually add a used tyre to old stock inventory</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:rotate-90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div
            className="overflow-y-auto flex-1 p-5 space-y-3"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}
          >
            <SectionHead title="Basic Tyre Info" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label required>Old Tyre Number</Label>
                <input
                  value={form.tyreNo}
                  onChange={e => set('tyreNo', e.target.value.toUpperCase())}
                  placeholder="e.g. OLD-5001"
                  className={inputCls(errors.tyreNo) + ' font-mono'}
                />
                <Err msg={errors.tyreNo} />
              </div>
              <div>
                <Label required>Brand</Label>
                <Sel err={errors.brand} value={form.brand} onChange={e => set('brand', e.target.value)}>
                  <option value="">Select Brand</option>
                  {BRANDS.map(b => <option key={b}>{b}</option>)}
                </Sel>
                <Err msg={errors.brand} />
              </div>
              <div>
                <Label required>Model</Label>
                <input
                  value={form.model}
                  onChange={e => set('model', e.target.value)}
                  placeholder="e.g. EnduRace"
                  className={inputCls(errors.model)}
                />
                <Err msg={errors.model} />
              </div>
              <div>
                <Label required>Tyre Size</Label>
                <Sel err={errors.tyreSize} value={form.tyreSize} onChange={e => set('tyreSize', e.target.value)}>
                  <option value="">Select Size</option>
                  {SIZES.map(s => <option key={s}>{s}</option>)}
                </Sel>
                <Err msg={errors.tyreSize} />
              </div>
              <div>
                <Label>Material Type</Label>
                <Sel value={form.material} onChange={e => set('material', e.target.value)}>
                  <option value="">Select Material</option>
                  {MATERIALS.map(m => <option key={m}>{m}</option>)}
                </Sel>
              </div>
            </div>

            <SectionHead title="Last Vehicle Details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Last Vehicle Number</Label>
                <Sel
                  value={form.vehicleNo}
                  onChange={e => {
                    const selectedVehicle = vehicles.find(v => v.vehicle_no === e.target.value);
                    set('vehicleNo', e.target.value);
                    set('vehicleId', selectedVehicle?.id || null);
                  }}
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.vehicle_no}>
                      {vehicle.vehicle_no}
                    </option>
                  ))}
                </Sel>
              </div>
              <div>
                <Label>Last Mounted Position</Label>
                <Sel value={form.lastPosition} onChange={e => set('lastPosition', e.target.value)}>
                  <option value="">Select Position</option>
                  {PLACEMENTS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </Sel>
              </div>
              <div>
                <Label required>Removed Date</Label>
                <input
                  type="date"
                  value={form.removedDate}
                  max={today()}
                  onChange={e => set('removedDate', e.target.value)}
                  className={inputCls(errors.removedDate)}
                />
                <Err msg={errors.removedDate} />
              </div>
              <div>
                <Label>Removal Reason</Label>
                <Sel value={form.removalReason} onChange={e => set('removalReason', e.target.value)}>
                  <option value="">Select Reason</option>
                  {REASONS.map(r => <option key={r}>{r}</option>)}
                </Sel>
              </div>
            </div>

            <SectionHead title="Running Details" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label required>Total Ran KM</Label>
                <input
                  type="number"
                  min="0"
                  value={form.runningKm}
                  onChange={e => set('runningKm', e.target.value)}
                  placeholder="e.g. 85000"
                  className={inputCls(errors.runningKm) + ' font-mono'}
                />
                <Err msg={errors.runningKm} />
              </div>
              <div>
                <Label>Expected Life (km)</Label>
                <input
                  type="number"
                  min="0"
                  value={form.expectedLife}
                  onChange={e => set('expectedLife', e.target.value)}
                  placeholder="e.g. 100000"
                  className={inputCls(false) + ' font-mono'}
                />
              </div>
              <div>
                <Label>Remaining Tread (%)</Label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.remainingTread}
                  onChange={e => set('remainingTread', e.target.value)}
                  placeholder="0–100"
                  className={inputCls(errors.remainingTread) + ' font-mono'}
                />
                <Err msg={errors.remainingTread} />
              </div>
            </div>

            <SectionHead title="Inventory Details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label required>Old Tyre Status</Label>
                <Sel err={errors.status} value={form.status} onChange={e => set('status', e.target.value)}>
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Sel>
                <Err msg={errors.status} />
              </div>
              <div>
                <Label required>Store Location</Label>
                <Sel err={errors.storeLocation} value={form.storeLocation} onChange={e => set('storeLocation', e.target.value)}>
                  <option value="">Select Location</option>
                  {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                </Sel>
                <Err msg={errors.storeLocation} />
              </div>
              <div className="sm:col-span-2">
                <Label>Notes / Remarks</Label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  placeholder="Optional remarks..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm font-medium text-slate-800 focus:outline-none transition-all duration-200 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 flex items-center justify-end gap-2.5 px-5 py-4 border-t border-slate-100 bg-slate-50/60">
            <button
              onClick={handleClose}
              className="h-10 px-5 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="h-10 px-6 text-sm font-extrabold text-white rounded-xl flex items-center gap-2
                transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)' }}
            >
              <Plus className="w-4 h-4" /> Add to Old Stock
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}