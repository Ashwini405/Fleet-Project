import React, { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import IncomeLogs         from "../components/income/IncomeLogs";
import IncomeTable        from "../components/income/IncomeTable";
import AddIncomeForm      from "../components/income/AddIncomeForm";
import IncomeDetailsModal from "../components/income/IncomeDetailsModal";

export default function IncomeTab({ selectedTruck, dateFrom, dateTo, searchQuery = "", vehicles = [], initialTripId, initialVehicleId }) {
  const [view,    setView]    = useState(initialTripId ? "add" : "list");
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
      if (selectedTruck === "General") {
        list = list.filter(i => !i.vehicle_id && !i.vehicle_number);
      } else {
        const selVeh = vehicles.find(v => String(v.id || v.vehicle_id) === String(selectedTruck));
        const selVehNo = selVeh?.vehicle_no?.trim().toLowerCase() || "";
        list = list.filter(i => {
          const vId = String(i.vehicle_id || "");
          const vNo = String(i.vehicle_number || "").trim().toLowerCase();
          return (
            vId === String(selectedTruck) ||
            vNo === String(selectedTruck).trim().toLowerCase() ||
            (selVehNo && vNo === selVehNo)
          );
        });
      }
    }

    if (dateFrom) {
      list = list.filter(i => {
        const d = String(i.payment_received_date || i.created_at || "").slice(0, 10);
        return !d || d >= dateFrom;
      });
    }

    if (dateTo) {
      list = list.filter(i => {
        const d = String(i.payment_received_date || i.created_at || "").slice(0, 10);
        return !d || d <= dateTo;
      });
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(i =>
        (i.customer_name && String(i.customer_name).toLowerCase().includes(q)) ||
        (i.income_title && String(i.income_title).toLowerCase().includes(q)) ||
        (i.income_number && String(i.income_number).toLowerCase().includes(q)) ||
        (i.vehicle_number && String(i.vehicle_number).toLowerCase().includes(q)) ||
        (i.trip_number && String(i.trip_number).toLowerCase().includes(q)) ||
        (i.notes && String(i.notes).toLowerCase().includes(q)) ||
        String(i.amount || "").includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }, [incomeList, selectedTruck, dateFrom, dateTo, searchQuery, vehicles]);

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
            <AddIncomeForm onBack={() => setView("list")} initialTripId={initialTripId} initialVehicleId={initialVehicleId} />
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