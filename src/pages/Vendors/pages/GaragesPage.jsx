import React from 'react';
import CategoryView from '../components/CategoryView';
import { dummyVendors } from '../data/dummyData';

const vendors = dummyVendors.filter(v => v.category === 'garages');

export default function GaragesPage({ onVendorClick }) {
  return (
    <CategoryView
      category="garages"
      categoryName="Garages"
      vendors={vendors}
      onVendorClick={onVendorClick}
    />
  );
}
