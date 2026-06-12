import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CategoryView from '../components/CategoryView';

export default function ShowroomsPage({ onVendorClick }) {

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchShowrooms = async () => {

    try {

      const response = await axios.get(
        'http://localhost:5001/api/showrooms'
      );

      setVendors(
        response.data.data || []
      );

    } catch (error) {

      console.error(
        'SHOWROOM FETCH ERROR:',
        error
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    fetchShowrooms();

  }, []);

  return (
    <CategoryView
      category="showrooms"
      categoryName="Showrooms"
      vendors={vendors}
      loading={loading}
      onVendorClick={onVendorClick}
      onRefresh={fetchShowrooms}
    />
  );
}