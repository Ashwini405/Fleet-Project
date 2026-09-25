import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  FiFileText, FiX, FiCheck, FiCheckCircle, FiPrinter, FiDownload,
  FiDollarSign, FiClock, FiEdit2, FiRefreshCw, FiUser, FiBriefcase,
  FiMapPin, FiCreditCard, FiAlertCircle
} from 'react-icons/fi';

// ─────────────────────────────────────────────
// MODAL: STAFF SALARY DETAIL VIEW
// ─────────────────────────────────────────────
export function StaffSalaryDetailModal({
  detailItem,
  onClose,
  onApprove,
  onReject,
  onEdit,
  onResubmit,
  onPrint,
  onMarkPaid,
}) {
  if (!detailItem) return null;

  const basic = Number(detailItem.basic_salary) || 0;
  const hra = Number(detailItem.hra) || 0;
  const travel = Number(detailItem.travel_allowance) || 0;
  const bonus = Number(detailItem.performance_bonus) || 0;
  const otherEarn = Number(detailItem.other_allowances) || 0;
  const totalEarnings = Number(detailItem.total_earnings) || (basic + hra + travel + bonus + otherEarn);

  const pf = Number(detailItem.pf_deduction) || 0;
  const esi = Number(detailItem.esi_deduction) || 0;
  const pt = Number(detailItem.professional_tax) || 0;
  const adv = Number(detailItem.advance_recovery) || 0;
  const penalty = Number(detailItem.penalty_deduction) || 0;
  const otherDed = Number(detailItem.other_deductions) || 0;
  const totalDeductions = Number(detailItem.total_deductions) || (pf + esi + pt + adv + penalty + otherDed);

  const netPayable = Number(detailItem.net_payable) || Math.max(0, totalEarnings - totalDeductions);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                detailItem.staff_type === 'Supervisor' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {detailItem.staff_type}
              </span>
              <h2 className="text-base font-bold text-slate-800">Salary Slip Details</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              {detailItem.salary_slip_no} &bull; Month: <span className="font-semibold text-slate-700">{detailItem.salary_month}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 bg-white hover:bg-slate-200 text-slate-500 rounded-full transition-colors shadow-sm">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Staff Info Card */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <FiUser className="text-indigo-500" /> Staff Member
              </p>
              <p className="font-bold text-slate-900 text-base">{detailItem.staff_name}</p>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">{detailItem.designation || 'Staff'} &bull; <span className="font-mono text-slate-500">{detailItem.staff_code}</span></p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <FiMapPin className="text-indigo-500" /> Station / Department
              </p>
              <p className="font-bold text-slate-800">{detailItem.department_or_station || 'Head Office'}</p>
              <p className="text-xs text-slate-500 mt-0.5">Plant: {detailItem.plant_name || 'Main Plant'} &bull; Attendance: {detailItem.present_days || 30}/{detailItem.working_days || 30} Days</p>
            </div>
          </div>

          {/* Rejected Banner */}
          {detailItem.status === 'Rejected' && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0 rounded-full bg-red-100 p-2 text-red-600">
                  <FiAlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-red-900">Salary Slip Rejected</p>
                  <p className="mt-1 text-xs text-red-600">Reason: <span className="font-medium text-red-800">{detailItem.rejected_reason || 'No specific reason given.'}</span></p>
                </div>
              </div>
            </div>
          )}

          {/* Earnings Breakdown */}
          <div className="rounded-xl border border-emerald-100 overflow-hidden shadow-sm">
            <div className="px-4 py-2.5 bg-emerald-50/80 border-b border-emerald-100 flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Earnings & Allowances</span>
              <span className="text-xs font-bold text-emerald-700">Total: ₹ {totalEarnings.toLocaleString()}</span>
            </div>
            <div className="p-4 bg-white grid grid-cols-2 gap-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100"><span className="text-slate-600">Basic Salary</span><span className="font-bold text-slate-800">₹ {basic.toLocaleString()}</span></div>
              <div className="flex justify-between py-1 border-b border-slate-100"><span className="text-slate-600">House Rent Allowance (HRA)</span><span className="font-bold text-slate-800">₹ {hra.toLocaleString()}</span></div>
              <div className="flex justify-between py-1 border-b border-slate-100"><span className="text-slate-600">Travel / Conveyance</span><span className="font-bold text-slate-800">₹ {travel.toLocaleString()}</span></div>
              <div className="flex justify-between py-1 border-b border-slate-100"><span className="text-slate-600">Performance Bonus</span><span className="font-bold text-slate-800">₹ {bonus.toLocaleString()}</span></div>
              {otherEarn > 0 && (
                <div className="flex justify-between py-1 col-span-2 border-b border-slate-100"><span className="text-slate-600">Other Allowances</span><span className="font-bold text-slate-800">₹ {otherEarn.toLocaleString()}</span></div>
              )}
            </div>
          </div>

          {/* Deductions Breakdown */}
          <div className="rounded-xl border border-rose-100 overflow-hidden shadow-sm">
            <div className="px-4 py-2.5 bg-rose-50/80 border-b border-rose-100 flex justify-between items-center">
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">Deductions</span>
              <span className="text-xs font-bold text-rose-700">Total: ₹ {totalDeductions.toLocaleString()}</span>
            </div>
            <div className="p-4 bg-white grid grid-cols-2 gap-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100"><span className="text-slate-600">Provident Fund (PF)</span><span className="font-bold text-rose-600">₹ {pf.toLocaleString()}</span></div>
              <div className="flex justify-between py-1 border-b border-slate-100"><span className="text-slate-600">Employee State Ins. (ESI)</span><span className="font-bold text-rose-600">₹ {esi.toLocaleString()}</span></div>
              <div className="flex justify-between py-1 border-b border-slate-100"><span className="text-slate-600">Professional Tax (PT)</span><span className="font-bold text-rose-600">₹ {pt.toLocaleString()}</span></div>
              <div className="flex justify-between py-1 border-b border-slate-100"><span className="text-slate-600">Advance Recovery</span><span className="font-bold text-rose-600">₹ {adv.toLocaleString()}</span></div>
              {penalty > 0 && (
                <div className="flex justify-between py-1 col-span-2 border-b border-slate-100">
                  <span className="text-slate-600">Penalty ({detailItem.penalty_reason || 'Fine'})</span>
                  <span className="font-bold text-rose-600">₹ {penalty.toLocaleString()}</span>
                </div>
              )}
              {otherDed > 0 && (
                <div className="flex justify-between py-1 col-span-2 border-b border-slate-100">
                  <span className="text-slate-600">Other Deductions ({detailItem.other_deduction_reason || 'Misc'})</span>
                  <span className="font-bold text-rose-600">₹ {otherDed.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bank & Payout Details */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <FiCreditCard className="text-indigo-500" /> Banking & Disbursal Information
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div><span className="text-slate-500 block text-[11px]">Bank Name</span><span className="font-bold text-slate-800">{detailItem.bank_name || '—'}</span></div>
              <div><span className="text-slate-500 block text-[11px]">Account Number</span><span className="font-mono font-bold text-slate-800">{detailItem.account_number || '—'}</span></div>
              <div><span className="text-slate-500 block text-[11px]">IFSC Code</span><span className="font-mono font-bold text-slate-800">{detailItem.ifsc_code || '—'}</span></div>
            </div>
          </div>

          {/* Paid Info if Paid */}
          {detailItem.status === 'Paid' && (
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-xs">
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <FiCheckCircle className="text-emerald-600" /> Payment Disbursal Record
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div><span className="text-emerald-600 block text-[11px]">Payment Date</span><span className="font-bold text-emerald-900">{detailItem.payment_date ? new Date(detailItem.payment_date).toLocaleDateString('en-GB') : '—'}</span></div>
                <div><span className="text-emerald-600 block text-[11px]">Payment Mode</span><span className="font-bold text-emerald-900">{detailItem.payment_method || 'Bank Transfer'}</span></div>
                <div><span className="text-emerald-600 block text-[11px]">Reference / UTR</span><span className="font-mono font-bold text-emerald-900">{detailItem.payment_reference || '—'}</span></div>
              </div>
              {detailItem.payment_notes && (
                <p className="mt-2 text-slate-600"><span className="font-semibold text-emerald-800">Notes:</span> {detailItem.payment_notes}</p>
              )}
            </div>
          )}

          {/* Net Payable Banner */}
          <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white p-4 rounded-xl flex justify-between items-center shadow-md">
            <div>
              <p className="text-xs text-indigo-200 uppercase font-bold tracking-wider">Net Salary Payable</p>
              <p className="text-xs text-indigo-300 mt-0.5">Status: <span className="font-bold text-white uppercase">{detailItem.status}</span></p>
            </div>
            <div className="text-2xl font-black">₹ {netPayable.toLocaleString()}</div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <button
            onClick={() => onPrint && onPrint(detailItem)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
          >
            <FiPrinter className="w-4 h-4" /> Payslip Voucher
          </button>

          <div className="flex items-center gap-2">
            {detailItem.status === 'Submitted' && (
              <>
                <button
                  onClick={() => onReject && onReject(detailItem)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                >
                  <FiX className="w-4 h-4" /> Reject
                </button>
                <button
                  onClick={() => onApprove && onApprove(detailItem.id)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-all"
                >
                  <FiCheck className="w-4 h-4" /> Approve Salary
                </button>
              </>
            )}

            {detailItem.status === 'Approved' && (
              <button
                onClick={() => onMarkPaid && onMarkPaid(detailItem)}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm transition-all"
              >
                <FiDollarSign className="w-4 h-4" /> Mark as Paid
              </button>
            )}

            {detailItem.status === 'Rejected' && (
              <>
                <button
                  onClick={() => onEdit && onEdit(detailItem)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <FiEdit2 className="w-4 h-4" /> Edit Salary
                </button>
                <button
                  onClick={() => onResubmit && onResubmit(detailItem)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <FiRefreshCw className="w-4 h-4" /> Resubmit for Approval
                </button>
              </>
            )}

            {detailItem.status === 'Draft' && (
              <button
                onClick={() => onEdit && onEdit(detailItem)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <FiEdit2 className="w-4 h-4" /> Edit Draft
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MODAL: REJECT SALARY
// ─────────────────────────────────────────────
export function StaffSalaryRejectModal({
  rejectTarget,
  rejectReason,
  setRejectReason,
  rejectError,
  onConfirm,
  onClose,
}) {
  if (!rejectTarget) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-rose-50">
          <div className="flex items-center gap-2 text-rose-700">
            <FiAlertCircle className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-slate-800">Reject Salary Slip</h3>
          </div>
          <button onClick={onClose} className="p-1.5 bg-white hover:bg-slate-200 text-slate-500 rounded-full transition-colors">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            You are rejecting the salary slip for <span className="font-bold text-slate-900">{rejectTarget.staff_name}</span> ({rejectTarget.salary_slip_no}). Please provide a reason for rejection.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Rejection Reason *</label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="E.g. Incorrect attendance days, deduction mismatch, unapproved overtime..."
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            {rejectError && <p className="text-xs text-rose-600 mt-1 font-medium">{rejectError}</p>}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 rounded-lg hover:bg-rose-700 shadow-sm"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MODAL: MARK SALARY AS PAID
// ─────────────────────────────────────────────
export function StaffSalaryMarkPaidModal({
  markPaidTarget,
  paymentDate,
  setPaymentDate,
  paymentMode,
  setPaymentMode,
  paymentRef,
  setPaymentRef,
  paymentNotes,
  setPaymentNotes,
  onConfirm,
  onClose,
}) {
  if (!markPaidTarget) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-emerald-50">
          <div className="flex items-center gap-2 text-emerald-800">
            <FiDollarSign className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800">Disburse & Record Salary Payment</h3>
          </div>
          <button onClick={onClose} className="p-1.5 bg-white hover:bg-slate-200 text-slate-500 rounded-full transition-colors">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payee</p>
                <p className="font-bold text-slate-900">{markPaidTarget.staff_name} ({markPaidTarget.staff_type})</p>
                <p className="text-xs text-slate-500">{markPaidTarget.salary_slip_no} &bull; {markPaidTarget.salary_month}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</p>
                <p className="text-lg font-black text-emerald-600">₹ {(Number(markPaidTarget.net_payable) || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Payment Date *</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Payment Mode *</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 font-bold text-slate-800"
              >
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Transaction Ref / UTR / Cheque No</label>
            <input
              type="text"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              placeholder="E.g. UTR1982736482 or CHQ-991283"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Payment Notes / Remarks</label>
            <textarea
              rows={2}
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              placeholder="Optional remarks regarding the salary disbursement..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm"
          >
            Confirm & Mark Paid
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MODAL: PAYSLIP VOUCHER & PRINT (A4 FORMAT)
// ─────────────────────────────────────────────
export function StaffSalaryPayslipModal({ voucherData, onClose }) {
  const voucherRef = useRef(null);

  if (!voucherData) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!voucherRef.current) return;
    try {
      const canvas = await html2canvas(voucherRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const all = clonedDoc.querySelectorAll('*');
          all.forEach((el) => {
            const computed = window.getComputedStyle(el);
            if (computed.color?.includes('oklch')) el.style.color = '#000';
            if (computed.backgroundColor?.includes('oklch')) el.style.backgroundColor = '#fff';
            if (computed.borderColor?.includes('oklch')) el.style.borderColor = '#e2e8f0';
          });
        },
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Salary-Slip-${voucherData.staff_name || 'staff'}-${voucherData.salary_month || ''}.pdf`);
    } catch (error) {
      console.error('Download PDF failed:', error);
      alert('Unable to download PDF. Please try printing instead.');
    }
  };

  const basic = Number(voucherData.basic_salary) || 0;
  const hra = Number(voucherData.hra) || 0;
  const travel = Number(voucherData.travel_allowance) || 0;
  const bonus = Number(voucherData.performance_bonus) || 0;
  const otherEarn = Number(voucherData.other_allowances) || 0;
  const totalEarnings = Number(voucherData.total_earnings) || (basic + hra + travel + bonus + otherEarn);

  const pf = Number(voucherData.pf_deduction) || 0;
  const esi = Number(voucherData.esi_deduction) || 0;
  const pt = Number(voucherData.professional_tax) || 0;
  const adv = Number(voucherData.advance_recovery) || 0;
  const penalty = Number(voucherData.penalty_deduction) || 0;
  const otherDed = Number(voucherData.other_deductions) || 0;
  const totalDeductions = Number(voucherData.total_deductions) || (pf + esi + pt + adv + penalty + otherDed);

  const netPayable = Number(voucherData.net_payable) || Math.max(0, totalEarnings - totalDeductions);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
      <div className="bg-slate-100 rounded-xl shadow-2xl w-full max-w-3xl h-[90vh] flex flex-col overflow-hidden">
        <style>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            .staff-voucher-print-area, .staff-voucher-print-area * {
              visibility: visible !important;
            }
            .staff-voucher-print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}</style>

        {/* Print toolbar */}
        <div className="bg-slate-800 p-4 flex justify-between items-center text-white shrink-0">
          <h2 className="font-bold flex items-center gap-2"><FiFileText /> Staff & Supervisor Salary Slip</h2>
          <div className="flex gap-4">
            <button onClick={handlePrint} className="flex items-center gap-2 text-sm font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded transition-colors"><FiPrinter /> Print</button>
            <button onClick={handleDownloadPdf} className="flex items-center gap-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded shadow transition-colors"><FiDownload /> Download PDF</button>
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded transition-colors"><FiX className="w-5 h-5" /></button>
          </div>
        </div>

        {/* A4 Paper Container */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div ref={voucherRef} className="staff-voucher-print-area bg-white mx-auto shadow-sm" style={{ width: '100%', maxWidth: '210mm', minHeight: '297mm' }}>
            <div className="p-10 font-sans">

              {/* Header */}
              <div className="flex justify-between border-b-2 border-slate-800 pb-4 mb-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Fleet & Logistics Management</h1>
                  <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">
                    {voucherData.staff_type === 'Supervisor' ? 'Supervisor Salary Slip' : 'Staff Salary Slip'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Slip No</div>
                  <div className="text-sm font-bold text-slate-800 font-mono">{voucherData.salary_slip_no}</div>
                  <div className="text-xs text-slate-400 mt-1">Date: {new Date().toLocaleDateString('en-GB')}</div>
                </div>
              </div>

              {/* Staff & Organization Info */}
              <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Employee Details</div>
                  <div className="text-lg font-black text-slate-900">{voucherData.staff_name}</div>
                  <div className="text-sm font-semibold text-slate-700 mt-0.5">{voucherData.designation || 'Staff'} ({voucherData.staff_type})</div>
                  <div className="text-xs font-mono text-slate-500 mt-0.5">Emp Code: {voucherData.staff_code}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Salary Period & Attendance</div>
                  <div className="text-base font-black text-slate-800">{voucherData.salary_month}</div>
                  <div className="text-xs font-medium text-slate-600 mt-0.5">Station: <span className="font-bold">{voucherData.department_or_station || 'Head Office'}</span></div>
                  <div className="text-xs font-medium text-slate-600 mt-0.5">Present: <span className="font-bold">{voucherData.present_days || 30}</span> / {voucherData.working_days || 30} Days</div>
                </div>
              </div>

              {/* Earnings and Deductions Table */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                
                {/* Earnings Table */}
                <div>
                  <div className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-t uppercase tracking-wider">Earnings</div>
                  <table className="w-full text-xs border border-slate-200 border-t-0">
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr><td className="p-2.5 text-slate-600">Basic Salary</td><td className="p-2.5 text-right font-bold text-slate-800">₹ {basic.toFixed(2)}</td></tr>
                      <tr><td className="p-2.5 text-slate-600">House Rent Allowance (HRA)</td><td className="p-2.5 text-right font-bold text-slate-800">₹ {hra.toFixed(2)}</td></tr>
                      <tr><td className="p-2.5 text-slate-600">Travel / Conveyance</td><td className="p-2.5 text-right font-bold text-slate-800">₹ {travel.toFixed(2)}</td></tr>
                      <tr><td className="p-2.5 text-slate-600">Performance Bonus</td><td className="p-2.5 text-right font-bold text-slate-800">₹ {bonus.toFixed(2)}</td></tr>
                      <tr><td className="p-2.5 text-slate-600">Other Allowances</td><td className="p-2.5 text-right font-bold text-slate-800">₹ {otherEarn.toFixed(2)}</td></tr>
                      <tr className="bg-emerald-50/70 font-bold border-t-2 border-slate-200">
                        <td className="p-2.5 text-emerald-900">Gross Earnings (A)</td>
                        <td className="p-2.5 text-right text-emerald-700">₹ {totalEarnings.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Deductions Table */}
                <div>
                  <div className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-t uppercase tracking-wider">Deductions</div>
                  <table className="w-full text-xs border border-slate-200 border-t-0">
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr><td className="p-2.5 text-slate-600">Provident Fund (PF)</td><td className="p-2.5 text-right font-bold text-rose-600">₹ {pf.toFixed(2)}</td></tr>
                      <tr><td className="p-2.5 text-slate-600">Employee State Ins. (ESI)</td><td className="p-2.5 text-right font-bold text-rose-600">₹ {esi.toFixed(2)}</td></tr>
                      <tr><td className="p-2.5 text-slate-600">Professional Tax (PT)</td><td className="p-2.5 text-right font-bold text-rose-600">₹ {pt.toFixed(2)}</td></tr>
                      <tr><td className="p-2.5 text-slate-600">Advance Recovery</td><td className="p-2.5 text-right font-bold text-rose-600">₹ {adv.toFixed(2)}</td></tr>
                      <tr><td className="p-2.5 text-slate-600">Penalty & Other Deductions</td><td className="p-2.5 text-right font-bold text-rose-600">₹ {(penalty + otherDed).toFixed(2)}</td></tr>
                      <tr className="bg-rose-50/70 font-bold border-t-2 border-slate-200">
                        <td className="p-2.5 text-rose-900">Total Deductions (B)</td>
                        <td className="p-2.5 text-right text-rose-700">₹ {totalDeductions.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>

              {/* Net Salary Highlight */}
              <div className="bg-slate-900 text-white p-5 rounded-lg mb-6 flex justify-between items-center">
                <div>
                  <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Net Salary Payable (A - B)</div>
                  <div className="text-xs text-slate-400 mt-1">Status: <span className="font-bold text-white uppercase">{voucherData.status}</span></div>
                </div>
                <div className="text-2xl font-black text-emerald-400">₹ {netPayable.toFixed(2)}</div>
              </div>

              {/* Bank Details Table */}
              <div className="border border-slate-200 rounded-lg p-4 mb-10 text-xs text-slate-600">
                <div className="font-bold text-slate-800 uppercase tracking-wider mb-2">Payment Details</div>
                <div className="grid grid-cols-3 gap-4">
                  <div><span className="text-slate-400 block">Bank Name:</span> <span className="font-semibold text-slate-800">{voucherData.bank_name || 'Direct Transfer'}</span></div>
                  <div><span className="text-slate-400 block">Account Number:</span> <span className="font-mono font-semibold text-slate-800">{voucherData.account_number || '—'}</span></div>
                  <div><span className="text-slate-400 block">IFSC Code:</span> <span className="font-mono font-semibold text-slate-800">{voucherData.ifsc_code || '—'}</span></div>
                </div>
                {voucherData.status === 'Paid' && (
                  <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-3 gap-4 text-emerald-800">
                    <div><span className="text-slate-400 block">Payment Date:</span> <span className="font-bold">{voucherData.payment_date ? new Date(voucherData.payment_date).toLocaleDateString('en-GB') : '—'}</span></div>
                    <div><span className="text-slate-400 block">Payment Mode:</span> <span className="font-bold">{voucherData.payment_method || 'Bank Transfer'}</span></div>
                    <div><span className="text-slate-400 block">Txn Reference:</span> <span className="font-mono font-bold">{voucherData.payment_reference || '—'}</span></div>
                  </div>
                )}
              </div>

              {/* Signatures */}
              <div className="flex justify-between pt-8 border-t border-slate-200 text-xs text-slate-500">
                <div className="text-center">
                  <div className="w-40 border-b border-slate-400 mb-2"></div>
                  <div>Prepared By</div>
                </div>
                <div className="text-center">
                  <div className="w-40 border-b border-slate-400 mb-2"></div>
                  <div>Authorized Signatory / HR</div>
                </div>
                <div className="text-center">
                  <div className="w-40 border-b border-slate-400 mb-2"></div>
                  <div>Employee Signature</div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
