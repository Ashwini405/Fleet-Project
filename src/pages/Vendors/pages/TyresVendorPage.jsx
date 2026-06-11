import React from 'react';
import CategoryView from '../components/CategoryView';
import { dummyVendors } from '../data/dummyData';

const vendors = dummyVendors.filter(v => v.category === 'tyres');

export default function TyresVendorPage({ onVendorClick }) {
  return (
    <CategoryView
      category="tyres"
      categoryName="Tyres"
      vendors={vendors}
      onVendorClick={onVendorClick}
    />
  );
}
