import React, { useState } from 'react';
import { FiArrowLeft, FiPlus, FiMapPin, FiHome, FiPhone, FiEye, FiX } from 'react-icons/fi';
import { dummyLedger, vendorCategories } from '../data/dummyData';
import TransactionModal from './TransactionModal';

export default function LedgerView({ vendor, onBack }) {
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  
  const transactions = dummyLedger[vendor.id] || [];

  const getCategoryLabel = (catId) => {
    const found = vendorCategories.find(c => c.id === catId);
    return found ? found.label.toUpperCase() : catId.toUpperCase();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
         <button 
           onClick={onBack}
           className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors"
         >
           <FiArrowLeft /> Ledger Book
         </button>
         <button 
           onClick={() => setAddModalOpen(true)}
           className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-sm transition-colors"
         >
           <FiPlus /> Add Transaction
         </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-50">
            <div>
               <div className="flex items-center gap-3 text-xs font-bold text-gray-400 tracking-widest mb-2">
                 <span>{getCategoryLabel(vendor.category)}</span>
                 <span>•</span>
                 <span className="flex items-center gap-1"><FiPhone/> {vendor.contact}</span>
               </div>
               <h2 className="text-3xl font-black text-gray-800 tracking-tight mb-2">{vendor.name}</h2>
               <div className="flex items-center gap-1 text-sm text-gray-500 mb-4 font-medium">
                 <FiMapPin className="text-gray-400" /> {vendor.address}
               </div>
               
               <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl max-w-sm border border-gray-100">
                 <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-400 shadow-sm border border-gray-100">
                   <FiHome size={20} />
                 </div>
                 <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Bank Details</div>
                    <div className="text-xs font-bold text-gray-700">{vendor.bank || 'No bank details provided'}</div>
                    <div className="text-[10px] text-gray-500 font-medium">IFSC: Not provided</div>
                 </div>
               </div>
            </div>

            <div className="text-right p-6 bg-gray-50 border border-gray-100 rounded-2xl md:min-w-[200px]">
               <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Current Balance</div>
               <div className={`text-4xl font-black tracking-tighter ${vendor.balance < 0 ? 'text-green-500' : 'text-red-500'}`}>
                 ₹{Math.abs(vendor.balance).toLocaleString()}
               </div>
               <div className={`text-xs font-bold uppercase tracking-widest mt-1 ${vendor.balance < 0 ? 'text-green-600' : 'text-red-600'}`}>
                 Balance {vendor.balance < 0 ? 'Advanced (Cr)' : 'Due (Dr)'}
               </div>
            </div>
         </div>

         <div className="overflow-x-auto p-4 pt-0">
           <table className="w-full text-left border-collapse mt-2">
             <thead>
               <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                 <th className="py-2 px-2 md:px-4">Date</th>
                 <th className="py-2 px-2 md:px-4 hidden sm:table-cell">Truck No</th>
                 <th className="py-2 px-2 md:px-4">Description</th>
                 <th className="py-2 px-2 md:px-4 text-right">Debit (+)</th>
                 <th className="py-2 px-2 md:px-4 text-right">Credit (-)</th>
                 <th className="py-2 px-2 md:px-4 text-center hidden md:table-cell">Action</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-50">
               {transactions.map((txn) => (
                 <tr key={txn.id} className="hover:bg-gray-50/50 transition-colors">
                   <td className="py-2 md:py-4 px-2 md:px-4">
                     <span className="text-xs font-bold text-gray-600 tracking-wide">{txn.date}</span>
                   </td>
                   <td className="py-2 md:py-4 px-2 md:px-4 hidden sm:table-cell">
                     <span className="text-xs font-medium text-gray-500 bg-gray-100 px-1 md:px-2 py-1 rounded">
                       {txn.truckId || '-'}
                     </span>
                   </td>
                   <td className="py-2 md:py-4 px-2 md:px-4">
                     <span className="text-xs md:text-sm font-semibold text-gray-700">{txn.desc}</span>
                   </td>
                   <td className="py-2 md:py-4 px-2 md:px-4 text-right">
                     {txn.debit > 0 ? (
                        <span className="font-bold text-red-500 text-xs md:text-sm">₹{txn.debit.toLocaleString()}</span>
                     ) : (
                        <span className="font-bold text-gray-300">-</span>
                     )}
                   </td>
                   <td className="py-2 md:py-4 px-2 md:px-4 text-right">
                     {txn.credit > 0 ? (
                        <span className="font-bold text-green-500 text-xs md:text-sm">₹{txn.credit.toLocaleString()}</span>
                     ) : (
                        <span className="font-bold text-gray-300">-</span>
                     )}
                   </td>
                   <td className="py-2 md:py-4 px-2 md:px-4 text-center hidden md:table-cell">
                     <button 
                       onClick={() => setSelectedTxn(txn)}
                       className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                     >
                       <FiEye size={18} />
                     </button>
                   </td>
                 </tr>
               ))}
               {transactions.length === 0 && (
                 <tr>
                   <td colSpan="6" className="p-8 text-center text-gray-400 font-medium">No transactions found for this vendor.</td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
      </div>

      <TransactionModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} vendor={vendor} />

      {/* View Transaction Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all"
            style={{ animation: "modalSlideIn 0.2s ease-out" }}
          >
            <div className="flex justify-between items-center p-4 bg-slate-50 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 tracking-wide">Transaction Details</h3>
              <button 
                onClick={() => setSelectedTxn(null)}
                className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
               <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date</p>
                    <p className="font-bold text-gray-800 text-sm">{selectedTxn.date}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Type</p>
                    <p className={`font-bold text-sm ${selectedTxn.debit > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {selectedTxn.debit > 0 ? 'Bill / Expense' : 'Payment Given'}
                    </p>
                  </div>
               </div>

               <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Amount</p>
                 <p className={`text-3xl font-extrabold ${selectedTxn.debit > 0 ? 'text-red-500' : 'text-green-500'}`}>
                   ₹{(selectedTxn.debit > 0 ? selectedTxn.debit : selectedTxn.credit).toLocaleString()}
                 </p>
               </div>

               {selectedTxn.truckId && (
                 <div className="border-t border-gray-100 pt-4">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Vehicle Linked</p>
                   <p className="font-bold text-gray-800 text-sm bg-gray-100 px-2 py-1 inline-block rounded">{selectedTxn.truckId}</p>
                 </div>
               )}

               <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Description</p>
                  <div className="bg-gray-50 text-gray-600 p-3 rounded-lg border border-gray-100 text-sm">
                    "{selectedTxn.desc}"
                  </div>
               </div>

               <div className="flex justify-end pt-2">
                 <button onClick={() => setSelectedTxn(null)} className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-colors w-full">Close</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
