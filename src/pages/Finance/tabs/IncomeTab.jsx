import React, { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { dummyIncome } from "../data/dummyData";
import IncomeLogs         from "../components/income/IncomeLogs";
import IncomeTable        from "../components/income/IncomeTable";
import AddIncomeForm      from "../components/income/AddIncomeForm";
import IncomeDetailsModal from "../components/income/IncomeDetailsModal";

export default function IncomeTab({ selectedTruck, dateFrom, dateTo }) {
  const [view,    setView]    = useState("list");
  const [viewTxn, setViewTxn] = useState(null);

  // Local state copy so payment updates reflect immediately in the list
  const [incomeList, setIncomeList] = useState(dummyIncome);

  const filtered = useMemo(() => {
    let list = [...incomeList];
    if (selectedTruck !== "All") list = list.filter(i => i.truckId === selectedTruck);
    if (dateFrom) list = list.filter(i => i.date >= dateFrom);
    if (dateTo)   list = list.filter(i => i.date <= dateTo);
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [incomeList, selectedTruck, dateFrom, dateTo]);

  // Called from IncomeDetailsModal when user records additional payment
  const handlePaymentUpdate = (patch) => {
    setIncomeList(prev =>
      prev.map(t => t.id === viewTxn.id ? { ...t, ...patch } : t)
    );
    // Keep modal open with updated data so user sees the new state
    setViewTxn(prev => ({ ...prev, ...patch }));
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {view === "add" ? (
          <motion.div
            key="add"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
          >
            <AddIncomeForm onBack={() => setView("list")} />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <IncomeLogs records={filtered} onAdd={() => setView("add")} />
            <IncomeTable records={filtered} onView={setViewTxn} />
          </motion.div>
        )}
      </AnimatePresence>

      <IncomeDetailsModal
        txn={viewTxn}
        onClose={() => setViewTxn(null)}
        onUpdate={handlePaymentUpdate}
      />
    </>
  );
}
