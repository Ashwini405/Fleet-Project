import React from 'react';
import ShowroomLedger from './ShowroomLedger';
import GarageLedger   from './GarageLedger';
import OilsLedger     from './OilsLedger';
import PartsLedger    from './PartsLedger';
import FuelLedger     from './FuelLedger';
import TyresLedger    from './TyresLedger';
import RTALedger      from './RTALedger';

/**
 * LedgerView — router only.
 * Routes to the correct ledger based on vendor.category:
 *   showrooms → ShowroomLedger  (vehicle purchases + warranty tracking)
 *   garages   → GarageLedger   (service/repair ledger + payments)
 *   oils      → OilsLedger     (lubricant purchases + PO connection)
 *   parts     → PartsLedger    (parts & spares purchases)
 *   fuel      → FuelLedger     (fuel fill transactions)
 *   tyres     → TyresLedger    (tyre purchases + retreading)
 *   rta       → RTALedger      (RTA fee transactions)
 */
export default function LedgerView({ vendor, onBack }) {
  if (vendor.category === 'showrooms') return <ShowroomLedger vendor={vendor} onBack={onBack} />;
  if (vendor.category === 'garages')   return <GarageLedger   vendor={vendor} onBack={onBack} />;
  if (vendor.category === 'oils')      return <OilsLedger     vendor={vendor} onBack={onBack} />;
  if (vendor.category === 'parts')     return <PartsLedger    vendor={vendor} onBack={onBack} />;
  if (vendor.category === 'fuel')      return <FuelLedger     vendor={vendor} onBack={onBack} />;
  if (vendor.category === 'tyres')     return <TyresLedger    vendor={vendor} onBack={onBack} />;
  if (vendor.category === 'rta')       return <RTALedger      vendor={vendor} onBack={onBack} />;
  return null;
}
