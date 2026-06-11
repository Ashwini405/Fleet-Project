import React from 'react';
import CategoryView from '../components/CategoryView';
import { dummyVendors } from '../data/dummyData';

const vendors = dummyVendors.filter(v => v.category === 'fuel');

export default function FuelVendorPage({ onVendorClick }) {
  return (
    <CategoryView
      category="fuel"
      categoryName="Fuel Stations"
      vendors={vendors}
      onVendorClick={onVendorClick}
    />
  );
}
