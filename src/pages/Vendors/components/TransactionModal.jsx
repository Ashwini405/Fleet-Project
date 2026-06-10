import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

const inputCls = "w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-[14px] text-gray-700";
const labelCls = "block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5";

export default function TransactionModal({ isOpen, onClose, vendor }) {
  const [entryType, setEntryType] = useState('opening'); // 'opening' | 'adjustment'

  if (!isOpen || !vendor) return null;

  const handleClose = () => {
    setEntryType('opening');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm sm:max-w-lg overflow-hidden"
        style={{ animation: 'modalSlideIn 0.2s ease-out' }}
      >
        <div className="flex justify-between items-center p-5 bg-[#1e293b]">
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-wide">Add Exception Entry</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{vendor.name}</p>
          </div>
          <button onClick={handleClose} className="p-1 rounded hover:bg-slate-700 text-gray-400 hover:text-white transition-colors">
            <FiX size={18} />
          </button>
        </div>

        {/* Info banner */}
        <div className="bg-blue-50 border-b border-blue-100 px-5 py-2.5">
          <p className="text-[11px] text-blue-600 font-medium">
            Service bills and payments are recorded automatically. Use this form only for opening balance or correction entries.
          </p>
        </div>

        <div className="p-6">
          {/* Entry type toggle */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => setEntryType('opening')}
              className={`flex-1 py-2.5 text-[13px] font-bold rounded-lg transition-all ${
                entryType === 'opening'
                  ? 'bg-white text-purple-600 border-[1.5px] border-purple-500 shadow-sm'
                  : 'bg-white text-gray-400 border border-gray-200'
              }`}
            >
              Opening Balance
            </button>
            <button
              type="button"
              onClick={() => setEntryType('adjustment')}
              className={`flex-1 py-2.5 text-[13px] font-bold rounded-lg transition-all ${
                entryType === 'adjustment'
                  ? 'bg-white text-gray-700 border-[1.5px] border-gray-500 shadow-sm'
                  : 'bg-white text-gray-400 border border-gray-200'
              }`}
            >
              Manual Adjustment
            </button>
          </div>

          {entryType === 'opening' ? (
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleClose(); }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Date <span className="text-red-400">*</span></label>
                  <input type="date" className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>Amount (₹) <span className="text-red-400">*</span></label>
                  <input type="number" placeholder="0.00" className={inputCls} required />
                </div>
              </div>
              <div>
                <label className={labelCls}>Balance Type <span className="text-red-400">*</span></label>
                <select className={inputCls} required>
                  <option value="">Select Type</option>
                  <option value="debit">Debit (Dr) — Amount owed to garage</option>
                  <option value="credit">Credit (Cr) — Advance paid to garage</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Remarks</label>
                <input type="text" placeholder="e.g. Opening balance as on 01-Apr-2024" className={inputCls} />
              </div>
              <button type="submit" className="w-full py-3 bg-[#1e293b] hover:bg-slate-800 text-white rounded-lg font-bold text-[14px] transition-colors">
                Save Opening Balance
              </button>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleClose(); }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Date <span className="text-red-400">*</span></label>
                  <input type="date" className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>Amount (₹) <span className="text-red-400">*</span></label>
                  <input type="number" placeholder="0.00" className={inputCls} required />
                </div>
              </div>
              <div>
                <label className={labelCls}>Adjustment Type <span className="text-red-400">*</span></label>
                <select className={inputCls} required>
                  <option value="">Select Type</option>
                  <option value="debit">Debit Adjustment — Increase outstanding</option>
                  <option value="credit">Credit Adjustment — Reduce outstanding</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Remarks <span className="text-red-400">*</span></label>
                <input type="text" placeholder="e.g. Correction for duplicate entry on 15-Oct" className={inputCls} required />
              </div>
              <button type="submit" className="w-full py-3 bg-[#1e293b] hover:bg-slate-800 text-white rounded-lg font-bold text-[14px] transition-colors">
                Save Adjustment
              </button>
            </form>
          )}
        </div>
      </div>
      <style>{`@keyframes modalSlideIn { from { opacity:0; transform:translateY(20px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
    </div>
  );
}
