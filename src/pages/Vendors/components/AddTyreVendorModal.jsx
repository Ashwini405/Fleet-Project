import React, { useState } from 'react';
import { FiX, FiCheckCircle, FiCheck, FiHome } from 'react-icons/fi';
import axios from 'axios';

const VENDOR_TYPES = [
  'Tyre Dealer',
  'Manufacturer',
  'Retreading Vendor',
  'Tyre Repair Shop',
  'Service Center',
  'Scrap Buyer',
];

const SERVICES = [
  'Tyre Supply',
  'Retreading',
  'Tyre Repair',
  'Wheel Alignment',
  'Wheel Balancing',
];

const BANK_OPTIONS = ['HDFC Bank','State Bank of India (SBI)','ICICI Bank','Axis Bank','Canara Bank','Union Bank','Indian Bank','Bank of Baroda','Others'];

const inputCls    = "w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm";
const inputErrCls = "w-full p-3 bg-white border border-red-300 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-300 text-sm";
const labelCls    = "block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1";
const labelOptCls = "block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1";

const EMPTY = {
  vendorName: '', vendorType: '', contactPerson: '',
  mobileNumber: '', email: '', gstNumber: '', address: '',
  services: [], paymentTerms: 'credit',
  bankName: '', customBank: '', accountNo: '', ifsc: '', upi: '',
};

export default function AddTyreVendorModal({ isOpen, onClose, onAdd }) {
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [toast, setToast]   = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: null }));
  };

  const toggleService = (svc) => {
    setForm(p => {
      const current = Array.isArray(p.services) ? p.services : [];
      return {
        ...p,
        services: current.includes(svc)
          ? current.filter(s => s !== svc)
          : [...current, svc],
      };
    });
    if (errors.services) setErrors(p => ({ ...p, services: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.vendorName.trim())   e.vendorName   = 'Vendor name is required';
    if (!form.vendorType)          e.vendorType   = 'Vendor type is required';
    if (!form.mobileNumber.trim()) e.mobileNumber = 'Mobile number is required';
    else if (!/^\d{10}$/.test(form.mobileNumber.trim())) e.mobileNumber = 'Enter a valid 10-digit mobile number';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      setLoading(true);

      await axios.post('http://localhost:5001/api/tyre-vendors', {
        vendor_name: form.vendorName,
        vendor_type: form.vendorType,
        contact_person: form.contactPerson,
        mobile_number: form.mobileNumber,
        email: form.email,
        gst_number: form.gstNumber,
        address_location: form.address,
        services: form.services,
        payment_terms: form.paymentTerms,
        bank_name: form.bankName,
        custom_bank_name: form.customBank,
        account_number: form.accountNo,
        ifsc_code: form.ifsc,
        upi_id: form.upi,
        status: 'Active'
      });

      setToast(true);

      setTimeout(() => {
        setToast(false);
        setForm(EMPTY);
        setErrors({});
        onClose();
      }, 1500);

    } catch (error) {
      console.error('TYRE VENDOR SAVE ERROR', error);
      alert(error?.response?.data?.message || 'Failed to save tyre vendor');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => { setForm(EMPTY); setErrors({}); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden" style={{ animation: 'modalSlideIn 0.3s ease-out' }}>

        {/* Header */}
        <div className="flex justify-between items-center p-5 bg-gray-900">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Add Tyre Vendor</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Tyres Accounts · New Vendor</p>
          </div>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
            <FiX size={18} />
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div className="flex items-center gap-2 px-5 py-3 bg-green-50 border-b border-green-100 text-green-700 text-sm font-semibold">
            <FiCheckCircle size={16} /> Tyre vendor added successfully
          </div>
        )}

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>

            {/* Section 1 — Vendor Information */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Vendor Information</p>
              <div className="space-y-4">

                <div>
                  <label className={labelCls}>Vendor Name <span className="text-red-400">*</span></label>
                  <input
                    type="text" value={form.vendorName}
                    onChange={e => set('vendorName', e.target.value)}
                    placeholder="e.g. MRF Tyres Dealer"
                    className={errors.vendorName ? inputErrCls : inputCls}
                  />
                  {errors.vendorName && <p className="text-xs text-red-500 mt-1">{errors.vendorName}</p>}
                </div>

                <div>
                  <label className={labelCls}>Vendor Type <span className="text-red-400">*</span></label>
                  <select
                    value={form.vendorType} onChange={e => set('vendorType', e.target.value)}
                    className={(errors.vendorType ? inputErrCls : inputCls) + ' text-gray-700'}
                  >
                    <option value="">Select Type</option>
                    {VENDOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.vendorType && <p className="text-xs text-red-500 mt-1">{errors.vendorType}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelOptCls}>Contact Person</label>
                    <input
                      type="text" value={form.contactPerson}
                      onChange={e => set('contactPerson', e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Mobile Number <span className="text-red-400">*</span></label>
                    <input
                      type="tel" value={form.mobileNumber}
                      onChange={e => set('mobileNumber', e.target.value)}
                      placeholder="e.g. 9876543210" maxLength={10}
                      className={errors.mobileNumber ? inputErrCls : inputCls}
                    />
                    {errors.mobileNumber && <p className="text-xs text-red-500 mt-1">{errors.mobileNumber}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelOptCls}>Email Address</label>
                    <input
                      type="email" value={form.email}
                      onChange={e => set('email', e.target.value)}
                      placeholder="e.g. vendor@example.com"
                      className={errors.email ? inputErrCls : inputCls}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className={labelOptCls}>GST Number</label>
                    <input
                      type="text" value={form.gstNumber}
                      onChange={e => set('gstNumber', e.target.value)}
                      placeholder="e.g. 36AABCU9603R1ZX"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelOptCls}>Address</label>
                  <input
                    type="text" value={form.address}
                    onChange={e => set('address', e.target.value)}
                    placeholder="e.g. Auto Nagar, Hyderabad"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Payment Terms</label>
                  <div className="flex gap-2">
                    {['credit', 'cash'].map(pt => (
                      <button key={pt} type="button" onClick={() => {
                        set('paymentTerms', pt);
                        if (pt === 'cash') {
                          setForm(p => ({ ...p, paymentTerms: 'cash', bankName: '', customBank: '', accountNo: '', ifsc: '', upi: '' }));
                        }
                      }}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize border transition-colors ${
                          form.paymentTerms === pt
                            ? pt === 'cash' ? 'bg-violet-600 text-white border-violet-600' : 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}>
                        {pt}
                      </button>
                    ))}
                  </div>
                  {form.paymentTerms === 'cash' && (
                    <p className="text-[11px] text-violet-500 font-semibold mt-1.5">Cash vendor — payment is made upfront. No ledger balance tracking.</p>
                  )}
                </div>

              </div>
            </div>

            {/* Bank Details — credit only */}
            {form.paymentTerms === 'credit' && (
            <div className="border-t border-gray-100 pt-5">
              <p className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
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
                      placeholder="e.g. vendor@upi" className={inputCls} />
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* Section 2 — Services Offered */}
            <div className="border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Services Offered
                </p>
                {(Array.isArray(form.services) && form.services.length > 0) && (
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    {form.services.length} selected
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SERVICES.map(svc => {
                  const checked = Array.isArray(form.services) && form.services.includes(svc);
                  return (
                    <button
                      key={svc}
                      type="button"
                      onClick={() => toggleService(svc)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold text-left transition-all ${
                        checked
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all ${
                        checked ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                      }`}>
                        {checked && <FiCheck size={10} className="text-white" strokeWidth={3} />}
                      </span>
                      {svc}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "+ Add Tyre Vendor"}
              </button>
            </div>

          </form>
        </div>
      </div>
      <style>{`@keyframes modalSlideIn { from { opacity:0; transform:translateY(20px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
    </div>
  );
}