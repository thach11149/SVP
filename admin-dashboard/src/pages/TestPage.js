// src/components/AddCustomerForm.js

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  Button, TextField, Box, Typography,
  Radio, RadioGroup, FormControlLabel, Grid, Paper
} from '@mui/material';

export default function TestPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_type: 'company',
    customer_code: '',
    name: '',
    tax_code: ''
  });

  // Tự động sinh mã khách hàng theo loại, dựa trên mã lớn nhất hiện có
  useEffect(() => {
    const fetchLatestCode = async () => {
      const prefix = formData.customer_type === 'company' ? 'DN' : 'CN';
      const { data } = await supabase
        .from('customers')
        .select('customer_code')
        .like('customer_code', `${prefix}%`)
        .order('customer_code', { ascending: false })
        .limit(1);

      let nextCode = `${prefix}0001`;
      if (data && data.length > 0) {
        const lastCode = data[0].customer_code;
        const num = parseInt(lastCode.replace(prefix, ''), 10) + 1;
        nextCode = `${prefix}${num.toString().padStart(4, '0')}`;
      }
      setFormData(prev => ({
        ...prev,
        customer_code: nextCode
      }));
    };
    fetchLatestCode();
  }, [formData.customer_type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const dataToSave = { ...formData };

    console.log('Dữ liệu được lưu:', dataToSave);

    // Kiểm tra trùng mã khách hàng trước khi thêm mới
    const { data: existed } = await supabase
      .from('customers')
      .select('id')
      .eq('customer_code', formData.customer_code)
      .single();
    if (existed) {
      alert('Mã khách hàng đã tồn tại!');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('customers')
        .insert([dataToSave])
        .select()
        .single();
      if (error) throw error;
      alert('Thêm khách hàng thành công!');
      // Reset form
      setFormData({
        customer_type: 'company',
        customer_code: '',
        name: '',
        tax_code: ''
      });
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: '#f5f6fa', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, sm: 4 }, borderRadius: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Test Page - Thêm Khách Hàng
        </Typography>
        <Typography color="text.secondary" mb={4}>
          Trang test để thêm khách hàng mới.
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          {/* Section 1: Thông tin chung */}
          <Box mb={3} p={2} border={1} borderRadius={2} borderColor="grey.200">
            <Typography variant="h6" mb={2}>1. Thông Tin Chung</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 12, md: 12 }}>
                <Typography variant="subtitle1" gutterBottom>Loại khách hàng</Typography>
                <RadioGroup
                  row
                  name="customer_type"
                  value={formData.customer_type}
                  onChange={handleChange}
                  sx={{ gap: 2 }}
                >
                  <FormControlLabel value="company" control={<Radio />} label="Doanh nghiệp" />
                  <FormControlLabel value="personal" control={<Radio />} label="Cá nhân" />
                </RadioGroup>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  label="Mã khách hàng"
                  name="customer_code"
                  value={formData.customer_code}
                  InputProps={{ readOnly: true }}
                  fullWidth
                  variant="standard"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <TextField
                  label="Tên khách hàng/Công ty"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  fullWidth
                  variant="standard"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  label="Mã số thuế"
                  name="tax_code"
                  value={formData.tax_code}
                  onChange={handleChange}
                  required={formData.customer_type === 'company'}
                  disabled={formData.customer_type !== 'company'}
                  fullWidth
                  variant="standard"
                  style={formData.customer_type === 'personal' ? { opacity: 0, pointerEvents: 'none' } : {}}
                />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}