import React, { useState, useMemo, useEffect } from 'react';
import {
  FiArrowLeft,
  FiPlus,
  FiEye,
  FiX,
  FiInbox,
  FiSearch,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiPrinter,
  FiDroplet,
  FiCornerUpLeft,
  FiCreditCard,
  FiCheckCircle,
} from 'react-icons/fi';
import axios from 'axios';
import { VendorInfoPanel, RecordPaymentModal } from './shared';
import { PAGE_SIZE, MODAL_ANIM, fmtDate } from './shared/constants';

const CATEGORY_LABEL = 'OILS & LUBES';
const FILTERS = ['Oil Records', 'Payments', 'Returns'];
const filterMatch = {
  'Oil Records': ['Purchase', 'Adjustment Credit'],
  Payments: ['Payment'],
  Returns: ['Vendor Return'],
};

function toCSV(rows, cols) {
  const h = cols.map(c => c.l).join(',');
  const b = rows.map(r => cols.map(c => `"${String(r[c.k] ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  return h + '\n' + b;
}

function dlCSV(name, content) {
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(content);
  a.download = name;
  a.click();
}

function printTbl(title, cols, rows) {
  const html = `<html><head><title>${title}</title><style>body{font-family:sans-serif;font-size:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:6px 10px;text-align:left}th{background:#f3f4f6;font-weight:700}h2{margin-bottom:12px}</style></head><body><h2>${title}</h2><table><thead><tr>${cols.map(c => `<th>${c.l}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${cols.map(c => `<td>${r[c.k] ?? ''}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`;
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  w.print();
}

export default function OilsLedger({ vendor, onBack }) {
  const isCash = (vendor.payment_terms || 'credit') === 'cash';
  const visibleFilters = isCash ? ['Oil Records', 'Returns'] : FILTERS;
  const [rawOrders, setRawOrders] = useState([]);
  const [rawReturns, setRawReturns] = useState([]);
  const [rawPayments, setRawPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Oil Records');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [payModalOpen, setPayModalOpen] = useState(false);

  // Fetch ledger data from database
  const fetchLedger = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5001/api/oil-ledger/${vendor.id}`);
      const data = response.data?.data || response.data;

      setRawOrders(data?.orders || []);
      setRawReturns(data?.returns || []);
      setRawPayments(data?.payments || []);
    } catch (error) {
      console.error('OIL LEDGER FETCH ERROR', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [vendor.id]);

  // Compute PO-by-PO Statements, Allocations & Transactions
  const {
    txnsWithBalance,
    poList,
    totalDebit,
    totalPayments,
    totalReturnCredits,
    totalCredit,
    netOutstanding,
  } = useMemo(() => {
    // 1. Group Returns by PO Reference
    const returnsByPO = {};
    const returnTxns = rawReturns.map(item => {
      const poRef = item.po_number || '';
      const creditAmt = Number(item.credit_amount || 0);
      if (poRef) {
        returnsByPO[poRef] = (returnsByPO[poRef] || 0) + creditAmt;
      }
      return {
        id: `return-${item.id}`,
        dbId: item.id,
        date: item.return_date,
        truckId: item.vehicle_number || '',
        type: 'Vendor Return',
        ref: item.po_number || `RETURN-${item.id}`,
        desc: `${item.part_name || 'Oil Item'}${item.quantity_returned ? ` (${item.quantity_returned}L)` : ''} - ${item.return_reason || item.notes || 'Vendor return'}`,
        reason: item.return_reason || item.notes || 'Damaged / Return',
        debit: 0,
        credit: creditAmt,
        paidAmount: 0,
        remainingDue: 0,
        poRef,
        itemName: item.part_name,
        quantity: item.quantity_returned,
        status: 'Credit Issued',
      };
    });

    // 2. Build PO Purchase Records and compute initial net balance
    const purchaseTxns = rawOrders.map(order => {
      const grossAmt = Number(order.total_amount || 0);
      const poRef = order.po_number || `PO-${order.id}`;
      const returnCredit = returnsByPO[poRef] || 0;
      const netBill = Math.max(0, grossAmt - returnCredit);

      return {
        id: `po-${order.id}`,
        dbId: order.id,
        date: order.requested_date || order.expected_delivery || order.created_at,
        truckId: '',
        type: 'Purchase',
        ref: poRef,
        desc: `${order.item_name || 'Oils & Lubes Purchase'}${order.quantity ? ` (${order.quantity}L)` : ''}`,
        debit: grossAmt,
        returnCredit: returnCredit,
        credit: isCash ? grossAmt : 0,
        paidAmount: isCash ? netBill : 0,
        remainingDue: isCash ? 0 : netBill,
        poRef,
        itemName: order.item_name,
        quantity: order.quantity,
        status: order.status || 'Received',
      };
    });

    // Sort purchases oldest first for FIFO payment allocation
    purchaseTxns.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 3. Process Payments and allocate to POs (matching FuelLedger FIFO allocation)
    const paymentTxns = rawPayments.map(p => {
      let amountLeft = Number(p.amount || 0);
      const paymentDate = p.payment_date;
      const allocationMatch = String(p.notes || '').match(/__fuel_allocation_ids:([^_]+)__/);
      const selectedPOKeys = allocationMatch
        ? new Set(allocationMatch[1].split(',').map(id => id.trim()).filter(Boolean))
        : null;
      const visibleNotes = String(p.notes || '')
        .replace(/__fuel_allocation_ids:[^_]+__\s*/g, '')
        .trim();

      const appliedTo = [];
      if (!isCash) {
        purchaseTxns.forEach(po => {
          if (selectedPOKeys && !selectedPOKeys.has(String(po.ref)) && !selectedPOKeys.has(String(po.id))) return;
          if (amountLeft <= 0 || po.remainingDue <= 0) return;
          const applied = Math.min(amountLeft, po.remainingDue);
          po.paidAmount += applied;
          po.remainingDue -= applied;
          amountLeft -= applied;
          appliedTo.push({
            poRef: po.ref,
            item: po.itemName,
            amount: applied,
          });
        });
      }

      const appliedLabel = appliedTo.length
        ? appliedTo.map(item => `${item.poRef}: ₹${item.amount.toLocaleString('en-IN')}`).join(', ')
        : 'General Vendor Payment';

      let paymentReceiptFiles = [];
      try {
        if (p.receipt_files) {
          if (Array.isArray(p.receipt_files)) {
            paymentReceiptFiles = p.receipt_files;
          } else if (typeof p.receipt_files === 'string') {
            const trimmed = p.receipt_files.trim();
            if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
              const parsed = JSON.parse(trimmed);
              paymentReceiptFiles = Array.isArray(parsed) ? parsed : [parsed];
            } else if (trimmed) {
              paymentReceiptFiles = [trimmed];
            }
          }
        }
      } catch (err) {
        paymentReceiptFiles = p.receipt_files ? [p.receipt_files] : [];
      }

      return {
        id: `pay-${p.id}`,
        dbId: p.id,
        date: paymentDate,
        truckId: '',
        type: 'Payment',
        ref: p.reference_number || `PAY-${p.id}`,
        desc: visibleNotes || `Payment via ${p.payment_mode || 'Bank'}`,
        appliedSummary: appliedLabel,
        debit: 0,
        credit: Number(p.amount || 0),
        paidAmount: Number(p.amount || 0),
        remainingDue: 0,
        poRef: '',
        paymentMode: p.payment_mode,
        notes: p.notes,
        receiptFiles: paymentReceiptFiles,
        status: 'Paid',
      };
    });

    // 4. Update status labels for Purchase Orders
    purchaseTxns.forEach(po => {
      if (isCash) {
        po.status = 'Cash Paid';
      } else if (po.remainingDue === 0) {
        po.status = 'Paid';
      } else if (po.paidAmount > 0 || po.returnCredit > 0) {
        po.status = 'Partially Paid';
      } else {
        po.status = 'Unpaid';
      }
    });

    // 5. Combine all transactions and calculate running balance
    const allTxns = [...purchaseTxns, ...returnTxns, ...paymentTxns].sort((a, b) => {
      const dateDiff = new Date(a.date) - new Date(b.date);
      if (dateDiff !== 0) return dateDiff;
      if (a.poRef && b.poRef && a.poRef !== b.poRef) return a.poRef.localeCompare(b.poRef);
      const typeOrder = { Purchase: 1, 'Vendor Return': 2, Payment: 3 };
      return (typeOrder[a.type] || 4) - (typeOrder[b.type] || 4);
    });

    let running = 0;
    const txnsWithRunningBalance = allTxns.map(t => {
      running += (t.debit || 0) - (t.credit || 0);
      return {
        ...t,
        runningBalance: isCash ? 0 : running,
      };
    });

    const debitSum = purchaseTxns.reduce((s, t) => s + (t.debit || 0), 0);
    const returnSum = returnTxns.reduce((s, t) => s + (t.credit || 0), 0);
    const paySum = paymentTxns.reduce((s, t) => s + (t.credit || 0), 0);
    const totalCred = returnSum + paySum;
    const outstanding = isCash ? 0 : debitSum - totalCred;

    // PO list for payment modal
    const poListForModal = purchaseTxns.map(po => ({
      poKey: String(po.ref || po.id),
      poRef: po.ref,
      desc: `${po.itemName || 'Oil'} (${po.ref})`,
      amount: Math.max(0, po.debit - po.returnCredit),
      paidAmount: po.paidAmount,
      allocations: [],
    }));

    return {
      txnsWithBalance: txnsWithRunningBalance,
      poList: poListForModal,
      totalDebit: debitSum,
      totalReturnCredits: returnSum,
      totalPayments: paySum,
      totalCredit: totalCred,
      netOutstanding: outstanding,
    };
  }, [rawOrders, rawReturns, rawPayments, isCash]);

  const filtered = useMemo(() => txnsWithBalance.filter(t => {
    if (!filterMatch[activeFilter]?.includes(t.type)) return false;
    if (search && !t.desc?.toLowerCase().includes(search.toLowerCase()) && !t.ref?.toLowerCase().includes(search.toLowerCase())) return false;
    if (dateFrom && t.date < dateFrom) return false;
    if (dateTo && t.date > dateTo) return false;
    return true;
  }), [txnsWithBalance, activeFilter, search, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSavePayment = async () => {
    await fetchLedger();
    setPage(1);
  };

  if (loading) {
    return (
      <div className="space-y-5 animate-fade-in pb-12">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-9 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="animate-pulse text-gray-400">Loading oils &amp; lubes vendor ledger...</div>
        </div>
      </div>
    );
  }

  const isPaymentFilter = activeFilter === 'Payments';
  const isReturnFilter = activeFilter === 'Returns';

  const financeCards = [
    {
      label: 'Total Purchases Cost',
      value: totalDebit,
      color: 'text-red-600',
      bg: 'bg-red-50',
      sub: `Gross orders: ₹${totalDebit.toLocaleString('en-IN')}`,
    },
    {
      label: 'Total Paid',
      value: isCash ? totalDebit : totalPayments,
      color: 'text-green-600',
      bg: 'bg-green-50',
      sub: isCash ? 'Paid at purchase' : 'Payments recorded',
    },
    {
      label: 'Balance Due',
      value: Math.max(0, netOutstanding),
      color: netOutstanding > 0 ? 'text-amber-600' : 'text-green-600',
      bg: netOutstanding > 0 ? 'bg-amber-50' : 'bg-green-50',
      sub: isCash
        ? 'Cash vendor (Settled)'
        : netOutstanding > 0
        ? 'Still payable to vendor'
        : netOutstanding < 0
        ? `Advance credit: ₹${Math.abs(netOutstanding).toLocaleString('en-IN')}`
        : 'Fully settled',
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in pb-12">

      {/* Navigation Top Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-wrap gap-3">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">
          <FiArrowLeft size={15} /> Oils &amp; Lubes Accounts
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              const cols = [
                { k: 'date', l: 'Date' },
                { k: 'type', l: 'Type' },
                { k: 'ref', l: 'Reference' },
                { k: 'desc', l: 'Description' },
                { k: 'debit', l: 'Cost (₹)' },
                { k: 'credit', l: 'Credit (₹)' },
                { k: 'paidAmount', l: 'Paid (₹)' },
                { k: 'remainingDue', l: 'Balance Due (₹)' },
                { k: 'status', l: 'Status' },
              ];
              dlCSV(`oils-ledger-${vendor.vendor_name || vendor.name}.csv`, toCSV(filtered, cols));
            }}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-500 rounded-lg font-bold text-xs hover:bg-gray-50 transition-colors"
          >
            <FiDownload size={13} /> CSV
          </button>
          <button
            onClick={() => {
              const cols = [
                { k: 'date', l: 'Date' },
                { k: 'type', l: 'Type' },
                { k: 'ref', l: 'Reference' },
                { k: 'desc', l: 'Description' },
                { k: 'debit', l: 'Cost (₹)' },
                { k: 'paidAmount', l: 'Paid (₹)' },
                { k: 'remainingDue', l: 'Balance Due (₹)' },
                { k: 'status', l: 'Status' },
              ];
              printTbl(`Oils & Lubes Ledger — ${vendor.vendor_name || vendor.name}`, cols, filtered);
            }}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-500 rounded-lg font-bold text-xs hover:bg-gray-50 transition-colors"
          >
            <FiPrinter size={13} /> Print
          </button>
          {!isCash && (
            <button
              onClick={() => setPayModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-sm shadow-sm transition-colors"
            >
              <FiPlus size={14} /> Record Payment
            </button>
          )}
        </div>
      </div>

      {/* Vendor Profile Info */}
      <VendorInfoPanel vendor={vendor} categoryLabel={CATEGORY_LABEL} />

      {/* 3 Clean Finance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {financeCards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className={`inline-flex px-2.5 py-1 rounded-lg ${card.bg} ${card.color} text-[10px] font-black uppercase tracking-widest`}>
              {card.label}
            </div>
            <div className={`mt-3 text-2xl font-black ${card.color}`}>
              ₹{card.value.toLocaleString('en-IN')}
            </div>
            <div className="mt-1 text-[11px] font-medium text-gray-400">
              {card.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Clean Ledger Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search PO reference, oil name, reason..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <FiCalendar size={13} className="text-gray-400 shrink-0" />
              <input
                type="date"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
              />
              <span className="text-gray-300 font-bold">–</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => { setDateTo(e.target.value); setPage(1); }}
                className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {visibleFilters.map(f => (
                <button
                  key={f}
                  onClick={() => { setActiveFilter(f); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeFilter === f ? 'bg-gray-900 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f}
                </button>
              ))}
              {(search || dateFrom || dateTo || activeFilter !== 'Oil Records') && (
                <button
                  onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setActiveFilter('Oil Records'); setPage(1); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <span className="text-xs text-gray-400 font-medium">
              Showing {filtered.length} {filtered.length === 1 ? 'transaction' : 'transactions'}
            </span>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
              <FiInbox size={38} className="text-gray-300" />
              <p className="font-semibold text-sm">
                {txnsWithBalance.length === 0 ? 'No ledger transactions available.' : `No transactions match your filters.`}
              </p>
              <p className="text-xs text-gray-400">
                {txnsWithBalance.length === 0 ? 'Purchases, returns, and payment entries will appear here.' : 'Try clearing filters to see all entries.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[820px]">
              <thead>
                {activeFilter === 'Oil Records' ? (
                  <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider bg-gray-50/60">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-center">Qty (L)</th>
                    <th className="py-3 px-4 text-right">Order Cost</th>
                    <th className="py-3 px-4 text-right">Returns</th>
                    <th className="py-3 px-4 text-right">Paid</th>
                    <th className="py-3 px-4 text-right">Balance Due</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                ) : activeFilter === 'Returns' ? (
                  <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider bg-gray-50/60">
                    <th className="py-3 px-4">Return Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">PO Reference</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-center">Qty Returned</th>
                    <th className="py-3 px-4 text-right">Credit Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                ) : (
                  <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider bg-gray-50/60">
                    <th className="py-3 px-4">Payment Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Payment Mode</th>
                    <th className="py-3 px-4">Description / Applied</th>
                    <th className="py-3 px-4 text-right">Paid Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                )}
              </thead>

              <tbody className="divide-y divide-gray-50">
                {paginated.map(txn => {
                  if (activeFilter === 'Oil Records') {
                    return (
                      <tr key={txn.id} className="hover:bg-amber-50/30 transition-colors">
                        {/* Date */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-xs font-bold text-gray-700">{fmtDate(txn.date)}</span>
                        </td>

                        {/* Type */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <FiDroplet size={10} /> Purchase
                          </span>
                        </td>

                        {/* Reference */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-[11px] font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                            {txn.ref || '—'}
                          </span>
                        </td>

                        {/* Description */}
                        <td className="py-3 px-4">
                          <div className="text-xs font-bold text-gray-800">{txn.itemName || txn.desc}</div>
                        </td>

                        {/* Qty */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                            {txn.quantity ? `${txn.quantity} L` : '—'}
                          </span>
                        </td>

                        {/* Order Cost */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <span className="font-bold text-red-500 text-xs">
                            ₹{txn.debit.toLocaleString('en-IN')}
                          </span>
                        </td>

                        {/* Returns */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {txn.returnCredit > 0 ? (
                            <span className="font-bold text-amber-600 text-xs">
                              − ₹{txn.returnCredit.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-gray-300 font-bold text-xs">—</span>
                          )}
                        </td>

                        {/* Paid */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {txn.paidAmount > 0 ? (
                            <span className="font-bold text-green-600 text-xs">
                              ₹{txn.paidAmount.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-gray-300 font-bold text-xs">—</span>
                          )}
                        </td>

                        {/* Balance Due (Cost - Returns - Paid) */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {isCash ? (
                            <div className="text-xs font-bold text-green-600">₹0 Paid</div>
                          ) : (
                            <>
                              <div className={`text-xs font-black ${txn.remainingDue > 0 ? 'text-red-500' : 'text-green-600'}`}>
                                ₹{Number(txn.remainingDue || 0).toLocaleString('en-IN')}
                              </div>
                              <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border inline-block mt-0.5 ${
                                txn.remainingDue > 0 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'
                              }`}>
                                {txn.remainingDue > 0 ? 'Payable' : 'Paid'}
                              </div>
                            </>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedTxn(txn)}
                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <FiEye size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  if (activeFilter === 'Returns') {
                    return (
                      <tr key={txn.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-xs font-bold text-gray-700">{fmtDate(txn.date)}</span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <FiCornerUpLeft size={10} /> Return
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            {txn.ref || '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-xs font-bold text-gray-800">{txn.itemName || txn.desc}</div>
                          {txn.truckId && <div className="text-[10px] text-gray-400">Vehicle: {txn.truckId}</div>}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {txn.quantity ? `${txn.quantity} L` : '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <span className="font-bold text-amber-600 text-xs">
                            − ₹{txn.credit.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 inline-flex items-center gap-1">
                            <FiCheckCircle size={10} /> Credit Issued
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button onClick={() => setSelectedTxn(txn)} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                            <FiEye size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  // Payments View
                  return (
                    <tr key={txn.id} className="hover:bg-green-50/30 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-xs font-bold text-gray-700">{fmtDate(txn.date)}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <FiCreditCard size={10} /> Payment
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          {txn.ref || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {txn.paymentMode || 'Bank Transfer'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-600">
                        <div>{txn.desc}</div>
                        {txn.appliedSummary && (
                          <div className="text-[10px] text-blue-600 font-medium mt-0.5">Applied: {txn.appliedSummary}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className="font-bold text-green-600 text-xs">
                          ₹{txn.credit.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                          <FiCheckCircle size={10} /> Paid
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button onClick={() => setSelectedTxn(txn)} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                          <FiEye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Table Totals Footer */}
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50/80">
                  <td colSpan={activeFilter === 'Oil Records' ? 5 : activeFilter === 'Returns' ? 5 : 5} className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Page Totals
                  </td>
                  {activeFilter === 'Oil Records' && (
                    <>
                      <td className="py-3 px-4 text-right">
                        <span className="text-xs font-black text-red-500">
                          ₹{paginated.reduce((s, t) => s + (t.debit || 0), 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-xs font-black text-amber-600">
                          − ₹{paginated.reduce((s, t) => s + (t.returnCredit || 0), 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-xs font-black text-green-600">
                          ₹{paginated.reduce((s, t) => s + (t.paidAmount || 0), 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-xs font-black text-red-500">
                          ₹{paginated.reduce((s, t) => s + Number(t.remainingDue || 0), 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                    </>
                  )}
                  {activeFilter === 'Returns' && (
                    <td className="py-3 px-4 text-right">
                      <span className="text-xs font-black text-amber-600">
                        − ₹{paginated.reduce((s, t) => s + (t.credit || 0), 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                  )}
                  {activeFilter === 'Payments' && (
                    <td className="py-3 px-4 text-right">
                      <span className="text-xs font-black text-green-600">
                        ₹{paginated.reduce((s, t) => s + (t.credit || 0), 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                  )}
                  <td />
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400 font-medium">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors"
              >
                <FiChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                    page === n ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        onSave={handleSavePayment}
        vendor={vendor}
        vendorName={vendor.vendor_name || vendor.name}
        vendorCategory="oil"
        outstanding={netOutstanding}
        poList={poList}
      />

      {/* Transaction Detail Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col" style={{ animation: 'modalSlideIn 0.2s ease-out' }}>
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Transaction Details</h3>
                <p className="text-[11px] text-amber-600 font-semibold mt-0.5">
                  {vendor.vendor_name || vendor.name} · Oils &amp; Lubes
                </p>
              </div>
              <button onClick={() => setSelectedTxn(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                <FiX size={16} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="font-semibold text-gray-400">Date</span>
                <span className="font-bold text-gray-800">{fmtDate(selectedTxn.date)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="font-semibold text-gray-400">Type</span>
                <span className="font-bold text-gray-800">{selectedTxn.type}</span>
              </div>
              {selectedTxn.ref && (
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="font-semibold text-gray-400">
                    {selectedTxn.type === 'Payment' ? 'Reference No' : 'PO Reference'}
                  </span>
                  <span className="font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{selectedTxn.ref}</span>
                </div>
              )}
              {selectedTxn.itemName && (
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="font-semibold text-gray-400">Oil Item</span>
                  <span className="font-bold text-gray-800">{selectedTxn.itemName}</span>
                </div>
              )}
              {selectedTxn.quantity && (
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="font-semibold text-gray-400">
                    {selectedTxn.type === 'Vendor Return' ? 'Qty Returned' : 'Quantity'}
                  </span>
                  <span className="font-bold text-gray-800">{selectedTxn.quantity} L</span>
                </div>
              )}
              {selectedTxn.reason && (
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="font-semibold text-gray-400">Return Reason</span>
                  <span className="font-medium text-amber-700">{selectedTxn.reason}</span>
                </div>
              )}
              {selectedTxn.truckId && (
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="font-semibold text-gray-400">Vehicle</span>
                  <span className="font-bold text-gray-800">{selectedTxn.truckId}</span>
                </div>
              )}
              {selectedTxn.paymentMode && (
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="font-semibold text-gray-400">Payment Mode</span>
                  <span className="font-bold text-emerald-700">{selectedTxn.paymentMode}</span>
                </div>
              )}
              {selectedTxn.appliedSummary && (
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="font-semibold text-gray-400">Applied To</span>
                  <span className="font-semibold text-blue-600 text-right ml-4">{selectedTxn.appliedSummary}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="font-semibold text-gray-400">Description / Notes</span>
                <span className="font-medium text-gray-700 text-right max-w-[200px]">{selectedTxn.desc}</span>
              </div>

              {/* Purchase Financials */}
              {selectedTxn.type === 'Purchase' && (
                <>
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="font-semibold text-gray-400">Order Cost</span>
                    <span className="font-bold text-red-500">₹{selectedTxn.debit.toLocaleString('en-IN')}</span>
                  </div>
                  {selectedTxn.returnCredit > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-50">
                      <span className="font-semibold text-gray-400">Returns Credited</span>
                      <span className="font-bold text-amber-600">− ₹{selectedTxn.returnCredit.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {selectedTxn.paidAmount > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-50">
                      <span className="font-semibold text-gray-400">Paid Amount</span>
                      <span className="font-bold text-green-600">₹{selectedTxn.paidAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {!isCash && (
                    <div className="flex justify-between py-2 border-b border-gray-50">
                      <span className="font-semibold text-gray-400">Remaining Balance Due</span>
                      <span className={`font-bold ${selectedTxn.remainingDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ₹{Number(selectedTxn.remainingDue || 0).toLocaleString('en-IN')} ({selectedTxn.remainingDue > 0 ? 'Payable' : 'Paid'})
                      </span>
                    </div>
                  )}
                </>
              )}

              {/* Return Financials */}
              {selectedTxn.type === 'Vendor Return' && (
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="font-semibold text-gray-400">Credit Amount</span>
                  <span className="font-bold text-amber-600">− ₹{selectedTxn.credit.toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Payment Financials */}
              {selectedTxn.type === 'Payment' && (
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="font-semibold text-gray-400">Payment Amount</span>
                  <span className="font-bold text-green-600">₹{selectedTxn.credit.toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Payment Proof / Receipt Attachment */}
              {selectedTxn.type === 'Payment' && (
                <div className="flex justify-between items-start py-2.5 border-b border-gray-50">
                  <span className="font-semibold text-gray-400">Payment Proof</span>
                  {selectedTxn.receiptFiles && selectedTxn.receiptFiles.length > 0 ? (
                    <div className="flex flex-col items-end gap-1.5 ml-4">
                      {selectedTxn.receiptFiles.map((file, index) => (
                        <a
                          key={`${file}-${index}`}
                          href={`http://localhost:5001/uploads/${String(file).replace(/\\/g, '/')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 transition-colors"
                        >
                          <FiEye size={13} /> View Proof {selectedTxn.receiptFiles.length > 1 ? `#${index + 1}` : ''}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 font-medium">No proof uploaded</span>
                  )}
                </div>
              )}
            </div>

            <div className="px-5 pb-4 shrink-0">
              <button
                onClick={() => setSelectedTxn(null)}
                className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
          <style>{MODAL_ANIM}</style>
        </div>
      )}
    </div>
  );
}