import React, { useState } from 'react';
import { FiFilter, FiPlus, FiArrowUp, FiArrowDown, FiX, FiDownload } from 'react-icons/fi';

const summaryCards = [
  { title: "TOTAL CONSUMPTION", value: "4,520 L", trend: "up", percent: "12%", comparison: "vs last month", icon: "▼", type: "consumption" },
  { title: "FUEL COSTS", value: "₹4,36,180", trend: "good", sub: "Within Budget", icon: "₹", type: "cost" },
  { title: "FLEET EFFICIENCY", value: "3.8 KMPL", trend: "neutral", sub: "- Stable", icon: "A", type: "efficiency" },
  { title: "FUEL ALERTS", value: "3", trend: "bad", sub: "Low mileage / Theft", icon: "!", type: "alerts" }
];

const dummyFuelLogs = [
  { id: 1, date: "28-11-2025", vehicle: "AP-21-TA-1234", tyreCount: "10 Tyres", qty: "110", rate: "96.50", cost: "₹10,615", mileage: "4.09 KMPL", vendor: "Indian Oil", mileageStatus: "good" },
  { id: 2, date: "27-11-2025", vehicle: "TS-08-UA-1122", tyreCount: "12 Tyres", qty: "125", rate: "96.50", cost: "₹12,062", mileage: "3.04 KMPL", vendor: "BPCL", mileageStatus: "bad" },
];

export default function FuelDashboard() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    date: '2025-11-29', vehicle: '', distance: '', qty: '', rate: '', vendor: ''
  });

  const handleFormChange = (e) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };

  const getMileageStatus = (mileageStr) => {
    // Dummy logic based on status string provided in array
    return mileageStr === 'good' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100';
  };

  // Auto Calculations
  const calculatedCost = (parseFloat(addForm.qty) || 0) * (parseFloat(addForm.rate) || 0);
  const calculatedMileage = (parseFloat(addForm.distance) || 0) > 0 && (parseFloat(addForm.qty) || 0) > 0 
    ? ((parseFloat(addForm.distance) || 0) / (parseFloat(addForm.qty) || 0)).toFixed(2) 
    : '0.00';

  return (
    <div className="flex flex-col space-y-6">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {summaryCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.title}</span>
              {/* Dummy icons based on type */}
              <div className={`p-1.5 rounded-md ${
                card.type === 'consumption' ? 'text-blue-500 bg-blue-50' : 
                card.type === 'cost' ? 'text-green-500 bg-green-50' : 
                card.type === 'efficiency' ? 'text-amber-500 bg-amber-50' : 
                'text-red-500 bg-red-50'
              }`}>
                 {card.type === 'consumption' && <span className="text-[10px] font-black">▼</span>}
                 {card.type === 'cost' && <span className="font-bold">₹</span>}
                 {card.type === 'efficiency' && <span className="font-bold">A</span>}
                 {card.type === 'alerts' && <span className="font-bold">🔔</span>}
              </div>
            </div>
            
            <h3 className={`text-2xl font-black mb-1 ${card.type === 'alerts' ? 'text-red-600' : 'text-slate-800'}`}>
              {card.value}
            </h3>
            
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              {card.trend === "up" && <span className="text-green-600 flex items-center"><FiArrowUp className="w-3 h-3 mr-0.5" />{card.percent}</span>}
              {card.trend === "down" && <span className="text-red-600 flex items-center"><FiArrowDown className="w-3 h-3 mr-0.5" />{card.percent}</span>}
              
              {card.comparison && <span className="text-slate-400 font-medium">{card.comparison}</span>}
              
              {card.trend === "good" && <span className="text-green-600 flex items-center">✓ {card.sub}</span>}
              {card.trend === "neutral" && <span className="text-slate-500 flex items-center">{card.sub}</span>}
              {card.trend === "bad" && <span className="text-red-500 flex items-center">{card.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Operations Block */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 rounded-t-xl">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Dashboard Operations</h2>
          </div>
        </div>
        
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Filters:</span>
             <select className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer">
               <option>All Vehicles</option>
               <option>AP-21-TA-1234</option>
               <option>TS-08-UA-1122</option>
             </select>
             <select className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer">
               <option>This Month</option>
               <option>Last Month</option>
             </select>
          </div>
          <button 
             onClick={() => setIsAddModalOpen(true)}
             className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
          >
             <FiPlus className="w-4 h-4 stroke-[3]" /> New Fuel Entry
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap text-sm">
            <thead className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Tyre Count</th>
                <th className="px-6 py-4">Qty (L)</th>
                <th className="px-6 py-4">Rate</th>
                <th className="px-6 py-4">Cost</th>
                <th className="px-6 py-4">Mileage</th>
                <th className="px-6 py-4">Vendor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {dummyFuelLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-600 font-medium">{log.date}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{log.vehicle}</td>
                  <td className="px-6 py-4 text-slate-500">{log.tyreCount}</td>
                  <td className="px-6 py-4 font-bold text-slate-700">{log.qty}</td>
                  <td className="px-6 py-4 text-slate-600">{log.rate}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{log.cost}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${getMileageStatus(log.mileageStatus)}`}>
                      {log.mileage}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{log.vendor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Fuel Entry Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                Add Fuel Entry
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-slate-50/50 space-y-6">
              
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold tracking-wide text-slate-500 uppercase mb-1.5">Date</label>
                  <input type="date" name="date" value={addForm.date} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold tracking-wide text-slate-500 uppercase mb-1.5">Select Vehicle</label>
                  <select name="vehicle" value={addForm.vehicle} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 appearance-none">
                    <option value="">Select...</option>
                    <option value="AP-21-TA-1234">AP-21-TA-1234</option>
                  </select>
                </div>
              </div>

              {/* Auto Fetched */}
              <div className="grid grid-cols-2 gap-5 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <label className="block text-[11px] font-bold tracking-wide text-indigo-400 uppercase mb-1.5">Auto-Fetched Driver</label>
                  <input type="text" value={addForm.vehicle === 'AP-21-TA-1234' ? 'Ramesh Kumar' : ''} readOnly className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 cursor-not-allowed shadow-inner" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold tracking-wide text-indigo-400 uppercase mb-1.5">Current Odometer</label>
                  <input type="text" value={addForm.vehicle === 'AP-21-TA-1234' ? '86,220' : ''} readOnly className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 cursor-not-allowed shadow-inner" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-5">
                <div>
                  <label className="block text-[11px] font-bold tracking-wide text-slate-500 uppercase mb-1.5">Distance Travelled (KM)</label>
                  <input type="number" name="distance" value={addForm.distance} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold tracking-wide text-slate-500 uppercase mb-1.5">Quantity (L)</label>
                  <input type="number" name="qty" value={addForm.qty} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold tracking-wide text-slate-500 uppercase mb-1.5">Rate (₹)</label>
                  <input type="number" name="rate" value={addForm.rate} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                 <div>
                    <label className="block text-[11px] font-bold tracking-wide text-slate-500 uppercase mb-1.5">Total Cost (₹)</label>
                    <input type="text" value={calculatedCost.toFixed(2)} readOnly className="w-full px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-sm font-bold text-indigo-700 cursor-not-allowed shadow-inner" />
                 </div>
                 <div>
                    <label className="block text-[11px] font-bold tracking-wide text-slate-500 uppercase mb-1.5">Mileage (KMPL)</label>
                    <input type="text" value={calculatedMileage} readOnly className="w-full px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-sm font-bold text-indigo-700 cursor-not-allowed shadow-inner" />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-5 border-t border-slate-200 pt-5">
                <div>
                  <label className="block text-[11px] font-bold tracking-wide text-slate-500 uppercase mb-1.5">Fuel Vendor</label>
                  <select name="vendor" value={addForm.vendor} onChange={handleFormChange} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 appearance-none">
                    <option value="">Select Vendor...</option>
                    <option value="Indian Oil">Indian Oil</option>
                    <option value="BPCL">BPCL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold tracking-wide text-slate-500 uppercase mb-1.5">Fuel Receipt</label>
                   <div className="w-full flex items-center justify-center px-3 py-2 border border-slate-300 border-dashed rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors text-indigo-600 text-sm font-bold shadow-sm">
                     <span className="flex items-center gap-2"><FiDownload className="w-4 h-4" /> Upload File</span>
                   </div>
                </div>
              </div>

            </div>

            <div className="p-5 border-t border-slate-100 bg-white flex justify-end gap-3">
              <button onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50">Cancel</button>
              <button 
                onClick={() => { console.log(addForm); setIsAddModalOpen(false); }} 
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm"
              >
                Save Entry
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
