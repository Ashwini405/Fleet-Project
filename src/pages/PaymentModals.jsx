import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  FiFileText, FiX, FiCheck, FiCheckCircle, FiPrinter, FiDownload,
  FiDollarSign, FiClock, FiEdit2, FiRefreshCw,
} from 'react-icons/fi';

// ─────────────────────────────────────────────
// MODAL: SETTLEMENT DETAIL VIEW
// ─────────────────────────────────────────────
export function DetailModal({ detailItem, onClose, onApprove, onReject, onEdit, onResubmit, onPrint }) {
  if (!detailItem) return null;
  
  // Calculate battha total from database fields
  const batthaTotal = (Number(detailItem.total_trips) || 0) * (Number(detailItem.battha_rate) || 0);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FiFileText className="text-indigo-500" /> Settlement Detail
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{detailItem.settlement_no} &mdash; {detailItem.statement_month}</p>
          </div>
          <button onClick={onClose} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Driver & Vehicle */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Driver Details</p>
              <p className="font-bold text-slate-800">{detailItem.driver_name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{detailItem.plant_name}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Vehicle</p>
              <p className="font-mono font-bold text-slate-800">{detailItem.vehicle_no}</p>
              <p className="text-xs text-slate-500 mt-0.5">Month: {detailItem.statement_month} &bull; {detailItem.total_trips} Trips</p>
            </div>
          </div>

          {/* Rejected Banner */}
          {detailItem.status === 'Rejected' && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0 rounded-full bg-red-100 p-2 text-red-600">
                  <FiX className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-red-800">Settlement Rejected</p>
                  <p className="mt-1 text-xs text-red-600">This settlement was rejected and preserved for audit. You can edit and resubmit it.</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs text-slate-700">
                <div className="rounded-xl bg-white p-3 border border-red-100">
                  <p className="font-semibold text-slate-900">Rejected By</p>
                  <p>{detailItem.rejectedBy || 'Admin'}</p>
                </div>
                <div className="rounded-xl bg-white p-3 border border-red-100">
                  <p className="font-semibold text-slate-900">Rejected On</p>
                  <p>{detailItem.rejected_at ? new Date(detailItem.rejected_at).toLocaleDateString() : '—'}</p>
                </div>
                <div className="rounded-xl bg-white p-3 border border-red-100">
                  <p className="font-semibold text-slate-900">Resubmitted</p>
                  <p>{detailItem.resubmitted_at ? new Date(detailItem.resubmitted_at).toLocaleDateString() : 'Not yet'}</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-white p-3 border border-red-100 text-slate-700">
                <p className="font-semibold text-slate-900">Reason</p>
                <p>{detailItem.rejected_reason || 'Not provided'}</p>
              </div>
            </div>
          )}

          {/* Earnings / Additions / Deductions breakdown */}
          {[
            ['Earnings', [
              ['Monthly Salary', `₹ ${(Number(detailItem.fixed_salary) || 0).toLocaleString()}`, 'text-slate-800'],
              ['Battha', `₹ ${batthaTotal.toLocaleString()}`, 'text-indigo-600'],
            ], 'blue'],
            ['Additions', [
              ['Loading Charges',   `₹ ${(Number(detailItem.loading_charges) || 0).toLocaleString()}`, 'text-green-600'],
              ['Unloading Charges', `₹ ${(Number(detailItem.unloading_charges) || 0).toLocaleString()}`, 'text-green-600'],
              ['Bonus',             `₹ ${(Number(detailItem.bonus) || 0).toLocaleString()}`, 'text-green-600'],
              ['Other Allowances',  `₹ ${(Number(detailItem.other_allowances) || 0).toLocaleString()}`, 'text-green-600'],
            ], 'green'],
            ['Deductions', [
              ['Driver Advance',    `₹ ${(Number(detailItem.driver_advance) || 0).toLocaleString()}`, 'text-red-500'],
              ['Penalty',           `₹ ${(Number(detailItem.penalty) || 0).toLocaleString()}`,   'text-red-500'],
              ['Other Deductions',  `₹ ${(Number(detailItem.other_deductions) || 0).toLocaleString()}`,   'text-red-500'],
            ], 'red'],
          ].map(([title, rows, color]) => (
            <div key={title} className={`rounded-xl border border-${color}-100 overflow-hidden`}>
              <div className={`px-4 py-2.5 bg-${color}-50 border-b border-${color}-100`}>
                <p className={`text-xs font-bold text-${color}-600 uppercase tracking-wider`}>{title}</p>
              </div>
              <div className="divide-y divide-slate-50">
                {rows.map(([label, val, cls]) => (
                  <div key={label} className="flex justify-between px-4 py-2.5 text-sm">
                    <span className="text-slate-600">{label}</span>
                    <span className={`font-bold ${cls}`}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Net Payable */}
          <div className="bg-linear-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl px-5 py-4 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-700">Net Payable</span>
            <span className="text-2xl font-black text-indigo-700">₹ {(Number(detailItem.net_payable) || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 flex gap-3 shrink-0">
          {detailItem.status === 'Submitted' && (
            <>
              <button onClick={() => { onApprove(detailItem); onClose(); }} className="flex-1 py-2.5 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 flex items-center justify-center gap-2 transition-colors">
                <FiCheck className="w-4 h-4" /> Approve
              </button>
              <button onClick={() => { onReject(detailItem); onClose(); }} className="flex-1 py-2.5 bg-red-50 text-red-600 border border-red-200 font-bold rounded-xl hover:bg-red-100 flex items-center justify-center gap-2 transition-colors">
                <FiX className="w-4 h-4" /> Reject
              </button>
            </>
          )}
          {detailItem.status === 'Rejected' && (
            <>
              <button onClick={() => { onEdit(detailItem); onClose(); }} className="flex-1 py-2.5 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 flex items-center justify-center gap-2 transition-colors">
                <FiEdit2 className="w-4 h-4" /> Edit
              </button>
              <button onClick={() => { onResubmit(detailItem); onClose(); }} className="flex-1 py-2.5 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 flex items-center justify-center gap-2 transition-colors">
                <FiRefreshCw className="w-4 h-4" /> Resubmit
              </button>
            </>
          )}
          <button onClick={() => onPrint(detailItem)} className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 text-sm transition-colors">
            <FiPrinter className="w-4 h-4" /> Print
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MODAL: REJECT
// ─────────────────────────────────────────────
export function RejectModal({ rejectTarget, rejectReason, setRejectReason, rejectError, onConfirm, onClose }) {
  if (!rejectTarget) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span className="bg-red-100 text-red-600 p-1.5 rounded-full"><FiX className="w-4 h-4" /></span>
            Reject Settlement
          </h2>
          <button onClick={onClose} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
            <FiX className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-lg px-4 py-3 flex justify-between text-sm border border-slate-100">
            <span className="text-slate-500 font-medium">Settlement</span>
            <span className="font-bold text-slate-800">{rejectTarget.settlement_no} &mdash; {rejectTarget.driver_name}</span>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 tracking-wider">Reason for Rejection</label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Enter reason..."
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2.5 resize-none focus:ring-1 focus:ring-red-400 focus:outline-none"
            />
            {rejectError && <p className="text-xs text-red-500 mt-1 font-medium">{rejectError}</p>}
          </div>
        </div>
        <div className="p-5 border-t border-slate-100 flex gap-3">
          <button onClick={onConfirm} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
            <FiX className="w-4 h-4" /> Confirm Reject
          </button>
          <button onClick={onClose} className="py-3 px-6 bg-white border border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MODAL: MARK AS PAID
// ─────────────────────────────────────────────
export function MarkPaidModal({ markPaidTarget, paymentDate, setPaymentDate, paymentMode, setPaymentMode, paymentRef, setPaymentRef, paymentNotes, setPaymentNotes, onConfirm, onClose }) {
  if (!markPaidTarget) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span className="bg-purple-100 text-purple-600 p-1.5 rounded-full"><FiDollarSign className="w-4 h-4" /></span>
            Mark as Paid
          </h2>
          <button onClick={onClose} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
            <FiX className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between text-sm bg-slate-50 rounded-lg px-4 py-3 border border-slate-100">
            <span className="text-slate-500 font-medium">Net Payable</span>
            <span className="font-black text-purple-700 text-lg">₹ {(Number(markPaidTarget.net_payable) || 0).toLocaleString()}</span>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 tracking-wider">Payment Date</label>
            <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 tracking-wider">Payment Mode</label>
            <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className="w-full text-sm font-bold border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-800">
              <option>Cash</option><option>Bank Transfer</option><option>UPI</option><option>Cheque</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 tracking-wider">Reference Number</label>
            <input type="text" value={paymentRef} onChange={e => setPaymentRef(e.target.value)} placeholder="Optional" className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 tracking-wider">Remarks</label>
            <textarea rows={2} value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)} placeholder="Optional remarks..." className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 resize-none focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
          </div>
        </div>
        <div className="p-5 border-t border-slate-100 flex gap-3">
          <button onClick={onConfirm} className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors">
            <FiCheck className="w-4 h-4" /> Confirm Payment
          </button>
          <button onClick={onClose} className="py-3 px-6 bg-white border border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MODAL: SETTLE PAYMENT
// ─────────────────────────────────────────────
export function SettleModal({ selectedPending, paymentDate, setPaymentDate, paymentMode, setPaymentMode, paymentRef, setPaymentRef, paymentNotes, setPaymentNotes, onConfirm, onClose }) {
  if (!selectedPending) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
            <span className="bg-green-100 text-green-600 p-1.5 rounded-full"><FiCheckCircle className="w-5 h-5" /></span>
            Settle Payment
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5 bg-slate-50/50">
          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pay To:</span>
            <span className="font-bold text-slate-800">{selectedPending.driver_name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Amount:</span>
            <span className="font-black text-green-600 text-xl">₹ {(Number(selectedPending.net_payable) || 0).toFixed(2)}</span>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 tracking-wider">Payment Date</label>
            <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="w-full text-sm font-medium border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 tracking-wider">Payment Mode</label>
            <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className="w-full text-sm font-bold border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-800">
              <option>Cash</option>
              <option>Bank Transfer</option>
              <option>UPI</option>
              <option>Cheque</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 tracking-wider">Reference No / Cheque No</label>
            <input type="text" value={paymentRef} onChange={e => setPaymentRef(e.target.value)} placeholder="Optional" className="w-full text-sm font-medium border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 tracking-wider">Notes</label>
            <textarea rows="2" value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)} placeholder="Remarks..." className="w-full text-sm font-medium border border-slate-300 rounded-lg px-3 py-2 resize-none focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
          </div>
        </div>
        <div className="p-5 border-t border-slate-100 flex gap-3">
          <button onClick={onConfirm} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
            <FiCheckCircle className="w-5 h-5" /> Confirm Payment
          </button>
          <button onClick={onClose} className="py-3 px-6 bg-white border border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MODAL: PRINTABLE VOUCHER VIEW
// ─────────────────────────────────────────────
export function VoucherModal({ selectedVoucherData, onClose }) {
  if (!selectedVoucherData) return null;
  
  const voucherRef = useRef(null);

  // Destructure the voucher data (already formatted in Payments.jsx)
  const {
    driver,
    truck,
    plant,
    period,
    trips,
    salary,
    batthaRate,
    batthaTotal,
    additions,
    totalAdvance,
    netPayable,
    paidDetails
  } = selectedVoucherData;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!voucherRef.current) return;

    try {
      const canvas = await html2canvas(voucherRef.current, {
        scale: 2,
        useCORS: true,
        onclone: (doc) => {
          doc.querySelectorAll('*').forEach((el) => {
            const style = el.style;
            ['color', 'backgroundColor', 'borderColor', 'outlineColor'].forEach((prop) => {
              if (style[prop]?.includes('oklch')) style[prop] = '';
            });
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
      pdf.save(`Driver-Settlement-${driver || 'voucher'}-${period || ''}.pdf`);
    } catch (error) {
      console.error('Download PDF failed:', error);
      alert('Unable to download PDF. Please try printing instead.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
      <div className="bg-slate-100 rounded-xl shadow-2xl w-full max-w-3xl h-[90vh] flex flex-col overflow-hidden">
        <style>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            .voucher-print-area, .voucher-print-area * {
              visibility: visible !important;
            }
            .voucher-print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}</style>

        {/* Print toolbar */}
        <div className="bg-slate-800 p-4 flex justify-between items-center text-white shrink-0">
          <h2 className="font-bold flex items-center gap-2"><FiFileText /> Payment Voucher & Trip Sheet</h2>
          <div className="flex gap-4">
            <button onClick={handlePrint} className="flex items-center gap-2 text-sm font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded transition-colors"><FiPrinter /> Print</button>
            <button onClick={handleDownloadPdf} className="flex items-center gap-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded shadow transition-colors"><FiDownload /> Download PDF</button>
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded transition-colors"><FiX className="w-5 h-5" /></button>
          </div>
        </div>

        {/* A4 Paper Container */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div ref={voucherRef} className="voucher-print-area bg-white mx-auto shadow-sm" style={{ width: '100%', maxWidth: '210mm', minHeight: '297mm' }}>
            <div className="p-10 font-sans">

              {/* Header line */}
              <div className="flex justify-between border-b-2 border-slate-800 pb-4 mb-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Fleet Management System</h1>
                  <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">Driver Settlement Voucher</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Date</div>
                  <div className="text-sm font-bold text-slate-800">{new Date().toLocaleDateString('en-GB')}</div>
                </div>
              </div>

              {/* Driver & Truck Info */}
              <div className="flex justify-between mb-8 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Paid To (Driver)</div>
                  <div className="text-lg font-black text-slate-800">{driver}</div>
                  <div className="text-sm font-medium text-slate-600 mt-0.5">Truck: <span className="font-bold text-slate-800">{truck}</span></div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">Plant: {plant}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Period</div>
                  <div className="text-lg font-black text-slate-800">{period}</div>
                  <div className="text-sm font-medium text-slate-600 mt-0.5">{trips} Trips</div>
                </div>
              </div>

              {/* Earnings & Deductions Table */}
              <table className="w-full text-sm mb-8">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left font-bold text-[10px] uppercase text-slate-500 tracking-wider pb-2">Description</th>
                    <th className="text-center font-bold text-[10px] uppercase text-slate-500 tracking-wider pb-2">Calculation</th>
                    <th className="text-right font-bold text-[10px] uppercase text-slate-500 tracking-wider pb-2">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="py-3 text-slate-700">Monthly Salary</td>
                    <td className="py-3 text-center text-slate-500 text-xs">Fixed</td>
                    <td className="py-3 text-right text-slate-800">₹ {salary.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-slate-700">Trip Battha</td>
                    <td className="py-3 text-center text-slate-500 text-xs">{trips} x ₹ {batthaRate}</td>
                    <td className="py-3 text-right text-slate-800">₹ {batthaTotal.toFixed(2)}</td>
                  </tr>
                  {additions.loading > 0 && (
                    <tr><td className="py-3 text-slate-700">Loading Charges</td><td /><td className="py-3 text-right text-slate-800">₹ {Number(additions.loading).toFixed(2)}</td></tr>
                  )}
                  {additions.unloading > 0 && (
                    <tr><td className="py-3 text-slate-700">Unloading Charges</td><td /><td className="py-3 text-right text-slate-800">₹ {Number(additions.unloading).toFixed(2)}</td></tr>
                  )}
                  {additions.others > 0 && (
                    <tr><td className="py-3 text-slate-700">Truck Bills</td><td /><td className="py-3 text-right text-slate-800">₹ {Number(additions.others).toFixed(2)}</td></tr>
                  )}
                  {additions.bonus > 0 && (
                    <tr><td className="py-3 text-green-600 font-bold">Bonus</td><td /><td className="py-3 text-right text-green-600 font-bold">₹ {Number(additions.bonus).toFixed(2)}</td></tr>
                  )}
                  <tr>
                    <td className="py-3 text-red-500 font-bold">Less: Total Advance</td>
                    <td className="py-3"></td>
                    <td className="py-3 text-right text-red-500 font-bold">(₹ {totalAdvance.toFixed(2)})</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="py-4 font-black text-slate-900 tracking-tight pl-2">NET PAYABLE</td>
                    <td></td>
                    <td className="py-4 text-right font-black text-slate-900 text-lg pr-2">₹ {netPayable.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Paid details if any */}
              {paidDetails && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex justify-between text-sm mb-8">
                  <div>
                    <strong className="block text-green-900 text-xs uppercase mb-1">Payment Details</strong>
                    Date: {paidDetails.date} <br />
                    Ref No: {paidDetails.ref || 'N/A'}
                  </div>
                  <div className="text-right">
                    <br />
                    Mode: <span className="font-bold">{paidDetails.mode}</span> <br />
                    Notes: {paidDetails.notes || '-'}
                  </div>
                </div>
              )}

              {/* Signatures */}
              <div className="flex justify-between mt-20 pt-4 border-t border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <div>Accountant</div>
                <div>Driver Sign</div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}