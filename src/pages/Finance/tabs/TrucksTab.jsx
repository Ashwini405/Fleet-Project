import React, { useState, useMemo, useEffect } from "react";
import { Truck, Eye, TrendingUp, TrendingDown, List, ArrowUpRight, ArrowDownRight, Minus, ChevronRight } from "lucide-react";
import Modal from "../components/Modal";
import IncomeDetailsModal from "../components/income/IncomeDetailsModal";

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-start py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-32 shrink-0">{label}</span>
      <span className="text-sm font-semibold text-gray-800 text-right">{value}</span>
    </div>
  );
}

export default function TrucksTab({ selectedTruck, dateFrom, dateTo }) {
  const [modalTruck, setModalTruck] = useState(null);
  const [detailTxn, setDetailTxn] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [incomeList, setIncomeList] = useState([]);
  const [expenseList, setExpenseList] = useState([]);
  const [fuelList, setFuelList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch vehicles from database
  const fetchVehicles = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/vehicles");
      const data = await res.json();
      if (data.success) {
        setVehicles(data.data || []);
      }
    } catch (error) {
      console.error("Vehicle fetch failed:", error);
    }
  };

  // Fetch income records from database
  const fetchIncome = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/income");
      const data = await res.json();
      if (data.success) {
        setIncomeList(data.data || []);
      }
    } catch (error) {
      console.error("Income fetch failed:", error);
    }
  };

  // Fetch expense records from database
  const fetchExpenses = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/expenses");
      const data = await res.json();
      if (data.success) {
        setExpenseList(data.data || []);
      }
    } catch (error) {
      console.error("Expense fetch failed:", error);
    }
  };

  const fetchFuel = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/fuel");
      const data = await res.json();
      if (data.success) setFuelList(data.data || []);
    } catch (error) {
      console.error("Fuel fetch failed:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchVehicles(), fetchIncome(), fetchExpenses(), fetchFuel()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const truckStats = useMemo(() => {
    return vehicles.map(vehicle => {
      // Filter income by vehicle_id
      let inc = incomeList.filter(i => String(i.vehicle_id) === String(vehicle.id));
      // Filter expense by vehicle_id
      let exp = expenseList.filter(e => String(e.vehicle_id) === String(vehicle.id));
      let fuel = fuelList.filter(f => String(f.vehicle_id) === String(vehicle.id));

      // Apply date filters
      if (dateFrom) {
        inc = inc.filter(i => i.payment_received_date >= dateFrom);
        exp = exp.filter(e => e.expense_date >= dateFrom);
        fuel = fuel.filter(f => String(f.date || f.created_at).slice(0, 10) >= dateFrom);
      }
      if (dateTo) {
        inc = inc.filter(i => i.payment_received_date <= dateTo);
        exp = exp.filter(e => e.expense_date <= dateTo);
        fuel = fuel.filter(f => String(f.date || f.created_at).slice(0, 10) <= dateTo);
      }

      const totalIncome = inc.reduce((s, i) => s + Number(i.amount || 0), 0);
      const otherExpense = exp.reduce((s, e) => s + Number(e.amount || 0), 0);
      const fuelExpense = fuel.reduce((s, f) => s + Number(f.total_cost || (Number(f.quantity || 0) * Number(f.rate || 0))), 0);
      const totalExpense = otherExpense + fuelExpense;
      const netProfit = totalIncome - totalExpense;

      // Combine income and expense for transaction history
      const history = [
        ...inc.map(i => ({
          ...i,
          _type: "income",
          amount: Number(i.amount || 0),
          title: i.income_category,
          date: i.payment_received_date,
        })),
        ...exp.map(e => ({
          ...e,
          _type: "expense",
          amount: Number(e.amount || 0),
          title: e.expense_category,
          date: e.expense_date,
        })),
        ...fuel.map(f => ({
          ...f,
          _type: "expense",
          _fuel: true,
          amount: Number(f.total_cost || (Number(f.quantity || 0) * Number(f.rate || 0))),
          title: "Fuel",
          date: f.date || f.created_at,
        })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      return {
        ...vehicle,
        totalIncome,
        totalExpense,
        netProfit,
        history,
      };
    }).filter(
      t => selectedTruck === "All" || String(t.id) === String(selectedTruck)
    );
  }, [vehicles, incomeList, expenseList, fuelList, selectedTruck, dateFrom, dateTo]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
            <Truck className="w-4 h-4 text-blue-600" /> Fleet Performance
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Loading vehicle data...</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── Section header ── */}
      <div>
        <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
          <Truck className="w-4 h-4 text-blue-600" /> Fleet Performance
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">Profit &amp; loss analysis by vehicle</p>
      </div>

      {/* ── Trucks grid ── */}
      {truckStats.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm py-14 text-center text-gray-400 text-sm">
          No vehicle records found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {truckStats.map(truck => {
            const isProfit = truck.netProfit > 0;
            const isLoss = truck.netProfit < 0;
            const statusCls = isProfit
              ? "border-emerald-200 hover:border-emerald-300"
              : isLoss
                ? "border-red-200 hover:border-red-300"
                : "border-gray-200 hover:border-gray-300";
            const badgeCls = isProfit
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : isLoss
                ? "bg-red-50 text-red-600 border-red-200"
                : "bg-gray-50 text-gray-500 border-gray-200";
            const BadgeIcon = isProfit ? ArrowUpRight : isLoss ? ArrowDownRight : Minus;
            const badgeLabel = isProfit ? "Profit" : isLoss ? "Loss" : "Break-even";

            // Expense share of income, for a quick visual read (capped at 100%)
            const spendRatio = truck.totalIncome > 0
              ? Math.min(100, Math.round((truck.totalExpense / truck.totalIncome) * 100))
              : truck.totalExpense > 0 ? 100 : 0;

            return (
              <div
                key={truck.id}
                className={`bg-white border rounded-2xl shadow-sm p-5 flex flex-col gap-4 transition-colors ${statusCls}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{truck.vehicle_no}</p>
                      <p className="text-xs text-gray-400 truncate">{truck.driver_name || "No Driver"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setModalTruck(truck)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0"
                    title="View truck report"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Status badge + net profit */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-bold uppercase tracking-wide ${badgeCls}`}>
                    <BadgeIcon className="w-3 h-3" /> {badgeLabel}
                  </span>
                  <p className={`text-xl font-extrabold tabular-nums ${isProfit ? "text-emerald-600" : isLoss ? "text-red-500" : "text-gray-500"}`}>
                    {isProfit ? "+" : isLoss ? "−" : ""}₹{Math.abs(truck.netProfit).toLocaleString()}
                  </p>
                </div>

                {/* Income vs Expense */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 px-3 py-2.5">
                    <p className="text-[10px] font-bold text-emerald-700/70 uppercase tracking-widest mb-0.5">Income</p>
                    <p className="text-sm font-extrabold text-emerald-700 tabular-nums">₹{truck.totalIncome.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl bg-red-50/60 border border-red-100 px-3 py-2.5">
                    <p className="text-[10px] font-bold text-red-600/70 uppercase tracking-widest mb-0.5">Expense</p>
                    <p className="text-sm font-extrabold text-red-600 tabular-nums">₹{truck.totalExpense.toLocaleString()}</p>
                  </div>
                </div>

                {/* Expense-share bar */}
                <div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${spendRatio >= 100 ? "bg-red-500" : spendRatio >= 70 ? "bg-amber-400" : "bg-emerald-400"}`}
                      style={{ width: `${spendRatio}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-gray-400 font-medium">
                    {truck.totalIncome > 0
                      ? `${spendRatio}% of income spent`
                      : truck.totalExpense > 0 ? "No income recorded yet" : "No transactions yet"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Truck report modal ── */}
      <Modal
        isOpen={!!modalTruck}
        onClose={() => setModalTruck(null)}
        title="Vehicle Financial Report"
        maxWidth="max-w-xl"
      >
        {modalTruck && (
          <div className="space-y-4">
            {/* Truck identity */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">{modalTruck.vehicle_no}</p>
                <p className="text-xs text-gray-500">
                  {modalTruck.id} &nbsp;·&nbsp; Driver: {modalTruck.driver_name || "No Driver"}
                </p>
              </div>
            </div>

            <DetailRow label="Assigned Station" value={modalTruck.station_name || "Not Assigned"} />
            <DetailRow label="Fuel Expense" value={`₹${Number(modalTruck.fuelExpense || 0).toLocaleString("en-IN")}`} />
            <DetailRow label="Other Expenses" value={`₹${Number(modalTruck.otherExpense || 0).toLocaleString("en-IN")}`} />

            {/* P&L summary */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total Income",  val: modalTruck.totalIncome,  color: "text-green-600", bg: "bg-green-50 border-green-100" },
                { label: "Total Expense", val: modalTruck.totalExpense, color: "text-red-500",   bg: "bg-red-50 border-red-100"     },
                { label: "Net Profit",    val: modalTruck.netProfit,    color: modalTruck.netProfit >= 0 ? "text-blue-600" : "text-red-500", bg: "bg-blue-50 border-blue-100" },
              ].map(({ label, val, color, bg }) => (
                <div key={label} className={`rounded-xl border px-3 py-3 text-center ${bg}`}>
                  <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
                  <p className={`text-lg font-extrabold ${color}`}>
                    {val >= 0 ? "" : "−"}₹{Math.abs(val).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Transaction history */}
            <div>
              <h4 className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                <List className="w-3.5 h-3.5" /> Transaction History
              </h4>

              {modalTruck.history.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No transactions in selected range.</p>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                  {modalTruck.history.map((txn, i) => {
                    const isInc = txn._type === "income";
                    return (
                      <button
                        key={i}
                        onClick={() => setDetailTxn(txn)}
                        title="View full record"
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isInc ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"}`}>
                            {isInc ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{txn.title || "—"}</p>
                            <p className="text-xs text-gray-400">{txn.date || "—"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <p className={`text-sm font-bold ${isInc ? "text-green-600" : "text-red-500"}`}>
                            {isInc ? "+" : "−"}₹{Math.abs(txn.amount).toLocaleString()}
                          </p>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setModalTruck(null)}
                className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Drill into the actual income record ── */}
      {detailTxn && detailTxn._type === "income" && (
        <IncomeDetailsModal txn={detailTxn} onClose={() => setDetailTxn(null)} />
      )}

      {/* ── Drill into the actual expense record ── */}
      <Modal
        isOpen={!!(detailTxn && detailTxn._type === "expense")}
        onClose={() => setDetailTxn(null)}
        title="Expense Transaction Details"
      >
        {detailTxn && detailTxn._type === "expense" && (
          <div>
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
              <p className="text-xs font-semibold text-gray-500 mb-0.5">Amount</p>
              <p className="text-3xl font-extrabold text-red-500">
                -₹{Number(detailTxn.amount || 0).toLocaleString("en-IN")}
              </p>
            </div>

            <DetailRow label="Date" value={detailTxn.expense_date || detailTxn.date || "—"} />
            <DetailRow label="Category" value={detailTxn.expense_category || "—"} />
            <DetailRow label="Vehicle" value={detailTxn.vehicle_number || "—"} />
            <DetailRow label="Payment Method" value={detailTxn.payment_method || "—"} />
            <DetailRow label="Vendor/Payee" value={detailTxn.vendor_payee || "—"} />
            <DetailRow label="Description" value={`"${detailTxn.description || "—"}"`} />

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setDetailTxn(null)}
                className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}