import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Snackbar from './Snackbar';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, type: '', message: '' });

  const fetchCustomers = async () => {
    console.log('Starting to fetch customers...');
    setIsLoadingCustomers(true);
    try {
      const { data, error } = await supabase
        .from('customer_sites')
        .select('id, site_name, address, ward_name, district_name, province_name, customers(id, customer_code, name, primary_contact_name, primary_contact_phone, primary_contact_position)');
      
      if (error) {
        console.error('Error fetching customers:', error);
        setSnackbar({ 
          open: true, 
          type: 'error', 
          message: `Lỗi khi tải danh sách khách hàng: ${error.message}` 
        });
      } else {
        console.log('Customers loaded successfully:', data?.length || 0, data);
        setCustomers(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      // QUAN TRỌNG: Đảm bảo setIsLoadingCustomers(false) luôn được gọi
      setIsLoadingCustomers(false);
      console.log('Set isLoadingCustomers to false');
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div>
      {isLoadingCustomers ? (
        <p>Loading customers...</p>
      ) : (
        <ul>
          {customers.map(customer => (
            <li key={customer.id}>
              {customer.site_name} - {customer.address}
            </li>
          ))}
        </ul>
      )}
      <Snackbar 
        open={snackbar.open} 
        onClose={() => setSnackbar({ ...snackbar, open: false })} 
        message={snackbar.message} 
        type={snackbar.type} 
      />
    </div>
  );
};

export default CustomerList;