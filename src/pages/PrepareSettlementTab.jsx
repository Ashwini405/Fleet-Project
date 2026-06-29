import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FiFileText, FiDollarSign, FiPlus, FiTrash2, FiInfo,
} from 'react-icons/fi';

export default function PrepareSettlementTab({
  plant, setPlant,
  truckNo, setTruckNo,
  statementMonth, setStatementMonth,
  fixedSalary, setFixedSalary,
  batthaRate, setBatthaRate,
  additions, setAdditions,
  deductions, setDeductions,
  penaltyReason, setPenaltyReason,
  otherDedReason, setOtherDedReason,
  draftId,
  settlementStatus,
  totalTrips, setTotalTrips,
  totalAdvances, setTotalAdvances,
  totalBattha,
  totalAdditions,
  totalDeductions,
  netPayable,
  vehicleId, setVehicleId,
  driverId, setDriverId,
}) {
  // ── Database states ──
  const [plants, setPlants] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [driverName, setDriverName] = useState('');
  const [loadingDriver, setLoadingDriver] = useState(false);

  // ── Fetch plants from database ──
  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/driver-settlements/plants');
      setPlants(response.data.data || []);
    } catch (error) {
      console.error('Error fetching plants:', error);
    }
  };

  // ── Fetch vehicles when plant changes ──
  useEffect(() => {
    if (plant) {
      fetchVehicles();
      // Reset vehicle selection when plant changes
      setTruckNo('');
      setVehicleId('');
      setDriverId('');
      setDriverName('');
      setTotalTrips(0);
      setTotalAdvances(0);
    }
  }, [plant]);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/driver-settlements/vehicles/${plant}`);
      setVehicles(response.data.data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  // ── Fetch driver details when vehicle changes ──
  useEffect(() => {
    if (truckNo && statementMonth) {
      fetchDriver();
    } else {
      setDriverName('');
      setDriverId('');
      setVehicleId('');
      setTotalTrips(0);
      setTotalAdvances(0);
    }
  }, [truckNo, statementMonth]);

  const fetchDriver = async () => {
    try {
      setLoadingDriver(true);
      const response = await axios.get(
        `http://localhost:5001/api/driver-settlements/driver/${truckNo}?month=${statementMonth}`
      );
      const data = response.data.data || {};
      setDriverName(data.driver_name || '');
      setDriverId(data.driver_id || '');
      setVehicleId(data.vehicle_id || '');
      if (setTotalTrips) setTotalTrips(data.total_trips || 0);
      if (setTotalAdvances) setTotalAdvances(data.total_advance || 0);
    } catch (error) {
      console.error('Error fetching driver:', error);
      setDriverName('');
      setDriverId('');
      setVehicleId('');
      setTotalTrips(0);
      setTotalAdvances(0);
    } finally {
      setLoadingDriver(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 space-y-6">

        {/* ── Header Box ── */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold flex items-center gap-2 text-slate-800">
                <FiFileText className="text-indigo-500" /> Prepare Monthly Settlement
              </h2>
              {draftId && (
                <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  {draftId}
                </span>
              )}
            </div>
            {{
              Draft:     <span className="bg-blue-50 text-blue-600 border border-blue-200 text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wide">Status: Draft</span>,
              Submitted: <span className="bg-yellow-50 text-yellow-600 border border-yellow-200 text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wide">Status: Submitted</span>,
              Approved:  <span className="bg-green-50 text-green-600 border border-green-200 text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wide">Status: Approved</span>,
              Paid:      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wide">Status: Paid</span>,
            }[settlementStatus]}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Running Plant */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Running Plant</label>
              <select value={plant} onChange={e => setPlant(e.target.value)} className="w-full text-sm font-medium border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none">
                <option value="">Select Plant</option>
                {plants.map((item, index) => (
                  <option key={index} value={item.source_plant}>
                    {item.source_plant}
                  </option>
                ))}
              </select>
            </div>

            {/* Truck No */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Truck No *</label>
              <select value={truckNo} onChange={e => setTruckNo(e.target.value)} className="w-full text-sm font-bold text-slate-800 border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none">
                <option value="">Select Truck</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.vehicle_no}>
                    {vehicle.vehicle_no}
                  </option>
                ))}
              </select>
            </div>

            {/* Driver Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Driver Name</label>
              {loadingDriver ? (
                <div className="flex items-center w-full text-sm border border-slate-200 bg-slate-50 rounded-lg px-3 py-2">
                  <span className="text-slate-400">Loading...</span>
                </div>
              ) : driverName ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center w-full text-sm border border-indigo-200 bg-indigo-50/40 rounded-lg px-3 py-2 gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                    <span className="font-bold text-slate-800 flex-1">{driverName}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium pl-1">Auto-fetched from database</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center w-full text-sm border border-red-200 bg-red-50/40 rounded-lg px-3 py-2 gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <span className="font-semibold text-red-500 flex-1">No Driver Assigned</span>
                  </div>
                  <p className="text-[10px] text-red-400 font-medium pl-1">Assign a driver in Vehicle Master first</p>
                </div>
              )}
            </div>

            {/* Statement Month */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Statement Month</label>
              <input type="month" value={statementMonth} onChange={e => setStatementMonth(e.target.value)} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
            </div>
          </div>
        </div>

        {/* ── Earnings Card ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
          <div className="px-5 pt-5 pb-4 border-b border-slate-100 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <FiDollarSign className="w-4 h-4 text-blue-500" />
            </div>
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">Earnings</h2>
            <span className="ml-auto text-[10px] font-bold text-blue-500 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded uppercase tracking-wider">Auto Calculate</span>
          </div>
          <div className="p-5 flex flex-col lg:flex-row gap-6">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Fixed Monthly Salary</label>
                <input type="number" value={fixedSalary} onChange={e => setFixedSalary(Number(e.target.value))} className="w-full text-sm font-bold text-indigo-700 border border-slate-300 bg-indigo-50/30 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Battha Rate Per Trip</label>
                <input type="number" value={batthaRate} onChange={e => setBatthaRate(Number(e.target.value))} className="w-full text-sm font-medium border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Total Trips</label>
                <div className="w-full text-sm font-bold text-slate-700 border border-slate-200 bg-slate-50 rounded-lg px-3 py-2.5 flex items-center gap-2">
                  <span className="text-base">{totalTrips}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Auto Fetch</span>
                </div>
              </div>
              <div className="flex flex-col justify-end">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Formula: Trips × Rate</p>
                <p className="text-xs font-medium text-slate-500">
                  {totalTrips} × ₹{batthaRate} = <span className="font-bold text-slate-700">₹ {totalBattha.toFixed(2)}</span>
                </p>
              </div>
            </div>
            <div className="hidden lg:block w-px bg-slate-100" />
            <div className="block lg:hidden h-px bg-slate-100" />
            <div className="lg:w-52 shrink-0 flex flex-col items-center justify-center bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 text-center">
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Total Battha</p>
              <p className="text-4xl font-black text-indigo-700 tracking-tight leading-none">₹ {totalBattha.toFixed(0)}</p>
              <p className="text-xs text-slate-400 mt-2 font-medium">{totalTrips} trips × ₹{batthaRate}/trip</p>
              <div className="mt-3 w-full border-t border-blue-100 pt-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Salary</span>
                  <span className="font-bold text-slate-700">₹ {fixedSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-slate-500 font-medium">Battha</span>
                  <span className="font-bold text-indigo-600">₹ {totalBattha.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs mt-2 pt-2 border-t border-blue-100">
                  <span className="font-bold text-slate-600">Total Earnings</span>
                  <span className="font-black text-indigo-700">₹ {(fixedSalary + totalBattha).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Additional Earnings Card ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
          <div className="px-5 pt-5 pb-4 border-b border-slate-100 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
              <FiPlus className="w-4 h-4 text-green-500" />
            </div>
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">Additional Earnings</h2>
            <span className="ml-auto text-[10px] font-bold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded uppercase tracking-wider">Auto Calculate</span>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                ['Loading Charges',   'loading'],
                ['Unloading Charges', 'unloading'],
                ['Bonus',             'bonus'],
                ['Other Allowances',  'others'],
              ].map(([label, key]) => (
                <div key={key}>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">{label}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                    <input type="number" value={additions[key]} onChange={e => setAdditions({ ...additions, [key]: e.target.value })} className="w-full text-sm font-medium border border-slate-300 rounded-lg pl-6 pr-3 py-2.5 focus:ring-1 focus:ring-green-500 focus:outline-none" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-green-50 border border-green-100 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                <span>Loading <span className="font-bold text-slate-700">₹ {Number(additions.loading) || 0}</span></span>
                <span className="text-slate-300">+</span>
                <span>Unloading <span className="font-bold text-slate-700">₹ {Number(additions.unloading) || 0}</span></span>
                <span className="text-slate-300">+</span>
                <span>Bonus <span className="font-bold text-slate-700">₹ {Number(additions.bonus) || 0}</span></span>
                <span className="text-slate-300">+</span>
                <span>Allowances <span className="font-bold text-slate-700">₹ {Number(additions.others) || 0}</span></span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] font-bold text-green-600 uppercase tracking-widest">Total Additions</span>
                <span className="text-2xl font-black text-green-600">+ ₹ {totalAdditions.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Deductions Card ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
          <div className="px-5 pt-5 pb-4 border-b border-slate-100 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
              <FiTrash2 className="w-4 h-4 text-red-500" />
            </div>
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">Deductions</h2>
            <span className="ml-auto text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded uppercase tracking-wider">Auto Calculate</span>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

              {/* Driver Advance */}
              <div className="flex flex-col gap-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Driver Advance</label>
                <div className="w-full text-sm font-bold text-red-600 border border-red-200 bg-red-50/40 rounded-lg px-3 py-2.5 flex items-center justify-between">
                  <span>₹ {totalAdvances.toLocaleString()}</span>
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Auto Fetch</span>
                </div>
                <p className="flex items-start gap-1 text-[11px] text-slate-400 leading-relaxed">
                  <FiInfo className="w-3 h-3 mt-0.5 shrink-0 text-slate-300" />
                  Outstanding advance automatically fetched from driver records and deducted during settlement.
                </p>
              </div>

              {/* Penalty */}
              <div className="flex flex-col gap-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Penalty</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                  <input type="number" value={deductions.penalty} onChange={e => setDeductions({ ...deductions, penalty: e.target.value })} className="w-full text-sm font-medium border border-slate-300 rounded-lg pl-6 pr-3 py-2.5 focus:ring-1 focus:ring-red-400 focus:outline-none" />
                </div>
                {Number(deductions.penalty) > 0 && (
                  <input type="text" value={penaltyReason} onChange={e => setPenaltyReason(e.target.value)} placeholder="Reason (e.g. Traffic Fine, Late Delivery...)" className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 placeholder:text-slate-300 focus:ring-1 focus:ring-red-300 focus:outline-none bg-red-50/30" />
                )}
                <p className="flex items-start gap-1 text-[11px] text-slate-400 leading-relaxed">
                  <FiInfo className="w-3 h-3 mt-0.5 shrink-0 text-slate-300" />
                  Optional — traffic fines, late delivery charges, vehicle damage, or policy violations.
                </p>
              </div>

              {/* Other Deductions */}
              <div className="flex flex-col gap-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Other Deductions</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                  <input type="number" value={deductions.others} onChange={e => setDeductions({ ...deductions, others: e.target.value })} className="w-full text-sm font-medium border border-slate-300 rounded-lg pl-6 pr-3 py-2.5 focus:ring-1 focus:ring-red-400 focus:outline-none" />
                </div>
                {Number(deductions.others) > 0 && (
                  <input type="text" value={otherDedReason} onChange={e => setOtherDedReason(e.target.value)} placeholder="Reason (e.g. Uniform Recovery, Fuel Shortage...)" className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 placeholder:text-slate-300 focus:ring-1 focus:ring-red-300 focus:outline-none bg-red-50/30" />
                )}
                <p className="flex items-start gap-1 text-[11px] text-slate-400 leading-relaxed">
                  <FiInfo className="w-3 h-3 mt-0.5 shrink-0 text-slate-300" />
                  Optional — uniform recovery, mobile expenses, fuel shortage recovery, or company-approved adjustments.
                </p>
              </div>

            </div>

            {/* Total Deductions Footer */}
            <div className="mt-4 bg-red-50 border border-red-100 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                <span>Advance <span className="font-bold text-slate-700">₹ {totalAdvances.toLocaleString()}</span></span>
                <span className="text-slate-300">+</span>
                <span>Penalty <span className="font-bold text-slate-700">₹ {Number(deductions.penalty) || 0}</span></span>
                <span className="text-slate-300">+</span>
                <span>Other <span className="font-bold text-slate-700">₹ {Number(deductions.others) || 0}</span></span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] font-bold text-red-500 uppercase tracking-widest">Total Deductions</span>
                <span className="text-2xl font-black text-red-500">− ₹ {totalDeductions.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Right Column: Settlement Summary ── */}
      <div className="lg:w-80 shrink-0">
        <div className="bg-white rounded-xl border border-slate-200 shadow-lg sticky top-6 overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-slate-100 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
              <FiFileText className="w-4 h-4 text-indigo-500" />
            </div>
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">Settlement Summary</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Driver</span>
                <span className="font-bold text-slate-700">{driverName || '—'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Month</span>
                <span className="font-bold text-slate-700">{statementMonth}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Total Trips</span>
                <span className="font-bold text-slate-700">{totalTrips}</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Earnings</p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 font-medium">Monthly Salary</span>
                <span className="font-bold text-slate-800">₹ {fixedSalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 font-medium">Total Battha</span>
                <span className="font-bold text-indigo-600">₹ {totalBattha.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 font-medium">Total Additions</span>
                <span className="font-bold text-green-600">+ ₹ {totalAdditions.toLocaleString()}</span>
              </div>
            </div>
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deductions</p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 font-medium">Total Deductions</span>
                <span className="font-bold text-red-500">− ₹ {totalDeductions.toLocaleString()}</span>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Formula</p>
              <p className="text-xs text-slate-500 leading-relaxed">Salary + Battha + Additions − Deductions</p>
              <p className="text-xs text-slate-400 mt-1">
                {fixedSalary.toLocaleString()} + {totalBattha.toLocaleString()} + {totalAdditions.toLocaleString()} − {totalDeductions.toLocaleString()}
              </p>
            </div>
            <div className="bg-linear-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl px-5 py-4 text-center">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Net Payable</p>
              <p className="text-4xl font-black text-indigo-700 tracking-tight leading-none">₹ {netPayable.toLocaleString()}</p>
              {netPayable < 0 && (
                <p className="text-xs text-red-500 font-bold mt-2 bg-red-50 border border-red-100 py-1 px-2 rounded-lg">Amount cannot be negative</p>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}