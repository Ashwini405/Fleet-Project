import React, { useState, useMemo } from "react";
import { Truck, Eye, TrendingUp, TrendingDown, List } from "lucide-react";
import Modal from "../components/Modal";
import { dummyTrucks, dummyIncome, dummyExpense } from "../data/dummyData";

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

  const truckStats = useMemo(() => {
    return dummyTrucks.map(truck => {
      let inc = dummyIncome.filter(i => i.truckId === truck.id);
      let exp = dummyExpense.filter(e => e.truckId === truck.id);

      if (dateFrom) { inc = inc.filter(i => i.date >= dateFrom); exp = exp.filter(e => e.date >= dateFrom); }
      if (dateTo)   { inc = inc.filter(i => i.date <= dateTo);   exp = exp.filter(e => e.date <= dateTo);   }

      const totalIncome  = inc.reduce((s, i) => s + i.amount, 0);
      const totalExpense = exp.reduce((s, e) => s + e.amount, 0);
      const netProfit    = totalIncome - totalExpense;

      const history = [
        ...inc.map(i => ({ ...i, _type: "income"  })),
        ...exp.map(e => ({ ...e, _type: "expense" })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      return { ...truck, totalIncome, totalExpense, netProfit, history };
    }).filter(t => selectedTruck === "All" || t.id === selectedTruck);
  }, [selectedTruck, dateFrom, dateTo]);

  return (
    <div className="space-y-4">

      {/* ── Section header ── */}
      <div>
        <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
          <Truck className="w-4 h-4 text-blue-600" /> Fleet Performance
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">Profit &amp; loss analysis by vehicle</p>
      </div>

      {/* ── Trucks table ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Head */}
        <div className="hidden md:grid grid-cols-[2.5fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wide">
          <span>Vehicle</span>
          <span className="text-center">Income</span>
          <span className="text-center">Expense</span>
          <span className="text-center">Net Profit</span>
          <span />
        </div>

        {truckStats.length === 0 ? (
          <div className="py-14 text-center text-gray-400 text-sm">No truck records found.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {truckStats.map(truck => (
              <div
                key={truck.id}
                className="flex flex-col md:grid md:grid-cols-[2.5fr_1fr_1fr_1fr_auto] gap-3 md:gap-4 items-start md:items-center px-5 py-4 hover:bg-gray-50/70 transition-colors"
              >
                {/* Vehicle info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{truck.model}</p>
                    <p className="text-xs text-gray-400">{truck.id} &nbsp;·&nbsp; {truck.driver}</p>
                  </div>
                </div>

                {/* Income */}
                <div className="md:text-center">
                  <p className="text-xs text-gray-400 font-semibold uppercase md:hidden">Income</p>
                  <p className="text-sm font-bold text-gray-800">₹{truck.totalIncome.toLocaleString()}</p>
                </div>

                {/* Expense */}
                <div className="md:text-center">
                  <p className="text-xs text-gray-400 font-semibold uppercase md:hidden">Expense</p>
                  <p className="text-sm font-bold text-red-500">₹{truck.totalExpense.toLocaleString()}</p>
                </div>

                {/* Net profit */}
                <div className="md:text-center">
                  <p className="text-xs text-gray-400 font-semibold uppercase md:hidden">Net Profit</p>
                  <p className={`text-sm font-extrabold ${truck.netProfit >= 0 ? "text-blue-600" : "text-red-500"}`}>
                    {truck.netProfit >= 0 ? "+" : ""}₹{truck.netProfit.toLocaleString()}
                  </p>
                </div>

                {/* View */}
                <button
                  onClick={() => setModalTruck(truck)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="View truck report"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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
                <p className="text-base font-bold text-gray-900">{modalTruck.model}</p>
                <p className="text-xs text-gray-500">{modalTruck.id} &nbsp;·&nbsp; Driver: {modalTruck.driver}</p>
              </div>
            </div>

            <DetailRow label="Assigned Route" value={modalTruck.route} />

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
                      <div
                        key={i}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isInc ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"}`}>
                            {isInc ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {isInc ? txn.type : txn.category}
                            </p>
                            <p className="text-xs text-gray-400">{txn.date}</p>
                          </div>
                        </div>
                        <p className={`text-sm font-bold ${isInc ? "text-green-600" : "text-red-500"}`}>
                          {isInc ? "+" : "−"}₹{txn.amount.toLocaleString()}
                        </p>
                      </div>
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
    </div>
  );
}
