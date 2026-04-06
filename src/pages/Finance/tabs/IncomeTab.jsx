import React, { useState } from "react";
import { FiPlus, FiEye, FiArrowLeft, FiTrendingUp, FiMapPin, FiClock, FiCreditCard, FiTruck } from "react-icons/fi";
import Modal from "../components/Modal";
import { dummyIncome, dummyTrucks } from "../data/dummyData";

export default function IncomeTab({ selectedTruck, dateFrom, dateTo }) {
  const [viewState, setViewState] = useState("list"); // 'list' | 'add'
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  
  let filteredValues = dummyIncome;

  if (selectedTruck !== "All") {
    filteredValues = filteredValues.filter(i => i.truckId === selectedTruck);
  }
  if (dateFrom) {
    filteredValues = filteredValues.filter(i => i.date >= dateFrom);
  }
  if (dateTo) {
    filteredValues = filteredValues.filter(i => i.date <= dateTo);
  }

  const handleView = (txn) => {
    setSelectedTxn(txn);
    setViewModalOpen(true);
  };

  if (viewState === "add") {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-green-600">
              <FiTrendingUp /> Income Logs
            </h2>
            <p className="text-sm text-gray-500">Creating new income entry</p>
          </div>
          <button 
            onClick={() => setViewState("list")}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
          >
            <FiArrowLeft /> Back to Logs
          </button>
        </div>
        
        <form className="p-6 space-y-6" onSubmit={(e) => { e.preventDefault(); setViewState("list"); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Select Truck</label>
              <select className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm text-gray-700">
                <option value="">-- Select Truck --</option>
                {dummyTrucks.map(t => <option key={t.id} value={t.id}>{t.model} ({t.id})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1"><FiMapPin/> Place of Running</label>
              <input type="text" placeholder="Hyderabad - Mumbai" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Range of Freight (Start)</label>
               <input type="date" className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm text-gray-700" />
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Range of Freight (End)</label>
               <input type="date" className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm text-gray-700" />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Category</label>
              <select className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm text-gray-700">
                <option value="">-- Select Category --</option>
                <option value="Freight">Freight</option>
                <option value="Return Load">Return Load</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Amount (₹)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">₹</span>
                <input type="number" placeholder="0.00" className="w-full pl-8 p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm text-gray-700 hover:bg-gray-50" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Payment Received Date</label>
              <input type="date" className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm text-gray-700" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Bank Received Reference No</label>
              <input type="text" placeholder="e.g. IMPS/NEFT Ref" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Description / Note</label>
            <textarea rows="3" placeholder="e.g. Trip details, repair notes..." className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm text-gray-700"></textarea>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setViewState("list")} className="w-32 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-bold transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors">Save Entry</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-green-600">
            <FiTrendingUp /> Income Logs
          </h2>
          <p className="text-sm text-gray-500">View all your income history</p>
        </div>
        <button 
          onClick={() => setViewState("add")}
          className="flex items-center gap-2 px-4 py-2 border border-green-200 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl font-bold transition-colors shadow-sm"
        >
          <FiPlus /> Add Income
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-gray-50">
              {filteredValues.map((txn, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 w-12 text-center">
                     <div className="w-10 h-10 mx-auto rounded-xl bg-green-50 text-green-500 flex items-center justify-center border border-green-100">
                        <FiTrendingUp />
                     </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{txn.truckId} <span className="text-xs text-gray-400 font-normal">{txn.truckModel}</span></div>
                    <div className="text-sm font-semibold text-gray-700 mt-1">{txn.type} <span className="text-xs text-gray-400 font-normal">| {txn.date}</span></div>
                    <div className="text-xs text-gray-400 italic mt-0.5">"{txn.desc}"</div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-1">Amount</div>
                    <div className="font-bold text-green-600 text-lg">₹{txn.amount.toLocaleString()}</div>
                  </td>
                  <td className="p-4 text-center w-16">
                    <button 
                      onClick={() => handleView(txn)}
                      className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-xl transition-colors"
                    >
                      <FiEye size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredValues.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">No income records found for selected filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTxn && (
        <Modal isOpen={isViewModalOpen} onClose={() => setViewModalOpen(false)} title={<span className="flex items-center gap-2 text-green-600"><FiTrendingUp/ > Transaction Details</span>}>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 pb-2">
                 <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Recvd</p>
                   <p className="font-bold text-gray-800 text-sm">{selectedTxn.date}</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Category</p>
                   <p className="font-bold text-gray-800 text-sm">{selectedTxn.type}</p>
                 </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                 <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><FiMapPin /> Place of running</p>
                   <p className="font-bold text-gray-800 text-sm">{selectedTxn.route || "Mumbai - Hyderabad"}</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><FiClock /> Freight Range</p>
                   <p className="font-bold text-gray-600 text-sm">2023-10-28 to {selectedTxn.date}</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><FiCreditCard /> Bank Reference</p>
                   <p className="font-bold text-gray-600 text-sm">{selectedTxn.refNumber || "NEFT-8822311"}</p>
                 </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Amount</p>
                <p className="text-3xl font-extrabold text-green-600">₹{selectedTxn.amount.toLocaleString()}</p>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><FiTruck /> Vehicle Linked</p>
                <p className="font-bold text-gray-800 text-sm">{selectedTxn.truckModel}</p>
                <p className="text-xs text-gray-500">{selectedTxn.truckId}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description</p>
                <div className="bg-gray-50 text-gray-600 p-3 rounded-xl border border-gray-100 text-sm italic">
                  "{selectedTxn.desc || "Return Load"}"
                </div>
              </div>

              <div className="flex justify-end pt-2">
                 <button onClick={() => setViewModalOpen(false)} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors">Close</button>
              </div>
            </div>
        </Modal>
      )}
    </div>
  );
}
