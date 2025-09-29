// src/components/AddCustomerForm.js

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Box } from '@mui/material';

// Đổi tên component cho rõ nghĩa hơn: Form này giờ dùng cho cả Thêm và Sửa
export default function CustomerForm({ open, onClose, onSave, customerToEdit, showAlert }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', customer_code: '', address: '', phone_number: '', email: '', invoice_info: ''
  });

  // useEffect này sẽ chạy mỗi khi `customerToEdit` thay đổi
  // Nó dùng để điền thông tin vào form khi ở chế độ "Sửa"
  useEffect(() => {
    if (customerToEdit) {
      setFormData(customerToEdit);
    } else {
      // Reset form khi ở chế độ "Thêm mới"
      setFormData({ name: '', customer_code: '', address: '', phone_number: '', email: '', invoice_info: '' });
    }
  }, [customerToEdit, open]); // Phụ thuộc vào customerToEdit và trạng thái mở của dialog

  const handleChange = (e) => {
    setFormData(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let savedData;
      if (customerToEdit) {
        const { data, error } = await supabase
          .from('customers')
          .update(formData)
          .eq('id', customerToEdit.id)
          .select()
          .single();
        if (error) throw error;
        savedData = data;
        showAlert && showAlert('Cập nhật khách hàng thành công!', 'success');
      } else {
        const { data, error } = await supabase
          .from('customers')
          .insert([formData])
          .select()
          .single();
        if (error) throw error;
        savedData = data;
        showAlert && showAlert('Thêm khách hàng thành công!', 'success');
      }
      onSave(savedData);
      onClose();
    } catch (error) {
      showAlert && showAlert('Lỗi: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      {/* Tiêu đề thay đổi tùy theo chế độ */}
      <DialogTitle>{customerToEdit ? 'Sửa thông tin Khách hàng' : 'Thêm Khách Hàng Mới'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {/* Dùng `value` để điền dữ liệu vào form */}
          <TextField autoFocus margin="dense" name="name" label="Tên Khách Hàng" type="text" fullWidth variant="standard" value={formData.name} onChange={handleChange} required />
          <TextField margin="dense" name="customer_code" label="Mã Khách Hàng" type="text" fullWidth variant="standard" value={formData.customer_code} onChange={handleChange} />
          <TextField margin="dense" name="address" label="Địa chỉ" type="text" fullWidth variant="standard" value={formData.address} onChange={handleChange} />
          <TextField margin="dense" name="phone_number" label="Số điện thoại" type="text" fullWidth variant="standard" value={formData.phone_number} onChange={handleChange} />
          <TextField margin="dense" name="email" label="Email" type="email" fullWidth variant="standard" value={formData.email} onChange={handleChange} />
          <TextField margin="dense" name="invoice_info" label="Thông tin xuất hóa đơn" type="text" fullWidth multiline rows={2} variant="standard" value={formData.invoice_info} onChange={handleChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}