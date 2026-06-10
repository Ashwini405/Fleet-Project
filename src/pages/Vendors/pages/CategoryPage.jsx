import React from 'react';
import CategoryView from '../components/CategoryView';

export default function CategoryPage({ category, categoryName, onVendorClick }) {
  return (
    <div className="animate-fade-in">
      <CategoryView category={category} categoryName={categoryName} onVendorClick={onVendorClick} />
    </div>
  );
}
