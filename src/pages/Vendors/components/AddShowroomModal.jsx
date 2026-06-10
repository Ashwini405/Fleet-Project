import React, { useState } from 'react';
import { FiX, FiHome, FiCheckCircle } from 'react-icons/fi';

const BANK_OPTIONS = ['HDFC Bank','State Bank of India (SBI)','ICICI Bank','Axis Bank','Canara Bank','Union Bank','Indian Bank','Bank of Baroda','Others'];
const inputCls    = "w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm";
const inputErrCls = "w-full p-3 bg-white border border-red-300 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-300 text-sm";
const labelCls    = "block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1";
const labelOptCls = "block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1";

const EMPTY = {
  name: '', mobile: '', email: '', address: '', status: 'Active',
  contactPerson: '', designation: '',
  bankName: '', customBank: '', accountNo: '', ifsc: '', upi: '',
  openingBalance: '0',
};

export default function AddShowroomModal({ isOpen, onClose }) {
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [toast, setToast]   = useState(false);

  if (!isOpen) return null;

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())   e.name   = 'Showroom name is required';
    if (!form.mobile.trim()) e.mobile = 'Mobile number is required';
    else if (!/^\d{10}$/.test(form.mobile.trim())) e.mobile = 'Enter a valid 10-digit mobile number';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setToast(true);
    setTimeout(() => { setToast(false); setForm(EMPTY); setErrors({}); onClose(); }, 1500);
  };

  const handleClose = () => { setForm(EMPTY); setErrors({}); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm sm:max-w-lg overflow-hidden" style={{ animation: 'modalSlideIn 0.3s ease-out' }}>

        <div className="flex justify-between items-center p-5 bg-gray-900">
          <h3 className="text-sm font-bold text-white tracking-wide">Add New Showroom</h3>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"><FiX size={18} /></button>
        </div>

        {toast && (
          <div className="flex items-center gap-2 px-5 py-3 bg-green-50 border-b border-green-100 text-green-700 text-sm font-semibold">
            <FiCheckCircle size={16} /> Showroom created successfully
          </div>
        )}

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>

            {/* Showroom Details */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Showroom Details</p>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Showroom Name <span className="text-red-400">*</span></label>
                  <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                    placeholder="e.g. Lakshmi Toyota" className={errors.name ? inputErrCls : inputCls} />
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
                      placeholder="e.g. info@showroom.com" className={errors.email ? inputErrCls : inputCls} />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Address / Location <span className="text-red-400">*</span></label>
                    <input type="text" value={form.address} onChange={e => set('address', e.target.value)}
                      placeholder="e.g. Banjara Hills, Hyderabad" className={inputCls} />
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

            {/* Contact Person */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Contact Person (Optional)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelOptCls}>Contact Person Name</label>
                  <input type="text" value={form.contactPerson} onChange={e => set('contactPerson', e.target.value)}
                    placeholder="e.g. Ramesh Kumar" className={inputCls} />
                </div>
                <div>
                  <label className={labelOptCls}>Designation</label>
                  <input type="text" value={form.designation} onChange={e => set('designation', e.target.value)}
                    placeholder="e.g. Sales Manager" className={inputCls} />
                </div>
              </div>
            </div>

            {/* Bank Details */}
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
                      placeholder="e.g. 1234567890" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelOptCls}>IFSC Code</label>
                    <input type="text" value={form.ifsc} onChange={e => set('ifsc', e.target.value)}
                      placeholder="e.g. ICIC0001234" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelOptCls}>UPI ID</label>
                    <input type="text" value={form.upi} onChange={e => set('upi', e.target.value)}
                      placeholder="e.g. showroom@upi" className={inputCls} />
                  </div>
                </div>
              </div>
            </div>

            {/* Opening Balance */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Financial Details (Optional)</p>
              <div>
                <label className={labelOptCls}>Opening Balance (₹)</label>
                <input type="number" value={form.openingBalance} onChange={e => set('openingBalance', e.target.value)}
                  min="0" placeholder="0" className={inputCls} />
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors">
                Create Showroom
              </button>
            </div>

          </form>
        </div>
      </div>
      <style>{`@keyframes modalSlideIn { from { opacity:0; transform:translateY(20px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
    </div>
  );
}
