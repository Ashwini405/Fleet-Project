import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiUploadCloud, FiFile, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import api from '../../../services/api';
import { MODAL_ANIM } from './shared/constants';

const EXPENSE_TYPES = [
  'Fitness Certificate Renewal',
  'Permit Renewal',
  'Road Tax',
  'Registration Charges',
  'NOC Charges',
  'Insurance Verification',
  'Pollution Certificate',
  'Other',
];

const iCls  = 'w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-200 text-sm';
const iECls = 'w-full p-2.5 bg-white border border-red-300 rounded-xl focus:outline-none focus:border-red-400 text-sm';
const lCls  = 'block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1';
const loCls = 'block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1';

function genRef(prefix) {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `${prefix}-${ymd}-${String(Math.floor(Math.random() * 900) + 100)}`;
}

export default function AddExpenseModal({ isOpen, onClose, onSave, agentName, vendorId }) {
  const today = new Date().toISOString().split('T')[0];
  const EMPTY = { expenseType: '', vehicle: '', date: today, amount: '', ref: '', notes: '' };
  
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [fetchingVehicles, setFetchingVehicles] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  // ── Fetch vehicles from database when modal opens ──────────────────────────
  useEffect(() => {
    if (isOpen) {
      fetchVehicles();
    } else {
      handleReset();
    }
  }, [isOpen]);

  const fetchVehicles = async () => {
    try {
      setFetchingVehicles(true);
      const response = await api.get('/vehicles');
      const data = response.data?.data || (Array.isArray(response.data) ? response.data : []);
      setVehicles(data);
    } catch (error) {
      console.error('Vehicle Fetch Error:', error);
    } finally {
      setFetchingVehicles(false);
    }
  };

  const handleReset = () => {
    setForm(EMPTY);
    setErrors({});
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: null }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(p => ({ ...p, file: 'File size must be under 5MB' }));
      return;
    }

    setErrors(p => ({ ...p, file: null }));
    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setFilePreview(url);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = () => {
    const e = {};
    if (!form.expenseType) e.expenseType = 'Expense type is required';
    if (!form.vehicle)     e.vehicle     = 'Vehicle is required';
    if (!form.date)        e.date        = 'Date is required';
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'Enter a valid amount';
    return e;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    try {
      setLoading(true);

      const ref = form.ref.trim() || genRef('RTA');

      const formData = new FormData();
      formData.append('vendor_id', vendorId);
      formData.append('vehicle_no', form.vehicle);
      formData.append('expense_type', form.expenseType);
      formData.append('expense_date', form.date);
      formData.append('amount', form.amount);
      formData.append('reference_no', ref);
      formData.append('notes', form.notes.trim());

      if (selectedFile) {
        formData.append('document', selectedFile);
      }

      await api.post('/rta-expenses', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (onSave) {
        await onSave();
      }

      handleReset();
      onClose();

    } catch (error) {
      console.error('Expense Save Error:', error);
      alert(error?.response?.data?.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" style={{ animation: 'modalSlideIn 0.22s ease-out' }}>
        <div className="flex justify-between items-center px-5 py-4 bg-gray-900">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400">Add Expense</p>
            <p className="text-sm font-bold text-white mt-0.5">{agentName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white rounded-full transition-colors"><FiX size={16} /></button>
        </div>
        <form onSubmit={handleSave} noValidate className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">

          {/* Vehicle Dropdown */}
          <div>
            <label className={lCls}>Vehicle <span className="text-red-400">*</span></label>
            <select
              value={form.vehicle}
              onChange={e => set('vehicle', e.target.value)}
              disabled={fetchingVehicles}
              className={`${errors.vehicle ? iECls : iCls} text-gray-700 disabled:bg-gray-50`}
            >
              <option value="">
                {fetchingVehicles ? 'Loading vehicles...' : 'Select vehicle'}
              </option>
              {vehicles.map(v => (
                <option key={v.id || v.vehicle_no} value={v.vehicle_no}>
                  {v.vehicle_no} {v.make_brand ? `(${v.make_brand})` : ''}
                </option>
              ))}
            </select>
            {errors.vehicle && <p className="text-xs text-red-500 mt-1">{errors.vehicle}</p>}
            {!fetchingVehicles && vehicles.length === 0 && (
              <p className="text-[11px] text-amber-600 mt-1">No vehicles found in Vehicle Master.</p>
            )}
          </div>

          {/* Expense Type */}
          <div>
            <label className={lCls}>Expense Type <span className="text-red-400">*</span></label>
            <select
              value={form.expenseType}
              onChange={e => set('expenseType', e.target.value)}
              className={`${errors.expenseType ? iECls : iCls} text-gray-700`}
            >
              <option value="">Select type</option>
              {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.expenseType && <p className="text-xs text-red-500 mt-1">{errors.expenseType}</p>}
          </div>

          {/* Date & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lCls}>Expense Date <span className="text-red-400">*</span></label>
              <input
                type="date"
                value={form.date}
                onChange={e => set('date', e.target.value)}
                className={errors.date ? iECls : iCls}
              />
              {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className={lCls}>Amount (₹) <span className="text-red-400">*</span></label>
              <input
                type="number"
                value={form.amount}
                onChange={e => set('amount', e.target.value)}
                placeholder="0"
                min="1"
                className={errors.amount ? iECls : iCls}
              />
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
            </div>
          </div>

          {/* Reference Number */}
          <div>
            <label className={loCls}>Reference / Challan Number</label>
            <input
              type="text"
              value={form.ref}
              onChange={e => set('ref', e.target.value)}
              placeholder="e.g. TAX-2026-0987 (auto-generated if blank)"
              className={iCls}
            />
          </div>

          {/* Proof / Document Upload */}
          <div>
            <label className={loCls}>Proof Document / Challan Copy</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/jpg, application/pdf"
              className="hidden"
              id="rta-expense-doc-upload"
            />

            {!selectedFile ? (
              <label
                htmlFor="rta-expense-doc-upload"
                className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-gray-200 hover:border-rose-300 rounded-xl cursor-pointer bg-gray-50/50 hover:bg-rose-50/20 transition-all group"
              >
                <FiUploadCloud size={22} className="text-gray-400 group-hover:text-rose-500 transition-colors" />
                <span className="text-xs font-semibold text-gray-600 mt-1 group-hover:text-rose-600">
                  Upload Challan / Receipt / Document
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5">
                  Supports JPG, PNG or PDF (Max 5MB)
                </span>
              </label>
            ) : (
              <div className="flex items-center justify-between p-2.5 bg-rose-50/40 border border-rose-200/70 rounded-xl">
                <div className="flex items-center gap-2.5 min-w-0">
                  {filePreview ? (
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="w-10 h-10 object-cover rounded-lg border border-rose-200 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-rose-100/70 rounded-lg flex items-center justify-center text-rose-600 shrink-0">
                      <FiFile size={18} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{selectedFile.name}</p>
                    <p className="text-[10px] font-medium text-gray-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB · <span className="text-emerald-600 font-semibold">Ready to upload</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2 shrink-0"
                  title="Remove file"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            )}
            {errors.file && <p className="text-xs text-red-500 mt-1">{errors.file}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className={loCls}>Notes</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Optional notes…"
              className={iCls + ' resize-none'}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {loading ? 'Saving…' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
      <style>{MODAL_ANIM}</style>
    </div>
  );
}