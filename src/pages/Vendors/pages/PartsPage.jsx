import React from 'react';
import CategoryView from '../components/CategoryView';
import { dummyVendors } from '../data/dummyData';

const vendors = dummyVendors.filter(v => v.category === 'parts');

export default function PartsPage({ onVendorClick }) {
  return (
    <CategoryView
      category="parts"
      categoryName="Parts & Spares"
      vendors={vendors}
      onVendorClick={onVendorClick}
    />
  );
}
