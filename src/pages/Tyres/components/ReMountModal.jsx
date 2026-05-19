import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, ChevronDown, AlertCircle, CheckCircle, ArrowRight, User, FileText } from 'lucide-react';
import { getLayout, POSITION_LABELS } from '../data/vehicleLayouts';
import { useTyreLifecycle } from '../index';

const API_URL = 'http://localhost:5001';
const today = () => new Date().toISOString().split('T')[0];

const inputCls = (err) =>
  `w-full px-3.5 h-[40px] bg-white border rounded-xl text-sm font-medium text-slate-800
   focus:outline-none focus:ring-2 transition-all
   ${err ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-100'}`;

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

export default function ReMountModal({ tyre, onClose, onSuccess }) {
  const { activeTyres } = useTyreLifecycle(); // keep only activeTyres, remountTyre removed

  const [truckId, setTruckId] = useState('');
  const [placement, setPlacement] = useState('');
  const [fittedDate, setFittedDate] = useState(today());
  const [fittedOdo, setFittedOdo] = useState('');
  const [technician, setTechnician] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch vehicles from database
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch(`${API_URL}/api/vehicles`);
        const result = await response.json();

        console.log('VEHICLE API RESULT:', result);

        setVehicles(
          result.data ||
          result.vehicles ||
          result ||
          []
        );

      } catch (error) {
        console.error('FETCH VEHICLES ERROR:', error);
      }
    };
    fetchVehicles();
  }, []);

  const selectedTruck = vehicles.find(t => String(t.id) === String(truckId));
  console.log('VEHICLES:', vehicles);
console.log('SELECTED TRUCK:', selectedTruck);
  const currentOdo = selectedTruck?.current_odometer ?? selectedTruck?.currentOdo ?? 0;
  const layout = selectedTruck
  ? getLayout(
      selectedTruck.type ||
      selectedTruck.vehicle_type ||
      selectedTruck.vehicleType
    )
  : null;

  // Update fitted odometer when truck changes
  useEffect(() => {
    if (selectedTruck) {
      setFittedOdo(String(currentOdo));
      setPlacement('');
    }
  }, [truckId]);

  // Count currently mounted tyres on this vehicle (using activeTyres from context)
  const occupiedPositions = truckId
  ? activeTyres
      .filter(t =>
        String(t.truckNo) === String(selectedTruck?.vehicle_no) ||
        String(t.truckNo) === String(selectedTruck?.id) ||
        String(t.vehicle_number) === String(selectedTruck?.vehicle_no)
      )
      .map(t => reversePositionMap[t.position] || t.position)
  : [];

  const normalizePosition = (pos) => {
  const map = {
    FL: 'frontleft',
    FR: 'frontright',
    FL2: 'frontleft2',
    FR2: 'frontright2',

    AL1LO: 'axle1leftouter',
    AL1LI: 'axle1leftinner',
    AR1LI: 'axle1rightinner',
    AR1LO: 'axle1rightouter',

    AL2LO: 'axle2leftouter',
    AL2LI: 'axle2leftinner',
    AR2LI: 'axle2rightinner',
    AR2LO: 'axle2rightouter',
  };

  return map[pos] || pos;
};

  const mountedCount = occupiedPositions.length;
  const truckCapacity = selectedTruck?.total_tyres ?? 0;
  const truckFull = truckCapacity > 0 && mountedCount >= truckCapacity;

  const allPositions = layout
    ? layout.axles.flatMap(a => [...a.left, ...a.right])
    : [];
  const emptyPositions = allPositions.filter(p => !occupiedPositions.includes(p));

  const treadPct = Number(
    tyre?.remaining_tread_percent ||
    tyre?.remainingTread ||
    100
  );

  const validate = () => {
    const e = {};
    if (!truckId) e.truckId = 'Select a vehicle';
    else if (truckFull) e.truckId = `Vehicle is full (${mountedCount}/${truckCapacity})`;
    if (!placement) e.placement = 'Select an axle position';
    else if (occupiedPositions.includes(placement)) e.placement = 'Position already occupied';
    if (!fittedDate) e.fittedDate = 'Select mount date';
    else if (fittedDate > today()) e.fittedDate = 'Cannot be a future date';
    if (!fittedOdo) e.fittedOdo = 'Enter odometer reading';
    else if (parseInt(fittedOdo) < 0) e.fittedOdo = 'Cannot be negative';
    if (treadPct < 20) e.tread = `Tread too low (${treadPct}%) — minimum 20% required for re-mount`;
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        tyre_number: tyre.tyreNo || tyre.tyre_number || tyre.id,
        vehicle_id: selectedTruck?.id || null,
        vehicle_number: selectedTruck?.vehicle_no || selectedTruck?.id || '',
        tyre_position: normalizePosition(placement), 
        fitted_odometer: Number(fittedOdo),
        date_of_issue: fittedDate,
        running_km: tyre.runningKm || 0,
        status: 'Mounted'
      };

      const response = await fetch(`${API_URL}/api/tyres/mount`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        setDone(true);
      } else {
        alert(result.message || 'Failed to re-mount tyre');
      }
    } catch (error) {
      console.error('REMOUNT ERROR:', error);
      alert('Server Error – could not re-mount tyre');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (done && onSuccess) onSuccess(tyre.tyreNo || tyre.old_tyre_number || tyre.tyre_number);
    setTruckId(''); setPlacement(''); setFittedDate(today());
    setFittedOdo(''); setTechnician(''); setNotes('');
    setErrors({}); setDone(false);
    onClose();
  };

  const set = (setter, field) => (val) => { setter(val); setErrors(p => ({ ...p, [field]: '' })); };

  if (!tyre) return null;

  const treadColor = treadPct <= 20 ? 'text-red-600' : treadPct <= 40 ? 'text-orange-500' : 'text-emerald-600';
  const treadBar = treadPct <= 20 ? 'bg-red-500' : treadPct <= 40 ? 'bg-orange-500' : 'bg-emerald-500';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm"
        onClick={e => e.target === e.currentTarget && handleClose()}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="bg-white rounded-2xl w-full flex flex-col overflow-hidden"
          style={{ maxWidth: '560px', maxHeight: '92vh', boxShadow: '0 32px 80px rgba(0,0,0,0.22)' }}
        >
          {/* Header */}
          <div className="shrink-0 px-5 py-4 bg-gradient-to-r from-[#0f172a] to-[#1e293b] flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 text-blue-400" />
                <h3 className="text-[15px] font-black text-white tracking-tight">Re-Mount Reusable Tyre</h3>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Mount reusable tyre back to vehicle active layout</p>
            </div>
            <button onClick={handleClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:rotate-90 shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>

          {done ? (
            /* Success State */
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-10 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </motion.div>
              <div>
                <p className="text-base font-black text-slate-800">Tyre Re-Mounted Successfully</p>
                <p className="text-xs text-slate-400 mt-1">
                  {tyre.tyreNo || tyre.old_tyre_number || tyre.tyre_number} → {selectedTruck?.vehicle_no || truckId} · {POSITION_LABELS[placement] || placement}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 bg-slate-50 rounded-xl px-4 py-2 border border-slate-100">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full ring-1 ring-blue-200">Old Stock</span>
                <ArrowRight className="w-3 h-3" />
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full ring-1 ring-emerald-200">Active / Mounted</span>
              </div>
              <button onClick={handleClose}
                className="h-10 px-8 text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all">
                Done
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
              <div className="p-5 space-y-4">

                {/* Tyre Summary Card */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-800 font-mono">{tyre.tyreNo || tyre.old_tyre_number || tyre.tyre_number}</span>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full ring-1 ring-blue-300">Reusable</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{tyre.make} {tyre.model} · {tyre.tyreSize}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-black ${treadColor}`}>{treadPct}%</div>
                      <div className="text-[9px] text-gray-400 font-semibold uppercase">Tread Left</div>
                    </div>
                  </div>

                  {/* Tread bar */}
                  <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden mb-3">
                    <div className={`h-full rounded-full ${treadBar}`} style={{ width: `${treadPct}%` }} />
                  </div>

                  {/* Detail grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      ['Run KM', `${(tyre.runningKm || 0).toLocaleString()} km`],
                      ['Prev Vehicle', tyre.vehicleNo || '—'],
                      ['Prev Position', tyre.lastPosition ? (POSITION_LABELS[tyre.lastPosition] || tyre.lastPosition) : '—'],
                      ['Removed', tyre.removedDate || '—'],
                      ['Condition', tyre.condition || '—'],
                      ['Material', tyre.material || '—'],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-white/70 rounded-lg px-2.5 py-1.5">
                        <div className="text-[8px] text-gray-400 font-bold uppercase">{k}</div>
                        <div className="text-[10px] text-slate-700 font-bold truncate">{v}</div>
                      </div>
                    ))}
                  </div>

                  {treadPct < 20 && (
                    <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <p className="text-[11px] text-red-600 font-semibold">Tread too low ({treadPct}%) — cannot re-mount. Minimum 20% required.</p>
                    </div>
                  )}
                </div>

                {/* Vehicle Selection */}
                <Field label="Select Vehicle" required>
                  <div className="relative">
                    <select value={truckId} onChange={e => set(setTruckId, 'truckId')(e.target.value)}
                      className={`w-full pl-3.5 pr-9 h-[40px] bg-white border rounded-xl text-sm font-medium text-slate-800 appearance-none focus:outline-none focus:ring-2 transition-all cursor-pointer ${errors.truckId ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'}`}>
                      <option value="">Select Vehicle</option>
                      {vehicles.map(t => {
                        const cnt = activeTyres.filter(a =>
                          String(a.truckNo) === String(t.vehicle_no) ||
                          String(a.truckNo) === String(t.id) ||
                          String(a.vehicle_number) === String(t.vehicle_no)
                        ).length;
                        const full = cnt >= (t.total_tyres || 0);
                        return (
                          <option key={t.id} value={t.id} disabled={full}>
                            {t.vehicle_no || t.id} — {t.make_brand || t.model || 'Vehicle'}
                            {full ? ' (Full)' : ` (${cnt}/${t.total_tyres || 0} slots)`}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  </div>
                  {selectedTruck && !errors.truckId && (
                    <p className="mt-1 text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      {emptyPositions.length} empty slot{emptyPositions.length !== 1 ? 's' : ''} available · ODO: {currentOdo.toLocaleString()} km
                    </p>
                  )}
                  <Err msg={errors.truckId} />
                </Field>

                {/* Empty Slot Cards */}
                {selectedTruck && (
                  <Field label="Select Axle Position" required>
                    {emptyPositions.length === 0 ? (
                      <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2.5">
                        <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
                        <p className="text-xs text-orange-700 font-semibold">All positions occupied on this vehicle</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {emptyPositions.map(posId => {
                          const isSelected = placement === posId;
                          return (
                            <button key={posId} type="button"
                              onClick={() => { setPlacement(posId); setErrors(p => ({ ...p, placement: '' })); }}
                              className={`rounded-xl border-2 px-2 py-2.5 text-center transition-all duration-150 ${isSelected
                                  ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
                                  : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                                }`}>
                              {isSelected && (
                                <CheckCircle className="w-3 h-3 text-blue-500 mx-auto mb-1" />
                              )}
                              <div className="text-[10px] font-black text-slate-700">{POSITION_LABELS[posId] || posId}</div>
                              <div className="text-[8px] text-slate-400 font-semibold mt-0.5">Empty</div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <Err msg={errors.placement} />
                    {errors.tread && <Err msg={errors.tread} />}
                  </Field>
                )}

                {/* Mount Date + ODO */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Mount Date" required>
                    <input type="date" value={fittedDate} max={today()}
                      onChange={e => set(setFittedDate, 'fittedDate')(e.target.value)}
                      className={inputCls(errors.fittedDate)} />
                    <Err msg={errors.fittedDate} />
                  </Field>
                  <Field label="Vehicle Odometer (km)" required>
                    <input type="number" value={fittedOdo} min="0" placeholder="e.g. 78500"
                      onChange={e => set(setFittedOdo, 'fittedOdo')(e.target.value)}
                      className={inputCls(errors.fittedOdo) + ' font-mono'} />
                    <Err msg={errors.fittedOdo} />
                  </Field>
                </div>

                {/* Technician + Notes */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Technician Name">
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input type="text" value={technician} placeholder="Optional"
                        onChange={e => setTechnician(e.target.value)}
                        className={inputCls(false) + ' pl-8'} />
                    </div>
                  </Field>
                  <Field label="Mount Reason">
                    <div className="relative">
                      <FileText className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input type="text" value={notes} placeholder="Optional"
                        onChange={e => setNotes(e.target.value)}
                        className={inputCls(false) + ' pl-8'} />
                    </div>
                  </Field>
                </div>

                {/* Lifecycle hint */}
                <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 pt-1">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full ring-1 ring-slate-200">Old Stock</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full ring-1 ring-blue-200">Reusable</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full ring-1 ring-emerald-200">Active / Mounted</span>
                </div>

              </div>
            </div>
          )}

          {/* Footer */}
          {!done && (
            <div className="shrink-0 flex items-center justify-end gap-2.5 px-5 py-4 border-t border-slate-100 bg-slate-50/60">
              <button onClick={handleClose}
                className="h-10 px-5 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={treadPct < 20 || loading}
                className="h-10 px-6 text-sm font-extrabold text-white rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Processing...' : 'Confirm Re-Mount'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}