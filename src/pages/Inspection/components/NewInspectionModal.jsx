import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Search, ChevronDown, ChevronRight, CheckCircle2,
  Shield, Wrench, Truck, ClipboardList, Calendar,
  Clock, MapPin, User, AlertTriangle,
  FileCheck, Send, Check, XCircle
} from 'lucide-react';

// ── Stepper ─────────────────────────────────────────────────────────────────
const STEPS = [
  { num: 1, label: 'Select Inspection Plan' },
  { num: 2, label: 'Vehicle Information' },
  { num: 3, label: 'Perform Inspection' },
  { num: 4, label: 'Review & Submit' },
];

// ── Toggle component (for work order) ────────────────────────────────────────
const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-blue-600' : 'bg-slate-200'
      }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
        }`}
    />
  </button>
);

// ── Plan type icons & colors (only for UI in step 1) ─────────────────────────
const planTypeIcon = {
  Safety: <Shield className="w-5 h-5 text-white" />,
  Maintenance: <Wrench className="w-5 h-5 text-white" />,
  Operations: <ClipboardList className="w-5 h-5 text-white" />,
  'Pre-Trip': <Truck className="w-5 h-5 text-white" />,
  'Post-Trip': <FileCheck className="w-5 h-5 text-white" />,
  default: <ClipboardList className="w-5 h-5 text-white" />,
};

const planTypeColor = {
  Safety: 'bg-blue-600',
  Maintenance: 'bg-emerald-600',
  Operations: 'bg-purple-600',
  'Pre-Trip': 'bg-indigo-600',
  'Post-Trip': 'bg-teal-600',
  default: 'bg-slate-600',
};

// ── Main Modal ──────────────────────────────────────────────────────────────
export default function NewInspectionModal({ isOpen, onClose }) {
  // Data from APIs
  const [plans, setPlans] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Step & selections
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All Types');

  // Step 2 – vehicle & inspection metadata
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [odometer, setOdometer] = useState('');
  const [engineHours, setEngineHours] = useState('');
  const [inspDate, setInspDate] = useState(() => {
    const now = new Date();
    return `${now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  });
  const [inspector, setInspector] = useState('');
  const [location, setLocation] = useState('Mumbai Depot');
  const [gpsCapture] = useState(true);
  const [gpsCoords] = useState('19.0760° N, 72.8777° E');
  const [preNotes, setPreNotes] = useState('');

  // Step 3 – results (only Pass/Fail)
  const [results, setResults] = useState({});

  // Step 4 – final notes & work order
  const [finalNotes, setFinalNotes] = useState('');
  const [autoWorkOrder, setAutoWorkOrder] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [inspectionId, setInspectionId] = useState('');

  // ──────────────────────────────────────────────────────────────────────────
  // Data fetching
  // ──────────────────────────────────────────────────────────────────────────
  const fetchPlans = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/inspection-plans');
      const data = await res.json();
      if (data.success) {
        const formatted = data.data.map(plan => ({
          id: plan.id,
          title: plan.title,
          planType: plan.plan_type,
          description: plan.description,
          scheduleType: plan.schedule_type,
          frequency: plan.frequency,
          priority: plan.priority,
          items: typeof plan.checklist_items === 'string'
            ? JSON.parse(plan.checklist_items)
            : plan.checklist_items || [],
          autoCreateWorkOrder: plan.auto_create_work_order === 1,
        }));
        setPlans(formatted);
      }
    } catch (err) {
      console.error('Fetch plans error:', err);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/vehicles');
      const data = await res.json();
      if (data.success) {
        const formattedVehicles = data.data.map(vehicle => ({
          id: vehicle.id,
          reg: vehicle.vehicle_no,
          model: vehicle.make_brand,
          type: vehicle.type,
          fleet: vehicle.default_route,
          assigned_supervisor:
            vehicle.supervisor_name
        }));
        setVehicles(formattedVehicles);
      }
    } catch (err) {
      console.error('Fetch vehicles error:', err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchPlans(), fetchVehicles()]);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) loadAllData();
  }, [isOpen]);

  // Reset modal when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedPlan(null);
      setSearch('');
      setFilterType('All Types');
      setSelectedVehicle(null);
      setOdometer('');
      setEngineHours('');
      setInspDate(() => {
        const now = new Date();
        return `${now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      });
      setLocation('Mumbai Depot');
      setPreNotes('');
      setResults({});
      setFinalNotes('');
      setAutoWorkOrder(true);
      setShowSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── Derived data ──────────────────────────────────────────────────────────
  const allItems = selectedPlan?.items || [];
  const totalItems = allItems.length;
  const passedItems = allItems.filter(i => results[i.id] === 'Pass').length;
  const failedItems = allItems.filter(i => results[i.id] === 'Fail').length;
  const pendingItems = totalItems - passedItems - failedItems;
  const hasFailures = failedItems > 0;

  // Filtered plans for step 1
  const planTypes = ['All Types', ...new Set(plans.map(p => p.planType))];
  const filteredPlans = plans.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !search || p.title.toLowerCase().includes(q) || p.planType.toLowerCase().includes(q);
    const matchType = filterType === 'All Types' || p.planType === filterType;
    return matchSearch && matchType;
  });

  const setResult = (id, val) => setResults(prev => ({ ...prev, [id]: val }));

  // ── Submit inspection to database ─────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      const payload = {
        inspection_number: `INS-${Date.now()}`,
        plan_id: selectedPlan?.id,
        plan_title: selectedPlan?.title,
        plan_type: selectedPlan?.planType,
        vehicle_id: selectedVehicle?.id,
        vehicle_number: selectedVehicle?.reg,
        inspection_date: new Date()
          .toISOString()
          .slice(0, 19)
          .replace('T', ' '),
        inspector_name: inspector,
        location: location,
        gps_coordinates: gpsCoords,
        odometer: odometer || null,
        engine_hours: engineHours || null,
        pre_notes: preNotes,
        final_notes: finalNotes,
        checklist_results: allItems.map(item => ({
          item_id: item.id,
          item_name: item.desc,
          result: results[item.id] || 'Pending',
          required: item.required,
        })),
        total_items: totalItems,
        passed_items: passedItems,
        failed_items: failedItems,
        pending_items: pendingItems,
        na_items: 0,
        inspection_status: hasFailures ? 'Failed' : 'Passed',
        auto_create_workorder: autoWorkOrder && hasFailures ? 'Yes' : 'No',
      };

      const res = await fetch('http://localhost:5001/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setInspectionId(payload.inspection_number);
        setShowSuccess(true);
      } else {
        console.error('Inspection submit error:', data.message);
      }
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  // ── Success modal ─────────────────────────────────────────────────────────
  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9 text-green-600" />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-1">Inspection Submitted Successfully!</h3>
          <p className="text-sm text-slate-500 mb-4">
            Inspection ID: <span className="font-bold text-slate-700">{inspectionId}</span>
          </p>
          <div className="bg-slate-50 rounded-xl px-4 py-3 mb-5 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Status</span>
              <span className="font-bold text-orange-500">{hasFailures ? 'Failed' : 'Passed'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Vehicle</span>
              <span className="font-bold text-slate-700">{selectedVehicle?.reg}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Time</span>
              <span className="font-bold text-slate-700">{inspDate}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors"
          >
            Close
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 text-center">
          <p className="text-slate-600 font-semibold">Loading inspection data...</p>
        </div>
      </div>
    );
  }

  // ── Main modal render ─────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
          <div>
            <h2 className="text-base font-black text-slate-800">Add New Inspection</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Step {step} of 4: {STEPS[step - 1].label}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className="px-6 py-2 bg-white border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-1 mb-2">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black transition-all
                      ${step > s.num ? 'bg-green-500 text-white' : step === s.num ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}
                  >
                    {step > s.num ? <Check className="w-3 h-3" /> : s.num}
                  </div>
                  <span className={`text-[11px] font-semibold hidden sm:block ${step === s.num ? 'text-blue-600' : step > s.num ? 'text-green-600' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-1 ${step > s.num ? 'bg-green-400' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
            <motion.div
              className="h-full bg-blue-600 rounded-full"
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto bg-white">
          <AnimatePresence mode="wait">
            {/* STEP 1: SELECT PLAN */}
            {step === 1 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-4"
              >
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search inspection plans..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm placeholder-slate-300"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={filterType}
                      onChange={e => setFilterType(e.target.value)}
                      className="appearance-none border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-sm font-semibold text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
                    >
                      {planTypes.map(t => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select className="appearance-none border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-sm font-semibold text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer">
                      <option>Active Plans</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  {filteredPlans.map(plan => {
                    const isSelected = selectedPlan?.id === plan.id;
                    const iconBg = planTypeColor[plan.planType] || planTypeColor.default;
                    const icon = planTypeIcon[plan.planType] || planTypeIcon.default;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan)}
                        className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all
                          ${isSelected ? 'border-blue-500 bg-blue-50/40 shadow-sm' : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'}`}
                      >
                        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                          {icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 leading-tight">{plan.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-500 font-medium">{plan.planType}</span>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                              <ClipboardList className="w-3 h-3" />
                              {plan.items?.length || 0} Checkpoints
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {filteredPlans.length === 0 && (
                    <div className="py-12 text-center text-slate-400 text-sm font-semibold">
                      No active plans found matching your criteria.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 2: VEHICLE INFORMATION */}
            {step === 2 && (() => {
              const scheduleType = selectedPlan?.scheduleType;
              const showOdometer = scheduleType !== 'Engine Hours';
              const showEngineHours = scheduleType === 'Engine Hours' || scheduleType === 'Custom';
              const odometerRequired = scheduleType === 'Mileage-Based' || scheduleType === 'Custom';
              const engineHoursRequired = scheduleType === 'Engine Hours';

              const scheduleTypeColor = {
                'Time-Based': 'bg-blue-50 border-blue-200 text-blue-700',
                'Mileage-Based': 'bg-emerald-50 border-emerald-200 text-emerald-700',
                'Engine Hours': 'bg-orange-50 border-orange-200 text-orange-700',
                'Custom': 'bg-purple-50 border-purple-200 text-purple-700',
              };
              const scheduleTypeHint = {
                'Time-Based': 'Inspection triggered by time schedule',
                'Mileage-Based': 'Odometer reading required to proceed',
                'Engine Hours': 'Engine hours required to proceed',
                'Custom': 'All readings required',
              };

              return (
                <motion.div
                  key="s2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 space-y-5"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">
                        Vehicle <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={selectedVehicle?.id || ''}
                          onChange={(e) => {

                            const vehicle =
                              vehicles.find(
                                v => String(v.id) === e.target.value
                              );

                            setSelectedVehicle(vehicle);

                            setInspector(
                              vehicle?.assigned_supervisor || ''
                            );

                          }}
                          className="w-full appearance-none border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm pr-8 cursor-pointer"
                        >
                          <option value="">Select a vehicle...</option>
                          {vehicles.map(v => (
                            <option key={v.id} value={v.id}>{v.reg} – {v.model}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Schedule Type</label>
                      <div className={`flex items-center gap-2.5 border rounded-xl px-3 py-2.5 shadow-sm ${scheduleTypeColor[scheduleType] || 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                        <Calendar className="w-4 h-4 shrink-0 opacity-70" />
                        <div className="min-w-0">
                          <p className="text-sm font-bold leading-tight">{scheduleType || '—'}</p>
                          {scheduleType && (
                            <p className="text-[10px] font-medium opacity-70 leading-tight mt-0.5">
                              {scheduleTypeHint[scheduleType]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedVehicle && (
                    <div className="flex items-center gap-4 border border-slate-200 rounded-xl p-4 bg-slate-50 shadow-sm">
                      <div className="w-20 h-16 rounded-lg bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                        <Truck className="w-10 h-10 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-800">{selectedVehicle.reg}</p>
                        <p className="text-xs text-slate-500 font-medium">{selectedVehicle.model}</p>
                        <p className="text-xs text-slate-500 font-medium">{selectedVehicle.type}</p>
                        <p className="text-xs text-slate-400 font-mono">Fleet ID: {selectedVehicle.fleet}</p>
                      </div>
                    </div>
                  )}

                  {(showOdometer || showEngineHours) && (
                    <div className={`grid gap-4 ${showOdometer && showEngineHours ? 'grid-cols-2' : 'grid-cols-2'}`}>
                      {showOdometer && (
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">
                            Odometer Reading (KM)
                            {odometerRequired && <span className="text-red-500"> *</span>}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={odometer}
                              onChange={e => setOdometer(e.target.value)}
                              placeholder="e.g. 58742"
                              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 pr-12 text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm placeholder-slate-300"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">KM</span>
                          </div>
                        </div>
                      )}
                      {showEngineHours && (
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">
                            Engine Hours
                            {engineHoursRequired && <span className="text-red-500"> *</span>}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={engineHours}
                              onChange={e => setEngineHours(e.target.value)}
                              placeholder="Enter engine hours"
                              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 pr-12 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm placeholder-slate-300"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Hrs</span>
                          </div>
                        </div>
                      )}
                      {showOdometer && !showEngineHours && <div />}
                      {!showOdometer && showEngineHours && <div />}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">
                        Inspection Date & Time <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          value={inspDate}
                          onChange={e => setInspDate(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">
                        Inspector <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                        <input
                          type="text"
                          value={inspector}
                          onChange={e => setInspector(e.target.value)}
                          placeholder="Enter inspector name"
                          className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm placeholder-slate-300"
                        />
                      </div>
                      {selectedVehicle?.assigned_supervisor && (
                        <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Auto-filled from vehicle supervisor
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                      <select
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        className="w-full appearance-none border border-slate-200 rounded-xl pl-9 pr-8 py-2.5 text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
                      >
                        <option>Mumbai Depot</option>
                        <option>Pune Depot</option>
                        <option>Bengaluru Depot</option>
                        <option>Chennai Depot</option>
                        <option>Delhi Depot</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    {gpsCapture && (
                      <div className="mt-2 space-y-0.5">
                        <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Live Location Captured
                        </p>
                        <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" /> {gpsCoords}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Notes (Optional)</label>
                    <textarea
                      value={preNotes}
                      onChange={e => setPreNotes(e.target.value.slice(0, 250))}
                      placeholder="Any remarks before starting inspection..."
                      rows={3}
                      maxLength={250}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-sm placeholder-slate-300"
                    />
                    <div className="text-right text-[10px] text-slate-400 mt-0.5">{preNotes.length}/250</div>
                  </div>
                </motion.div>
              );
            })()}

            {/* STEP 3: PERFORM INSPECTION (simplified Pass/Fail) */}
            {step === 3 && (
              <motion.div
                key="s3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-5 space-y-4"
              >
                <div className="flex items-center gap-6 px-1 pb-3 border-b border-slate-100">
                  {[
                    { label: 'Total', val: totalItems, color: 'text-blue-600' },
                    { label: 'Pending', val: pendingItems, color: 'text-slate-400' },
                    { label: 'Passed', val: passedItems, color: 'text-green-600' },
                    { label: 'Failed', val: failedItems, color: 'text-red-500' },
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  {allItems.map((item, idx) => {
                    const res = results[item.id];
                    const isPassed = res === 'Pass';
                    const isFailed = res === 'Fail';
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all
                          ${isFailed ? 'border-red-200 bg-red-50/40'
                            : isPassed ? 'border-green-200 bg-green-50/30'
                              : 'border-slate-200 bg-white'}`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-xs font-bold text-slate-400 shrink-0 w-5 text-right">
                            {idx + 1}.
                          </span>
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {item.desc}
                            {item.required && <span className="text-red-400 ml-1">*</span>}
                          </p>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => setResult(item.id, isPassed ? undefined : 'Pass')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
                              ${isPassed ? 'bg-green-600 text-white border-green-600' : 'border-slate-200 text-slate-600 hover:border-green-400 hover:text-green-700'}`}
                          >
                            <Check className="w-3 h-3" /> Pass
                          </button>
                          <button
                            onClick={() => setResult(item.id, isFailed ? undefined : 'Fail')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
                              ${isFailed ? 'bg-red-600 text-white border-red-600' : 'border-slate-200 text-slate-600 hover:border-red-400 hover:text-red-700'}`}
                          >
                            <XCircle className="w-3 h-3" /> Fail
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {allItems.length === 0 && (
                    <div className="py-12 text-center text-slate-400 text-sm font-semibold">
                      No checklist items found in this plan.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 4: REVIEW & SUBMIT */}
            {step === 4 && (
              <motion.div
                key="s4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide mb-3">Inspection Summary</h4>
                    {[
                      { icon: <ClipboardList className="w-4 h-4 text-slate-400" />, label: 'Plan', value: selectedPlan?.title },
                      { icon: <Truck className="w-4 h-4 text-slate-400" />, label: 'Vehicle', value: selectedVehicle ? `${selectedVehicle.reg} – ${selectedVehicle.model}` : '—' },
                      { icon: <Calendar className="w-4 h-4 text-slate-400" />, label: 'Date & Time', value: inspDate },
                      { icon: <User className="w-4 h-4 text-slate-400" />, label: 'Inspector', value: inspector },
                      { icon: <MapPin className="w-4 h-4 text-slate-400" />, label: 'Location', value: location },
                      { icon: <Clock className="w-4 h-4 text-slate-400" />, label: 'Odometer', value: odometer ? `${odometer} KM` : '—' },
                    ].map(row => (
                      <div key={row.label} className="flex items-start gap-2 py-1.5 border-b border-slate-50 last:border-0">
                        {row.icon}
                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-400 font-semibold">{row.label}</p>
                          <p className="text-xs font-bold text-slate-700 truncate">{row.value || '—'}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide mb-3">Result Summary</h4>
                      <div className="flex items-center gap-4">
                        <svg width="80" height="80" viewBox="0 0 80 80">
                          <circle cx="40" cy="40" r="30" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                          {passedItems > 0 && (
                            <circle
                              cx="40"
                              cy="40"
                              r="30"
                              fill="none"
                              stroke="#22c55e"
                              strokeWidth="12"
                              strokeDasharray={`${(passedItems / totalItems) * 188} 188`}
                              strokeDashoffset="47"
                              transform="rotate(-90 40 40)"
                            />
                          )}
                          {failedItems > 0 && (
                            <circle
                              cx="40"
                              cy="40"
                              r="30"
                              fill="none"
                              stroke="#ef4444"
                              strokeWidth="12"
                              strokeDasharray={`${(failedItems / totalItems) * 188} 188`}
                              strokeDashoffset={`${47 - (passedItems / totalItems) * 188}`}
                              transform="rotate(-90 40 40)"
                            />
                          )}
                        </svg>
                        <div className="space-y-1">
                          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                            <span className="w-2 h-2 rounded-full bg-green-500" /> {passedItems} Passed
                          </p>
                          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                            <span className="w-2 h-2 rounded-full bg-red-500" /> {failedItems} Failed
                          </p>
                          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-slate-300" /> {pendingItems} Pending
                          </p>
                        </div>
                      </div>
                    </div>

                    {hasFailures && (
                      <div className="border border-red-200 bg-red-50 rounded-xl px-4 py-3 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-black text-red-600">{failedItems} Failure(s) Found</p>
                          <p className="text-[11px] text-red-500 mt-0.5">Please review failed items before submission.</p>
                        </div>
                      </div>
                    )}

                    {selectedPlan?.autoCreateWorkOrder && hasFailures && (
                      <div className="border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between bg-white shadow-sm">
                        <div>
                          <p className="text-xs font-black text-slate-700">Auto Create Work Order</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Work order will be created for failed items as per plan settings.
                          </p>
                        </div>
                        <Toggle checked={autoWorkOrder} onChange={setAutoWorkOrder} />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Inspector Notes (Optional)</label>
                  <textarea
                    value={finalNotes}
                    onChange={e => setFinalNotes(e.target.value.slice(0, 250))}
                    placeholder="Brake fluid slightly low. Other all good."
                    rows={3}
                    maxLength={250}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-sm placeholder-slate-300"
                  />
                  <div className="text-right text-[10px] text-slate-400 mt-0.5">{finalNotes.length}/250</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FOOTER */}
        <div className="bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
          <button
            onClick={step === 1 ? onClose : () => setStep(p => p - 1)}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep(p => p + 1)}
              disabled={
                (step === 1 && !selectedPlan) ||
                (step === 2 &&
                  (() => {
                    const st = selectedPlan?.scheduleType;
                    if (!selectedVehicle) return true;
                    if (st === 'Mileage-Based' && !odometer) return true;
                    if (st === 'Engine Hours' && !engineHours) return true;
                    if (st === 'Custom' && (!odometer || !engineHours)) return true;
                    return false;
                  })()) ||
                (step === 3 && allItems.filter(i => i.required).some(i => !results[i.id]))
              }
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors"
            >
              <Send className="w-4 h-4" /> Submit Inspection
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}