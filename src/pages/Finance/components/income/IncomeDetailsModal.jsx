import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  TrendingUp,
  Calendar,
  MapPin,
  Truck,
  FileText,
  Link2,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  IndianRupee,
  ReceiptText,
  Landmark,
} from "lucide-react";
import IncomeCategoryBadge from "./IncomeCategoryBadge";

const inputClass =
  "w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 " +
  "focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 " +
  "transition-all placeholder:text-slate-300 font-mono";

const formatMoney = (value = 0) => `Rs. ${Number(value).toLocaleString("en-IN")}`;

function Section({ title, children, action }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
          {title}
        </h4>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function DetailItem({ icon: Icon, label, value, mono }) {
  if (!value) return null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/70 p-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <p className={`break-words text-sm font-semibold text-slate-800 ${mono ? "font-mono" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function MoneyCard({ label, value, tone = "slate" }) {
  const toneClass = {
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-100",
    red: "text-red-700 bg-red-50 border-red-100",
    orange: "text-orange-700 bg-orange-50 border-orange-100",
    slate: "text-slate-800 bg-slate-50 border-slate-100",
  }[tone];

  return (
    <div className={`min-w-0 rounded-xl border px-3 py-3 ${toneClass}`}>
      <p className="mb-1 text-[10px] font-extrabold uppercase tracking-widest opacity-70">
        {label}
      </p>
      <p className="whitespace-nowrap text-base font-black tabular-nums">{formatMoney(value)}</p>
    </div>
  );
}

function PaymentStatusPanel({ totalAmount, paidAmount, status }) {
  const remaining = Math.max(0, totalAmount - paidAmount);
  const pct = totalAmount > 0 ? Math.min(100, Math.round((paidAmount / totalAmount) * 100)) : 0;
  const isReceived = status === "Received";
  const isPartial = status === "Partial";

  const barColor = isReceived ? "bg-emerald-500" : isPartial ? "bg-orange-500" : "bg-red-500";
  const statusClass = isReceived
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : isPartial
      ? "bg-orange-50 text-orange-700 border-orange-200"
      : "bg-red-50 text-red-700 border-red-200";

  return (
    <Section
      title="Payment Status"
      action={
        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${statusClass}`}>
          {status}
        </span>
      }
    >
      <div className="space-y-4">
        <div className={`flex items-start gap-3 rounded-xl border p-3 ${statusClass}`}>
          {isReceived ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <div>
            <p className="text-sm font-extrabold">
              {isReceived
                ? "Payment fully received"
                : isPartial
                  ? `${formatMoney(remaining)} still pending`
                  : "Payment not yet received"}
            </p>
            <p className="mt-0.5 text-xs font-medium opacity-80">
              {isReceived
                ? `Full invoice value of ${formatMoney(totalAmount)} has been collected.`
                : isPartial
                  ? `${formatMoney(paidAmount)} received out of ${formatMoney(totalAmount)}.`
                  : `Full invoice value of ${formatMoney(totalAmount)} is pending.`}
            </p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Collection progress</span>
            <span>{pct}% received</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className={`h-full rounded-full ${barColor}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <MoneyCard label="Invoice" value={totalAmount} />
          <MoneyCard label="Received" value={paidAmount} tone="emerald" />
          <MoneyCard label="Pending" value={remaining} tone={remaining > 0 ? "red" : "slate"} />
        </div>
      </div>
    </Section>
  );
}

function UpdatePaymentForm({ txn, onUpdate }) {
  const totalAmount = Number(txn.amount || 0);
  const paidAmount = Number(txn.received_amount || 0);
  const remaining = Math.max(0, totalAmount - paidAmount);
  
  const [open, setOpen] = useState(false);
  const [newAmount, setNewAmount] = useState("");
  const [newRef, setNewRef] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [markFull, setMarkFull] = useState(false);
  const [saved, setSaved] = useState(false);

  const amountNum = parseFloat(newAmount) || 0;
  const wouldComplete = markFull || amountNum >= remaining;

  const handleSave = () => {
    if (!newAmount && !markFull) return;

    const addedAmount = markFull ? remaining : amountNum;
    const newPaid = paidAmount + addedAmount;
    const newStatus = newPaid >= totalAmount ? "Received" : "Partial";
    const newPending = Math.max(0, totalAmount - newPaid);

    onUpdate({
      received_amount: newPaid,
      pending_amount: newPending,
      payment_status: newStatus,
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setOpen(false);
      setNewAmount("");
      setNewRef("");
      setMarkFull(false);
    }, 1200);
  };

  return (
    <section className="overflow-hidden rounded-xl border border-emerald-200 bg-white">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 bg-emerald-50 px-4 py-3 text-left transition-colors hover:bg-emerald-100"
      >
        <span className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-emerald-700" />
          <span className="text-xs font-extrabold uppercase tracking-wide text-emerald-800">
            Record Additional Payment
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 text-emerald-700 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 p-4">
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <div>
                  <p className="text-xs font-bold text-slate-800">Mark as fully received</p>
                  <p className="text-[11px] font-medium text-slate-500">
                    Remaining balance: {formatMoney(remaining)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMarkFull((value) => !value)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${markFull ? "bg-emerald-500" : "bg-slate-300"}`}
                  aria-pressed={markFull}
                >
                  <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${markFull ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>

              {!markFull && (
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Amount Received Now
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      Rs.
                    </span>
                    <input
                      type="number"
                      min="1"
                      max={remaining}
                      placeholder={`Max ${formatMoney(remaining)}`}
                      value={newAmount}
                      onChange={(event) => setNewAmount(event.target.value)}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                  {amountNum > remaining && (
                    <p className="mt-1 text-[11px] font-semibold text-red-600">
                      Amount cannot exceed {formatMoney(remaining)}.
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(event) => setNewDate(event.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Bank Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NEFT-0012"
                    value={newRef}
                    onChange={(event) => setNewRef(event.target.value.toUpperCase())}
                    className={inputClass}
                  />
                </div>
              </div>

              {(markFull || amountNum > 0) && amountNum <= remaining && (
                <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${
                  wouldComplete
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-blue-200 bg-blue-50 text-blue-700"
                }`}
                >
                  {wouldComplete ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      This transaction will be marked as Received.
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 shrink-0" />
                      {formatMoney(remaining - amountNum)} will remain pending.
                    </>
                  )}
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={!markFull && (!newAmount || amountNum <= 0 || amountNum > remaining)}
                className="w-full rounded-lg bg-emerald-600 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saved ? "Saved" : "Save Payment Update"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default function IncomeDetailsModal({ txn, onClose, onUpdate }) {
  if (!txn) return null;

  const totalAmount = Number(txn.amount || 0);
  const paidAmount = Number(txn.received_amount || 0);
  const isPartial = txn.payment_status === "Partial";
  const isPending = txn.payment_status === "Pending";
  const needsUpdate = isPartial || isPending;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-2xl"
        >
          <header className="shrink-0 border-b border-slate-800 bg-slate-950 px-5 py-4 text-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10">
                  <ReceiptText className="h-5 w-5 text-emerald-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-200">
                    Fleet Finance / Income Module
                  </p>
                  <h3 className="mt-1 text-lg font-black tracking-tight text-white">
                    Income Transaction Details
                  </h3>
                  <p className="mt-1 truncate text-xs font-medium text-slate-400">
                    {txn.income_category} / {txn.vehicle_number}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div
            className="min-h-0 flex-1 overflow-y-auto p-5"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 transparent" }}
          >
            <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                        Invoice Amount
                      </p>
                      <p className="mt-1 text-4xl font-black text-emerald-700 tabular-nums">
                        +{formatMoney(totalAmount)}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <IndianRupee className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                    <IncomeCategoryBadge category={txn.income_category} size="sm" />
                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">
                      {txn.vehicle_number}
                    </span>
                    <span className={`ml-auto rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                      txn.payment_status === "Received"
                        ? "bg-emerald-100 text-emerald-700"
                        : txn.payment_status === "Partial"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                    }`}
                    >
                      {txn.payment_status}
                    </span>
                  </div>
                </div>

                <PaymentStatusPanel
                  totalAmount={totalAmount}
                  paidAmount={paidAmount}
                  status={txn.payment_status}
                />

                {needsUpdate && onUpdate && (
                  <UpdatePaymentForm txn={txn} onUpdate={onUpdate} />
                )}
              </div>

              <div className="space-y-4">
                <Section title="Transaction Details">
                  <div className="grid gap-3">
                    <DetailItem icon={Calendar} label="Payment Date" value={txn.payment_received_date} />
                    <DetailItem icon={TrendingUp} label="Category" value={txn.income_category} />
                    <DetailItem icon={MapPin} label="Place of Running" value={txn.place_of_running} />
                    <DetailItem
                      icon={Calendar}
                      label="Freight Range"
                      value={txn.freight_start_date && txn.freight_end_date ? `${txn.freight_start_date} to ${txn.freight_end_date}` : null}
                      mono
                    />
                    <DetailItem icon={Landmark} label="Bank Reference" value={txn.bank_reference_number} mono />
                    <DetailItem icon={Truck} label="Vehicle" value={txn.vehicle_number} />
                    <DetailItem icon={FileText} label="Description" value={txn.description ? `"${txn.description}"` : null} />
                  </div>
                </Section>

                {(txn.trip_number || txn.linked_invoice_no) && (
                  <Section title="ERP Linked Records">
                    <div className="space-y-2">
                      {txn.trip_number && (
                        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">
                          <Link2 className="h-4 w-4 shrink-0" />
                          <Truck className="h-4 w-4 shrink-0" />
                          <span className="text-blue-600">Trip</span>
                          <span className="ml-auto font-mono text-xs">{txn.trip_number}</span>
                        </div>
                      )}
                      {txn.linked_invoice_no && (
                        <div className="flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800">
                          <Link2 className="h-4 w-4 shrink-0" />
                          <UserCheck className="h-4 w-4 shrink-0" />
                          <span className="text-teal-600">Invoice</span>
                          <span className="ml-auto font-mono text-xs">{txn.linked_invoice_no}</span>
                        </div>
                      )}
                    </div>
                  </Section>
                )}
              </div>
            </div>
          </div>

          <footer className="shrink-0 border-t border-slate-200 bg-white px-5 py-3.5">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-extrabold text-white transition-colors hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}