import React, { useState } from 'react';
import { FiArrowLeft, FiPlus, FiMapPin, FiHome, FiPhone, FiEye, FiX, FiInbox } from 'react-icons/fi';
import { dummyLedger, vendorCategories } from '../data/dummyData';
import TransactionModal from './TransactionModal';

// Auto-entry types come from their respective modules.
// Opening Balance & Manual Adjustment are the only manual exception entries.
const TYPE_STYLES = {
  'Periodic Service':   'bg-blue-50 text-blue-600 border border-blue-100',
  'Repair Work':        'bg-orange-50 text-orange-600 border border-orange-100',
  'Payment':            'bg-green-50 text-green-600 border border-green-100',
  'Opening Balance':    'bg-purple-50 text-purple-600 border border-purple-100',
  'Manual Adjustment':  'bg-gray-100 text-gray-500 border border-gray-200',
};

function TypeBadge({ type }) {
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${TYPE_STYLES[type] || 'bg-gray-100 text-gray-500'}`}>
      {type}
    </span>
  );
}

export default function LedgerView({ vendor, onBack }) {
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const transactions = dummyLedger[vendor.id] || [];

  const totalDebit  = transactions.reduce((s, t) => s + (t.debit  || 0), 0);
  const totalCredit = transactions.reduce((s, t) => s + (t.credit || 0), 0);
  const netBalance  = totalDebit - totalCredit;

  const FILTERS = [
    { label: 'All',         match: null },
    { label: 'Repairs',     match: 'Repair Work' },
    { label: 'Services',    match: 'Periodic Service' },
    { label: 'Payments',    match: 'Payment' },
    { label: 'Adjustments', match: ['Opening Balance', 'Manual Adjustment'] },
  ];

  const visibleTxns = activeFilter === 'All'
    ? transactions
    : transactions.filter(t => {
        const match = FILTERS.find(f => f.label === activeFilter)?.match;
        return Array.isArray(match) ? match.includes(t.type) : t.type === match;
      });

  const getCategoryLabel = (catId) => {
    const found = vendorCategories.find(c => c.id === catId);
    return found ? found.label.toUpperCase() : catId.toUpperCase();
  };

  // Parse bank string "HDFC Bank - 501002345678" into parts
  const bankParts = vendor.bank ? vendor.bank.split(' - ') : [];
  const bankName   = bankParts[0] || vendor.bank || 'Not provided';
  const bankAccNo  = bankParts[1] || null;

  return (
    <div className="space-y-6 animate-fade-in pb-12">

      {/* Top Nav */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">
          <FiArrowLeft /> Ledger Book
        </button>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-sm transition-colors"
        >
          <FiPlus /> Add Transaction
        </button>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start gap-6 border-b border-gray-50">

          {/* Garage Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2">
              <span>{getCategoryLabel(vendor.category)}</span>
            </div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight mb-3">{vendor.name}</h2>

            <div className="space-y-1.5 mb-5">
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <FiPhone className="text-gray-400 shrink-0" size={13} /> {vendor.contact}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <FiMapPin className="text-gray-400 shrink-0" size={13} /> {vendor.address}
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl max-w-xs border border-gray-100">
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-gray-400 shadow-sm border border-gray-100 shrink-0">
                <FiHome size={16} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Bank Details</div>
                <div className="text-xs font-bold text-gray-700">{bankName}</div>
                {bankAccNo && <div className="text-[11px] text-gray-500 font-medium">A/C: {bankAccNo}</div>}
              </div>
            </div>
          </div>

          {/* Balance Card */}
          <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl md:min-w-[200px] text-right shrink-0">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Current Balance</div>
            {netBalance === 0 ? (
              <>
                <div className="text-4xl font-black tracking-tighter text-gray-400">₹0</div>
                <span className="inline-block mt-2 text-[11px] font-bold text-green-600 bg-green-50 border border-green-100 px-3 py-0.5 rounded-full">Settled</span>
              </>
            ) : (
              <>
                <div className="text-xs font-bold mb-1">
                  <span className={netBalance > 0 ? 'text-red-400' : 'text-green-500'}>
                    {netBalance > 0 ? 'Outstanding Payable' : 'Advance Balance'}
                  </span>
                </div>
                <div className={`text-4xl font-black tracking-tighter ${netBalance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  ₹{Math.abs(netBalance).toLocaleString()}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Summary Row */}
        <div className="border-b border-gray-100">
          <div className="p-4 text-center">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1" title="Total bills raised by garage">Total Garage Bills</div>
            <div className="text-lg font-black text-red-500">₹{totalDebit.toLocaleString()}</div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto p-4">
          {/* Filter Buttons */}
          {transactions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {FILTERS.map(f => (
                <button
                  key={f.label}
                  onClick={() => setActiveFilter(f.label)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                    activeFilter === f.label
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
          {visibleTxns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-gray-400">
              <FiInbox size={40} className="text-gray-300" />
              {transactions.length === 0 ? (
                <>
                  <p className="font-semibold text-sm">No service or repair transactions available yet.</p>
                  <button
                    onClick={() => setAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors"
                  >
                    <FiPlus /> Add Transaction
                  </button>
                </>
              ) : (
                <p className="font-semibold text-sm">No transactions match this filter.</p>
              )}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-2 px-2 md:px-4">Date</th>
                  <th className="py-2 px-2 md:px-4">Type</th>
                  <th className="py-2 px-2 md:px-4 hidden sm:table-cell">Truck No</th>
                  <th className="py-2 px-2 md:px-4">Description</th>
                  <th className="py-2 px-2 md:px-4 text-right" title="Amount payable to garage">Debit (+)</th>
                  <th className="py-2 px-2 md:px-4 text-right" title="Payment made to garage">Credit (-)</th>
                  <th className="py-2 px-2 md:px-4 text-center hidden md:table-cell">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visibleTxns.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-2 md:px-4">
                      <span className="text-xs font-bold text-gray-600 tracking-wide whitespace-nowrap">{txn.date}</span>
                    </td>
                    <td className="py-3 px-2 md:px-4">
                      <TypeBadge type={txn.type} />
                    </td>
                    <td className="py-3 px-2 md:px-4 hidden sm:table-cell">
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {txn.truckId || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-2 md:px-4">
                      <div className="text-xs md:text-sm font-semibold text-gray-700">{txn.desc}</div>
                      {txn.ref && <div className="text-[10px] text-gray-400 font-medium mt-0.5">REF: {txn.ref}</div>}
                    </td>
                    <td className="py-3 px-2 md:px-4 text-right">
                      {txn.debit > 0
                        ? <span className="font-bold text-red-500 text-xs md:text-sm">₹{txn.debit.toLocaleString()}</span>
                        : <span className="text-gray-300 font-bold">—</span>}
                    </td>
                    <td className="py-3 px-2 md:px-4 text-right">
                      {txn.credit > 0
                        ? <span className="font-bold text-green-500 text-xs md:text-sm">₹{txn.credit.toLocaleString()}</span>
                        : <span className="text-gray-300 font-bold">—</span>}
                    </td>
                    <td className="py-3 px-2 md:px-4 text-center hidden md:table-cell">
                      <button
                        onClick={() => setSelectedTxn(txn)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FiEye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <TransactionModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} vendor={vendor} />

      {/* View Transaction Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
            style={{ animation: 'modalSlideIn 0.2s ease-out' }}
          >
            <div className="flex justify-between items-center p-4 bg-slate-50 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 tracking-wide">Transaction Details</h3>
              <button onClick={() => setSelectedTxn(null)} className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
                <FiX size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date</p>
                  <p className="font-bold text-gray-800 text-sm">{selectedTxn.date}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Type</p>
                  <TypeBadge type={selectedTxn.type} />
                </div>
              </div>

              {selectedTxn.truckId && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Vehicle Linked</p>
                  <span className="font-bold text-gray-800 text-sm bg-gray-100 px-2 py-1 inline-block rounded">{selectedTxn.truckId}</span>
                </div>
              )}

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bill Amount</p>
                <p className={`text-3xl font-extrabold ${selectedTxn.debit > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  ₹{(selectedTxn.debit > 0 ? selectedTxn.debit : selectedTxn.credit).toLocaleString()}
                  <span className="text-base ml-1">{selectedTxn.debit > 0 ? 'Dr' : 'Cr'}</span>
                </p>
              </div>

              {selectedTxn.ref && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Reference Number</p>
                  <p className="font-bold text-gray-700 text-sm">{selectedTxn.ref}</p>
                </div>
              )}

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Source Module</p>
                <p className="text-sm font-semibold text-gray-700">
                  {{
                    'Repair Work':       'Maintenance Module',
                    'Periodic Service':  'Service Module',
                    'Payment':           'Operational Payments',
                    'Opening Balance':   'Manual Entry',
                    'Manual Adjustment': 'Manual Entry',
                  }[selectedTxn.type] || 'Manual Entry'}
                </p>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Description</p>
                <div className="bg-gray-50 text-gray-600 p-3 rounded-lg border border-gray-100 text-sm">{selectedTxn.desc}</div>
              </div>

              <div className="pt-2">
                <button onClick={() => setSelectedTxn(null)} className="w-full py-2.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-colors">Close</button>
              </div>
            </div>
          </div>
          <style>{`@keyframes modalSlideIn { from { opacity:0; transform:translateY(20px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
        </div>
      )}
    </div>
  );
}
