import React from 'react';
import { FiX, FiHome } from 'react-icons/fi';

export default function AddAccountModal({ isOpen, onClose, categoryName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all"
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
               <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Account Name</label>
               <input type="text" placeholder="e.g. City Mechanics" className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm" required />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Mobile Number</label>
                  <input type="text" placeholder="e.g. 9876543210" className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Address/Location</label>
                  <input type="text" placeholder="e.g. Main Street" className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm" />
                </div>
             </div>

             <div className="pt-2 border-t border-gray-100">
               <h4 className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-4"><FiHome /> Bank Details (Optional)</h4>
               <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Bank Name</label>
                    <input type="text" placeholder="e.g. HDFC Bank" className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Account Number / UPI ID</label>
                      <input type="text" placeholder="e.g. 5010..." className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">IFSC Code</label>
                      <input type="text" placeholder="e.g. HDFC000..." className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm" />
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
