import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, CheckCircle2, Clock, AlertCircle,
  RefreshCw, ExternalLink, ChevronDown, ChevronUp,
  CreditCard, Calendar, MapPin, Link2,
} from 'lucide-react';

// ── Static dummy finance reference data keyed by trip ID
const FINANCE_REF = {
  'TRIP-2023-0041': {
    status:        'Payment Received',
    incomeLinked:  true,
    freightAmount: 15000,
    paymentStatus: 'Received',
    entryDate:     '2023-11-01',
    refNumber:     'NEFT-8822311',
    route:         'Hyderabad – Mumbai',
    incomeId:      'INC-2023-0041',
  },
  'TRIP-2023-0038': {
    status:        'Partial Payment',
    incomeLinked:  true,
    freightAmount: 6500,
    paymentStatus: 'Partial',
    entryDate:     '2023-11-05',
    refNumber:     'IMPS-4421009',
    route:         'Pune – Hyderabad',
    incomeId:      'INC-2023-0038',
  },
  'TRIP-2023-0035': {
    status:        'Payment Pending',
    incomeLinked:  true,
    freightAmount: 22000,
    paymentStatus: 'Pending',
    entryDate:     '2023-10-22',
    refNumber:     null,
    route:         'Mumbai – Delhi',
    incomeId:      'INC-2023-0035',
  },
  'TRIP-2023-0031': {
    status:        'Income Linked',
    incomeLinked:  true,
    freightAmount: 7200,
    paymentStatus: 'Pending',
    entryDate:     '2023-11-12',
    refNumber:     'IMPS-9988001',
    route:         'Hyderabad – Bangalore',
    incomeId:      'INC-2023-0031',
  },
};

// ── Status badge config
const STATUS_CFG = {
  'Payment Received': {
    icon: CheckCircle2,
    cls:  'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot:  'bg-emerald-500',
  },
  'Partial Payment': {
    icon: RefreshCw,
    cls:  'bg-orange-50 text-orange-700 border-orange-200',
    dot:  'bg-orange-500',
  },
  'Payment Pending': {
    icon: AlertCircle,
    cls:  'bg-red-50 text-red-700 border-red-200',
    dot:  'bg-red-500',
  },
  'Income Linked': {
    icon: Link2,
    cls:  'bg-blue-50 text-blue-700 border-blue-200',
    dot:  'bg-blue-500',
  },
  'Income Pending': {
    icon: Clock,
    cls:  'bg-slate-50 text-slate-500 border-slate-200',
    dot:  'bg-slate-400',
  },
};

function FinanceStatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG['Income Pending'];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      <Icon className="w-3 h-3 shrink-0" />
      {status}
    </span>
  );
}

function RefRow({ icon: Icon, label, value, mono, valueClass = 'text-slate-700' }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span className="text-xs font-semibold text-slate-400">{label}</span>
      </div>
      <span className={`text-xs font-bold ${mono ? 'font-mono' : ''} ${valueClass}`}>{value}</span>
    </div>
  );
}

export default function TripFinanceSummary({ tripId }) {
  const [expanded, setExpanded] = useState(false);
  const ref = FINANCE_REF[tripId];

  // No finance data for this trip
  if (!ref) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">Finance Summary</h2>
          <span className="ml-auto">
            <FinanceStatusBadge status="Income Pending" />
          </span>
        </div>
        <div className="px-5 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-slate-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">No income entry linked yet</p>
            <p className="text-xs text-slate-400 mt-0.5">Finance team has not recorded income for this trip.</p>
          </div>
          <a
            href="/finance"
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors shrink-0"
          >
            <ExternalLink className="w-3 h-3" /> Open Finance
          </a>
        </div>
      </div>
    );
  }

  const isReceived = ref.paymentStatus === 'Received';
  const isPartial  = ref.paymentStatus === 'Partial';
  const isPending  = ref.paymentStatus === 'Pending';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
        <TrendingUp className="w-4 h-4 text-emerald-600" />
        <h2 className="text-sm font-bold text-slate-800 tracking-tight">Finance Summary</h2>
        <p className="text-xs text-slate-400 font-medium hidden sm:block">Linked finance information for this trip</p>
        <div className="ml-auto flex items-center gap-2">
          <FinanceStatusBadge status={ref.status} />
          <button
            onClick={() => setExpanded(p => !p)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Top summary strip — always visible */}
      <div className="grid grid-cols-3 divide-x divide-slate-100">
        {/* Freight Amount */}
        <div className="px-4 py-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Freight Amount</p>
          <p className="text-base font-black text-emerald-600 tabular-nums">
            ₹{ref.freightAmount.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Payment Status */}
        <div className="px-4 py-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Payment Status</p>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full shrink-0 ${
              isReceived ? 'bg-emerald-500' : isPartial ? 'bg-orange-500' : 'bg-red-500'
            }`} />
            <span className={`text-sm font-bold ${
              isReceived ? 'text-emerald-700' : isPartial ? 'text-orange-700' : 'text-red-600'
            }`}>
              {ref.paymentStatus}
            </span>
          </div>
        </div>

        {/* Income Entry Date */}
        <div className="px-4 py-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Entry Date</p>
          <p className="text-sm font-bold text-slate-700 font-mono">{ref.entryDate}</p>
        </div>
      </div>

      {/* Expandable detail section */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 py-3 border-t border-slate-100 space-y-0.5">
              <RefRow icon={Link2}      label="Income Entry ID"  value={ref.incomeId}      mono />
              <RefRow icon={MapPin}     label="Route"            value={ref.route} />
              <RefRow icon={CreditCard} label="Bank Reference"   value={ref.refNumber}     mono />
              <RefRow icon={Calendar}   label="Entry Date"       value={ref.entryDate}     mono />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 px-5 pb-4 pt-1">
              <a
                href="/finance"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <ExternalLink className="w-3 h-3" /> View Income Entry
              </a>
              <a
                href="/finance"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <TrendingUp className="w-3 h-3" /> Open Finance Record
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
