/**
 * createVendorTransaction
 *
 * Reusable transaction creator for all vendor ledger entries.
 * Currently works with frontend state via onTransaction callback.
 * When backend is ready: replace callback with API POST.
 *
 * types: 'Tyre Purchase' | 'Retreading' | 'Parts Purchase' | 'Payment' | 'Adjustment'
 */
export function createVendorTransaction({
  vendorId,
  vendorName,
  date,
  type,
  ref       = '',
  desc      = '',
  debit     = 0,
  credit    = 0,
  truckId   = '',
  onTransaction,
}) {
  const txn = {
    id:        `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    vendorId,
    vendorName,
    date,
    type,
    ref,
    desc,
    debit:     Number(debit)  || 0,
    credit:    Number(credit) || 0,
    truckId,
    createdAt: new Date().toISOString(),
  };

  // Future: await axios.post('/api/vendor-transactions', txn)
  onTransaction?.(txn);
  return txn;
}
