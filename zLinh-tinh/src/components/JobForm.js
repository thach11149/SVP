// src/components/JobForm.js

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Box,
  Select, MenuItem, FormControl, InputLabel, CircularProgress
} from '@mui/material';
import moment from 'moment';

export default function JobForm({ open, onClose, onSave, onDelete, selectedSlot, jobToEdit }) {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]); // Đây là danh sách nhân viên
  const [formData, setFormData] = useState({
    customer_id: '', user_id: '', job_description: '', scheduled_date: null
  });

  useEffect(() => {
    async function fetchData() {
      // Lấy danh sách khách hàng (giữ nguyên)
      const { data: customersData } = await supabase.from('customers').select('id, name');
      setCustomers(customersData || []);

      // SỬA LỖI Ở ĐÂY: Gọi hàm RPC thay vì lệnh admin
      const { data: usersData, error: usersError } = await supabase.rpc('get_all_users');
      if (usersError) {
          console.error('Lỗi lấy danh sách nhân viên:', usersError);
      } else {
          setUsers(usersData || []);
      }
    }
    if (open) fetchData();
  }, [open]);
  
  // Các phần còn lại của file giữ nguyên không thay đổi...
  useEffect(() => {
    if (jobToEdit) {
      setFormData({
        customer_id: jobToEdit.resource.customer_id || '',
        user_id: jobToEdit.resource.user_id || '',
        job_description: jobToEdit.resource.job_description || '',
        scheduled_date: jobToEdit.resource.scheduled_date || null,
      });
    } else if (selectedSlot) {
      setFormData({
        customer_id: '', user_id: '', job_description: '', scheduled_date: selectedSlot.start
      });
    }
  }, [jobToEdit, selectedSlot, open]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
      await onDelete(jobToEdit.id);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let savedData;
      const { id, ...restOfFormData } = formData;
      if (jobToEdit) {
        const { data, error } = await supabase.from('jobs').update(restOfFormData).eq('id', jobToEdit.id).select('*, customers(name)').single();
        if (error) throw error;
        savedData = data;
      } else {
        const { data, error } = await supabase.from('jobs').insert([formData]).select('*, customers(name)').single();
        if (error) throw error;
        savedData = data;
      }
      onSave(savedData);
      alert(jobToEdit ? 'Cập nhật thành công!' : 'Tạo công việc thành công!');
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{jobToEdit ? 'Sửa Công việc' : 'Tạo Công việc mới'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel id="customer-select-label">Chọn Khách hàng</InputLabel>
            <Select labelId="customer-select-label" name="customer_id" value={formData.customer_id} label="Chọn Khách hàng" onChange={handleChange} required>
              {customers.map(customer => (<MenuItem key={customer.id} value={customer.id}>{customer.name}</MenuItem>))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel id="user-select-label">Gán cho Nhân viên</InputLabel>
            <Select labelId="user-select-label" name="user_id" value={formData.user_id} label="Gán cho Nhân viên" onChange={handleChange} required>
              {users.map(user => (<MenuItem key={user.id} value={user.id}>{user.email}</MenuItem>))}
            </Select>
          </FormControl>
          <TextField margin="dense" name="job_description" label="Mô tả công việc" type="text" fullWidth multiline rows={3} value={formData.job_description} onChange={handleChange} required />
          <TextField margin="dense" name="scheduled_date" label="Ngày bắt đầu" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }} value={formData.scheduled_date ? moment(formData.scheduled_date).format('YYYY-MM-DDTHH:mm') : ''} onChange={handleChange} />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', padding: '16px 24px' }}>
            {jobToEdit && <Button color="error" onClick={handleDelete}>Xóa</Button>}
            <Box>
                <Button onClick={onClose}>Hủy</Button>
                <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Lưu'}
                </Button>
            </Box>
        </DialogActions>
      </Box>
    </Dialog>
  );
}