// src/components/CustomerList.js

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button, Box } from '@mui/material';
import CustomerForm from './AddCustomerForm'; // Đổi tên import cho đúng

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null); // State để lưu khách hàng đang được sửa

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setCustomers(data);
    } catch (error) {
      alert('Lỗi lấy dữ liệu khách hàng: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  // Xử lý khi nhấn nút "Thêm mới"
  const handleAddNew = () => {
    setEditingCustomer(null); // Đảm bảo không có khách hàng nào đang được sửa
    setOpenDialog(true);
  };

  // Xử lý khi nhấn nút "Sửa"
  const handleEdit = (customer) => {
    setEditingCustomer(customer); // Lưu thông tin khách hàng cần sửa vào state
    setOpenDialog(true); // Mở dialog
  };

  // Xử lý khi đóng dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCustomer(null); // Reset state sửa
  };

  // Xử lý sau khi lưu form (cả thêm mới và sửa)
  const handleSave = (savedCustomer) => {
    if (editingCustomer) { // Nếu là chế độ sửa
      // Tìm và thay thế khách hàng đã được cập nhật trong danh sách
      setCustomers(customers.map(c => (c.id === savedCustomer.id ? savedCustomer : c)));
    } else { // Nếu là chế độ thêm mới
      setCustomers([savedCustomer, ...customers]);
    }
  };

  const handleDelete = async (customerId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này không?')) {
      try {
        const { error } = await supabase.from('customers').delete().eq('id', customerId);
        if (error) throw error;
        setCustomers(customers.filter(customer => customer.id !== customerId));
        alert('Xóa khách hàng thành công!');
      } catch (error) {
        alert('Lỗi khi xóa khách hàng: ' + error.message);
      }
    }
  };

  if (loading) return <Typography>Đang tải dữ liệu...</Typography>;

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Danh sách Khách hàng</Typography>
        <Button variant="contained" onClick={handleAddNew}>Thêm Khách Hàng Mới</Button>
      </Box>

      <CustomerForm
        open={openDialog}
        onClose={handleCloseDialog}
        onSave={handleSave}
        customerToEdit={editingCustomer}
      />

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Tên Khách Hàng</TableCell>
              <TableCell>Mã KH</TableCell>
              <TableCell>Địa chỉ</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.customer_code}</TableCell>
                <TableCell>{customer.address}</TableCell>
                <TableCell>{customer.phone_number}</TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => handleEdit(customer)}>Sửa</Button>
                  <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(customer.id)}>Xóa</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}