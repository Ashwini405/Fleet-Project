import React from 'react';
import LedgerView from '../components/LedgerView';

export default function VendorDetailPage({ vendor, onBack }) {
  return (
    <div className="animate-fade-in">
      <LedgerView vendor={vendor} onBack={onBack} />
    </div>
  );
}
