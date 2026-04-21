import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiDownload } from 'react-icons/fi';

export default function FuelLogs() {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  // Fetch fuel logs from backend
  useEffect(() => {
    fetch('http://localhost:5001/api/fuel')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const formatted = data.data.map(item => {
            const mileage = Number(item.mileage || 0);
            const expected = Number(item.expected_mileage || 0);
            let status = 'neutral';
            if (mileage > expected) status = 'good';
            else if (mileage < expected - 1) status = 'bad';

            return {
              id: item.id,
              date: item.date ? new Date(item.date).toLocaleDateString('en-IN') : '',
              vehicle: item.vehicle_no || '—',
              tyreCount: '-', // not available in DB; keep placeholder
              driver: item.driver_name || '—',
              odometer: Number(item.current_odo || 0).toLocaleString(),
              distance: item.distance || 0,
              quantity: item.quantity || 0,
              rate: item.rate || 0,
              amount: `₹${Number(item.total_cost || 0).toLocaleString()}`,
              mileage: `${mileage.toFixed(2)} KMPL`,
              mileageStatus: status,
              vendor: item.vendor || '—',
              dateRaw: item.date, // for date filtering
            };
          });
          setFuelLogs(formatted);
        }
      })
      .catch(err => console.error('Error fetching fuel logs:', err));
  }, []);

  // Helper for mileage status badge
  const getMileageStatusClass = (status) => {
    if (status === 'good') return 'text-green-700 bg-green-100';
    if (status === 'bad') return 'text-red-700 bg-red-100';
    return 'text-amber-700 bg-amber-100';
  };

  // Filter logs based on search, vehicle, vendor, period
  const filteredLogs = fuelLogs.filter(log => {
    // Search by vehicle or driver
    const matchesSearch = search === '' ||
      log.vehicle.toLowerCase().includes(search.toLowerCase()) ||
      log.driver.toLowerCase().includes(search.toLowerCase());

    // Vehicle filter
    const matchesVehicle = selectedVehicle === 'all' || log.vehicle === selectedVehicle;

    // Vendor filter
    const matchesVendor = selectedVendor === 'all' || log.vendor === selectedVendor;

    // Period filter (simple mock)
    let matchesPeriod = true;
    if (selectedPeriod !== 'all' && log.dateRaw) {
      const logDate = new Date(log.dateRaw);
      const now = new Date();
      if (selectedPeriod === 'month') {
        matchesPeriod = logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
      } else if (selectedPeriod === 'lastMonth') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        matchesPeriod = logDate.getMonth() === lastMonth.getMonth() && logDate.getFullYear() === lastMonth.getFullYear();
      }
    }

    return matchesSearch && matchesVehicle && matchesVendor && matchesPeriod;
  });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Vehicle', 'Driver', 'Odometer', 'Distance (km)', 'Qty (L)', 'Rate (₹)', 'Total Amount', 'Mileage (KMPL)', 'Vendor'];
    const rows = filteredLogs.map(log => [
      log.date, log.vehicle, log.driver, log.odometer, log.distance, log.quantity, log.rate, log.amount, log.mileage, log.vendor
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fuel-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Unique values for dropdowns
  const uniqueVehicles = ['all', ...new Set(fuelLogs.map(l => l.vehicle))];
  const uniqueVendors = ['all', ...new Set(fuelLogs.map(l => l.vendor))];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
      
      {/* Action & Filter Bar */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
        
        <div className="relative w-full md:w-72 flex-shrink-0">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search driver, vehicle..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
            <FiFilter className="text-slate-400 w-4 h-4" />
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-sm font-medium border-none focus:ring-0 p-0 text-slate-700 bg-transparent cursor-pointer"
            >
              <option value="all">All Periods</option>
              <option value="month">This Month</option>
              <option value="lastMonth">Last Month</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
            <span className="text-sm font-medium text-slate-600">Vehicle:</span>
            <select 
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="text-sm font-bold border-none focus:ring-0 p-0 text-indigo-700 bg-transparent cursor-pointer"
            >
              {uniqueVehicles.map(v => (
                <option key={v} value={v}>{v === 'all' ? 'All Vehicles' : v}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
            <span className="text-sm font-medium text-slate-600">Vendor:</span>
            <select 
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="text-sm font-bold border-none focus:ring-0 p-0 text-slate-700 bg-transparent cursor-pointer"
            >
              {uniqueVendors.map(v => (
                <option key={v} value={v}>{v === 'all' ? 'All Vendors' : v}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
          >
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
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="10" className="px-5 py-10 text-center text-slate-500">
                  No fuel logs found.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
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
                    <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${getMileageStatusClass(log.mileageStatus)}`}>
                      {log.mileage}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 mt-auto bg-slate-50/30">
        <span>Showing {filteredLogs.length} of {fuelLogs.length} entries</span>
        <div className="flex gap-1">
          {/* Pagination buttons can be added if needed; for simplicity we keep static */}
          <button className="px-3 py-1 border border-slate-200 bg-white rounded hover:bg-slate-50 disabled:opacity-50" disabled>Prev</button>
          <button className="px-3 py-1 border border-indigo-600 bg-indigo-600 text-white rounded font-medium">1</button>
          <button className="px-3 py-1 border border-slate-200 bg-white rounded hover:bg-slate-50 disabled:opacity-50" disabled>Next</button>
        </div>
      </div>

    </div>
  );
}