import React, { useState } from 'react';
import { FiX, FiHome, FiCheckCircle, FiZap } from 'react-icons/fi';
import axios from 'axios';

const FUEL_TYPES = ['Diesel', 'Petrol', 'CNG', 'LNG', 'EV Charging'];
const BANK_OPTIONS = ['HDFC Bank', 'State Bank of India (SBI)', 'ICICI Bank', 'Axis Bank', 'Canara Bank', 'Union Bank', 'Indian Bank', 'Bank of Baroda', 'Others'];

const iCls  = 'w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-sm';
const iECls = 'w-full p-3 bg-white border border-red-300 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-300 text-sm';
const lCls  = 'block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1';
const loCls = 'block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1';

const EMPTY = {
  name: '', contactPerson: '', mobile: '', email: '', address: '',
  fuelTypes: [], gst: '', openingBalance: '0', status: 'Active',
  bankName: '', customBank: '', accountNo: '', ifsc: '', upi: '', notes: '',
};

function validate(form, existingVendors) {
  const e = {};
  if (!form.name.trim())    e.name    = 'Vendor name is required';
  if (!form.mobile.trim())  e.mobile  = 'Mobile number is required';
  else if (!/^\d{10}$/.test(form.mobile.trim())) e.mobile = 'Enter a valid 10-digit mobile number';
  if (!form.address.trim()) e.address = 'Address is required';
  if (form.fuelTypes.length === 0) e.fuelTypes = 'Select at least one fuel type';
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
  if (form.gst) {
    const gst = form.gst.trim().toUpperCase();
    const validOfficial = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst);
    const validCustom = /^GST[0-9A-Z]{9,12}$/.test(gst);
    if (!validOfficial && !validCustom) e.gst = 'Enter a valid GST number';
  }
  const dup = existingVendors.find(v =>
    v.name.trim().toLowerCase() === form.name.trim().toLowerCase() &&
    (v.contact || v.mobile || '').replace(/\D/g, '') === form.mobile.trim()
  );
  if (dup) e.name = 'A vendor with this name and mobile already exists';
  return e;
}

export default function AddFuelVendorModal({ isOpen, onClose, onAdd, existingVendors = [] }) {
  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: null }));
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

    const errs = validate(form, existingVendors);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    try {
      setLoading(true);

      await axios.post('http://localhost:5001/api/fuel-vendors', {
        vendor_name: form.name.trim(),
        contact_person: form.contactPerson.trim(),
        mobile_number: form.mobile.trim(),
        email: form.email.trim(),
        address_location: form.address.trim(),
        fuel_types: form.fuelTypes,
        gst_number: form.gst.trim().toUpperCase(),
        opening_balance: Number(form.openingBalance) || 0,
        status: form.status,
        bank_name: form.bankName === 'Others' ? form.customBank : form.bankName,
        custom_bank_name: form.bankName === 'Others' ? form.customBank : null,
        account_number: form.accountNo.trim(),
        ifsc_code: form.ifsc.trim(),
        upi_id: form.upi.trim(),
        notes: form.notes.trim(),
      });

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setForm(EMPTY);
        setErrors({});
        onClose();
      }, 1200);

    } catch (error) {
      console.error('FUEL VENDOR SAVE ERROR', error);
      alert(error?.response?.data?.message || 'Failed to create fuel vendor');
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
            <h3 className="text-sm font-bold text-white tracking-wide">Add Fuel Vendor</h3>
            <p className="text-[11px] text-yellow-400 mt-0.5">Fuel Station Accounts · New Vendor</p>
          </div>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
            <FiX size={18} />
          </button>
        </div>

        {/* Success banner */}
        {success && (
          <div className="flex items-center gap-2 px-5 py-3 bg-green-50 border-b border-green-100 text-green-700 text-sm font-semibold">
            <FiCheckCircle size={16} /> Fuel vendor added successfully
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="p-6 max-h-[78vh] overflow-y-auto space-y-6">

          {/* Station Information */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Vendor Information</p>
            <div className="space-y-4">

              <div>
                <label className={lCls}>Vendor / Fuel Station Name <span className="text-red-400">*</span></label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Indian Oil Highway" className={errors.name ? iECls : iCls} />
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
                  <label className={loCls}>Contact Person</label>
                  <input type="text" value={form.contactPerson} onChange={e => set('contactPerson', e.target.value)}
                    placeholder="e.g. Suresh Kumar" className={iCls} />
                </div>
              </div>

              <div>
                <label className={lCls}>Address / Location <span className="text-red-400">*</span></label>
                <input type="text" value={form.address} onChange={e => set('address', e.target.value)}
                  placeholder="e.g. NH-44 Bypass, Hyderabad" className={errors.address ? iECls : iCls} />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
              </div>

              {/* Fuel Types */}
              <div>
                <label className={lCls}>
                  <span className="flex items-center gap-1"><FiZap size={11} /> Fuel Types Supported <span className="text-red-400">*</span></span>
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {FUEL_TYPES.map(ft => (
                    <button key={ft} type="button" onClick={() => toggleFuelType(ft)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        form.fuelTypes.includes(ft)
                          ? 'bg-yellow-500 text-white border-yellow-500'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-yellow-400'
                      }`}>
                      {ft}
                    </button>
                  ))}
                </div>
                {errors.fuelTypes && <p className="text-xs text-red-500 mt-1">{errors.fuelTypes}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={loCls}>Email Address</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="e.g. fuel@example.com" className={errors.email ? iECls : iCls} />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className={loCls}>GST Number</label>
                  <input type="text" value={form.gst} onChange={e => set('gst', e.target.value.toUpperCase())}
                    placeholder="e.g. 36AABCU9603R1ZX" maxLength={15} className={errors.gst ? iECls : iCls} />
                  {errors.gst && <p className="text-xs text-red-500 mt-1">{errors.gst}</p>}
                </div>
                <div>
                  <label className={lCls}>Status</label>
                  <select value={form.status} onChange={e => set('status', e.target.value)} className={iCls + ' text-gray-700'}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={loCls}>Opening Balance (₹)</label>
                  <input type="number" value={form.openingBalance} onChange={e => set('openingBalance', e.target.value)}
                    min="0" placeholder="0" className={iCls} />
                </div>
                <div>
                  <label className={loCls}>Notes / Remarks</label>
                  <input type="text" value={form.notes} onChange={e => set('notes', e.target.value)}
                    placeholder="Optional notes…" className={iCls} />
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details */}
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
                    placeholder="e.g. HDFC0001234" maxLength={11} className={iCls} />
                </div>
                <div>
                  <label className={loCls}>UPI ID</label>
                  <input type="text" value={form.upi} onChange={e => set('upi', e.target.value)}
                    placeholder="e.g. station@upi" className={iCls} />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading || success}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm">
            {loading ? 'Adding Vendor…' : success ? 'Added!' : 'Add Fuel Vendor'}
          </button>

        </form>
      </div>
      <style>{`@keyframes modalSlideIn { from { opacity:0; transform:translateY(18px) scale(0.96); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
}