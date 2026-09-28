import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronRight, CheckCircle2,
  CalendarCheck2, Truck, ClipboardList,
  Check, XCircle, Send
} from 'lucide-react';

const STEPS = [
  { num: 1, label: 'Plan & Vehicle' },
  { num: 2, label: 'Checklist' },
  { num: 3, label: 'Additional Notes' },
  { num: 4, label: 'Review & Submit' }
];

export default function NewInspectionModal({ isOpen, onClose, plansData, onSubmit }) {
  const [plans, setPlans] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Wizard Step
  const [step, setStep] = useState(1);

  // Step 1: Select Plan, Vehicle, Odometer
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [odometer, setOdometer] = useState('');

  // Step 2: Checklist results
  const [results, setResults] = useState({});

  // Step 3: Additional notes
  const [notes, setNotes] = useState('');

  // Step 4: Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedId, setSubmittedId] = useState('');

  // Fetch plans & vehicles on open
  useEffect(() => {
    if (!isOpen) return;

    setStep(1);
    setSelectedPlanId('');
    setSelectedVehicleId('');
    setOdometer('');
    setResults({});
    setNotes('');
    setShowSuccess(false);
    setSubmittedId('');

    const fetchData = async () => {
      setLoading(true);
      try {
        const [plansRes, vehRes] = await Promise.all([
          fetch('http://localhost:5001/api/inspection-plans'),
          fetch('http://localhost:5001/api/vehicles')
        ]);

        const pData = await plansRes.json();
        const vData = await vehRes.json();

        if (pData.success) {
          const formattedPlans = pData.data.map(p => ({
            id: p.id,
            title: p.title,
            planType: p.plan_type || p.type || 'Maintenance',
            frequency: p.frequency || 'Daily',
            priority: p.priority || 'Medium',
            items: typeof p.checklist_items === 'string'
              ? JSON.parse(p.checklist_items)
              : p.checklist_items || []
          }));
          setPlans(formattedPlans);
          if (formattedPlans.length > 0) {
            setSelectedPlanId(String(formattedPlans[0].id));
          }
        }

        if (vData.success) {
          const formattedVehicles = vData.data.map(v => ({
            id: v.id,
            reg: v.vehicle_no,
            model: v.make_brand || v.model || '',
            type: v.type || '',
            supervisor: v.supervisor_name || 'Inspector'
          }));
          setVehicles(formattedVehicles);
          if (formattedVehicles.length > 0) {
            setSelectedVehicleId(String(formattedVehicles[0].id));
          }
        }
      } catch (err) {
        console.error('Error fetching inspection initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen]);

  const selectedPlan = plans.find(p => String(p.id) === String(selectedPlanId)) || null;
  const selectedVehicle = vehicles.find(v => String(v.id) === String(selectedVehicleId)) || null;

  const checklistItems = selectedPlan?.items || [];
  const totalItems = checklistItems.length;
  const passedItems = checklistItems.filter(i => results[i.id] === 'Pass').length;
  const failedItems = checklistItems.filter(i => results[i.id] === 'Fail').length;
  const pendingItems = totalItems - passedItems - failedItems;
  const hasFailures = failedItems > 0;

  const handleResultChange = (itemId, val) => {
    setResults(prev => ({
      ...prev,
      [itemId]: val
    }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    } else {
      onClose();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const inspectionNumber = `INS-${Date.now()}`;
      const payload = {
        inspection_number: inspectionNumber,
        plan_id: selectedPlan?.id,
        plan_title: selectedPlan?.title,
        plan_type: selectedPlan?.planType,
        vehicle_id: selectedVehicle?.id,
        vehicle_number: selectedVehicle?.reg,
        inspection_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
        inspector_name: selectedVehicle?.supervisor || 'Inspector',
        location: 'Depot',
        gps_coordinates: '',
        odometer: odometer ? Number(odometer) : null,
        pre_notes: '',
        final_notes: notes,
        checklist_results: checklistItems.map((item, idx) => ({
          item_id: item.id || `item-${idx + 1}`,
          item_name: typeof item === 'object' ? (item.desc || item.name || '') : item,
          result: results[item.id] || 'Pass',
          required: item.required !== undefined ? Boolean(item.required) : true
        })),
        total_items: totalItems,
        passed_items: passedItems,
        failed_items: failedItems,
        pending_items: pendingItems,
        na_items: 0,
        inspection_status: hasFailures ? 'Failed' : 'Passed',
        auto_create_workorder: hasFailures ? 'Yes' : 'No'
      };

      const res = await fetch('http://localhost:5001/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        setSubmittedId(inspectionNumber);
        setShowSuccess(true);
        if (onSubmit) {
          onSubmit({
            id: inspectionNumber,
            date: new Date().toLocaleDateString(),
            vehicle: selectedVehicle?.reg,
            vehicle_id: selectedVehicle?.id,
            inspector: selectedVehicle?.supervisor || 'Inspector',
            status: hasFailures ? 'Failed' : 'Passed',
            defectStatus: hasFailures ? 'Open' : null,
            repairId: null,
            repairStatus: hasFailures ? 'Pending' : null,
            recommendations: [],
            rawData: payload
          });
        }
      } else {
        alert(data.message || 'Error submitting inspection');
      }
    } catch (err) {
      console.error('Submit inspection error:', err);
      alert('Failed to connect to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // SUCCESS SCREEN
  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
        >
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Inspection Submitted!</h3>
          <p className="text-xs text-slate-500 mb-4 font-mono font-medium">
            {submittedId}
          </p>

          <div className="bg-slate-50 rounded-xl p-3 mb-5 text-xs space-y-1.5 text-left border border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-500">Result:</span>
              <span className={`font-bold ${hasFailures ? 'text-red-600' : 'text-emerald-600'}`}>
                {hasFailures ? 'Failed' : 'Passed'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Vehicle:</span>
              <span className="font-bold text-slate-800">{selectedVehicle?.reg}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Plan:</span>
              <span className="font-bold text-slate-800 truncate max-w-[160px]">{selectedPlan?.title}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm"
          >
            Done
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
          <div>
            <h2 className="text-base font-bold text-slate-800">Start New Inspection</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Step {step} of 4: {STEPS[step - 1].label}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PROGRESS STEPPER */}
        <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step > s.num
                        ? 'bg-emerald-500 text-white'
                        : step === s.num
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span
                    className={`text-xs font-semibold hidden sm:inline ${
                      step === s.num ? 'text-blue-600' : step > s.num ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${step > s.num ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: PLAN, VEHICLE, ODOMETER & COMPACT PLAN CARD */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                {/* Select Inspection Plan */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Select Inspection Plan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  >
                    <option value="">Select a plan...</option>
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.planType})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vehicle */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Vehicle <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  >
                    <option value="">Select a vehicle...</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.reg} {v.model ? `— ${v.model}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Odometer */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Odometer (KM)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={odometer}
                      onChange={(e) => setOdometer(e.target.value)}
                      placeholder="e.g. 54200"
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 pr-12 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm placeholder-slate-300"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                      KM
                    </span>
                  </div>
                </div>

                {/* Compact Info Card for Selected Plan */}
                {selectedPlan && (
                  <div className="mt-4 p-4 rounded-xl border border-blue-100 bg-blue-50/40 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                        {selectedPlan.planType}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800">{selectedPlan.title}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {selectedPlan.items?.length || 0} Configured Checkpoints • Schedule: {selectedPlan.frequency}
                      </p>
                    </div>
                    <ClipboardList className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 2: CHECKLIST ITEMS WITH PASS / FAIL RADIO BUTTONS */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs text-slate-500 font-medium">
                  <span>Checkpoints ({checklistItems.length})</span>
                  <div className="flex gap-4">
                    <span className="text-emerald-600 font-bold">{passedItems} Passed</span>
                    <span className="text-red-600 font-bold">{failedItems} Failed</span>
                  </div>
                </div>

                {checklistItems.length === 0 ? (
                  <p className="py-8 text-center text-xs text-slate-400">
                    No checklist items configured for this plan.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {checklistItems.map((item, idx) => {
                      const itemId = item.id || `item-${idx + 1}`;
                      const itemDesc = typeof item === 'object' ? (item.desc || item.name || '') : item;
                      const res = results[itemId];
                      const isPassed = res === 'Pass';
                      const isFailed = res === 'Fail';

                      return (
                        <div
                          key={itemId}
                          className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                            isPassed
                              ? 'border-emerald-200 bg-emerald-50/20'
                              : isFailed
                              ? 'border-red-200 bg-red-50/20'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <span className="text-xs font-bold text-slate-400 w-5 shrink-0 text-center">
                              {idx + 1}.
                            </span>
                            <span className="text-xs font-medium text-slate-800 truncate">
                              {itemDesc}
                              {item.required && <span className="text-red-500 ml-0.5">*</span>}
                            </span>
                          </div>

                          {/* Pass / Fail Radio/Toggles */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleResultChange(itemId, 'Pass')}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                isPassed
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400 hover:text-emerald-700'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" /> Pass
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResultChange(itemId, 'Fail')}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                isFailed
                                  ? 'bg-red-600 text-white border-red-600 shadow-sm'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-red-400 hover:text-red-700'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" /> Fail
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 3: ADDITIONAL NOTES */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Additional Notes / Observations
                  </label>
                  <textarea
                    rows={6}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter any additional observations, remarks or instructions for the maintenance team..."
                    className="w-full border border-slate-200 rounded-xl p-3.5 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm resize-none placeholder-slate-300"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Optional notes to attach with this inspection report.
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP 4: REVIEW & SUBMIT */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                {/* Summary Info */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Inspection Overview
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Selected Plan</span>
                      <span className="font-bold text-slate-800">{selectedPlan?.title || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Vehicle</span>
                      <span className="font-bold text-slate-800">{selectedVehicle?.reg || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Odometer</span>
                      <span className="font-bold text-slate-800">{odometer ? `${odometer} KM` : 'Not recorded'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Overall Result</span>
                      <span className={`font-bold ${hasFailures ? 'text-red-600' : 'text-emerald-600'}`}>
                        {hasFailures ? 'Failed (Defects Found)' : 'Passed (All Clear)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkpoint Breakdown */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white flex items-center justify-around text-center">
                  <div>
                    <p className="text-base font-black text-slate-800">{totalItems}</p>
                    <p className="text-[11px] text-slate-400 font-semibold">Total Items</p>
                  </div>
                  <div className="w-px h-8 bg-slate-100" />
                  <div>
                    <p className="text-base font-black text-emerald-600">{passedItems}</p>
                    <p className="text-[11px] text-slate-400 font-semibold">Passed</p>
                  </div>
                  <div className="w-px h-8 bg-slate-100" />
                  <div>
                    <p className="text-base font-black text-red-600">{failedItems}</p>
                    <p className="text-[11px] text-slate-400 font-semibold">Failed</p>
                  </div>
                </div>

                {/* Notes Summary */}
                {notes && (
                  <div className="border border-slate-200 rounded-xl p-3.5 bg-white text-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Notes
                    </span>
                    <p className="text-slate-700">{notes}</p>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={
                (step === 1 && (!selectedPlanId || !selectedVehicleId)) ||
                (step === 2 && checklistItems.filter(i => i.required).some(i => !results[i.id]))
              }
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/20 transition-colors disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" /> {isSubmitting ? 'Submitting...' : 'Submit Inspection'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}