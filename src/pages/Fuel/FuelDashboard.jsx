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

// Vehicle master data (in real app, fetched from API)
const VEHICLE_DATA = {
  'AP-21-TA-1234': { driver: 'Ramesh Kumar', prevOdo: 85800 },
  'TS-08-UA-1122': { driver: 'Suresh Babu',  prevOdo: 62400 },
};

export default function FuelDashboard() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    date: '2025-11-29',
    vehicle: '',
    fuelType: 'Diesel',
    stationName: '',
    paymentMethod: 'Cash',
    tripId: '',
    currentOdo: '',
    qty: '',
    rate: '',
    fullTank: false,
    billNumber: '',
    vendor: '',
    vendorType: 'Petrol Pump',
    remarks: '',
    location: '',
    filledBy: 'Driver',
  });

  const vehicleInfo = VEHICLE_DATA[addForm.vehicle] || null;
  const prevOdo = vehicleInfo ? vehicleInfo.prevOdo : 0;
  const distance = addForm.currentOdo && prevOdo ? Math.max(0, parseFloat(addForm.currentOdo) - prevOdo) : 0;
  const calculatedCost = (parseFloat(addForm.qty) || 0) * (parseFloat(addForm.rate) || 0);
  const calculatedMileage = distance > 0 && parseFloat(addForm.qty) > 0
    ? (distance / parseFloat(addForm.qty)).toFixed(2)
    : '0.00';

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const getMileageStatus = (mileageStr) => {
    return mileageStr === 'good' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100';
  };

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
          <table className="w-full text-left whitespace-nowrap text-xs md:text-sm">
            <thead className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr className="border-b border-slate-100">
                <th className="px-3 md:px-6 py-3">Date</th>
                <th className="px-3 md:px-6 py-3">Vehicle</th>
                <th className="hidden sm:table-cell px-3 md:px-6 py-3">Tyre Count</th>
                <th className="px-3 md:px-6 py-3">Qty (L)</th>
                <th className="hidden md:table-cell px-3 md:px-6 py-3">Rate</th>
                <th className="px-3 md:px-6 py-3">Cost</th>
                <th className="hidden lg:table-cell px-3 md:px-6 py-3">Mileage</th>
                <th className="hidden xl:table-cell px-3 md:px-6 py-3">Vendor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {dummyFuelLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-3 md:px-6 py-3 text-slate-600 font-medium text-xs md:text-sm">{log.date}</td>
                  <td className="px-3 md:px-6 py-3 font-bold text-slate-800 text-xs md:text-sm truncate">{log.vehicle}</td>
                  <td className="hidden sm:table-cell px-3 md:px-6 py-3 text-slate-500 text-xs md:text-sm">{log.tyreCount}</td>
                  <td className="px-3 md:px-6 py-3 font-bold text-slate-700 text-xs md:text-sm">{log.qty}</td>
                  <td className="hidden md:table-cell px-3 md:px-6 py-3 text-slate-600 text-xs md:text-sm">{log.rate}</td>
                  <td className="px-3 md:px-6 py-3 font-bold text-slate-800 text-xs md:text-sm">{log.cost}</td>
                  <td className="hidden lg:table-cell px-3 md:px-6 py-3">
                    <span className={`inline-flex px-1 md:px-2 py-0.5 rounded text-[10px] md:text-[11px] font-bold ${getMileageStatus(log.mileageStatus)}`}>
                      {log.mileage}
                    </span>
                  </td>
                  <td className="hidden xl:table-cell px-3 md:px-6 py-3 text-slate-600 text-xs md:text-sm">{log.vendor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Fuel Entry Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />

          <div className="relative bg-white w-full sm:rounded-2xl shadow-2xl sm:max-w-2xl max-h-[95vh] flex flex-col animate-in zoom-in-95 duration-200 rounded-t-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">⛽</span>
                <div>
                  <h2 className="text-base font-bold text-slate-800">New Fuel Entry</h2>
                  <p className="text-xs text-slate-400">Fill all details to log a fuel transaction</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto flex-1 p-5 space-y-4">

              {/* ── SECTION 1: Basic Info ── */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">🚛 Basic Info</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Date</label>
                    <input type="date" name="date" value={addForm.date} onChange={handleFormChange} className="input" />
                  </div>
                  <div>
                    <label className="label">Select Vehicle</label>
                    <select name="vehicle" value={addForm.vehicle} onChange={handleFormChange} className="input">
                      <option value="">Choose vehicle...</option>
                      {Object.keys(VEHICLE_DATA).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Fuel Type</label>
                    <select name="fuelType" value={addForm.fuelType} onChange={handleFormChange} className="input">
                      <option>Diesel</option>
                      <option>Petrol</option>
                      <option>CNG</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Fuel Station Name</label>
                    <input type="text" name="stationName" value={addForm.stationName} onChange={handleFormChange} placeholder="e.g. HP Petrol Pump" className="input" />
                  </div>
                  <div>
                    <label className="label">Payment Method</label>
                    <select name="paymentMethod" value={addForm.paymentMethod} onChange={handleFormChange} className="input">
                      <option>Cash</option>
                      <option>Card</option>
                      <option>UPI</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Trip ID (Optional)</label>
                    <select name="tripId" value={addForm.tripId} onChange={handleFormChange} className="input">
                      <option value="">Select trip...</option>
                      <option value="TRIP-1001">TRIP-1001</option>
                      <option value="TRIP-1002">TRIP-1002</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ── SECTION 2: Auto Data ── */}
              <div className="bg-indigo-50/60 rounded-xl p-4 border border-indigo-100 space-y-3">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">⚡ Auto-Fetched Data</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label text-indigo-500">Driver (Auto)</label>
                    <input readOnly value={vehicleInfo?.driver || ''} placeholder="Select vehicle first" className="input-auto" />
                  </div>
                  <div>
                    <label className="label text-indigo-500">Previous Odometer (Auto)</label>
                    <input readOnly value={vehicleInfo ? prevOdo.toLocaleString() + ' km' : ''} placeholder="—" className="input-auto" />
                  </div>
                </div>
              </div>

              {/* ── SECTION 3: Odometer & Distance ── */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">📍 Odometer Reading</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="label text-indigo-500">Previous ODO</label>
                    <input readOnly value={vehicleInfo ? prevOdo.toLocaleString() : ''} placeholder="—" className="input-auto" />
                  </div>
                  <div>
                    <label className="label">Current ODO ✏️</label>
                    <input type="number" name="currentOdo" value={addForm.currentOdo} onChange={handleFormChange} placeholder="Enter reading" className="input" />
                  </div>
                  <div>
                    <label className="label text-emerald-600">Distance (Auto)</label>
                    <div className="input-calc">{distance > 0 ? `${distance.toLocaleString()} km` : '—'}</div>
                  </div>
                </div>
              </div>

              {/* ── SECTION 4: Fuel Details ── */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">⛽ Fuel Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Quantity (L)</label>
                    <input type="number" name="qty" value={addForm.qty} onChange={handleFormChange} placeholder="e.g. 120" className="input" />
                  </div>
                  <div>
                    <label className="label">Rate per Litre (₹)</label>
                    <input type="number" name="rate" value={addForm.rate} onChange={handleFormChange} placeholder="e.g. 96.50" className="input" />
                  </div>
                  <div>
                    <label className="label">Fuel Bill Number</label>
                    <input type="text" name="billNumber" value={addForm.billNumber} onChange={handleFormChange} placeholder="e.g. BILL-2025-001" className="input" />
                  </div>
                  <div className="flex items-center gap-3 pt-5">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="fullTank" checked={addForm.fullTank} onChange={handleFormChange} className="sr-only peer" />
                      <div className="w-10 h-5 bg-slate-200 peer-checked:bg-indigo-600 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                    </label>
                    <span className="text-sm font-semibold text-slate-700">Full Tank Fill</span>
                  </div>
                </div>
              </div>

              {/* ── SECTION 5: Cost & Performance (Auto) ── */}
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 space-y-3">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">📊 Cost & Performance (Auto-Calculated)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label text-emerald-700">Total Cost (₹)</label>
                    <div className="input-calc text-emerald-700">{calculatedCost > 0 ? `₹ ${calculatedCost.toFixed(2)}` : '—'}</div>
                  </div>
                  <div>
                    <label className="label text-emerald-700">Mileage (KMPL)</label>
                    <div className="input-calc text-emerald-700">{calculatedMileage !== '0.00' ? `${calculatedMileage} km/L` : '—'}</div>
                  </div>
                </div>
              </div>

              {/* ── SECTION 6: Vendor & Upload ── */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">🏪 Vendor & Receipt</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Vendor Type</label>
                    <select name="vendorType" value={addForm.vendorType} onChange={handleFormChange} className="input">
                      <option>Petrol Pump</option>
                      <option>Internal</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Fuel Vendor</label>
                    <select name="vendor" value={addForm.vendor} onChange={handleFormChange} className="input">
                      <option value="">Select vendor...</option>
                      <option>Indian Oil</option>
                      <option>BPCL</option>
                      <option>HPCL</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Upload Receipt</label>
                    <label className="flex items-center justify-center gap-2 w-full px-3 py-3 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors text-indigo-600 text-sm font-bold">
                      <FiDownload className="w-4 h-4" /> Click to upload bill / photo
                      <input type="file" className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* ── SECTION 7: Extra Info ── */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">📝 Extra Info</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Location</label>
                    <input type="text" name="location" value={addForm.location} onChange={handleFormChange} placeholder="e.g. NH-44, Kurnool" className="input" />
                  </div>
                  <div>
                    <label className="label">Fuel Filled By</label>
                    <select name="filledBy" value={addForm.filledBy} onChange={handleFormChange} className="input">
                      <option>Driver</option>
                      <option>Supervisor</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Remarks / Notes</label>
                    <textarea name="remarks" value={addForm.remarks} onChange={handleFormChange} rows={2} placeholder="Any additional notes..." className="input resize-none" />
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
              <button onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50">Cancel</button>
              <button
                onClick={() => { console.log(addForm); setIsAddModalOpen(false); }}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm flex items-center gap-2"
              >
                ⛽ Save Fuel Entry
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
