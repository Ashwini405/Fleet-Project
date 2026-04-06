import React, { useState } from "react";
import { FiEye, FiTruck, FiTrendingDown, FiTrendingUp, FiList } from "react-icons/fi";
import Modal from "../components/Modal";
import { dummyTrucks, dummyIncome, dummyExpense } from "../data/dummyData";

export default function TrucksTab({ selectedTruck, dateFrom, dateTo }) {
  const [selectedTruckData, setSelectedTruckData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Group by truck
  let truckStats = dummyTrucks.map(truck => {
    let tIncome = dummyIncome.filter(i => i.truckId === truck.id);
    let tExpense = dummyExpense.filter(e => e.truckId === truck.id);

    if (dateFrom) {
      tIncome = tIncome.filter(i => i.date >= dateFrom);
      tExpense = tExpense.filter(e => e.date >= dateFrom);
    }
    if (dateTo) {
      tIncome = tIncome.filter(i => i.date <= dateTo);
      tExpense = tExpense.filter(e => e.date <= dateTo);
    }

    const totalIncome = tIncome.reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = tExpense.reduce((sum, item) => sum + item.amount, 0);
    const netProfit = totalIncome - totalExpense;

    return {
      ...truck,
      totalIncome,
      totalExpense,
      netProfit,
      history: [...tIncome, ...tExpense].sort((a, b) => new Date(b.date) - new Date(a.date))
    };
  });

  if (selectedTruck !== "All") {
    truckStats = truckStats.filter(t => t.id === selectedTruck);
  }

  const handleOpenTruck = (truck) => {
    setSelectedTruckData(truck);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="px-2">
        <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
           <FiTruck className="text-blue-600"/> Fleet Performance
        </h2>
        <p className="text-sm text-gray-500">Monitor profit and loss by vehicle</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-gray-50">
              {truckStats.map((truck, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-blue-50 text-blue-500 rounded-xl border border-blue-100">
                      <FiTruck size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{truck.model}</div>
                      <div className="text-xs text-gray-500">{truck.id} <span className="mx-1">•</span> {truck.history.length} transactions in range</div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Income</div>
                    <div className="font-bold text-gray-800 text-lg">₹{truck.totalIncome.toLocaleString()}</div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Expense</div>
                    <div className="font-bold text-red-500 text-lg">₹{truck.totalExpense.toLocaleString()}</div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Net Profit</div>
                    <div className={`font-bold text-lg ${truck.netProfit >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                      ₹{truck.netProfit.toLocaleString()}
                    </div>
                  </td>
                  <td className="p-4 text-center w-16">
                    <button 
                      onClick={() => handleOpenTruck(truck)}
                      className="p-2 text-gray-400 hover:text-blue-500 border border-transparent hover:border-blue-100 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                      <FiEye size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {truckStats.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No truck records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTruckData && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title={<span className="flex items-center gap-2 text-gray-800"><FiTruck className="text-blue-600"/> Vehicle Report</span>}
        >
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6">
               <div className="flex-1">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-blue-50 text-blue-500 rounded-xl border border-blue-100">
                      <FiTruck size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{selectedTruckData.model}</h3>
                      <p className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded inline-block font-medium mt-1">{selectedTruckData.id}</p>
                    </div>
                 </div>
                 
                 <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Assigned Route</p>
                    <p className="font-bold text-gray-800 text-sm">Hyderabad - Mumbai</p>
                 </div>
               </div>

               <div className="flex-1 bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                 <div className="flex justify-between border-b border-gray-100 pb-3 mb-3">
                   <div>
                     <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-1">Total Income</p>
                     <p className="font-bold text-gray-800 text-lg">₹{selectedTruckData.totalIncome.toLocaleString()}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Total Expense</p>
                     <p className="font-bold text-gray-800 text-lg">₹{selectedTruckData.totalExpense.toLocaleString()}</p>
                   </div>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Net Profit</p>
                    <p className={`font-extrabold text-xl ${selectedTruckData.netProfit >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                      ₹{selectedTruckData.netProfit.toLocaleString()}
                    </p>
                 </div>
               </div>
            </div>

            <div className="pt-2">
              <h4 className="flex items-center gap-2 font-bold text-gray-700 mb-4 text-sm tracking-wide">
                <FiList className="text-gray-400" /> Transaction History
              </h4>
              <div className="max-h-64 overflow-y-auto pr-2 space-y-3">
                {selectedTruckData.history.map((txn, idx) => {
                  const isIncome = !!txn.type;
                  return (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors rounded px-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-lg border ${isIncome ? 'bg-green-50 text-green-500 border-green-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                           {isIncome ? <FiTrendingUp size={14}/> : <FiTrendingDown size={14}/>}
                        </div>
                        <div>
                          <p className="font-bold text-gray-700 text-sm">{isIncome ? txn.type : txn.category}</p>
                          <p className="text-xs text-gray-400 tracking-wide font-medium">{txn.date}</p>
                        </div>
                      </div>
                      <div className={`font-bold text-sm ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
                        {isIncome ? '+' : '-'}₹{txn.amount.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
                {selectedTruckData.history.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No transactions found.</p>
                )}
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-gray-100 mt-2">
               <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-sm">Close</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
