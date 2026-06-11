import React from 'react';
import CategoryView from '../components/CategoryView';
import { dummyVendors } from '../data/dummyData';

const vendors = dummyVendors.filter(v => v.category === 'rta');

export default function RTAPage({ onVendorClick }) {
  return (
    <CategoryView
      category="rta"
      categoryName="RTA Expenses"
      vendors={vendors}
      onVendorClick={onVendorClick}
    />
  );
}
