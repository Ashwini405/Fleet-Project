import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { dummyTrucks } from '../../Finance/data/dummyData';

export default function TransactionModal({ isOpen, onClose, vendor }) {
  const [type, setType] = useState('expense'); // 'expense' | 'payment'

  if (!isOpen || !vendor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm sm:max-w-lg overflow-hidden transform transition-all"
        style={{ animation: "modalSlideIn 0.2s ease-out" }}
      >
        <div className="flex justify-between items-center p-5 bg-[#1e293b] border-b border-gray-700">
          <h3 className="text-[15px] font-bold text-white tracking-wide">New Entry for {vendor.name}</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>
        
        <div className="p-6">
           <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
             <div className="flex gap-4 mb-2">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-2.5 text-[15px] font-bold rounded-lg transition-all ${
                    type === 'expense' 
                    ? 'bg-white text-red-600 border-[1.5px] border-red-600 shadow-sm' 
                    : 'bg-white text-gray-400 border border-gray-200'
                  }`}
                >
                  Bill / Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('payment')}
                  className={`flex-1 py-2.5 text-[15px] font-bold rounded-lg transition-all ${
                    type === 'payment' 
                    ? 'bg-white text-green-700 border-[1.5px] border-green-700 shadow-sm' 
                    : 'bg-white text-gray-400 border border-gray-200'
                  }`}
                >
                  Payment Given
                </button>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div>
                  <label className="block text-[11px] font-bold text-gray-500 capitalize tracking-wide mb-1.5">Date</label>
                  <input type="date" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-[14px] text-gray-700" required />
               </div>
               <div>
                  <label className="block text-[11px] font-bold text-gray-500 capitalize tracking-wide mb-1.5">Amount (₹)</label>
                  <input type="number" placeholder="0.00" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-[14px] text-gray-700" required />
               </div>
             </div>

             {type === 'expense' && (
                <div>
                   <label className="block text-[11px] font-bold text-gray-500 capitalize tracking-wide mb-1.5">Select Truck / Vehicle</label>
                   <select className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-[14px] text-gray-700">
                     <option value="">-- Select Truck --</option>
                     {dummyTrucks?.map(t => <option key={t.id} value={t.id}>{t.model} ({t.id})</option>)}
                   </select>
                </div>
             )}

             <div>
                <label className="block text-[11px] font-bold text-gray-500 capitalize tracking-wide mb-1.5">Description</label>
                <input type="text" placeholder="e.g. Bill No. 123" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-[14px] text-gray-700" required />
             </div>

             <div className="pt-2">
                <button type="submit" className="w-full py-4 bg-[#1e293b] hover:bg-slate-800 text-white rounded-lg font-bold text-[15px] transition-colors shadow-sm">
                  Save Transaction
                </button>
             </div>
           </form>
        </div>
      </div>
    </div>
  );
}
