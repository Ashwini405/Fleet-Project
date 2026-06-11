import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CategoryView from '../components/CategoryView';

export default function GaragesPage({ onVendorClick }) {

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGarages = async () => {

    try {

      const res = await axios.get(
        'http://localhost:5001/api/vendors?category=garages'
      );

      setVendors(res.data.data || []);

    } catch (error) {

      console.error(
        'FETCH GARAGES ERROR:',
        error
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchGarages();
  }, []);

  return (
    <CategoryView
      category="garages"
      categoryName="Garages"
      vendors={vendors}
      loading={loading}
      onVendorClick={onVendorClick}
      onRefresh={fetchGarages}
    />
  );
}