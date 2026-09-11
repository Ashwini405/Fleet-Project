import React, { useState, useRef } from 'react';
import { FiX, FiHome, FiCheckCircle, FiZap, FiAlertCircle, FiInfo } from 'react-icons/fi';
import axios from 'axios';

const FUEL_TYPES = ['Diesel', 'Petrol', 'CNG', 'LNG', 'EV Charging'];
const BANK_OPTIONS = ['HDFC Bank', 'State Bank of India (SBI)', 'ICICI Bank', 'Axis Bank', 'Canara Bank', 'Union Bank', 'Indian Bank', 'Bank of Baroda', 'Others'];

const iCls  = 'w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-sm transition-colors';
const iECls = 'w-full p-3 bg-white border border-red-300 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-300 text-sm transition-colors';
const lCls  = 'block text-xs font-bold text-gray-600 uppercase tracking-widest mb-1';
const loCls = 'block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1';

const EMPTY = {
  name: '', contactPerson: '', mobile: '', email: '', address: '',
  fuelTypes: [], gst: '', openingBalance: '0', status: 'Active', paymentTerms: 'credit',
  bankName: '', customBank: '', accountNo: '', ifsc: '', upi: '', notes: '',
};

function validate(form, existingVendors = []) {
  const e = {};
  if (!form.name.trim())    e.name    = 'Vendor name is required';
  if (!form.mobile.trim())  e.mobile  = 'Mobile number is required';
  else if (!/^\d{10}$/.test(form.mobile.trim())) e.mobile = 'Enter a valid 10-digit mobile number';
  if (!form.address.trim()) e.address = 'Address is required';
  if (form.fuelTypes.length === 0) e.fuelTypes = 'Select at least one fuel type';
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email address';

  const dup = (existingVendors || []).find(v => {
    const vName = (v?.vendor_name || v?.name || '').trim().toLowerCase();
    const vMobile = (v?.mobile_number || v?.mobile || v?.contact || '').replace(/\D/g, '');
    return vName === form.name.trim().toLowerCase() && vMobile === form.mobile.trim();
  });
  if (dup) e.name = 'A vendor with this name and mobile number already exists';

  return e;
}

export default function AddFuelVendorModal({ isOpen, onClose, onAdd, existingVendors = [] }) {
  const [form, setForm]         = useState(EMPTY);
  const [errors, setErrors]     = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [success, setSuccess]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const formRef = useRef(null);

  if (!isOpen) return null;

  const isCash = form.paymentTerms === 'cash';

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: null }));
    if (generalError) setGeneralError(null);
  };

  const handlePaymentTermsChange = (pt) => {
    if (pt === 'cash') {
      setForm(p => ({
        ...p,
        paymentTerms: 'cash',
        openingBalance: '0',
        bankName: '',
        customBank: '',
        accountNo: '',
        ifsc: '',
        upi: '',
      }));
    } else {
      setForm(p => ({
        ...p,
        paymentTerms: 'credit',
      }));
    }
    if (errors.paymentTerms) setErrors(p => ({ ...p, paymentTerms: null }));
  };

  const toggleFuelType = (ft) => {
    setForm(p => ({
      ...p,
      fuelTypes: p.fuelTypes.includes(ft)
        ? p.fuelTypes.filter(t => t !== ft)
        : [...p.fuelTypes, ft],
    }));
    setErrors(p => ({ ...p, fuelTypes: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);

    const errs = validate(form, existingVendors);
    if (Object.keys(errs).length) {
      setErrors(errs);
      setGeneralError('Please fill in all required fields marked with *');
      if (formRef.current) {
        formRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    try {
      setLoading(true);

      const payload = {
        vendor_name: form.name.trim(),
        contact_person: form.contactPerson.trim() || null,
        mobile_number: form.mobile.trim(),
        email: form.email.trim() || null,
        address_location: form.address.trim(),
        fuel_types: form.fuelTypes,
        gst_number: form.gst ? form.gst.trim().toUpperCase() : null,
        opening_balance: isCash ? 0 : (Number(form.openingBalance) || 0),
        status: form.status,
        payment_terms: form.paymentTerms,
        bank_name: isCash ? null : (form.bankName === 'Others' ? (form.customBank || null) : (form.bankName || null)),
        custom_bank_name: isCash ? null : (form.bankName === 'Others' ? (form.customBank || null) : null),
        account_number: isCash ? null : (form.accountNo.trim() || null),
        ifsc_code: isCash ? null : (form.ifsc.trim() || null),
        upi_id: isCash ? null : (form.upi.trim() || null),
        notes: form.notes.trim() || null,
      };

      await axios.post('http://localhost:5001/api/fuel-vendors', payload);

      setSuccess(true);
      if (onAdd) onAdd();

      setTimeout(() => {
        setSuccess(false);
        setForm(EMPTY);
        setErrors({});
        setGeneralError(null);
        onClose();
      }, 1000);

    } catch (error) {
      console.error('FUEL VENDOR SAVE ERROR:', error);
      const errMsg = error?.response?.data?.message || error?.message || 'Failed to create fuel vendor';
      setGeneralError(errMsg);
      if (formRef.current) {
        formRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm(EMPTY);
    setErrors({});
    setGeneralError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]" style={{ animation: 'modalSlideIn 0.25s ease-out' }}>

        {/* Header */}
        <div className="flex justify-between items-center p-5 bg-gray-900 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Add Fuel Vendor</h3>
            <p className="text-[11px] text-yellow-400 mt-0.5">Fuel Station Accounts · New Vendor</p>
          </div>
          <button onClick={handleClose} type="button" className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
            <FiX size={18} />
          </button>
        </div>

        {/* Success banner */}
        {success && (
          <div className="flex items-center gap-2 px-5 py-3 bg-emerald-50 border-b border-emerald-100 text-emerald-700 text-sm font-semibold shrink-0">
            <FiCheckCircle size={16} /> Fuel vendor added successfully!
          </div>
        )}

        {/* General Error Banner */}
        {generalError && (
          <div className="flex items-center gap-2 px-5 py-3 bg-red-50 border-b border-red-100 text-red-700 text-xs font-semibold shrink-0">
            <FiAlertCircle size={15} className="shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form ref={formRef} onSubmit={handleSubmit} noValidate className="p-6 overflow-y-auto space-y-6 flex-1">

          {/* Station Information */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Vendor Information</p>
            <div className="space-y-4">

              <div>
                <label className={lCls}>Vendor / Fuel Station Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Indian Oil Highway Station"
                  className={errors.name ? iECls : iCls}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={lCls}>Mobile Number <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    value={form.mobile}
                    onChange={e => set('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    className={errors.mobile ? iECls : iCls}
                  />
                  {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>}
                </div>
                <div>
                  <label className={loCls}>Contact Person</label>
                  <input
                    type="text"
                    value={form.contactPerson}
                    onChange={e => set('contactPerson', e.target.value)}
                    placeholder="e.g. Suresh Kumar"
                    className={iCls}
                  />
                </div>
              </div>

              <div>
                <label className={lCls}>Address / Location <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => set('address', e.target.value)}
                  placeholder="e.g. NH-44 Bypass, Hyderabad"
                  className={errors.address ? iECls : iCls}
                />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
              </div>

              {/* Fuel Types */}
              <div>
                <label className={lCls}>
                  <span className="flex items-center gap-1"><FiZap size={12} className="text-yellow-500" /> Fuel Types Supported <span className="text-red-500">*</span></span>
                </label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {FUEL_TYPES.map(ft => (
                    <button
                      key={ft}
                      type="button"
                      onClick={() => toggleFuelType(ft)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        form.fuelTypes.includes(ft)
                          ? 'bg-yellow-500 text-white border-yellow-500 shadow-sm'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-yellow-400 hover:bg-yellow-50/50'
                      }`}
                    >
                      {ft}
                    </button>
                  ))}
                </div>
                {errors.fuelTypes && <p className="text-xs text-red-500 mt-1">{errors.fuelTypes}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={loCls}>Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="e.g. station@example.com"
                    className={errors.email ? iECls : iCls}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className={loCls}>GST Number</label>
                  <input
                    type="text"
                    value={form.gst}
                    onChange={e => set('gst', e.target.value.toUpperCase())}
                    placeholder="e.g. 36AABCU9603R1ZX"
                    maxLength={15}
                    className={errors.gst ? iECls : iCls}
                  />
                  {errors.gst && <p className="text-xs text-red-500 mt-1">{errors.gst}</p>}
                </div>
                <div>
                  <label className={lCls}>Status</label>
                  <select
                    value={form.status}
                    onChange={e => set('status', e.target.value)}
                    className={iCls + ' text-gray-700 font-medium'}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Payment Terms */}
              <div>
                <label className={lCls}>Payment Terms</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => handlePaymentTermsChange('credit')}
                    className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      form.paymentTerms === 'credit'
                        ? 'bg-yellow-500 text-white border-yellow-500 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Credit (Ledger Account)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePaymentTermsChange('cash')}
                    className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      form.paymentTerms === 'cash'
                        ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Cash (Spot Payment)
                  </button>
                </div>

                {isCash ? (
                  <div className="flex items-start gap-2 p-3 mt-2.5 bg-violet-50 border border-violet-100 rounded-xl text-xs text-violet-700 font-medium leading-relaxed">
                    <FiInfo className="shrink-0 mt-0.5 text-violet-600" size={14} />
                    <span>Cash fuel vendor — fuel is paid upfront on the spot. Bank details and ledger balance tracking are not required.</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 mt-1.5 font-medium">Credit account with running balance and periodic settlement ledger.</p>
                )}
              </div>

              {/* Financials & Notes (Credit vendors only for opening balance) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {!isCash && (
                  <div>
                    <label className={loCls}>Opening Balance (₹)</label>
                    <input
                      type="number"
                      value={form.openingBalance}
                      onChange={e => set('openingBalance', e.target.value)}
                      min="0"
                      placeholder="0"
                      className={iCls}
                    />
                  </div>
                )}
                <div className={isCash ? "sm:col-span-2" : ""}>
                  <label className={loCls}>Notes / Remarks</label>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={e => set('notes', e.target.value)}
                    placeholder="Optional notes or pump location details…"
                    className={iCls}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Bank Details — Only for Credit Vendors */}
          {!isCash && (
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <FiHome size={12} className="text-yellow-500" /> Bank Details (Optional)
                </p>
                <span className="text-[11px] text-gray-400 font-medium">For credit settlements</span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={loCls}>Bank Name</label>
                  <select
                    value={form.bankName}
                    onChange={e => { set('bankName', e.target.value); set('customBank', ''); }}
                    className={iCls + ' text-gray-700'}
                  >
                    <option value="">Select Bank (Optional)</option>
                    {BANK_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                {form.bankName === 'Others' && (
                  <div>
                    <label className={loCls}>Custom Bank Name</label>
                    <input
                      type="text"
                      value={form.customBank}
                      onChange={e => set('customBank', e.target.value)}
                      placeholder="Enter bank name"
                      className={iCls}
                    />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={loCls}>Account Number</label>
                    <input
                      type="text"
                      value={form.accountNo}
                      onChange={e => set('accountNo', e.target.value)}
                      placeholder="e.g. 501002345678"
                      className={iCls}
                    />
                  </div>
                  <div>
                    <label className={loCls}>IFSC Code</label>
                    <input
                      type="text"
                      value={form.ifsc}
                      onChange={e => set('ifsc', e.target.value.toUpperCase())}
                      placeholder="e.g. HDFC0001234"
                      maxLength={11}
                      className={iCls}
                    />
                  </div>
                  <div>
                    <label className={loCls}>UPI ID</label>
                    <input
                      type="text"
                      value={form.upi}
                      onChange={e => set('upi', e.target.value)}
                      placeholder="e.g. station@upi"
                      className={iCls}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || success}
              className={`w-full py-3 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md ${
                isCash
                  ? 'bg-violet-600 hover:bg-violet-700'
                  : 'bg-yellow-500 hover:bg-yellow-600'
              }`}
            >
              {loading ? 'Adding Vendor…' : success ? 'Added!' : 'Add Fuel Vendor'}
            </button>
          </div>

        </form>
      </div>
      <style>{`@keyframes modalSlideIn { from { opacity:0; transform:translateY(18px) scale(0.96); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
}