import React from 'react';
import Overview from '../components/Overview';

/**
 * DashboardPage
 * Landing page for Vendor Ledgers — shows business overview + outstanding payments table.
 */
export default function DashboardPage({ onVendorClick }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <Overview onVendorClick={onVendorClick} />
    </div>
  );
}
