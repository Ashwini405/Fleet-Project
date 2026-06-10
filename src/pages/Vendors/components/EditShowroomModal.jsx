import React, { useState, useEffect } from 'react';
import { FiX, FiHome } from 'react-icons/fi';

const BANK_OPTIONS = [
  'HDFC Bank',
  'State Bank of India (SBI)',
  'ICICI Bank',
  'Axis Bank',
  'Canara Bank',
  'Union Bank',
  'Indian Bank',
  'Bank of Baroda',
  'Others',
];

const inputCls = "w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm";
const labelCls = "block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1";
const labelOptCls = "block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1";

export default function EditShowroomModal({ isOpen, onClose, vendor }) {
  const [bankName, setBankName]     = useState('');
  const [customBank, setCustomBank] = useState('');
  const [form, setForm] = useState({ name: '', contact: '', address: '', accountNo: '', ifsc: '', contactPerson: '', designation: '', email: '' });

  useEffect(() => {
    if (!vendor) return;
    const bankParts = vendor.bank ? vendor.bank.split(' - ') : [];
    const detectedBank = BANK_OPTIONS.includes(bankParts[0]) ? bankParts[0] : bankParts[0] ? 'Others' : '';
    setBankName(detectedBank);
    setCustomBank(detectedBank === 'Others' ? bankParts[0] : '');
    setForm({
      name:          vendor.name          || '',
      contact:       vendor.contact       || '',
      address:       vendor.address       || '',
      accountNo:     bankParts[1]         || '',
      ifsc:          '',
      contactPerson: vendor.contactPerson || '',
      designation:   vendor.designation   || '',
      email:         vendor.email         || '',
    });
  }, [vendor]);

  if (!isOpen || !vendor) return null;

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm sm:max-w-lg overflow-hidden" style={{ animation: 'modalSlideIn 0.3s ease-out' }}>
        <div className="flex justify-between items-center p-5 bg-gray-900">
          <h3 className="text-sm font-bold text-white tracking-wide">Edit Showroom</h3>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
            <FiX size={18} />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleClose(); }}>

            {/* Basic Details */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Basic Details</p>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Showroom Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Lakshmi Toyota"
                    className={inputCls}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Mobile Number <span className="text-red-400">*</span></label>
                    <input
                      type="tel"
                      value={form.contact}
                      onChange={(e) => setForm(p => ({ ...p, contact: e.target.value }))}
                      placeholder="e.g. 9876543210"
                      className={inputCls}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Address / Location <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))}
                      placeholder="e.g. Banjara Hills, Hyderabad"
                      className={inputCls}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Person */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Contact Person (Optional)</p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelOptCls}>Contact Person Name</label>
                    <input type="text" value={form.contactPerson} onChange={(e) => setForm(p => ({ ...p, contactPerson: e.target.value }))} placeholder="e.g. Ramesh Kumar" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelOptCls}>Designation</label>
                    <input type="text" value={form.designation} onChange={(e) => setForm(p => ({ ...p, designation: e.target.value }))} placeholder="e.g. Sales Manager" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelOptCls}>Email Address</label>
                  <input type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} placeholder="e.g. ramesh@lakshmitoyota.com" className={inputCls} />
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
                  <select
                    value={bankName}
                    onChange={(e) => { setBankName(e.target.value); setCustomBank(''); }}
                    className={inputCls + " text-gray-600"}
                  >
                    <option value="">Select Bank</option>
                    {BANK_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                {bankName === 'Others' && (
                  <div>
                    <label className={labelOptCls}>Custom Bank Name</label>
                    <input
                      type="text"
                      placeholder="Enter bank name"
                      value={customBank}
                      onChange={(e) => setCustomBank(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelOptCls}>Account Number / UPI ID</label>
                    <input
                      type="text"
                      value={form.accountNo}
                      onChange={(e) => setForm(p => ({ ...p, accountNo: e.target.value }))}
                      placeholder="e.g. 1234567890"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelOptCls}>IFSC Code</label>
                    <input
                      type="text"
                      value={form.ifsc}
                      onChange={(e) => setForm(p => ({ ...p, ifsc: e.target.value }))}
                      placeholder="e.g. ICIC0001234"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`@keyframes modalSlideIn { from { opacity:0; transform:translateY(20px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
    </div>
  );
}
