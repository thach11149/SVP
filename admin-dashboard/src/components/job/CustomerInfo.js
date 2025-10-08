import React from 'react';
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
  formatFullAddress
}) => {
  const filteredCustomers = customers.filter(c => {
    if (!searchCustomer.trim()) return true;

    const searchTerm = searchCustomer.toLowerCase().trim();
    const customerName = (c.customers?.name || '').toLowerCase();
    const customerCode = (c.customers?.customer_code || '').toLowerCase();

    return customerName.includes(searchTerm) || customerCode.includes(searchTerm);
  });

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
        <InputLabel>Khách hàng *</InputLabel>
        <Select
          value={customer}
          onChange={e => {
            setCustomer(e.target.value);
            const cust = customers.find(c => c.customers?.id === e.target.value);
            setSelectedCustomer(cust || null);
            if (e.target.value) {
              fetchCustomerServicePlan(e.target.value);
            } else {
              setCustomerServicePlan(null);
            }
          }}
          label="Khách hàng *"
        >
          <MenuItem value=""><em>-- Chọn khách hàng --</em></MenuItem>
          {filteredCustomers.map(c => (
            <MenuItem key={c.id} value={c.customers?.id}>{c.customers?.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Mã Khách hàng"
        value={selectedCustomer?.customer_code || ''}
        InputProps={{ readOnly: true }}
        fullWidth sx={{ mb: 2 }}
        variant="outlined"
      />
      {/* Thay TextField thành Typography cho các trường không sửa được */}
      <Typography variant="body1" sx={{ mb: 1 }}>
        <strong>Người liên hệ:</strong> {selectedCustomer?.primary_contact_name || ''}
      </Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        <strong>Chức vụ:</strong> {selectedCustomer?.primary_contact_position || ''}
      </Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        <strong>Số điện thoại liên hệ:</strong> {selectedCustomer?.primary_contact_phone || ''}
      </Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        <strong>Địa chỉ thực hiện:</strong> {formatFullAddress(selectedCustomer)}
      </Typography>
    </Paper>
  );
};

export default CustomerInfo;