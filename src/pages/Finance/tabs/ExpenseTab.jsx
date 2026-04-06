import React, { useState } from "react";
import { FiPlus, FiEye, FiArrowLeft, FiTrendingDown, FiTruck } from "react-icons/fi";
import Modal from "../components/Modal";
import { dummyExpense, dummyTrucks } from "../data/dummyData";

export default function ExpenseTab({ selectedTruck, dateFrom, dateTo }) {
  const [viewState, setViewState] = useState("list"); // 'list' | 'add'
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  
  let filteredValues = dummyExpense;

  if (selectedTruck !== "All") {
    filteredValues = filteredValues.filter(e => e.truckId === selectedTruck);
  }
  if (dateFrom) {
    filteredValues = filteredValues.filter(e => e.date >= dateFrom);
  }
  if (dateTo) {
    filteredValues = filteredValues.filter(e => e.date <= dateTo);
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
            <h2 className="flex items-center gap-2 text-xl font-bold text-red-600">
              <FiTrendingDown /> Expense Logs
            </h2>
            <p className="text-sm text-gray-500">Creating new expense entry</p>
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
              <select className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm text-gray-700">
                <option value="">-- Select Truck --</option>
                {dummyTrucks.map(t => <option key={t.id} value={t.id}>{t.model} ({t.id})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Date</label>
              <input type="date" className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm text-gray-700" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Category</label>
              <select className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm text-gray-700">
                <option value="">-- Select Category --</option>
                <option value="Fuel">Fuel</option>
                <option value="Toll">Toll</option>
                <option value="Driver Salary">Driver Salary</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Amount (₹)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">₹</span>
                <input type="number" placeholder="0.00" className="w-full pl-8 p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm text-gray-700 hover:bg-gray-50" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Description / Note</label>
            <textarea rows="3" placeholder="e.g. Trip details, repair notes..." className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm text-gray-700"></textarea>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setViewState("list")} className="w-32 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-bold transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors">Save Entry</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-red-600">
            <FiTrendingDown /> Expense Logs
          </h2>
          <p className="text-sm text-gray-500">View all your expense history</p>
        </div>
        <button 
          onClick={() => setViewState("add")}
          className="flex items-center gap-2 px-4 py-2 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition-colors shadow-sm"
        >
          <FiPlus /> Add Expense
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-gray-50">
              {filteredValues.map((txn, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 w-12 text-center">
                     <div className="w-10 h-10 mx-auto rounded-xl bg-red-50 text-red-500 flex items-center justify-center border border-red-100">
                        <FiTrendingDown />
                     </div>
                  </td>
                  <td className="p-4">
                     <div className="font-bold text-gray-800">{txn.truckId}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-semibold text-gray-700">{txn.category} <span className="text-xs text-gray-400 font-normal">| {txn.date}</span></div>
                    <div className="text-xs text-gray-400 italic mt-0.5">"{txn.desc}"</div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-1">Amount</div>
                    <div className="font-bold text-red-600 text-lg">₹{txn.amount.toLocaleString()}</div>
                  </td>
                  <td className="p-4 text-center w-16">
                    <button 
                      onClick={() => handleView(txn)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <FiEye size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredValues.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No expense records found for selected filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTxn && (
        <Modal isOpen={isViewModalOpen} onClose={() => setViewModalOpen(false)} title={<span className="flex items-center gap-2 text-red-600"><FiTrendingDown/> Transaction Details</span>}>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                 <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Date</p>
                   <p className="font-bold text-gray-800 text-sm">{selectedTxn.date}</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Category</p>
                   <p className="font-bold text-gray-800 text-sm">{selectedTxn.category}</p>
                 </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Amount</p>
                <p className="text-3xl font-extrabold text-red-600">₹{selectedTxn.amount.toLocaleString()}</p>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><FiTruck /> Vehicle Linked</p>
                <p className="font-bold text-gray-800 text-sm">Volvo FH16</p>
                <p className="text-xs text-gray-500">{selectedTxn.truckId}</p>
              </div>

              <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description</p>
                 <div className="bg-gray-50 text-gray-600 p-3 rounded-xl border border-gray-100 text-sm italic">
                   "{selectedTxn.desc || "No description provided."}"
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
