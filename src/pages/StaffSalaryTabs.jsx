import React, { useState, useEffect } from 'react';
import {
  FiSearch, FiCheckCircle, FiFileText, FiTrash2, FiPrinter, FiX, FiCheck,
  FiDownload, FiDollarSign, FiClock, FiPlus, FiInfo, FiEdit2, FiRefreshCw,
  FiUser, FiBriefcase, FiMapPin, FiCreditCard, FiFilter, FiAlertCircle
} from 'react-icons/fi';

// ─────────────────────────────────────────────
// SUB-TAB 1: PREPARE STAFF & SUPERVISOR SALARY
// ─────────────────────────────────────────────
export function PrepareStaffSalaryTab({
  staffList = [],
  selectedStaff,
  onSelectStaff,

  salaryMonth,
  setSalaryMonth,
  workingDays,
  setWorkingDays,
  presentDays,
  setPresentDays,

  basicSalary,
  setBasicSalary,
  hra,
  setHra,
  travelAllowance,
  setTravelAllowance,
  performanceBonus,
  setPerformanceBonus,
  otherAllowances,
  setOtherAllowances,

  pfDeduction,
  setPfDeduction,
  esiDeduction,
  setEsiDeduction,
  professionalTax,
  setProfessionalTax,
  advanceRecovery,
  setAdvanceRecovery,
  penaltyDeduction,
  setPenaltyDeduction,
  penaltyReason,
  setPenaltyReason,
  otherDeductions,
  setOtherDeductions,
  otherDedReason,
  setOtherDedReason,

  bankName,
  setBankName,
  accountNumber,
  setAccountNumber,
  ifscCode,
  setIfscCode,

  notes,
  setNotes,
  draftId,
  salaryStatus,

  totalEarnings,
  totalDeductions,
  netPayable,

  onSaveDraft,
  onSubmit,
  onOpenPayslip,
}) {
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [staffSearch, setStaffSearch] = useState('');

  // Auto-sync role filter if selected staff is of specific type
  useEffect(() => {
    if (selectedStaff?.staff_type) {
      if (roleFilter !== 'ALL' && roleFilter !== selectedStaff.staff_type) {
        setRoleFilter('ALL');
      }
    }
  }, [selectedStaff]);

  const filteredStaff = staffList.filter((s) => {
    if (roleFilter !== 'ALL' && s.staff_type !== roleFilter) return false;
    if (staffSearch.trim()) {
      const q = staffSearch.toLowerCase();
      return (
        s.staff_name?.toLowerCase().includes(q) ||
        s.staff_code?.toLowerCase().includes(q) ||
        s.department_or_station?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedStaffKey = selectedStaff
    ? `${selectedStaff.staff_type}_${selectedStaff.staff_id || selectedStaff.id}`
    : '';

  const isSelectedInFiltered = selectedStaff && filteredStaff.some(
    (s) =>
      s.staff_type === selectedStaff.staff_type &&
      (String(s.staff_id) === String(selectedStaff.staff_id || selectedStaff.id) ||
        String(s.id) === String(selectedStaff.staff_id || selectedStaff.id) ||
        (s.staff_code && selectedStaff.staff_code && String(s.staff_code).toLowerCase() === String(selectedStaff.staff_code).toLowerCase()) ||
        (s.employee_id && selectedStaff.employee_id && String(s.employee_id).toLowerCase() === String(selectedStaff.employee_id).toLowerCase()))
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* LEFT / MAIN COLUMN */}
      <div className="flex-1 space-y-6">

        {/* Staff Selection & Overview */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold flex items-center gap-2 text-slate-800">
                <FiUser className="text-indigo-600" /> Staff & Supervisor Selection
              </h2>
              {draftId && (
                <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  {draftId}
                </span>
              )}
            </div>
            <div>
              {{
                Draft:     <span className="bg-blue-50 text-blue-600 border border-blue-200 text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wide">Status: Draft</span>,
                Submitted: <span className="bg-yellow-50 text-yellow-600 border border-yellow-200 text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wide">Status: Submitted</span>,
                Approved:  <span className="bg-green-50 text-green-600 border border-green-200 text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wide">Status: Approved</span>,
                Paid:      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wide">Status: Paid</span>,
                Rejected:  <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wide">Status: Rejected</span>,
              }[salaryStatus] || <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded font-bold">Status: Draft</span>}
            </div>
          </div>

          {/* Quick Filter buttons */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Type:</span>
            {['ALL', 'Supervisor', 'Employee'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setRoleFilter(role)}
                className={`text-xs px-3 py-1 rounded-full font-bold transition-all ${
                  roleFilter === role
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {role === 'ALL' ? 'All Personnel' : role + 's'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Staff Selector */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Select Staff Member / Supervisor *
              </label>
              <select
                value={selectedStaffKey}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) {
                    onSelectStaff(null);
                    return;
                  }
                  const [type, id] = val.split('_');
                  const target = staffList.find(
                    (s) =>
                      s.staff_type === type &&
                      (String(s.staff_id) === String(id) ||
                        String(s.id) === String(id) ||
                        String(s.staff_code) === String(id) ||
                        String(s.employee_id) === String(id) ||
                        String(s.supervisor_code) === String(id))
                  );
                  if (target) {
                    onSelectStaff(target);
                  } else if (selectedStaff && `${selectedStaff.staff_type}_${selectedStaff.staff_id || selectedStaff.id}` === val) {
                    onSelectStaff(selectedStaff);
                  }
                }}
                className="w-full text-sm font-bold text-slate-800 border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                <option value="">-- Choose Employee or Supervisor ({filteredStaff.length} available) --</option>
                {!isSelectedInFiltered && selectedStaff && (
                  <option value={selectedStaffKey}>
                    ✓ {selectedStaff.staff_name || selectedStaff.name} • {selectedStaff.staff_code || selectedStaff.employee_id} ({selectedStaff.department_or_station || selectedStaff.plant_name || 'Selected Staff'})
                  </option>
                )}
                {filteredStaff.filter(s => s.staff_type === 'Employee').length > 0 && (
                  <optgroup label={`🏢 Employees (${filteredStaff.filter(s => s.staff_type === 'Employee').length})`}>
                    {filteredStaff.filter(s => s.staff_type === 'Employee').map((s) => (
                      <option key={`${s.staff_type}_${s.staff_id || s.id}`} value={`${s.staff_type}_${s.staff_id || s.id}`}>
                        {s.staff_name || s.name} • {s.staff_code || s.employee_id} ({s.department_or_station || 'Operations'} — {s.plant_name || 'Main'})
                      </option>
                    ))}
                  </optgroup>
                )}
                {filteredStaff.filter(s => s.staff_type === 'Supervisor').length > 0 && (
                  <optgroup label={`👷‍♂️ Supervisors (${filteredStaff.filter(s => s.staff_type === 'Supervisor').length})`}>
                    {filteredStaff.filter(s => s.staff_type === 'Supervisor').map((s) => (
                      <option key={`${s.staff_type}_${s.staff_id || s.id}`} value={`${s.staff_type}_${s.staff_id || s.id}`}>
                        {s.staff_name || s.name} • {s.staff_code || s.supervisor_code} (Station: {s.department_or_station || 'Unassigned'})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Salary Month */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Salary Month *
              </label>
              <input
                type="month"
                value={salaryMonth}
                onChange={(e) => setSalaryMonth(e.target.value)}
                className="w-full text-sm font-bold text-slate-800 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Selected Staff Info Box */}
          {selectedStaff && (
            <div className="mt-4 p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Role & Code</span>
                <span className="font-bold text-slate-800">{selectedStaff.designation || selectedStaff.staff_type}</span>
                <span className="text-indigo-600 block font-mono text-[11px]">{selectedStaff.staff_code}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Station / Dept</span>
                <span className="font-bold text-slate-800">{selectedStaff.department_or_station || 'Main'}</span>
                <span className="text-slate-500 block text-[11px]">Plant: {selectedStaff.plant_name || 'Main Plant'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Contact</span>
                <span className="font-bold text-slate-800">{selectedStaff.phone || '—'}</span>
                {selectedStaff.wallet_balance !== undefined && Number(selectedStaff.wallet_balance) > 0 && (
                  <span className="text-amber-700 block text-[10px] font-semibold">Wallet: ₹ {Number(selectedStaff.wallet_balance).toLocaleString()}</span>
                )}
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Bank A/C</span>
                <span className="font-bold text-slate-800">{bankName || 'Not Set'}</span>
                <span className="text-slate-500 block font-mono text-[10px]">{accountNumber ? `••••${accountNumber.slice(-4)}` : '—'}</span>
              </div>
            </div>
          )}

          {/* Attendance Days */}
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Total Month Working Days
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={workingDays}
                onChange={(e) => setWorkingDays(Number(e.target.value) || 0)}
                className="w-full text-sm font-semibold text-slate-800 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Days Present / Payable
              </label>
              <input
                type="number"
                min="0"
                max={workingDays || 31}
                value={presentDays}
                onChange={(e) => setPresentDays(Number(e.target.value) || 0)}
                className="w-full text-sm font-semibold text-slate-800 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

        </div>

        {/* EARNINGS & ALLOWANCES */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              1. Salary & Allowances (Earnings)
            </h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Total Earnings: ₹ {totalEarnings.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Basic Salary (₹) *</label>
              <input
                type="number"
                min="0"
                value={basicSalary}
                onChange={(e) => setBasicSalary(Number(e.target.value) || 0)}
                className="w-full text-sm font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">House Rent Allowance (HRA)</label>
              <input
                type="number"
                min="0"
                value={hra}
                onChange={(e) => setHra(Number(e.target.value) || 0)}
                className="w-full text-sm font-semibold text-slate-800 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Travel / Conveyance Allowance</label>
              <input
                type="number"
                min="0"
                value={travelAllowance}
                onChange={(e) => setTravelAllowance(Number(e.target.value) || 0)}
                className="w-full text-sm font-semibold text-slate-800 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Performance Bonus / Incentive</label>
              <input
                type="number"
                min="0"
                value={performanceBonus}
                onChange={(e) => setPerformanceBonus(Number(e.target.value) || 0)}
                className="w-full text-sm font-semibold text-slate-800 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Other Allowances / Overtime</label>
              <input
                type="number"
                min="0"
                value={otherAllowances}
                onChange={(e) => setOtherAllowances(Number(e.target.value) || 0)}
                className="w-full text-sm font-semibold text-slate-800 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* DEDUCTIONS & RECOVERIES */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-rose-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              2. Deductions & Recoveries
            </h3>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              Total Deductions: ₹ {totalDeductions.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Provident Fund (PF)</label>
              <input
                type="number"
                min="0"
                value={pfDeduction}
                onChange={(e) => setPfDeduction(Number(e.target.value) || 0)}
                className="w-full text-sm font-semibold text-slate-800 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Employee State Ins. (ESI)</label>
              <input
                type="number"
                min="0"
                value={esiDeduction}
                onChange={(e) => setEsiDeduction(Number(e.target.value) || 0)}
                className="w-full text-sm font-semibold text-slate-800 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Professional Tax (PT)</label>
              <input
                type="number"
                min="0"
                value={professionalTax}
                onChange={(e) => setProfessionalTax(Number(e.target.value) || 0)}
                className="w-full text-sm font-semibold text-slate-800 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Advance Salary Recovery</label>
              <input
                type="number"
                min="0"
                value={advanceRecovery}
                onChange={(e) => setAdvanceRecovery(Number(e.target.value) || 0)}
                className="w-full text-sm font-semibold text-slate-800 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            {/* Penalty + Reason */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Penalty / Fine (₹)</label>
              <input
                type="number"
                min="0"
                value={penaltyDeduction}
                onChange={(e) => setPenaltyDeduction(Number(e.target.value) || 0)}
                className="w-full text-sm font-semibold text-slate-800 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:outline-none mb-1.5"
              />
              {penaltyDeduction > 0 && (
                <input
                  type="text"
                  placeholder="Penalty Reason *"
                  value={penaltyReason}
                  onChange={(e) => setPenaltyReason(e.target.value)}
                  className="w-full text-xs p-1.5 border border-rose-200 rounded focus:outline-none"
                />
              )}
            </div>

            {/* Other Deductions + Reason */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Other Deductions (₹)</label>
              <input
                type="number"
                min="0"
                value={otherDeductions}
                onChange={(e) => setOtherDeductions(Number(e.target.value) || 0)}
                className="w-full text-sm font-semibold text-slate-800 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:outline-none mb-1.5"
              />
              {otherDeductions > 0 && (
                <input
                  type="text"
                  placeholder="Other Deduction Reason *"
                  value={otherDedReason}
                  onChange={(e) => setOtherDedReason(e.target.value)}
                  className="w-full text-xs p-1.5 border border-rose-200 rounded focus:outline-none"
                />
              )}
            </div>
          </div>
        </div>

        {/* BANKING & PAYOUT DETAILS */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <FiCreditCard className="text-indigo-600" />
            3. Banking Details & Notes
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="E.g. HDFC Bank"
                className="w-full text-xs font-semibold text-slate-800 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="E.g. 501002348572"
                className="w-full text-xs font-mono font-semibold text-slate-800 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">IFSC Code</label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                placeholder="E.g. HDFC0001234"
                className="w-full text-xs font-mono font-semibold text-slate-800 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Remarks / HR Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any internal payroll remarks or settlement notes..."
              className="w-full text-xs text-slate-800 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: CALCULATION SUMMARY CARD */}
      <div className="w-full lg:w-80 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sticky top-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <FiDollarSign className="text-indigo-600" /> Payroll Summary
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Gross Earnings</span>
              <span className="font-bold text-emerald-600">+ ₹ {totalEarnings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Total Deductions</span>
              <span className="font-bold text-rose-500">- ₹ {totalDeductions.toLocaleString()}</span>
            </div>

            {/* Big Net Payable Card */}
            <div className="p-4 bg-gradient-to-br from-indigo-700 to-indigo-900 text-white rounded-xl shadow-md my-4">
              <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider block">Net Payable Salary</span>
              <span className="text-2xl font-black block mt-1">₹ {netPayable.toLocaleString()}</span>
              <span className="text-[11px] text-indigo-300 block mt-1">
                {selectedStaff ? selectedStaff.staff_name : 'No staff selected'} &bull; {salaryMonth}
              </span>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1 pt-1">
              <p>&bull; Status: <span className="font-bold text-slate-700">{salaryStatus}</span></p>
              <p>&bull; Staff Code: <span className="font-mono text-slate-700">{selectedStaff?.staff_code || '—'}</span></p>
              <p>&bull; Present: <span className="font-bold text-slate-700">{presentDays}</span> of {workingDays} days</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-2.5">
            {salaryStatus === 'Draft' && (
              <>
                <button
                  type="button"
                  onClick={onSaveDraft}
                  disabled={!selectedStaff}
                  className={`w-full py-2.5 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                    !selectedStaff
                      ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <FiFileText className="w-4 h-4" /> Save as Draft
                </button>
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={!selectedStaff || netPayable <= 0}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold shadow transition-all flex items-center justify-center gap-2 ${
                    !selectedStaff || netPayable <= 0
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'
                  }`}
                >
                  <FiCheckCircle className="w-4 h-4" /> Submit for Approval
                </button>
              </>
            )}

            {salaryStatus === 'Submitted' && (
              <div className="text-center p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-bold">
                <FiClock className="w-4 h-4 inline mr-1" /> Awaiting Management Approval
              </div>
            )}

            {salaryStatus === 'Approved' && (
              <div className="text-center p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-xs font-bold">
                <FiCheck className="w-4 h-4 inline mr-1" /> Approved & Ready for Payment
              </div>
            )}

            {salaryStatus === 'Paid' && (
              <div className="text-center p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold">
                <FiCheckCircle className="w-4 h-4 inline mr-1" /> Salary Disbursed & Paid
              </div>
            )}

            {onOpenPayslip && (
              <button
                type="button"
                onClick={onOpenPayslip}
                disabled={!selectedStaff}
                className="w-full py-2 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <FiPrinter className="w-3.5 h-3.5" /> Preview Payslip
              </button>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────
// SUB-TAB 2: PENDING APPROVALS
// ─────────────────────────────────────────────
export function StaffPendingApprovalTab({
  pendingList = [],
  onView,
  onApprove,
  onReject,
}) {
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = pendingList.filter((item) => {
    if (filterType !== 'ALL' && item.staff_type !== filterType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.staff_name?.toLowerCase().includes(q) ||
        item.staff_code?.toLowerCase().includes(q) ||
        item.salary_slip_no?.toLowerCase().includes(q) ||
        item.department_or_station?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPendingAmount = filtered.reduce((acc, curr) => acc + (Number(curr.net_payable) || 0), 0);

  return (
    <div className="space-y-5">
      
      {/* KPI Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Salary Slips</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{filtered.length}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <FiClock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pending Amount</p>
            <p className="text-2xl font-black text-indigo-600 mt-1">₹ {totalPendingAmount.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <FiDollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Approval Policy</p>
            <p className="text-xs font-semibold text-slate-600 mt-1">Requires 1-Click Verification</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <FiCheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {['ALL', 'Supervisor', 'Employee'].map((role) => (
            <button
              key={role}
              onClick={() => setFilterType(role)}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${
                filterType === role
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {role === 'ALL' ? 'All Roles' : role + 's'}
            </button>
          ))}
        </div>

        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search staff, code, slip #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none w-64"
          />
        </div>
      </div>

      {/* Table / List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FiCheckCircle className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-700">No Pending Salary Approvals</h4>
          <p className="text-xs text-slate-400 mt-1">All submitted salary slips for staff and supervisors have been processed.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Slip No / Month</th>
                  <th className="py-3.5 px-4">Staff Member</th>
                  <th className="py-3.5 px-4">Role & Station</th>
                  <th className="py-3.5 px-4 text-right">Gross Salary</th>
                  <th className="py-3.5 px-4 text-right">Deductions</th>
                  <th className="py-3.5 px-4 text-right">Net Payable</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-indigo-700 block">{item.salary_slip_no}</span>
                      <span className="text-[11px] text-slate-400 font-semibold">{item.salary_month}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{item.staff_name}</span>
                      <span className="text-[11px] text-slate-500 font-mono">{item.staff_code}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-0.5 ${
                        item.staff_type === 'Supervisor' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.staff_type}
                      </span>
                      <span className="text-[11px] text-slate-600 block">{item.department_or_station || 'Main'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                      ₹ {(Number(item.total_earnings) || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-rose-500">
                      ₹ {(Number(item.total_deductions) || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-indigo-700 text-sm">
                      ₹ {(Number(item.net_payable) || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 text-[10px] px-2.5 py-1 rounded-full font-bold">
                        Awaiting Approval
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onView && onView(item)}
                          className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                          title="View Breakdown"
                        >
                          View
                        </button>
                        <button
                          onClick={() => onApprove && onApprove(item.id)}
                          className="px-2.5 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors shadow-sm"
                          title="Approve Salary"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onReject && onReject(item)}
                          className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors"
                          title="Reject"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

// ─────────────────────────────────────────────
// SUB-TAB 3: SALARY HISTORY & LEDGER
// ─────────────────────────────────────────────
export function StaffSalaryHistoryTab({
  historyList = [],
  filterRole,
  setFilterRole,
  filterStatus,
  setFilterStatus,
  filterMonth,
  setFilterMonth,
  filterSearch,
  setFilterSearch,
  onNewSalary,
  onView,
  onPrint,
  onMarkPaid,
  onEdit,
  onResubmit,
  onDuplicate,
}) {
  const uniqueMonths = Array.from(new Set(historyList.map((i) => i.salary_month).filter(Boolean))).sort().reverse();

  const filtered = historyList.filter((item) => {
    if (filterRole && item.staff_type !== filterRole) return false;
    if (filterStatus && item.status !== filterStatus) return false;
    if (filterMonth && item.salary_month !== filterMonth) return false;
    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase();
      return (
        item.staff_name?.toLowerCase().includes(q) ||
        item.staff_code?.toLowerCase().includes(q) ||
        item.salary_slip_no?.toLowerCase().includes(q) ||
        item.department_or_station?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPaidAmount = historyList
    .filter((h) => h.status === 'Paid')
    .reduce((sum, h) => sum + (Number(h.net_payable) || 0), 0);

  const totalPendingAmount = historyList
    .filter((h) => h.status === 'Submitted')
    .reduce((sum, h) => sum + (Number(h.net_payable) || 0), 0);

  return (
    <div className="space-y-5">
      
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Slips Processed</p>
          <p className="text-xl font-black text-slate-800 mt-1">{historyList.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Disbursed (Paid)</p>
          <p className="text-xl font-black text-emerald-600 mt-1">₹ {totalPaidAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Approvals</p>
          <p className="text-xl font-black text-amber-600 mt-1">₹ {totalPendingAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Create New</p>
            <p className="text-xs text-slate-500 mt-0.5">Prepare Next Slip</p>
          </div>
          <button
            onClick={onNewSalary}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-sm transition-all"
          >
            <FiPlus className="w-4 h-4" /> Prepare
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search staff, code, slip #..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">All Personnel Roles</option>
              <option value="Supervisor">Supervisors Only</option>
              <option value="Employee">Employees Only</option>
            </select>
          </div>

          {/* Month Filter */}
          <div>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">All Months</option>
              {uniqueMonths.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted (Pending)</option>
              <option value="Approved">Approved</option>
              <option value="Paid">Paid</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

        </div>
      </div>

      {/* History Data Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <FiFileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700">No Salary Slips Found</h4>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or prepare a new salary slip.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="py-3 px-4">Slip No / Month</th>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role & Station</th>
                  <th className="py-3 px-4 text-right">Gross Salary</th>
                  <th className="py-3 px-4 text-right">Deductions</th>
                  <th className="py-3 px-4 text-right">Net Payable</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((item) => {
                  const gross = Number(item.total_earnings) || 0;
                  const ded = Number(item.total_deductions) || 0;
                  const net = Number(item.net_payable) || 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-indigo-700 block">{item.salary_slip_no}</span>
                        <span className="text-[11px] text-slate-400 font-semibold">{item.salary_month}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{item.staff_name}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{item.staff_code}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-0.5 ${
                          item.staff_type === 'Supervisor' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.staff_type}
                        </span>
                        <span className="text-[11px] text-slate-600 block">{item.department_or_station || 'Main'}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800">
                        ₹ {gross.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-rose-500">
                        ₹ {ded.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                        ₹ {net.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {{
                          Draft:     <span className="bg-blue-50 text-blue-600 border border-blue-200 text-[10px] px-2 py-0.5 rounded-full font-bold">Draft</span>,
                          Submitted: <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 text-[10px] px-2 py-0.5 rounded-full font-bold">Pending Approval</span>,
                          Approved:  <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] px-2 py-0.5 rounded-full font-bold">Approved</span>,
                          Paid:      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] px-2.5 py-0.5 rounded-full font-bold">Paid</span>,
                          Rejected:  <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] px-2 py-0.5 rounded-full font-bold">Rejected</span>,
                        }[item.status]}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onView && onView(item)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                            title="View Details"
                          >
                            <FiFileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onPrint && onPrint(item)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                            title="Print Payslip Voucher"
                          >
                            <FiPrinter className="w-4 h-4" />
                          </button>

                          {item.status === 'Approved' && (
                            <button
                              onClick={() => onMarkPaid && onMarkPaid(item)}
                              className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold hover:bg-emerald-700 transition-colors"
                              title="Disburse Payment"
                            >
                              Pay
                            </button>
                          )}

                          {item.status === 'Draft' && (
                            <button
                              onClick={() => onEdit && onEdit(item)}
                              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                              title="Edit Draft"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                          )}

                          {item.status === 'Rejected' && (
                            <>
                              <button
                                onClick={() => onEdit && onEdit(item)}
                                className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                                title="Edit & Fix"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onResubmit && onResubmit(item)}
                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                title="Resubmit for Approval"
                              >
                                <FiRefreshCw className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => onDuplicate && onDuplicate(item)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                            title="Duplicate as New Draft"
                          >
                            <FiPlus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
