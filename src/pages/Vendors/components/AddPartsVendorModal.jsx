import React, { useState } from 'react';
import { FiX, FiHome, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';

const BANK_OPTIONS = ['HDFC Bank','State Bank of India (SBI)','ICICI Bank','Axis Bank','Canara Bank','Union Bank','Indian Bank','Bank of Baroda','Others'];

const inputCls    = "w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm";
const inputErrCls = "w-full p-3 bg-white border border-red-300 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-300 text-sm";
const labelCls    = "block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1";
const labelOptCls = "block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1";

const EMPTY = {
  name: '', mobile: '', email: '', address: '', gst: '',
  openingBalance: '0', status: 'Active',
  bankName: '', customBank: '', accountNo: '', ifsc: '', upi: '',
};

export default function AddPartsVendorModal({ isOpen, onClose }) {
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [toast, setToast]   = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())   e.name   = 'Vendor name is required';
    if (!form.mobile.trim()) e.mobile = 'Mobile number is required';
    else if (!/^\d{10}$/.test(form.mobile.trim())) e.mobile = 'Enter a valid 10-digit mobile number';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      setLoading(true);
      await axios.post('http://localhost:5001/api/parts-vendors', {
        vendor_name: form.name,
        mobile_number: form.mobile,
        email: form.email,
        address_location: form.address,
        gst_number: form.gst,
        opening_balance: form.openingBalance,
        status: form.status,
        bank_name: form.bankName === 'Others' ? form.customBank : form.bankName,
        custom_bank_name: form.customBank,
        account_number: form.accountNo,
        ifsc_code: form.ifsc,
        upi_id: form.upi,
      });
      setToast(true);
      setTimeout(() => { setToast(false); setForm(EMPTY); setErrors({}); onClose(); }, 1500);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to create vendor');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => { setForm(EMPTY); setErrors({}); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden" style={{ animation: 'modalSlideIn 0.3s ease-out' }}>

        <div className="flex justify-between items-center p-5 bg-gray-900">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Add Parts & Spares Vendor</h3>
            <p className="text-[11px] text-indigo-400 mt-0.5">Parts & Spares Accounts · New Vendor</p>
          </div>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"><FiX size={18} /></button>
        </div>

        {toast && (
          <div className="flex items-center gap-2 px-5 py-3 bg-green-50 border-b border-green-100 text-green-700 text-sm font-semibold">
            <FiCheckCircle size={16} /> Vendor created successfully
          </div>
        )}

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>

            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Vendor Information</p>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Vendor Name <span className="text-red-400">*</span></label>
                  <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                    placeholder="e.g. Genuine Parts Co." className={errors.name ? inputErrCls : inputCls} />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Mobile Number <span className="text-red-400">*</span></label>
                    <input type="tel" value={form.mobile} onChange={e => set('mobile', e.target.value)}
                      placeholder="e.g. 9876543210" maxLength={10} className={errors.mobile ? inputErrCls : inputCls} />
                    {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>}
                  </div>
                  <div>
                    <label className={labelOptCls}>Email Address</label>
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                      placeholder="e.g. vendor@example.com" className={errors.email ? inputErrCls : inputCls} />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>
                </div>
                <div>
                  <label className={labelOptCls}>Address / Location</label>
                  <input type="text" value={form.address} onChange={e => set('address', e.target.value)}
                    placeholder="e.g. Auto Nagar, Hyderabad" className={inputCls} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelOptCls}>GST Number</label>
                    <input type="text" value={form.gst} onChange={e => set('gst', e.target.value)}
                      placeholder="e.g. 36AABCU9603R1ZX" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelOptCls}>Opening Balance (₹)</label>
                    <input type="number" value={form.openingBalance} onChange={e => set('openingBalance', e.target.value)}
                      min="0" placeholder="0" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls + ' text-gray-700'}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <p className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                <FiHome size={12} /> Bank Details (Optional)
              </p>
              <div className="space-y-4">
                <div>
                  <label className={labelOptCls}>Bank Name</label>
                  <select value={form.bankName} onChange={e => { set('bankName', e.target.value); set('customBank', ''); }}
                    className={inputCls + ' text-gray-600'}>
                    <option value="">Select Bank</option>
                    {BANK_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                {form.bankName === 'Others' && (
                  <div>
                    <label className={labelOptCls}>Custom Bank Name</label>
                    <input type="text" value={form.customBank} onChange={e => set('customBank', e.target.value)}
                      placeholder="Enter bank name" className={inputCls} />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelOptCls}>Account Number</label>
                    <input type="text" value={form.accountNo} onChange={e => set('accountNo', e.target.value)}
                      placeholder="e.g. 501002345678" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelOptCls}>IFSC Code</label>
                    <input type="text" value={form.ifsc} onChange={e => set('ifsc', e.target.value)}
                      placeholder="e.g. HDFC0001234" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelOptCls}>UPI ID</label>
                    <input type="text" value={form.upi} onChange={e => set('upi', e.target.value)}
                      placeholder="e.g. vendor@upi" className={inputCls} />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Creating...' : 'Add Parts & Spares Vendor'}
              </button>
            </div>

          </form>
        </div>
      </div>
      <style>{`@keyframes modalSlideIn { from { opacity:0; transform:translateY(20px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
    </div>
  );
}
