// src/components/JobForm.js

import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid
} from '@mui/material';

export default function JobForm({ open, onClose, onSave, jobToEdit }) {
  const [formData, setFormData] = useState({
    clientName: '',
    serviceContent: '',
    startTime: '08:00',
    endTime: '10:00',
    notes: ''
  });

  useEffect(() => {
    if (jobToEdit) {
      setFormData({
        clientName: jobToEdit.clientName || '',
        serviceContent: jobToEdit.serviceContent || '',
        startTime: jobToEdit.startTime || '08:00',
        endTime: jobToEdit.endTime || '10:00',
        notes: jobToEdit.notes || ''
      });
    }
  }, [jobToEdit]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (jobToEdit) {
      onSave({ ...jobToEdit, ...formData }); // Gọi onSave với dữ liệu đã cập nhật
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Sửa Thông Tin Công Việc</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên Khách Hàng"
                value={formData.clientName}
                onChange={(e) => handleChange('clientName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nội Dung Công Việc"
                value={formData.serviceContent}
                onChange={(e) => handleChange('serviceContent', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Thời Gian Bắt Đầu"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Thời Gian Kết Thúc"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ghi Chú"
                multiline
                rows={4}
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained">Lưu</Button>
      </DialogActions>
    </Dialog>
  );
}