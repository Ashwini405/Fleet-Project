import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, CalendarCheck2, ChevronDown, AlertCircle, XCircle } from 'lucide-react';

const PLAN_TYPES = [
  'Maintenance',
  'Safety',
  'Operations',
  'Pre-Trip',
  'Post-Trip',
  'Compliance',
  'Custom'
];

const FREQUENCIES = [
  'Daily',
  'Weekly',
  'Bi-Weekly',
  'Monthly',
  'Quarterly',
  'Yearly',
  'Once'
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const Label = ({ children, required }) => (
  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
    {children}{required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const inputCls = 'w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm placeholder-slate-300';
const selectCls = inputCls + ' appearance-none pr-8 cursor-pointer';

const Sel = ({ label, required, value, onChange, children, error }) => (
  <div>
    {label && <Label required={required}>{label}</Label>}
    <div className="relative">
      <select value={value} onChange={onChange} className={selectCls + (error ? ' border-red-300 ring-1 ring-red-200' : '')}>
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
    {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
  </div>
);

const Inp = ({ label, required, error, ...props }) => (
  <div>
    {label && <Label required={required}>{label}</Label>}
    <input {...props} className={inputCls + (error ? ' border-red-300 ring-1 ring-red-200' : '')} />
    {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
  </div>
);

const Toggle = ({ checked, onChange, label }) => (
  <div className="flex items-center gap-2">
    {label && <span className="text-xs font-medium text-slate-600 select-none">{label}</span>}
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-blue-600' : 'bg-slate-200'
      }`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
        checked ? 'translate-x-4' : 'translate-x-0.5'
      }`} />
    </button>
  </div>
);

export default function CreatePlanModal({ isOpen, onClose, onSave, planData }) {
  const isEditing = Boolean(planData?.id);

  const [fd, setFd] = useState({
    title: '',
    planType: 'Maintenance',
    frequency: 'Daily',
    priority: 'Medium'
  });

  const [items, setItems] = useState([
    { id: 'item-1', desc: '', required: true }
  ]);

  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && planData) {
      setFd({
        title: planData.title || '',
        planType: planData.plan_type || planData.type || 'Maintenance',
        frequency: planData.frequency || 'Daily',
        priority: planData.priority || 'Medium'
      });

      const rawItems = planData.checklist_items || planData.items || [];
      const parsedItems = typeof rawItems === 'string' ? JSON.parse(rawItems) : rawItems;

      if (Array.isArray(parsedItems) && parsedItems.length > 0) {
        setItems(parsedItems.map((item, idx) => ({
          id: item.id || `item-${idx + 1}-${Date.now()}`,
          desc: typeof item === 'object' ? (item.desc || item.description || item.item_name || '') : item,
          required: typeof item === 'object' && item.required !== undefined ? item.required : true
        })));
      } else {
        setItems([{ id: 'item-1', desc: '', required: true }]);
      }
      setErrors({});
      setToastMessage(null);
    } else {
      setFd({
        title: '',
        planType: 'Maintenance',
        frequency: 'Daily',
        priority: 'Medium'
      });
      setItems([{ id: 'item-1', desc: '', required: true }]);
      setErrors({});
      setToastMessage(null);
    }
  }, [isOpen, planData, isEditing]);

  const isFormValid = useMemo(() => {
    if (!fd.title.trim()) return false;
    if (!fd.planType) return false;
    if (!fd.frequency) return false;
    if (!fd.priority) return false;
    const validItems = items.filter(i => i.desc.trim() !== '');
    return validItems.length > 0;
  }, [fd.title, fd.planType, fd.frequency, fd.priority, items]);

  const set = (f, v) => setFd(prev => ({ ...prev, [f]: v }));

  const addItem = () => {
    setItems(prev => [
      ...prev,
      { id: `item-${Date.now()}-${Math.random()}`, desc: '', required: true }
    ]);
  };

  const removeItem = (id) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = (id, field, val) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, [field]: val } : i)));
  };

  const validate = () => {
    const newErrors = {};
    if (!fd.title.trim()) newErrors.title = 'Plan title is required';
    if (!fd.planType) newErrors.planType = 'Plan type is required';
    if (!fd.frequency) newErrors.frequency = 'Frequency is required';
    if (!fd.priority) newErrors.priority = 'Priority is required';

    const validItems = items.filter(i => i.desc.trim() !== '');
    if (validItems.length === 0) {
      newErrors.checklist = 'At least one checkpoint item description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setToastMessage('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const validItems = items
        .filter(i => i.desc.trim() !== '')
        .map((item, idx) => ({
          id: item.id || `item-${idx + 1}`,
          desc: item.desc.trim(),
          required: Boolean(item.required)
        }));

      const payload = {
        plan_number: isEditing ? (planData.plan_number || `PLAN-${Date.now()}`) : `PLAN-${Date.now()}`,
        title: fd.title.trim(),
        plan_type: fd.planType,
        description: '',
        schedule_type: 'Time-Based',
        frequency: fd.frequency,
        priority: fd.priority,
        checklist_items: validItems,
        total_checkpoints: validItems.length
      };

      const url = isEditing
        ? `http://localhost:5001/api/inspection-plans/${planData.id}`
        : 'http://localhost:5001/api/inspection-plans';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        if (onSave) onSave();
        onClose();
      } else {
        setToastMessage(data.message || 'Failed to save plan');
      }
    } catch (error) {
      console.error('SAVE PLAN ERROR:', error);
      setToastMessage('Server error - Unable to save inspection plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <CalendarCheck2 className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  {isEditing ? 'Edit Inspection Plan' : 'Create Inspection Plan'}
                </h2>
                <p className="text-xs text-slate-400">Configure plan details and checkpoints</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* TOAST ALERT */}
          {toastMessage && (
            <div className="bg-red-50 border-b border-red-100 px-6 py-2.5 flex items-center justify-between text-xs text-red-600 font-semibold">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{toastMessage}</span>
              </div>
              <button onClick={() => setToastMessage(null)}>
                <XCircle className="w-4 h-4 text-red-400 hover:text-red-600" />
              </button>
            </div>
          )}

          {/* SCROLLABLE BODY */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 bg-white">
            
            {/* SECTION 1: PLAN INFORMATION */}
            <div className="border border-slate-200 rounded-2xl p-4 sm:p-5">
              <div className="mb-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  1. Plan Information
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Core properties and scheduling details</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="sm:col-span-2">
                  <Inp 
                    label="Plan Title" 
                    required 
                    error={errors.title}
                    value={fd.title} 
                    onChange={e => set('title', e.target.value)}
                    placeholder="e.g. Daily Truck Tyre & Brake Inspection" 
                  />
                </div>

                <Sel 
                  label="Plan Type" 
                  required 
                  error={errors.planType} 
                  value={fd.planType} 
                  onChange={e => set('planType', e.target.value)}
                >
                  {PLAN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </Sel>

                <Sel 
                  label="Frequency" 
                  required 
                  error={errors.frequency} 
                  value={fd.frequency} 
                  onChange={e => set('frequency', e.target.value)}
                >
                  {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                </Sel>

                <Sel 
                  label="Priority" 
                  required 
                  error={errors.priority} 
                  value={fd.priority} 
                  onChange={e => set('priority', e.target.value)}
                >
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </Sel>
              </div>
            </div>

            {/* SECTION 2: CHECKLIST ITEMS */}
            <div className="border border-slate-200 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    2. Checklist Items
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Checkpoints to be evaluated during inspection</p>
                </div>
                <button 
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Item
                </button>
              </div>

              {errors.checklist && (
                <p className="text-xs text-red-500 mb-3">{errors.checklist}</p>
              )}

              <div className="space-y-2.5">
                {items.map((item, idx) => (
                  <div 
                    key={item.id} 
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition"
                  >
                    <span className="text-xs font-bold text-slate-400 w-5 shrink-0 text-center">
                      {idx + 1}.
                    </span>

                    {/* Checkpoint Description */}
                    <div className="flex-1">
                      <input 
                        type="text"
                        value={item.desc}
                        onChange={e => updateItem(item.id, 'desc', e.target.value)}
                        placeholder="Checkpoint description (e.g. Check tyre pressure & tread)"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm placeholder-slate-300"
                      />
                    </div>

                    {/* Required Toggle */}
                    <div className="shrink-0 flex items-center">
                      <Toggle 
                        label="Required"
                        checked={item.required} 
                        onChange={v => updateItem(item.id, 'required', v)} 
                      />
                    </div>

                    {/* Delete Item */}
                    <div className="shrink-0">
                      <button 
                        type="button"
                        onClick={() => removeItem(item.id)} 
                        disabled={items.length <= 1}
                        className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                        title="Delete checkpoint"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* FOOTER */}
          <div className="bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
            <button 
              type="button"
              onClick={onClose} 
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handleSubmit} 
              disabled={!isFormValid || isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <CalendarCheck2 className="w-4 h-4" /> 
              {isSubmitting ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Plan')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}