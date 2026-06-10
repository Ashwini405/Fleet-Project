import React from 'react';
import ShowroomLedger from './ShowroomLedger';
import GarageLedger   from './GarageLedger';
import VendorLedger   from './VendorLedger';

/**
 * LedgerView — router only.
 * Routes to the correct ledger based on vendor.category:
 *   showrooms → ShowroomLedger  (vehicle purchases + warranty tracking)
 *   garages   → GarageLedger   (service/repair ledger + payments)
 *   *         → VendorLedger   (parts, fuel, tyres, oils, rta, etc.)
 */
export default function LedgerView({ vendor, onBack }) {
  if (vendor.category === 'showrooms') return <ShowroomLedger vendor={vendor} onBack={onBack} />;
  if (vendor.category === 'garages')   return <GarageLedger   vendor={vendor} onBack={onBack} />;
  return                                      <VendorLedger   vendor={vendor} onBack={onBack} />;
}
