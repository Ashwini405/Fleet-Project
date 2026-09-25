import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiX, FiHome, FiCheckCircle } from 'react-icons/fi';

const BANK_OPTIONS = ['HDFC Bank', 'State Bank of India (SBI)', 'ICICI Bank', 'Axis Bank', 'Canara Bank', 'Union Bank', 'Indian Bank', 'Bank of Baroda', 'Others'];
const inputCls = 'w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm';
const labelCls = 'block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1';
const labelOptCls = 'block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1';

export default function EditGarageModal({ isOpen, onClose, vendor }) {
  const [form, setForm] = useState({
    name: '', mobile: '', email: '', address: '', gst: '', status: 'Active', paymentTerms: 'credit',
    bankName: '', customBank: '', accountNo: '', ifsc: '', upi: '', openingBalance: '0',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!vendor) return;
    setForm({
      name: vendor.garage_name || '', mobile: vendor.mobile_number || '', email: vendor.email || '',
      address: vendor.address_location || '', gst: vendor.gst_number || '', status: vendor.status || 'Active',
      paymentTerms: vendor.payment_terms || 'credit', bankName: vendor.bank_name || '',
      customBank: vendor.custom_bank_name || '', accountNo: vendor.account_number_or_upi || '',
      ifsc: vendor.ifsc_code || '', upi: vendor.upi_id || '', openingBalance: vendor.opening_balance ?? '0',
    });
  }, [vendor]);

  if (!isOpen || !vendor) return null;

  const isCash = form.paymentTerms === 'cash';
  const set = (key, value) => setForm(previous => ({ ...previous, [key]: value }));
  const changePaymentTerms = (paymentTerms) => setForm(previous => paymentTerms === 'cash'
    ? { ...previous, paymentTerms, openingBalance: '0', bankName: '', customBank: '', accountNo: '', ifsc: '', upi: '' }
    : { ...previous, paymentTerms });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !/^\d{10}$/.test(form.mobile.trim())) {
      alert('Garage name and a valid 10-digit mobile number are required.');
      return;
    }
    try {
      setLoading(true);
      await axios.put(`http://localhost:5001/api/vendors/${vendor.id}`, {
        category: 'garages', garage_name: form.name.trim(), mobile_number: form.mobile.trim(),
        email: form.email.trim() || null, address_location: form.address.trim() || null,
        gst_number: form.gst.trim().toUpperCase() || null, status: form.status,
        payment_terms: form.paymentTerms, opening_balance: isCash ? 0 : (Number(form.openingBalance) || 0),
        bank_name: isCash ? null : (form.bankName === 'Others' ? form.customBank : form.bankName) || null,
        custom_bank_name: isCash ? null : (form.bankName === 'Others' ? form.customBank : null),
        account_number_or_upi: isCash ? null : form.accountNo.trim() || null,
        ifsc_code: isCash ? null : form.ifsc.trim().toUpperCase() || null,
        upi_id: isCash ? null : form.upi.trim() || null,
      });
      setToast(true);
      setTimeout(() => { setToast(false); onClose(); }, 900);
    } catch (error) {
      console.error('UPDATE GARAGE ERROR:', error);
      alert(error?.response?.data?.message || 'Failed to update garage');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center p-5 bg-gray-900">
          <h3 className="text-sm font-bold text-white tracking-wide">Edit Garage</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white"><FiX size={18} /></button>
        </div>
        {toast && <div className="flex items-center gap-2 px-5 py-3 bg-green-50 border-b border-green-100 text-green-700 text-sm font-semibold"><FiCheckCircle size={16} /> Garage updated successfully</div>}
        <form className="p-6 max-h-[80vh] overflow-y-auto space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div><label className={labelCls}>Garage Name *</label><input value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelCls}>Mobile Number *</label><input value={form.mobile} onChange={e => set('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10} className={inputCls} /></div>
              <div><label className={labelOptCls}>Email Address</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inputCls} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelCls}>Address / Location</label><input value={form.address} onChange={e => set('address', e.target.value)} className={inputCls} /></div>
              <div><label className={labelOptCls}>GST Number</label><input value={form.gst} onChange={e => set('gst', e.target.value)} className={inputCls} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelCls}>Status</label><select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls}><option>Active</option><option>Inactive</option></select></div>
              <div><label className={labelCls}>Payment Terms</label><div className="flex gap-2">{['credit', 'cash'].map(term => <button key={term} type="button" onClick={() => changePaymentTerms(term)} className={`flex-1 py-3 rounded-xl text-sm font-bold capitalize border ${form.paymentTerms === term ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200'}`}>{term}</button>)}</div></div>
            </div>
          </div>
          {!isCash && <>
            <div className="pt-2 border-t border-gray-100 space-y-4">
              <p className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest"><FiHome size={12} /> Bank Details (Optional)</p>
              <select value={form.bankName} onChange={e => setForm(previous => ({ ...previous, bankName: e.target.value, customBank: '' }))} className={inputCls}><option value="">Select Bank</option>{BANK_OPTIONS.map(bank => <option key={bank}>{bank}</option>)}</select>
              {form.bankName === 'Others' && <input value={form.customBank} onChange={e => set('customBank', e.target.value)} placeholder="Enter bank name" className={inputCls} />}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><input value={form.accountNo} onChange={e => set('accountNo', e.target.value)} placeholder="Account Number" className={inputCls} /><input value={form.ifsc} onChange={e => set('ifsc', e.target.value.toUpperCase())} placeholder="IFSC Code" maxLength={11} className={inputCls} /><input value={form.upi} onChange={e => set('upi', e.target.value)} placeholder="UPI ID" className={inputCls} /></div>
            </div>
            <div className="pt-2 border-t border-gray-100"><label className={labelOptCls}>Opening Balance (₹)</label><input type="number" min="0" value={form.openingBalance} onChange={e => set('openingBalance', e.target.value)} className={inputCls} /></div>
          </>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold disabled:opacity-50">{loading ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>
    </div>
  );
}
