import React from 'react';
import CategoryView from '../components/CategoryView';
import { dummyVendors } from '../data/dummyData';

const vendors = dummyVendors.filter(v => v.category === 'oils');

export default function OilsPage({ onVendorClick }) {
  return (
    <CategoryView
      category="oils"
      categoryName="Oils & Lubes"
      vendors={vendors}
      onVendorClick={onVendorClick}
    />
  );
}
