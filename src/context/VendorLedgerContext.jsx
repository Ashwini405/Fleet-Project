import React, { createContext, useContext, useState, useCallback } from 'react';

const VendorLedgerContext = createContext(null);

/**
 * VendorLedgerProvider — wrap at App level.
 * Stores all vendor transactions in memory (keyed by vendorId).
 * When backend is ready, replace state with API calls.
 */
export function VendorLedgerProvider({ children }) {
  // { [vendorId]: [txn, txn, ...] }
  const [txnsByVendor, setTxnsByVendor] = useState({});

  const addVendorTransaction = useCallback((txn) => {
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
    <VendorLedgerContext.Provider value={{ addVendorTransaction, updateVendorTransaction, removeVendorTransaction, getVendorTransactions, txnsByVendor }}>
      {children}
    </VendorLedgerContext.Provider>
  );
}

export function useVendorLedger() {
  const ctx = useContext(VendorLedgerContext);
  if (!ctx) throw new Error('useVendorLedger must be used inside VendorLedgerProvider');
  return ctx;
}
