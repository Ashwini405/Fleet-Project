import React from 'react';
import {
  FiCheckCircle, FiFileText, FiX, FiCheck, FiDownload,
  FiClock, FiPlus, FiEdit2, FiRefreshCw, FiPrinter,
} from 'react-icons/fi';

export default function SettlementHistoryTab({
  historyList,
  filteredHistory,
  historyFilterDriver, setHistoryFilterDriver,
  historyFilterVehicle, setHistoryFilterVehicle,
  historyFilterMonth, setHistoryFilterMonth,
  historyFilterStatus, setHistoryFilterStatus,
  historyFilterDateFrom, setHistoryFilterDateFrom,
  historyFilterDateTo, setHistoryFilterDateTo,
  uniqueMonths,
  uniqueDrivers,
  uniqueVehicles,
  onNewSettlement,
  onView,
  onPrint,
  onMarkPaid,
  onEdit,
  onResubmit,
  onDuplicate,
}) {
  const hasFilters =
    historyFilterDriver || historyFilterVehicle || historyFilterMonth ||
    historyFilterStatus || historyFilterDateFrom || historyFilterDateTo;

  const clearFilters = () => {
    setHistoryFilterDriver('');
    setHistoryFilterVehicle('');
    setHistoryFilterMonth('');
    setHistoryFilterStatus('');
    setHistoryFilterDateFrom('');
    setHistoryFilterDateTo('');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

      {/* ── Filters Bar ── */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">

          <select value={historyFilterDriver} onChange={e => setHistoryFilterDriver(e.target.value)} className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none">
            <option value="">All Drivers</option>
            {uniqueDrivers.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select value={historyFilterVehicle} onChange={e => setHistoryFilterVehicle(e.target.value)} className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none">
            <option value="">All Vehicles</option>
            {uniqueVehicles.map(v => <option key={v} value={v}>{v}</option>)}
          </select>

          <select value={historyFilterMonth} onChange={e => setHistoryFilterMonth(e.target.value)} className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none">
            <option value="">All Months</option>
            {uniqueMonths.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <select value={historyFilterStatus} onChange={e => setHistoryFilterStatus(e.target.value)} className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none">
            <option value="">All Status</option>
            {['Paid', 'Approved', 'Submitted', 'Rejected', 'Draft'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <input
            type="date"
            value={historyFilterDateFrom}
            onChange={e => setHistoryFilterDateFrom(e.target.value)}
            className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none"
          />
          <input
            type="date"
            value={historyFilterDateTo}
            onChange={e => setHistoryFilterDateTo(e.target.value)}
            className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none"
          />

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-indigo-500 hover:text-indigo-700 underline underline-offset-2"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400 font-medium">{filteredHistory.length} records</span>
          <button className="flex items-center gap-1.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:text-indigo-600 transition-colors">
            <FiDownload className="w-3.5 h-3.5" /> Export
          </button>
          <button
            onClick={onNewSettlement}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors"
          >
            <FiPlus className="w-4 h-4" /> Generate Settlement
          </button>
        </div>
      </div>

      {/* ── Table ── */}
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

            {/* Empty State */}
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
              const sal = item.salary || 18000;
              const bth = (item.trips || 0) * (item.batthaRate || 300);
              const add = item.additions
                ? Object.values(item.additions).reduce((s, v) => s + (Number(v) || 0), 0)
                : 1350;
              const ded = (item.advance || 6500) + (item.penalty || 0) + (item.otherDed || 0);

              return (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">

                  <td className="py-3 px-4 font-bold text-indigo-600 text-xs whitespace-nowrap">{item.id}</td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800 text-sm whitespace-nowrap">{item.driver}</div>
                    <div className="text-[11px] text-slate-400">{item.plant}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap">{item.truckNo}</span>
                  </td>

                  <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">{item.month}</td>
                  <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">₹ {sal.toLocaleString()}</td>
                  <td className="py-3 px-4 text-indigo-600 font-semibold whitespace-nowrap">₹ {bth.toLocaleString()}</td>
                  <td className="py-3 px-4 text-green-600 font-semibold whitespace-nowrap">+ ₹ {add.toLocaleString()}</td>
                  <td className="py-3 px-4 text-red-500 font-semibold whitespace-nowrap">− ₹ {ded.toLocaleString()}</td>

                  <td className="py-3 px-4">
                    <span className="font-black text-indigo-700 whitespace-nowrap">₹ {item.netPayable.toLocaleString()}</span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4">
                    {item.status === 'Paid' && (
                      <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap">
                        <FiCheck className="w-2.5 h-2.5" /> Paid
                      </span>
                    )}
                    {item.status === 'Approved' && (
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 border border-green-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap">
                        <FiCheckCircle className="w-2.5 h-2.5" /> Approved
                      </span>
                    )}
                    {item.status === 'Submitted' && (
                      <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 border border-orange-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap">
                        <FiClock className="w-2.5 h-2.5" /> Submitted
                      </span>
                    )}
                    {item.status === 'Rejected' && (
                      <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap">
                        <FiX className="w-2.5 h-2.5" /> Rejected
                      </span>
                    )}
                    {item.status === 'Draft' && (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap">
                        <FiFileText className="w-2.5 h-2.5" /> Draft
                      </span>
                    )}
                  </td>

                  {/* Payment Date */}
                  <td className="py-3 px-4">
                    {item.paidOn ? (
                      <>
                        <div className="text-xs font-semibold text-slate-700 whitespace-nowrap">{item.paidOn}</div>
                        <div className="text-[11px] text-slate-400">{item.mode || '—'}</div>
                      </>
                    ) : item.status === 'Approved' ? (
                      <button
                        onClick={() => onMarkPaid(item)}
                        className="text-xs font-bold text-purple-600 bg-purple-50 border border-purple-200 px-2 py-1 rounded-lg hover:bg-purple-100 transition-colors whitespace-nowrap"
                      >
                        Mark as Paid
                      </button>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => onView(item)} title="View" className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                        <FiFileText className="w-4 h-4" />
                      </button>
                      <button onClick={() => onPrint(item)} title="Print" className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                        <FiPrinter className="w-4 h-4" />
                      </button>
                      <button onClick={() => onPrint(item)} title="Download PDF" className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                        <FiDownload className="w-4 h-4" />
                      </button>
                      {item.status === 'Rejected' ? (
                        <>
                          <button onClick={() => onEdit(item)} title="Edit" className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => onResubmit(item)} title="Resubmit" className="p-1.5 rounded-lg text-slate-500 hover:text-green-600 hover:bg-green-50 transition-colors">
                            <FiRefreshCw className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button onClick={() => onDuplicate(item)} title="Duplicate" className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors">
                          <FiPlus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Footer Summary ── */}
      {filteredHistory.length > 0 && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap justify-between items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">
            Showing {filteredHistory.length} of {historyList.length} settlements
          </span>
          <span className="text-sm font-bold text-slate-700">
            Total Paid:{' '}
            <span className="text-purple-700">
              ₹ {filteredHistory
                .filter(i => i.status === 'Paid')
                .reduce((s, i) => s + i.netPayable, 0)
                .toLocaleString()}
            </span>
          </span>
        </div>
      )}

    </div>
  );
}