import React from 'react';
import CategoryView from '../components/CategoryView';
import { dummyVendors } from '../data/dummyData';

const vendors = dummyVendors.filter(v => v.category === 'showrooms');

export default function ShowroomsPage({ onVendorClick }) {
  return (
    <CategoryView
      category="showrooms"
      categoryName="Showrooms"
      vendors={vendors}
      onVendorClick={onVendorClick}
    />
  );
}
