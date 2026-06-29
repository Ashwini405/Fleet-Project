import React from 'react';
import {
  FiSearch, FiCheckCircle, FiFileText, FiTrash2, FiPrinter, FiX, FiCheck,
  FiDownload, FiDollarSign, FiClock, FiPlus, FiInfo, FiEdit2, FiRefreshCw,
} from 'react-icons/fi';

// ─────────────────────────────────────────────
// TAB 1: PREPARE SETTLEMENT (FULLY DATABASE-DRIVEN)
// ─────────────────────────────────────────────
export function PrepareSettlementTab({
  plants,
  vehicles,
  driver,

  plant,
  setPlant,

  truckNo,
  setTruckNo,

  statementMonth,
  setStatementMonth,

  fixedSalary,
  setFixedSalary,

  batthaRate,
  setBatthaRate,

  additions,
  setAdditions,

  deductions,
  setDeductions,

  penaltyReason,
  setPenaltyReason,

  otherDedReason,
  setOtherDedReason,

  notes,
  setNotes,

  draftId,
  settlementStatus,

  totalTrips,
  totalAdvances,
  totalBattha,
  totalAdditions,
  totalDeductions,
  netPayable,

  onSaveDraft,
  onSubmit,
  onOpenVoucher,
  onMarkPaid,
}) {
  const driverName = driver?.full_name || '';

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 space-y-6">

        {/* Header Box */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold flex items-center gap-2 text-slate-800">
                <FiFileText className="text-indigo-500" /> Prepare Monthly Settlement
              </h2>
              {draftId && <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{draftId}</span>}
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
              <select value={plant} onChange={(e) => setPlant(e.target.value)} className="w-full text-sm font-medium border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none">
                <option value="">Select Plant</option>
                {plants.map((p, index) => (
                  <option key={p.source_plant || index} value={p.source_plant}>
                    {p.source_plant}
                  </option>
                ))}
              </select>
            </div>

            {/* Truck No */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Truck No *</label>
              <select value={truckNo} onChange={(e) => setTruckNo(e.target.value)} className="w-full text-sm font-bold text-slate-800 border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none">
                <option value="">Select Vehicle</option>
                {vehicles.map((v, index) => (
                  <option key={v.vehicle_id || index} value={v.vehicle_no}>
                    {v.vehicle_no}
                  </option>
                ))}
              </select>
            </div>

            {/* Driver Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Driver Name</label>
              {driverName ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center w-full text-sm border border-indigo-200 bg-indigo-50/40 rounded-lg px-3 py-2 gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
                    <span className="font-bold text-slate-800 flex-1">{driverName}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium pl-1">Auto-fetched from database</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center w-full text-sm border border-red-200 bg-red-50/40 rounded-lg px-3 py-2 gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                    <span className="font-semibold text-red-500 flex-1">No Driver Assigned</span>
                  </div>
                  <p className="text-[10px] text-red-400 font-medium pl-1">Assign a driver in Vehicle Master first</p>
                </div>
              )}
            </div>

            {/* Statement Month */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Statement Month</label>
              <input type="month" value={statementMonth} onChange={(e) => setStatementMonth(e.target.value)} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Earnings Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
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
                <input type="number" value={fixedSalary} onChange={(e) => setFixedSalary(Number(e.target.value))} className="w-full text-sm font-bold text-indigo-700 border border-slate-300 bg-indigo-50/30 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Battha Rate Per Trip</label>
                <input type="number" value={batthaRate} onChange={(e) => setBatthaRate(Number(e.target.value))} className="w-full text-sm font-medium border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
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

        {/* Additional Earnings Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
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
                    <input type="number" value={additions[key]} onChange={(e) => setAdditions({ ...additions, [key]: e.target.value })} className="w-full text-sm font-medium border border-slate-300 rounded-lg pl-6 pr-3 py-2.5 focus:ring-1 focus:ring-green-500 focus:outline-none" />
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

        {/* Deductions Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
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
                  <input type="number" value={deductions.penalty} onChange={(e) => setDeductions({ ...deductions, penalty: e.target.value })} className="w-full text-sm font-medium border border-slate-300 rounded-lg pl-6 pr-3 py-2.5 focus:ring-1 focus:ring-red-400 focus:outline-none" />
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
                  <input type="number" value={deductions.others} onChange={(e) => setDeductions({ ...deductions, others: e.target.value })} className="w-full text-sm font-medium border border-slate-300 rounded-lg pl-6 pr-3 py-2.5 focus:ring-1 focus:ring-red-400 focus:outline-none" />
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

      {/* Right Column — Settlement Summary */}
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

// ─────────────────────────────────────────────
// TAB 2: PENDING APPROVAL
// ─────────────────────────────────────────────
export function PendingApprovalTab({ pendingList, onView, onApprove, onReject, vehicles }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-3 items-center">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Filter:</span>
        <select className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none">
          <option>All Trucks</option>
          {vehicles.map(v => (
            <option key={v.vehicle_id || v.vehicle_no} value={v.vehicle_no}>{v.vehicle_no}</option>
          ))}
        </select>
        <select className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none">
          <option>All Months</option>
          <option>2026-01</option>
          <option>2025-12</option>
        </select>
        <span className="ml-auto text-xs text-slate-400 font-medium">{pendingList.length} pending</span>
      </div>

      {pendingList.length === 0 ? (
        <div className="py-20 text-center">
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <FiCheckCircle className="w-10 h-10 opacity-20" />
            <p className="text-sm font-semibold">All caught up!</p>
            <p className="text-xs">No settlements pending approval.</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b-2 border-slate-100">
              <tr>
                {['Settlement ID', 'Driver', 'Vehicle', 'Month', 'Net Payable', 'Submitted', 'Status', 'Actions'].map(h => (
                  <th key={h} className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingList.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-indigo-600 text-xs">{item.id}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800 text-sm">{item.driver_name}</div>
                    <div className="text-[11px] text-slate-400">{item.plant_name}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{item.vehicle_no}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700">{item.statement_month}</td>
                  <td className="py-3 px-4">
                    <span className="font-black text-indigo-700">₹ {(Number(item.net_payable) || 0).toLocaleString()}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-xs text-slate-600 font-medium">{item.submittedOn || '—'}</div>
                    <div className="text-[11px] text-slate-400">{item.submittedBy || '—'}</div>
                  </td>
                  <td className="py-3 px-4">
                    {item.status === 'Submitted' && <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 border border-orange-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"><FiClock className="w-2.5 h-2.5" />Submitted</span>}
                    {item.status === 'Draft'     && <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"><FiFileText className="w-2.5 h-2.5" />Draft</span>}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => onView(item)} title="View" className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"><FiFileText className="w-4 h-4" /></button>
                      <button onClick={() => onApprove(item)} title="Approve" className="p-1.5 rounded-lg text-slate-500 hover:text-green-600 hover:bg-green-50 transition-colors"><FiCheck className="w-4 h-4 stroke-3" /></button>
                      <button onClick={() => onReject(item)} title="Reject" className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"><FiX className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB 3: SETTLEMENT HISTORY
// ─────────────────────────────────────────────
export function SettlementHistoryTab({
  historyList,
  filteredHistory,
  historyFilterDriver, setHistoryFilterDriver,
  historyFilterVehicle, setHistoryFilterVehicle,
  historyFilterMonth, setHistoryFilterMonth,
  historyFilterStatus, setHistoryFilterStatus,
  historyFilterDateFrom, setHistoryFilterDateFrom,
  historyFilterDateTo, setHistoryFilterDateTo,
  uniqueMonths, uniqueDrivers, uniqueVehicles,
  onNewSettlement,
  onView,
  onPrint,
  onMarkPaid,
  onEdit,
  onResubmit,
  onDuplicate,
}) {
  const hasFilters = historyFilterDriver || historyFilterVehicle || historyFilterMonth || historyFilterStatus || historyFilterDateFrom || historyFilterDateTo;

  const clearFilters = () => {
    setHistoryFilterDriver('');
    setHistoryFilterVehicle('');
    setHistoryFilterMonth('');
    setHistoryFilterStatus('');
    setHistoryFilterDateFrom('');
    setHistoryFilterDateTo('');
  };

  const handleExport = () => {
    const headers = ['ID', 'Driver', 'Vehicle', 'Plant', 'Month', 'Salary', 'Battha', 'Additions', 'Deductions', 'Net Payable', 'Status', 'Payment Date', 'Payment Mode'];
    const rows = filteredHistory.map(i => [
      i.id, i.driver_name, i.vehicle_no, i.plant_name, i.statement_month,
      Number(i.fixed_salary || 0), Number(i.total_battha || 0),
      Number(i.total_additions || 0), Number(i.total_deductions || 0),
      Number(i.net_payable || 0), i.status,
      i.payment_date ? new Date(i.payment_date).toLocaleDateString('en-GB') : '',
      i.payment_method || ''
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `settlements-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <select value={historyFilterDriver} onChange={e => setHistoryFilterDriver(e.target.value)} className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none">
            <option value="">All Drivers</option>
            {uniqueDrivers.map((d, index) => (
              <option key={`${d}-${index}`} value={d}>{d}</option>
            ))}
          </select>
          <select value={historyFilterVehicle} onChange={e => setHistoryFilterVehicle(e.target.value)} className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none">
            <option value="">All Vehicles</option>
            {uniqueVehicles.map((v, index) => (
              <option key={`${v}-${index}`} value={v}>{v}</option>
            ))}
          </select>
          <select value={historyFilterMonth} onChange={e => setHistoryFilterMonth(e.target.value)} className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none">
            <option value="">All Months</option>
            {uniqueMonths.map((m, index) => (
              <option key={`${m}-${index}`} value={m}>{m}</option>
            ))}
          </select>
          <select value={historyFilterStatus} onChange={e => setHistoryFilterStatus(e.target.value)} className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none">
            <option value="">All Status</option>
            {['Paid', 'Approved', 'Submitted', 'Rejected', 'Draft'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="date" value={historyFilterDateFrom} onChange={e => setHistoryFilterDateFrom(e.target.value)} className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none" />
          <input type="date" value={historyFilterDateTo} onChange={e => setHistoryFilterDateTo(e.target.value)} className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none" />
          {hasFilters && (
            <button onClick={clearFilters} className="text-xs font-bold text-indigo-500 hover:text-indigo-700 underline underline-offset-2">Clear</button>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400 font-medium">{filteredHistory.length} records</span>
          <button onClick={handleExport} className="flex items-center gap-1.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:text-indigo-600 transition-colors">
            <FiDownload className="w-3.5 h-3.5" /> Export
          </button>
          <button onClick={onNewSettlement} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors">
            <FiPlus className="w-4 h-4 stroke-3" /> Generate Settlement
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b-2 border-slate-100">
            <tr>
              {['Sett. ID', 'Driver', 'Vehicle', 'Month', 'Salary', 'Battha', 'Additions', 'Deductions', 'Net Payable', 'Status', 'Payment Date', 'Actions'].map(h => (
                <th key={h} className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <FiFileText className="w-8 h-8 opacity-30" />
                    <p className="text-sm font-medium">No records found</p>
                    <p className="text-xs">Try adjusting the filters above</p>
                  </div>
                </td>
              </tr>
            ) : filteredHistory.map(item => {
              const sal = Number(item.fixed_salary || 0);
              const bth = Number(item.total_battha || 0);
              const add = Number(item.total_additions || 0);
              const ded = Number(item.total_deductions || 0);
              return (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-indigo-600 text-xs whitespace-nowrap">{item.id}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800 text-sm whitespace-nowrap">{item.driver_name}</div>
                    <div className="text-[11px] text-slate-400">{item.plant_name}</div>
                  </td>
                  <td className="py-3 px-4"><span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap">{item.vehicle_no}</span></td>
                  <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">{item.statement_month}</td>
                  <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">₹ {sal.toLocaleString()}</td>
                  <td className="py-3 px-4 text-indigo-600 font-semibold whitespace-nowrap">₹ {bth.toLocaleString()}</td>
                  <td className="py-3 px-4 text-green-600 font-semibold whitespace-nowrap">+ ₹ {add.toLocaleString()}</td>
                  <td className="py-3 px-4 text-red-500 font-semibold whitespace-nowrap">− ₹ {ded.toLocaleString()}</td>
                  <td className="py-3 px-4"><span className="font-black text-indigo-700 whitespace-nowrap">₹ {(Number(item.net_payable) || 0).toLocaleString()}</span></td>
                  <td className="py-3 px-4">
                    {item.status === 'Paid'      && <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap"><FiCheck className="w-2.5 h-2.5" />Paid</span>}
                    {item.status === 'Approved'  && <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 border border-green-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap"><FiCheckCircle className="w-2.5 h-2.5" />Approved</span>}
                    {item.status === 'Submitted' && <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 border border-orange-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap"><FiClock className="w-2.5 h-2.5" />Submitted</span>}
                    {item.status === 'Rejected'  && <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap"><FiX className="w-2.5 h-2.5" />Rejected</span>}
                    {item.status === 'Draft'     && <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap"><FiFileText className="w-2.5 h-2.5" />Draft</span>}
                  </td>
                  <td className="py-3 px-4">
                    {item.payment_date
                      ? <><div className="text-xs font-semibold text-slate-700 whitespace-nowrap">{new Date(item.payment_date).toLocaleDateString('en-GB')}</div><div className="text-[11px] text-slate-400">{item.payment_method || '—'}</div></>
                      : item.status === 'Approved'
                        ? <button onClick={() => onMarkPaid(item)} className="text-xs font-bold text-purple-600 bg-purple-50 border border-purple-200 px-2 py-1 rounded-lg hover:bg-purple-100 transition-colors whitespace-nowrap">Mark as Paid</button>
                        : <span className="text-slate-300 text-xs">—</span>
                    }
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => onView(item)} title="View" className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"><FiFileText className="w-4 h-4" /></button>
                      <button onClick={() => onPrint(item)} title="Print" className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"><FiPrinter className="w-4 h-4" /></button>
                      <button onClick={() => onPrint(item)} title="Download PDF" className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"><FiDownload className="w-4 h-4" /></button>
                      {item.status === 'Rejected' ? (
                        <>
                          <button onClick={() => onEdit(item)} title="Edit" className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"><FiEdit2 className="w-4 h-4" /></button>
                          <button onClick={() => onResubmit(item)} title="Resubmit" className="p-1.5 rounded-lg text-slate-500 hover:text-green-600 hover:bg-green-50 transition-colors"><FiRefreshCw className="w-4 h-4" /></button>
                        </>
                      ) : (
                        <button onClick={() => onDuplicate(item)} title="Duplicate" className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"><FiPlus className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredHistory.length > 0 && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap justify-between items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Showing {filteredHistory.length} of {historyList.length} settlements</span>
          <span className="text-sm font-bold text-slate-700">Total Paid: <span className="text-purple-700">₹ {filteredHistory.filter(i => i.status === 'Paid').reduce((s, i) => s + Number(i.net_payable || 0), 0).toLocaleString()}</span></span>
        </div>
      )}
    </div>
  );
}