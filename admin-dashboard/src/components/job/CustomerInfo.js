import React, { useEffect } from 'react';
import {
  Paper, Typography, TextField, Select, MenuItem, FormControl, InputLabel, Divider
} from '@mui/material';

const CustomerInfo = ({
  searchCustomer,
  setSearchCustomer,
  customer,
  setCustomer,
  customers,
  selectedCustomer,
  setSelectedCustomer,
  customerServicePlan,
  setCustomerServicePlan,
  fetchCustomerServicePlan,
  formatFullAddress,
  isLoadingCustomers
}) => {
  // useEffect để handle customer không có trong danh sách customer_sites
  React.useEffect(() => {
    if (!isLoadingCustomers && customers.length > 0 && customer) {
      const customerExists = customers.some(c => c.id === customer);
      if (!customerExists) {
        console.warn('Customer site not found in customer_sites list. Customer may not have any sites:', customer);
        // Không reset customer, chỉ log warning
        // Có thể customer tồn tại nhưng chưa có site nào
      }
    }
  }, [customers, customer, isLoadingCustomers]);

  // Bước 1: Lọc customers dựa trên search
  let filteredCustomers = customers.filter(c => {
    if (!searchCustomer.trim()) return true;

    const searchTerm = searchCustomer.toLowerCase().trim();
    const customerName = (c.customers?.name || '').toLowerCase();
    const customerCode = (c.customers?.customer_code || '').toLowerCase();

    return customerName.includes(searchTerm) || customerCode.includes(searchTerm);
  });

  // Debug: Log sau khi filtered
  console.log('CustomerInfo render:', {
    customersLength: customers.length,
    searchCustomer,
    customer,
    isLoadingCustomers,
    filteredLength: filteredCustomers.length,
    hasValidCustomer: customer && filteredCustomers.some(c => c.customers?.id === customer)
  });

  // Bước 2: Đảm bảo khách hàng đã chọn luôn có trong danh sách ngay cả khi không khớp search
  if (customer) {
    const customerExists = filteredCustomers.some(c => 
      (c.customers?.id === customer) || (!c.customers && c.id === customer)
    );
    if (!customerExists) {
      const selectedCust = customers.find(c => 
        (c.customers?.id === customer) || (!c.customers && c.id === customer)
      );
      if (selectedCust) {
        filteredCustomers = [...filteredCustomers, selectedCust];
        console.log('Added selected customer to filtered list:', selectedCust.customers?.name || selectedCust.name);
      } else {
        console.warn('Selected customer not found in customers array:', customer);
      }
    }
  }

  // Debug: Log cuối cùng
  console.log('Final filtered customers:', {
    finalLength: filteredCustomers.length,
    customerValue: customer,
    availableValues: filteredCustomers.map(c => c.customers?.id || c.id),
    searchTerm: searchCustomer
  });

  useEffect(() => {
    if (customer && customers.length > 0) {
      // Tìm theo customer ID (c.customers?.id) hoặc nếu là direct customer thì c.id
      const cust = customers.find(c => 
        (c.customers?.id === customer) || 
        (!c.customers && c.id === customer)
      );
      if (cust) {
        setSelectedCustomer(cust);
        // Sử dụng customer ID thực tế để fetch service plan
        const actualCustomerId = cust.customers?.id || cust.id;
        fetchCustomerServicePlan(actualCustomerId);
      } else {
        console.warn('Customer not found in any format:', customer);
      }
    } else {
      setSelectedCustomer(null);
      setCustomerServicePlan(null);
    }
  }, [customer, customers, fetchCustomerServicePlan, setCustomerServicePlan, setSelectedCustomer]);

  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight={600} color="primary" gutterBottom>
        Nhóm 1: Thông tin Khách hàng
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <TextField
        label="Tìm kiếm khách hàng"
        value={searchCustomer}
        onChange={e => setSearchCustomer(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        placeholder="Nhập tên hoặc mã khách hàng..."
      />

      <FormControl fullWidth required sx={{ mb: 2 }}>
        <InputLabel>Khách hàng</InputLabel>
        <Select
          value={isLoadingCustomers && customers.length === 0 ? '' : customer}
          onChange={e => {
            setCustomer(e.target.value);
            // Tìm customer theo customer ID (không phải site ID)
            const cust = customers.find(c => 
              (c.customers?.id === e.target.value) || 
              (!c.customers && c.id === e.target.value)
            );
            setSelectedCustomer(cust || null);
            if (e.target.value) {
              fetchCustomerServicePlan(e.target.value);
            } else {
              setCustomerServicePlan(null);
            }
          }}
          label="Khách hàng *"
          disabled={isLoadingCustomers && customers.length === 0}
        >
          <MenuItem value=""><em>-- Chọn khách hàng --</em></MenuItem>
          {(isLoadingCustomers && customers.length === 0) ? (
            <MenuItem disabled><em>Đang tải danh sách khách hàng...</em></MenuItem>
          ) : filteredCustomers.length === 0 ? (
            <MenuItem disabled><em>Không tìm thấy khách hàng nào</em></MenuItem>
          ) : (
            filteredCustomers.map(c => {
              // Sử dụng customer ID làm value, không phải site ID
              const customerId = c.customers?.id || c.id;
              const customerCode = c.customers?.customer_code || c.customer_code;
              const customerName = c.customers?.name || c.name;
              
              return (
                <MenuItem key={c.id || c.customer_code} value={customerId}>
                  {customerCode} - {customerName || 'Tên không có'}
                </MenuItem>
              );
            })
          )}
        </Select>
      </FormControl>
      {/* <TextField
        label="Mã Khách hàng"
        value={selectedCustomer?.customers?.customer_code || selectedCustomer?.customer_code || ''}
        InputProps={{ readOnly: true }}
        fullWidth sx={{ mb: 2 }}
        variant="outlined"
      /> */}
      
      <Typography variant="body1" sx={{ mb: 1 }}>
        <strong>Người liên hệ:</strong> {selectedCustomer?.customers?.primary_contact_name || selectedCustomer?.primary_contact_name || ''}
      </Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        <strong>Chức vụ:</strong> {selectedCustomer?.customers?.primary_contact_position || selectedCustomer?.primary_contact_position || "Chưa cập nhật"}
      </Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        <strong>Số điện thoại liên hệ:</strong> {selectedCustomer?.customers?.primary_contact_phone || selectedCustomer?.primary_contact_phone || ''}
      </Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        <strong>Địa chỉ thực hiện:</strong> {formatFullAddress(selectedCustomer)}
      </Typography>
    </Paper>
  );
};

export default CustomerInfo;