import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, Trash2, CalendarCheck2, Info,
  ChevronDown, ArrowUp, ArrowDown, Copy, AlertCircle, XCircle
} from 'lucide-react';

// ============================================================
// Enumerations
// ============================================================
const PLAN_TYPES = [
  'Maintenance',
  'Safety',
  'Pre-Trip',
  'Post-Trip',
  'DVIR',
  'Compliance',
  'Operations',
  'Custom'
];

const SCHEDULE_TYPES = [
  'Time-Based',
  'Mileage-Based',
  'Engine Hours',
  'Custom'
];

const FREQUENCIES = [
  'Once',
  'Daily',
  'Weekly',
  'Bi-Weekly',
  'Monthly',
  'Quarterly',
  'Yearly'
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

// ============================================================
// Helper: get status badge color (not used in this modal but kept for reference)
// ============================================================
const getStatusColor = (status) => {
  switch (status) {
    case 'Active': return 'bg-green-100 text-green-700 border-green-200';
    case 'Draft': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Inactive': return 'bg-gray-100 text-gray-600 border-gray-200';
    case 'Archived': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

// ============================================================
// Reusable UI Components
// ============================================================
const Label = ({ children, required }) => (
  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
    {children}{required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm placeholder-slate-300';
const selectCls = inputCls + ' appearance-none pr-8 cursor-pointer';

const Sel = ({ label, required, hint, icon: Icon, value, onChange, children, disabled, error }) => (
  <div>
    {label && <Label required={required}>{label}</Label>}
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />}
      <select value={value} onChange={onChange} className={selectCls + (Icon ? ' pl-9' : '') + (error ? ' border-red-300 ring-red-100' : '')} disabled={disabled}>
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    {hint && !error && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
  </div>
);

const Inp = ({ label, required, hint, icon: Icon, error, ...props }) => (
  <div>
    {label && <Label required={required}>{label}</Label>}
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />}
      <input {...props} className={inputCls + (Icon ? ' pl-9' : '') + (error ? ' border-red-300 ring-red-100' : '')} />
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    {hint && !error && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
  </div>
);

const Toggle = ({ checked, onChange, label, disabled }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs font-medium text-slate-600">{label}</span>
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}
      disabled={disabled}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const SecHead = ({ num, title, sub }) => (
  <div className="mb-5">
    <div className="flex items-center gap-2">
      <h3 className="text-sm font-black text-slate-700 uppercase tracking-wide">
        {num}. {title}
      </h3>
    </div>
    {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
  </div>
);

// Toast notification (auto-dismiss)
const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
      <AlertCircle className="w-4 h-4" />
      {message}
      <button onClick={onClose} className="ml-2"><XCircle className="w-4 h-4" /></button>
    </div>
  );
};

// ============================================================
// Main Component
// ============================================================
export default function CreatePlanModal({ isOpen, onClose, onAddPlan }) {
  // Plan-level state - only fields matching database schema
  const [fd, setFd] = useState({
    title: '',
    planType: '',
    description: '',
    scheduleType: '',
    frequency: '',
    priority: ''
  });

  // Checklist items with advanced fields
  const [items, setItems] = useState([
    {
      id: 'item-1',
      desc: '',
      type: 'Pass / Fail',
      required: true,
      severity: 'Medium',
      category: 'General',
      requireCommentOnFail: false,
      requirePhoto: false,
      expectedValue: '',
      minValue: '',
      maxValue: '',
      unit: ''
    }
  ]);

  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ------------------------------------------------------------
  // Pure validity check (no state updates) for button disable
  // ------------------------------------------------------------
  const isFormValid = useMemo(() => {
    if (!fd.title.trim()) return false;
    if (!fd.planType) return false;
    if (!fd.scheduleType) return false;
    if (!fd.frequency) return false;
    if (!fd.priority) return false;
    const validItems = items.filter(i => i.desc.trim() !== '');
    if (validItems.length === 0) return false;
    // numeric range checks
    for (const item of items) {
      if (item.type === 'Numeric' && item.minValue && item.maxValue) {
        const min = parseFloat(item.minValue);
        const max = parseFloat(item.maxValue);
        if (!isNaN(min) && !isNaN(max) && min > max) return false;
      }
    }
    return true;
  }, [fd.title, fd.planType, fd.scheduleType, fd.frequency, fd.priority, items]);

  // Helpers
  const set = (f, v) => setFd(prev => ({ ...prev, [f]: v }));

  // Checklist CRUD
  const addItem = () => {
    const newId = `item-${Date.now()}`;
    setItems(prev => [...prev, {
      id: newId,
      desc: '',
      type: 'Pass / Fail',
      required: true,
      severity: 'Medium',
      category: 'General',
      requireCommentOnFail: false,
      requirePhoto: false,
      expectedValue: '',
      minValue: '',
      maxValue: '',
      unit: ''
    }]);
  };

  const duplicateItem = (id) => {
    const target = items.find(i => i.id === id);
    if (!target) return;
    const newId = `item-${Date.now()}`;
    setItems(prev => [...prev, { ...target, id: newId }]);
  };

  const removeItem = (id) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = (id, field, val) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i));
  };

  // Reorder
  const moveItemUp = (index) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setItems(newItems);
  };

  const moveItemDown = (index) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
    setItems(newItems);
  };

  // Validation that sets errors (only on submit)
  const validateAndShowErrors = () => {
    const newErrors = {};
    if (!fd.title.trim()) newErrors.title = 'Plan title is required';
    if (!fd.planType) newErrors.planType = 'Plan type is required';
    if (!fd.scheduleType) newErrors.scheduleType = 'Schedule type is required';
    if (!fd.frequency) newErrors.frequency = 'Frequency is required';
    if (!fd.priority) newErrors.priority = 'Priority is required';

    const validItems = items.filter(i => i.desc.trim() !== '');
    if (validItems.length === 0) {
      newErrors.checklist = 'At least one checklist item with description is required';
    }
    items.forEach((item, idx) => {
      if (!item.desc.trim()) return;
      if (item.type === 'Numeric') {
        const min = parseFloat(item.minValue);
        const max = parseFloat(item.maxValue);
        if (item.minValue && item.maxValue && !isNaN(min) && !isNaN(max) && min > max) {
          newErrors[`item_${item.id}_range`] = `Min value cannot be greater than Max value (Item ${idx+1})`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateAndShowErrors()) {
      setToastMessage('Please fix the validation errors before saving.');
      return;
    }

    setIsSubmitting(true);
    try {
      const validItems = items.filter(i => i.desc.trim() !== '');
      const payload = {
        plan_number: `PLAN-${Date.now()}`,
        title: fd.title,
        plan_type: fd.planType,
        description: fd.description,
        schedule_type: fd.scheduleType,
        frequency: fd.frequency,
        priority: fd.priority,
        checklist_items: validItems,
        total_checkpoints: validItems.length
      };

      const response = await fetch('http://localhost:5001/api/inspection-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        // Call the parent callback if provided
        if (onAddPlan) {
          onAddPlan(payload);
        }
        onClose();
      } else {
        setToastMessage(data.message || 'Failed to create plan');
      }
    } catch (error) {
      console.error('CREATE PLAN ERROR:', error);
      setToastMessage('Server Error - Unable to create inspection plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const totalCheckpoints = items.filter(i => i.desc.trim() !== '').length;

  return (
    <AnimatePresence>
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                <CalendarCheck2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800">Create Inspection Plan</h2>
                <p className="text-xs text-slate-400">Configure inspection plan, schedule and dynamic checklist</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-500">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* SCROLLABLE BODY */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 bg-white">
            
            {/* SECTION 1: PLAN INFORMATION */}
            <div className="border border-slate-100 rounded-2xl px-5 py-5">
              <SecHead num={1} title="Plan Information" sub="Define the core properties of this inspection plan" />

              <div className="grid grid-cols-2 gap-4 mb-4">
                <Inp label="Plan Title" required error={errors.title}
                  value={fd.title} onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Weekly Tyre & Brake Inspection" />
                <Sel label="Plan Type" required error={errors.planType} value={fd.planType} onChange={e => set('planType', e.target.value)}>
                  <option value="">Select Plan Type</option>
                  {PLAN_TYPES.map(t => <option key={t}>{t}</option>)}
                </Sel>
              </div>

              <div className="mb-4">
                <Label>Description</Label>
                <textarea
                  value={fd.description}
                  onChange={e => set('description', e.target.value.slice(0, 200))}
                  placeholder="Enter detailed plan description..."
                  rows={3}
                  maxLength={200}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-sm"
                />
                <div className="text-right text-[10px] text-slate-400 mt-1">{fd.description.length}/200</div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <Sel label="Schedule Type" required error={errors.scheduleType} value={fd.scheduleType} onChange={e => set('scheduleType', e.target.value)}>
                  <option value="">Select Schedule Type</option>
                  {SCHEDULE_TYPES.map(s => <option key={s}>{s}</option>)}
                </Sel>
                <Sel label="Frequency" required error={errors.frequency} value={fd.frequency} onChange={e => set('frequency', e.target.value)}>
                  <option value="">Select Frequency</option>
                  {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
                </Sel>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Sel label="Priority" required error={errors.priority} value={fd.priority} onChange={e => set('priority', e.target.value)}>
                  <option value="">Select Priority</option>
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </Sel>
              </div>
            </div>

            {/* SECTION 2: CHECKLIST ITEMS */}
            <div className="border border-slate-100 rounded-2xl px-5 py-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-black text-slate-700 uppercase tracking-wide">2. Checklist Items</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Define checkpoints, add advanced rules per item</p>
                </div>
                <button onClick={addItem}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Item
                </button>
              </div>
              {errors.checklist && <p className="text-xs text-red-500 mb-2">{errors.checklist}</p>}

              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={item.id} className="border border-slate-200 rounded-xl bg-white shadow-sm hover:shadow transition">
                    <div className="p-4 flex items-start gap-3">
                      <div className="flex flex-col gap-1 mt-1">
                        <button onClick={() => moveItemUp(idx)} disabled={idx === 0} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30">
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => moveItemDown(idx)} disabled={idx === items.length-1} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-12 gap-3 items-start">
                          <div className="col-span-5">
                            <input type="text"
                              value={item.desc}
                              onChange={e => updateItem(item.id, 'desc', e.target.value)}
                              placeholder="Checkpoint description (e.g. Check tyre pressure)"
                              className={inputCls + ' py-2 text-sm'} />
                          </div>
                          <div className="col-span-2 flex items-center gap-3">
                            <Toggle checked={item.required} onChange={v => updateItem(item.id, 'required', v)} label="Required" />
                          </div>
                          <div className="col-span-3 flex justify-end gap-2">
                            <button onClick={() => duplicateItem(item.id)} className="p-1.5 text-slate-500 hover:text-blue-600"><Copy className="w-4 h-4" /></button>
                            <button onClick={() => removeItem(item.id)} disabled={items.length <= 1}
                              className="p-1.5 text-slate-500 hover:text-red-600 disabled:opacity-30"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 mt-3 px-1 text-xs text-slate-400">
                <Info className="w-3.5 h-3.5 text-blue-400" /> Use ↑↓ buttons to reorder checkpoints.
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <div className="flex items-center gap-3">
              <button onClick={handleSubmit} disabled={!isFormValid || isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
                <CalendarCheck2 className="w-4 h-4" /> {isSubmitting ? 'Creating...' : 'Create Plan'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}