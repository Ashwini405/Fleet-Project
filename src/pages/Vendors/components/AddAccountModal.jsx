import React, { useState } from 'react';
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

export default function AddAccountModal({ isOpen, onClose, categoryName, category }) {
  const [bankName, setBankName] = useState('');
  const [customBank, setCustomBank] = useState('');

  if (!isOpen) return null;

  const isGarage = category === 'garages';

  const handleClose = () => {
    setBankName('');
    setCustomBank('');
    onClose();
  };

  if (isGarage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm sm:max-w-lg overflow-hidden" style={{ animation: "modalSlideIn 0.3s ease-out" }}>
          <div className="flex justify-between items-center p-5 bg-gray-900">
            <h3 className="text-sm font-bold text-white tracking-wide">Add New Garage</h3>
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
                    <label className={labelCls}>Garage Name <span className="text-red-400">*</span></label>
                    <input type="text" placeholder="e.g. City Auto Works" className={inputCls} required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Mobile Number <span className="text-red-400">*</span></label>
                      <input type="tel" placeholder="e.g. 9876543210" className={inputCls} required />
                    </div>
                    <div>
                      <label className={labelCls}>Address / Location <span className="text-red-400">*</span></label>
                      <input type="text" placeholder="e.g. Main Road, Hyderabad" className={inputCls} required />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="pt-2 border-t border-gray-100">
                <p className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3"><FiHome size={12} /> Bank Details (Optional)</p>
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
                      <input type="text" placeholder="Enter bank name" value={customBank} onChange={(e) => setCustomBank(e.target.value)} className={inputCls} />
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelOptCls}>Account Number / UPI ID</label>
                      <input type="text" placeholder="e.g. 501002345678 or cityautoworks@upi" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelOptCls}>IFSC Code</label>
                      <input type="text" placeholder="e.g. HDFC0001234" className={inputCls} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors">
                  Create Garage
                </button>
              </div>
            </form>
          </div>
        </div>
        <style>{`@keyframes modalSlideIn { from { opacity:0; transform:translateY(20px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
      </div>
    );
  }

  // Generic modal for other categories
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm sm:max-w-lg overflow-hidden transform transition-all"
        style={{ animation: "modalSlideIn 0.3s ease-out" }}
      >
        <div className="flex justify-between items-center p-5 bg-gray-900 border-b border-gray-100">
          <h3 className="text-sm font-bold text-white tracking-wide">Add New Account</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>
        <div className="p-6">
           <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
             <div>
               <label className={labelCls}>Account Name</label>
               <input type="text" placeholder="e.g. City Mechanics" className={inputCls} required />
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Mobile Number</label>
                  <input type="text" placeholder="e.g. 9876543210" className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>Address/Location</label>
                  <input type="text" placeholder="e.g. Main Street" className={inputCls} />
                </div>
             </div>

             <div className="pt-2 border-t border-gray-100">
               <h4 className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-4"><FiHome /> Bank Details (Optional)</h4>
               <div className="space-y-4">
                  <div>
                    <label className={labelOptCls}>Bank Name</label>
                    <input type="text" placeholder="e.g. HDFC Bank" className={inputCls} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelOptCls}>Account Number / UPI ID</label>
                      <input type="text" placeholder="e.g. 5010..." className={inputCls} />
                    </div>
                    <div>
                      <label className={labelOptCls}>IFSC Code</label>
                      <input type="text" placeholder="e.g. HDFC000..." className={inputCls} />
                    </div>
                  </div>
               </div>
             </div>

             <div className="pt-2 mt-6">
                <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors">
                  Create Account
                </button>
             </div>
           </form>
        </div>
      </div>
      <style>{`
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
