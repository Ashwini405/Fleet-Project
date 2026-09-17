import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiCheck, FiInfo, FiTag, FiTruck, FiAlertCircle, FiUploadCloud, FiFile, FiTrash2 } from 'react-icons/fi';
import api from '../../../services/api';
import { PAYMENT_METHODS, MODAL_ANIM } from './shared/constants';

const iCls  = 'w-full p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 text-sm';
const iECls = 'w-full p-2.5 bg-white border border-red-300 rounded-xl focus:outline-none focus:border-red-400 text-sm';
const lCls  = 'block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1';
const loCls = 'block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1';

function genRef(prefix) {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `${prefix}-${ymd}-${String(Math.floor(Math.random() * 900) + 100)}`;
}

export default function AddPaymentModal({
  isOpen,
  onClose,
  onSave,
  agentName,
  outstanding,
  vendorId,
  pendingExpenses = [],
  targetExpense = null,
}) {
  const today = new Date().toISOString().split('T')[0];
  const EMPTY = {
    expenseId: '',
    date: today,
    amount: '',
    method: 'UPI',
    ref: '',
    notes: '',
  };

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Sync target expense when modal opens
  useEffect(() => {
    if (isOpen) {
      if (targetExpense) {
        setForm({
          expenseId: String(targetExpense.rawId || targetExpense.id?.replace('EXP-', '') || ''),
          date: today,
          amount: String(targetExpense.remainingDue || targetExpense.debit || ''),
          method: 'UPI',
          ref: '',
          notes: `Payment for ${targetExpense.expenseType || 'expense'} (${targetExpense.truckId || ''})`,
        });
      } else if (pendingExpenses.length > 0) {
        setForm({
          expenseId: '',
          date: today,
          amount: '',
          method: 'UPI',
          ref: '',
          notes: '',
        });
      } else {
        setForm(EMPTY);
      }
      setErrors({});
    } else {
      handleReset();
    }
  }, [isOpen, targetExpense, pendingExpenses]);

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

  const selectedExp = pendingExpenses.find(
    e => String(e.rawId || e.id?.replace('EXP-', '')) === String(form.expenseId)
  );

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: null }));
  };

  const handleExpenseSelect = (expId) => {
    if (!expId) {
      setForm(p => ({ ...p, expenseId: '', amount: '', notes: '' }));
      return;
    }
    const exp = pendingExpenses.find(
      e => String(e.rawId || e.id?.replace('EXP-', '')) === String(expId)
    );
    if (exp) {
      setForm(p => ({
        ...p,
        expenseId: expId,
        amount: String(exp.remainingDue > 0 ? exp.remainingDue : exp.debit),
        notes: `Payment for ${exp.expenseType || 'expense'} (${exp.truckId || ''})`,
      }));
    } else {
      set('expenseId', expId);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    if (!form.date) e.date = 'Date is required';
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'Enter a valid payment amount';
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

      const ref = form.ref.trim() || genRef('PAY');
      const expIdNum = form.expenseId ? Number(form.expenseId) : null;

      const formData = new FormData();
      formData.append('vendor_id', vendorId);
      if (expIdNum) {
        formData.append('expense_id', expIdNum);
      }
      formData.append('payment_date', form.date);
      formData.append('amount', form.amount);
      formData.append('payment_method', form.method);
      formData.append('reference_no', ref);
      formData.append('notes', form.notes.trim());

      if (selectedFile) {
        formData.append('receipt_document', selectedFile);
      }

      await api.post('/rta-payments', formData, {
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
      console.error('Payment Save Error:', error);
      alert(error?.response?.data?.message || 'Failed to save payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" style={{ animation: 'modalSlideIn 0.22s ease-out' }}>
        
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 bg-gray-900">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Record Payment</p>
            <p className="text-sm font-bold text-white mt-0.5">{agentName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white rounded-full transition-colors">
            <FiX size={16} />
          </button>
        </div>

        {/* Total Outstanding Banner */}
        {outstanding > 0 && (
          <div className="px-5 py-2.5 bg-red-50/80 border-b border-red-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-red-700">Total Balance Due</span>
            <span className="text-sm font-black text-red-600">₹{outstanding.toLocaleString('en-IN')}</span>
          </div>
        )}

        <form onSubmit={handleSave} noValidate className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">

          {/* Specific Expense Selection */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <FiTag className="text-emerald-600" size={13} /> Select Expense to Pay
              </label>
              {pendingExpenses.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  {pendingExpenses.length} Pending
                </span>
              )}
            </div>
            <select
              value={form.expenseId}
              onChange={e => handleExpenseSelect(e.target.value)}
              className={`${iCls} text-gray-800 font-semibold bg-white`}
            >
              <option value="">General Account Payment / Advance (No Specific Expense)</option>
              {pendingExpenses.map(exp => {
                const expId = String(exp.rawId || exp.id?.replace('EXP-', ''));
                const due = exp.remainingDue != null ? exp.remainingDue : exp.debit;
                return (
                  <option key={expId} value={expId}>
                    {exp.truckId ? `[${exp.truckId}] ` : ''}{exp.expenseType} — Due: ₹{Number(due).toLocaleString('en-IN')} (Ref: {exp.ref || '—'})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Selected Expense Highlight Card */}
          {selectedExp && (
            <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <FiTag size={13} className="text-emerald-600" />
                  {selectedExp.expenseType}
                </span>
                {selectedExp.truckId && (
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 border border-blue-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <FiTruck size={10} /> {selectedExp.truckId}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center text-gray-600 pt-1 border-t border-emerald-100/80">
                <span>Total Fee: <strong>₹{Number(selectedExp.debit || 0).toLocaleString('en-IN')}</strong></span>
                <span>Due Now: <strong className="text-red-600 font-black">₹{Number(selectedExp.remainingDue || selectedExp.debit || 0).toLocaleString('en-IN')}</strong></span>
              </div>
            </div>
          )}

          {/* Date & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lCls}>Payment Date <span className="text-red-400">*</span></label>
              <input
                type="date"
                value={form.date}
                onChange={e => set('date', e.target.value)}
                className={errors.date ? iECls : iCls}
              />
              {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Amount (₹) <span className="text-red-400">*</span>
                </label>
                {selectedExp && (
                  <button
                    type="button"
                    onClick={() => set('amount', String(selectedExp.remainingDue || selectedExp.debit))}
                    className="text-[10px] font-bold text-emerald-600 hover:underline"
                  >
                    Pay Full
                  </button>
                )}
              </div>
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

          {/* Payment Mode & Reference */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lCls}>Payment Mode</label>
              <select
                value={form.method}
                onChange={e => set('method', e.target.value)}
                className={iCls + ' text-gray-700'}
              >
                {PAYMENT_METHODS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={loCls}>Reference / UTR No.</label>
              <input
                type="text"
                value={form.ref}
                onChange={e => set('ref', e.target.value)}
                placeholder="Auto-generated if blank"
                className={iCls}
              />
            </div>
          </div>

          {/* Payment Proof Upload */}
          <div>
            <label className={loCls}>Payment Proof / UTR Screenshot / Receipt</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/jpg, application/pdf"
              className="hidden"
              id="rta-payment-doc-upload"
            />

            {!selectedFile ? (
              <label
                htmlFor="rta-payment-doc-upload"
                className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-gray-200 hover:border-emerald-300 rounded-xl cursor-pointer bg-gray-50/50 hover:bg-emerald-50/20 transition-all group"
              >
                <FiUploadCloud size={20} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                <span className="text-xs font-semibold text-gray-600 mt-1 group-hover:text-emerald-600">
                  Upload Payment Proof / UTR Slip
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5">
                  Supports JPG, PNG or PDF (Max 5MB)
                </span>
              </label>
            ) : (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50/40 border border-emerald-200/70 rounded-xl">
                <div className="flex items-center gap-2.5 min-w-0">
                  {filePreview ? (
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="w-10 h-10 object-cover rounded-lg border border-emerald-200 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-emerald-100/70 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
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
            <label className={loCls}>Notes / Remarks</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="e.g. Paid via PhonePe / Road tax for AP 26 AP 4321..."
              className={iCls + ' resize-none'}
            />
          </div>

          {/* Actions */}
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
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {loading ? 'Saving…' : 'Save Payment'}
            </button>
          </div>

        </form>
      </div>
      <style>{MODAL_ANIM}</style>
    </div>
  );
}
