import React, { useState } from 'react';
import axios from 'axios';
import { FiX, FiHome, FiCheckCircle } from 'react-icons/fi';

const AGENT_TYPES  = ['Individual Agent', 'RTO Office', 'Transport Consultant', 'Other'];
const BANK_OPTIONS = ['HDFC Bank', 'State Bank of India (SBI)', 'ICICI Bank', 'Axis Bank', 'Canara Bank', 'Union Bank', 'Indian Bank', 'Bank of Baroda', 'Others'];

const iCls  = 'w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm';
const iECls = 'w-full p-3 bg-white border border-red-300 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-300 text-sm';
const lCls  = 'block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1';
const loCls = 'block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1';

const EMPTY = {
  name: '', mobile: '', email: '', address: '', agentType: '',
  openingBalance: '0', status: 'Active',
  bankName: '', customBank: '', accountNo: '', ifsc: '', upi: '', notes: '',
};

function validate(form, existing) {
  const e = {};
  if (!form.name.trim())      e.name      = 'Agent / office name is required';
  if (!form.mobile.trim())    e.mobile    = 'Mobile number is required';
  else if (!/^\d{10}$/.test(form.mobile.trim())) e.mobile = 'Enter a valid 10-digit mobile number';
  if (!form.agentType)        e.agentType = 'Agent type is required';
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
  const dup = existing.find(v =>
    v.name.trim().toLowerCase() === form.name.trim().toLowerCase() &&
    (v.contact || v.mobile || '').replace(/\D/g, '') === form.mobile.trim()
  );
  if (dup) e.name = 'An agent with this name and mobile already exists';
  return e;
}

export default function AddRTAVendorModal({ isOpen, onClose, onAdd, existingVendors = [] }) {
  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate(form, existingVendors);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        vendor_name: form.name.trim(),
        mobile_number: form.mobile.trim(),
        email: form.email.trim(),
        address_location: form.address.trim(),
        agent_type: form.agentType,
        opening_balance: Number(form.openingBalance) || 0,
        status: form.status,
        bank_name: form.bankName === "Others" ? form.customBank : form.bankName,
        custom_bank_name: form.customBank,
        account_number: form.accountNo.trim(),
        ifsc_code: form.ifsc.trim(),
        upi_id: form.upi.trim(),
        notes: form.notes.trim(),
      };

      const response = await axios.post("http://localhost:5001/api/rta-vendors", payload);

      if (response.data.success) {
        setSuccess(true);

        setTimeout(() => {
          setSuccess(false);
          setForm(EMPTY);
          setErrors({});
          onClose();

          if (onAdd) {
            onAdd();
          }
        }, 1200);
      }
    } catch (error) {
      console.error("Create RTA Vendor Error:", error);
      alert(error?.response?.data?.message || "Failed to create vendor");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => { setForm(EMPTY); setErrors({}); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden" style={{ animation: 'modalSlideIn 0.25s ease-out' }}>

        {/* Header */}
        <div className="flex justify-between items-center p-5 bg-gray-900">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Add RTA Agent</h3>
            <p className="text-[11px] text-rose-400 mt-0.5">RTA Expenses Accounts · New Agent</p>
          </div>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
            <FiX size={18} />
          </button>
        </div>

        {/* Success banner */}
        {success && (
          <div className="flex items-center gap-2 px-5 py-3 bg-green-50 border-b border-green-100 text-green-700 text-sm font-semibold">
            <FiCheckCircle size={16} /> RTA agent added successfully
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="p-6 max-h-[78vh] overflow-y-auto space-y-6">

          {/* Section 1: Agent Information */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Agent Information</p>
            <div className="space-y-4">

              <div>
                <label className={lCls}>Agent / Office Name <span className="text-red-400">*</span></label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="e.g. RTA Agent Suresh" className={errors.name ? iECls : iCls} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={lCls}>Mobile Number <span className="text-red-400">*</span></label>
                  <input type="tel" value={form.mobile} onChange={e => set('mobile', e.target.value)}
                    placeholder="e.g. 9876543210" maxLength={10} className={errors.mobile ? iECls : iCls} />
                  {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>}
                </div>
                <div>
                  <label className={loCls}>Email Address</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="e.g. agent@example.com" className={errors.email ? iECls : iCls} />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className={loCls}>Office Address</label>
                <textarea rows={2} value={form.address} onChange={e => set('address', e.target.value)}
                  placeholder="e.g. RTO Office, Hyderabad"
                  className={iCls + ' resize-none'} />
              </div>

              <div>
                <label className={lCls}>Agent Type <span className="text-red-400">*</span></label>
                <select value={form.agentType} onChange={e => set('agentType', e.target.value)}
                  className={`${errors.agentType ? iECls : iCls} text-gray-700`}>
                  <option value="">Select agent type</option>
                  {AGENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.agentType && <p className="text-xs text-red-500 mt-1">{errors.agentType}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={loCls}>Opening Balance (₹)</label>
                  <input type="number" value={form.openingBalance} onChange={e => set('openingBalance', e.target.value)}
                    placeholder="0" className={iCls} />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Positive = Payable to Agent · Negative = Advance with Agent
                  </p>
                </div>
                <div>
                  <label className={lCls}>Status</label>
                  <select value={form.status} onChange={e => set('status', e.target.value)}
                    className={iCls + ' text-gray-700'}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Bank Details */}
          <div className="pt-2 border-t border-gray-100">
            <p className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              <FiHome size={11} /> Bank Details (Optional)
            </p>
            <div className="space-y-4">
              <div>
                <label className={loCls}>Bank Name</label>
                <select value={form.bankName} onChange={e => { set('bankName', e.target.value); set('customBank', ''); }}
                  className={iCls + ' text-gray-600'}>
                  <option value="">Select Bank</option>
                  {BANK_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              {form.bankName === 'Others' && (
                <div>
                  <label className={loCls}>Custom Bank Name</label>
                  <input type="text" value={form.customBank} onChange={e => set('customBank', e.target.value)}
                    placeholder="Enter bank name" className={iCls} />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={loCls}>Account Number</label>
                  <input type="text" value={form.accountNo} onChange={e => set('accountNo', e.target.value)}
                    placeholder="e.g. 501002345678" className={iCls} />
                </div>
                <div>
                  <label className={loCls}>IFSC Code</label>
                  <input type="text" value={form.ifsc} onChange={e => set('ifsc', e.target.value.toUpperCase())}
                    placeholder="e.g. AXIS0001234" maxLength={11} className={iCls} />
                </div>
                <div>
                  <label className={loCls}>UPI ID</label>
                  <input type="text" value={form.upi} onChange={e => set('upi', e.target.value)}
                    placeholder="agent@upi" className={iCls} />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Additional Information */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Additional Information</p>
            <div>
              <label className={loCls}>Notes / Remarks</label>
              <textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)}
                placeholder="Any additional notes about this agent..."
                className={iCls + ' resize-none'} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={handleClose}
              className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading || success}
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Creating…' : success ? 'Created!' : 'Create Account'}
            </button>
          </div>

        </form>
      </div>
      <style>{`@keyframes modalSlideIn { from { opacity:0; transform:translateY(18px) scale(0.96); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
}