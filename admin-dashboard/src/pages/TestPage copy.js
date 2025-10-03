// src/components/AddCustomerForm.js

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  Button, TextField, Box, Typography,
  Radio, RadioGroup, FormControlLabel, Checkbox, Grid, MenuItem, Paper
} from '@mui/material';
import provincesData from '../data/provinces.json';
import districtsData from '../data/districts.json';
import wardsData from '../data/wards.json';

export default function TestPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_type: 'company',
    customer_code: '',
    name: '',
    tax_code: '',
    primary_contact_name: '',
    primary_contact_position: '',
    primary_contact_phone: '',
    primary_contact_email: '',
    address: '',
    ward: '',
    district: '',
    province: '',
    site_contact_name: '',
    site_contact_position: '',
    site_contact_phone: '',
    notes: '',
    google_map_code: ''
  });
  const [copyContact, setCopyContact] = useState(false);

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

  // Copy thông tin liên hệ chính sang hiện trường
  useEffect(() => {
    if (copyContact) {
      setFormData(prev => ({
        ...prev,
        site_contact_name: prev.primary_contact_name,
        site_contact_position: prev.primary_contact_position,
        site_contact_phone: prev.primary_contact_phone
      }));
    }
  }, [copyContact, formData.primary_contact_name, formData.primary_contact_position, formData.primary_contact_phone]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'province') {
      setFormData(prev => ({
        ...prev,
        province: value,
        district: '',
        ward: ''
      }));
      return;
    }
    if (name === 'district') {
      setFormData(prev => ({
        ...prev,
        district: value,
        ward: ''
      }));
      return;
    }
    if (name === 'ward') {
      setFormData(prev => ({
        ...prev,
        ward: value
      }));
      return;
    }
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
      const { data, error } = await supabase
        .from('customers')
        .insert([dataToSave])
        .select()
        .single();
      if (error) throw error;
      alert('Thêm khách hàng thành công!');
      // Reset form hoặc redirect
      setFormData({
        customer_type: 'company',
        customer_code: '',
        name: '',
        tax_code: '',
        primary_contact_name: '',
        primary_contact_position: '',
        primary_contact_phone: '',
        primary_contact_email: '',
        address: '',
        ward: '',
        district: '',
        province: '',
        site_contact_name: '',
        site_contact_position: '',
        site_contact_phone: '',
        notes: '',
        google_map_code: ''
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
              <Grid item xs={12}>
                <Typography variant="subtitle1">Loại khách hàng</Typography>
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
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
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
                  <Grid item xs={12} md={6}>
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
                  <Grid item xs={12} md={3}>
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
              </Grid>
            </Grid>
          </Box>

          {/* Section 2: Thông tin liên hệ chính */}
          <Box mb={3} p={2} border={1} borderRadius={2} borderColor="grey.200">
            <Typography variant="h6" mb={2}>2. Thông Tin Liên Hệ Chính</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Họ tên"
                  name="primary_contact_name"
                  value={formData.primary_contact_name}
                  onChange={handleChange}
                  fullWidth
                  variant="standard"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Chức vụ"
                  name="primary_contact_position"
                  value={formData.primary_contact_position}
                  onChange={handleChange}
                  fullWidth
                  variant="standard"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Điện thoại"
                  name="primary_contact_phone"
                  value={formData.primary_contact_phone}
                  onChange={handleChange}
                  fullWidth
                  variant="standard"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email"
                  name="primary_contact_email"
                  value={formData.primary_contact_email}
                  onChange={handleChange}
                  fullWidth
                  variant="standard"
                  required
                />
              </Grid>
            </Grid>
          </Box>

          {/* Section 3: Địa chỉ khách hàng */}
          <Box mb={3} p={2} border={1} borderRadius={2} borderColor="grey.200">
            <Typography variant="h6" mb={2}>3. Địa Chỉ Khách Hàng</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Địa chỉ"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  fullWidth
                  variant="standard"
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  label="Tỉnh/Thành phố"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  fullWidth
                  variant="standard"
                  required
                >
                  {provincesData.map(province => (
                    <MenuItem key={province.code} value={province.code}>
                      {province.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  label="Quận/Huyện"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  fullWidth
                  variant="standard"
                  required
                >
                  {districtsData
                    .filter(district => district.province_code === formData.province)
                    .map(district => (
                      <MenuItem key={district.code} value={district.code}>
                        {district.name}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  label="Phường/Xã"
                  name="ward"
                  value={formData.ward}
                  onChange={handleChange}
                  fullWidth
                  variant="standard"
                  required
                >
                  {wardsData
                    .filter(ward => ward.district_code === formData.district)
                    .map(ward => (
                      <MenuItem key={ward.code} value={ward.code}>
                        {ward.name}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>

          {/* Section 4: Thông tin hiện trường */}
          <Box mb={3} p={2} border={1} borderRadius={2} borderColor="grey.200">
            <Typography variant="h6" mb={2}>4. Thông Tin Hiện Trường</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={copyContact}
                      onChange={(e) => setCopyContact(e.target.checked)}
                    />
                  }
                  label="Sử dụng thông tin liên hệ chính cho hiện trường"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Họ tên"
                  name="site_contact_name"
                  value={formData.site_contact_name}
                  onChange={handleChange}
                  fullWidth
                  variant="standard"
                  disabled={copyContact}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Chức vụ"
                  name="site_contact_position"
                  value={formData.site_contact_position}
                  onChange={handleChange}
                  fullWidth
                  variant="standard"
                  disabled={copyContact}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Điện thoại"
                  name="site_contact_phone"
                  value={formData.site_contact_phone}
                  onChange={handleChange}
                  fullWidth
                  variant="standard"
                  disabled={copyContact}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Section 5: Ghi chú */}
          <Box mb={3} p={2} border={1} borderRadius={2} borderColor="grey.200">
            <Typography variant="h6" mb={2}>5. Ghi Chú Khác</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Ghi chú"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  fullWidth
                  variant="standard"
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Mã nhúng Google Map"
                  name="google_map_code"
                  value={formData.google_map_code}
                  onChange={handleChange}
                  fullWidth
                  variant="standard"
                  multiline
                  rows={2}
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