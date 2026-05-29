import React, { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import IncomeLogs         from "../components/income/IncomeLogs";
import IncomeTable        from "../components/income/IncomeTable";
import AddIncomeForm      from "../components/income/AddIncomeForm";
import IncomeDetailsModal from "../components/income/IncomeDetailsModal";

export default function IncomeTab({ selectedTruck, dateFrom, dateTo }) {
  const [view,    setView]    = useState("list");
  const [viewTxn, setViewTxn] = useState(null);
  const [incomeList, setIncomeList] = useState([]);

  // ──────────────────────────────────────────────────────────────────────────
  // FETCH INCOME ENTRIES FROM DATABASE
  // ──────────────────────────────────────────────────────────────────────────
  const fetchIncomeEntries = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/income");
      const data = await res.json();
      if (data.success) {
        setIncomeList(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch income entries:", error);
    }
  };

  useEffect(() => {
    fetchIncomeEntries();
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // FILTERING & SORTING (using database field names)
  // ──────────────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...incomeList];

    if (selectedTruck && selectedTruck !== "All") {
      list = list.filter(i =>
        String(i.vehicle_id) === String(selectedTruck) ||
        String(i.vehicle_number) === String(selectedTruck)
      );
    }

    if (dateFrom) {
      list = list.filter(i => new Date(i.payment_received_date) >= new Date(dateFrom));
    }

    if (dateTo) {
      list = list.filter(i => new Date(i.payment_received_date) <= new Date(dateTo));
    }

    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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