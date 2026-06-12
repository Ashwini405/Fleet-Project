import React, { createContext, useContext, useState, useCallback } from 'react';

const VendorLedgerContext = createContext(null);

export function VendorLedgerProvider({ children }) {
  // { [vendorId]: [txn, txn, ...] }
  const [txnsByVendor, setTxnsByVendor] = useState({});
  // Set of PO numbers already posted to ledger — prevents duplicates
  const [postedPORefs, setPostedPORefs] = useState(new Set());

  const hasPOTransaction = useCallback((poRef) => {
    return postedPORefs.has(poRef);
  }, [postedPORefs]);

  const addVendorTransaction = useCallback((txn) => {
    // If this is a PO-sourced purchase, guard against duplicates
    if (txn.poRef && txn.type === 'Purchase') {
      setPostedPORefs(prev => {
        if (prev.has(txn.poRef)) return prev; // already exists — skip
        const next = new Set(prev);
        next.add(txn.poRef);
        return next;
      });
      // Check synchronously via closure — use functional update to conditionally add
      setTxnsByVendor(prev => {
        const existing = prev[txn.vendorId] || [];
        if (existing.some(t => t.poRef === txn.poRef && t.type === 'Purchase')) return prev;
        return { ...prev, [txn.vendorId]: [txn, ...existing] };
      });
      return;
    }
    setTxnsByVendor(prev => ({
      ...prev,
      [txn.vendorId]: [txn, ...(prev[txn.vendorId] || [])],
    }));
  }, []);

  const updateVendorTransaction = useCallback((vendorId, txnId, patch) => {
    setTxnsByVendor(prev => ({
      ...prev,
      [vendorId]: (prev[vendorId] || []).map(t => t.id === txnId ? { ...t, ...patch } : t),
    }));
  }, []);

  const getVendorTransactions = useCallback((vendorId) => {
    return txnsByVendor[vendorId] || [];
  }, [txnsByVendor]);

  const removeVendorTransaction = useCallback((vendorId, txnId) => {
    setTxnsByVendor(prev => ({
      ...prev,
      [vendorId]: (prev[vendorId] || []).filter(t => t.id !== txnId),
    }));
  }, []);

  return (
    <VendorLedgerContext.Provider value={{ addVendorTransaction, updateVendorTransaction, removeVendorTransaction, getVendorTransactions, txnsByVendor, hasPOTransaction }}>
      {children}
    </VendorLedgerContext.Provider>
  );
}

export function useVendorLedger() {
  const ctx = useContext(VendorLedgerContext);
  if (!ctx) throw new Error('useVendorLedger must be used inside VendorLedgerProvider');
  return ctx;
}
