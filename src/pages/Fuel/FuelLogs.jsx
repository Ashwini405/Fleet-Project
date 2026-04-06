import React from 'react';
import { FiSearch, FiFilter, FiDownload } from 'react-icons/fi';

const dummyFuelLogs = [
  { id: 1, date: "28-11-2025", vehicle: "AP-21-TA-1234", tyreCount: "10 Tyres", driver: "Ramesh Kumar", odometer: "86,220", distance: "450", quantity: "110", rate: "96.50", amount: "₹10,615", mileage: "4.09 KMPL", mileageStatus: "good" },
  { id: 2, date: "27-11-2025", vehicle: "TS-08-UA-1122", tyreCount: "12 Tyres", driver: "Suresh Babu", odometer: "112,450", distance: "380", quantity: "125", rate: "96.50", amount: "₹12,062", mileage: "3.04 KMPL", mileageStatus: "bad" },
  { id: 3, date: "25-11-2025", vehicle: "MH-12-CD-4567", tyreCount: "14 Tyres", driver: "Arjun Singh", odometer: "65,300", distance: "520", quantity: "135", rate: "96.50", amount: "₹13,027", mileage: "3.85 KMPL", mileageStatus: "neutral" },
];

export default function FuelLogs() {

  const getMileageStatus = (mileageStr) => {
    if (mileageStr === 'good') return 'text-green-700 bg-green-100';
    if (mileageStr === 'bad') return 'text-red-700 bg-red-100';
    return 'text-amber-700 bg-amber-100';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
      
      {/* Action & Filter Bar */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
        
        <div className="relative w-full md:w-72 flex-shrink-0">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search driver, vehicle..." 
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
            <FiFilter className="text-slate-400 w-4 h-4" />
            <select className="text-sm font-medium border-none focus:ring-0 p-0 text-slate-700 bg-transparent cursor-pointer">
              <option>All Periods</option>
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
            <span className="text-sm font-medium text-slate-600">Vehicle:</span>
            <select className="text-sm font-bold border-none focus:ring-0 p-0 text-indigo-700 bg-transparent cursor-pointer">
              <option>All Vehicles</option>
              <option>AP-21-TA-1234</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
            <span className="text-sm font-medium text-slate-600">Vendor:</span>
            <select className="text-sm font-bold border-none focus:ring-0 p-0 text-slate-700 bg-transparent cursor-pointer">
              <option>All Vendors</option>
              <option>Indian Oil</option>
              <option>BPCL</option>
            </select>
          </div>

          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
            <FiDownload className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap text-sm">
          <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
            <tr>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Vehicle</th>
              <th className="px-5 py-4">Tyres</th>
              <th className="px-5 py-4">Driver Name</th>
              <th className="px-5 py-4">Odometer</th>
              <th className="px-5 py-4">Dist (KM)</th>
              <th className="px-5 py-4">Qty (L)</th>
              <th className="px-5 py-4">Rate</th>
              <th className="px-5 py-4">Total Amount</th>
              <th className="px-5 py-4 text-center">Mileage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dummyFuelLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-4 font-medium text-slate-600">{log.date}</td>
                <td className="px-5 py-4 font-bold text-indigo-700">{log.vehicle}</td>
                <td className="px-5 py-4 text-slate-500">{log.tyreCount}</td>
                <td className="px-5 py-4 font-bold text-slate-700">{log.driver}</td>
                <td className="px-5 py-4 font-medium text-slate-600">{log.odometer}</td>
                <td className="px-5 py-4 font-medium text-slate-600">{log.distance}</td>
                <td className="px-5 py-4 font-bold text-slate-800">{log.quantity}</td>
                <td className="px-5 py-4 text-slate-600">{log.rate}</td>
                <td className="px-5 py-4 font-bold text-green-700">{log.amount}</td>
                <td className="px-5 py-4 text-center">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${getMileageStatus(log.mileageStatus)}`}>
                    {log.mileage}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 mt-auto bg-slate-50/30">
        <span>Showing 1 to 3 of 3 entries</span>
        <div className="flex gap-1">
          <button className="px-3 py-1 border border-slate-200 bg-white rounded hover:bg-slate-50 disabled:opacity-50" disabled>Temp</button>
          <button className="px-3 py-1 border border-indigo-600 bg-indigo-600 text-white rounded font-medium">1</button>
          <button className="px-3 py-1 border border-slate-200 bg-white rounded hover:bg-slate-50 disabled:opacity-50" disabled>Next</button>
        </div>
      </div>

    </div>
  );
}
