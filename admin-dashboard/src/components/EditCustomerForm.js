// src/components/EditCustomerForm.js

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import styles from './AddCustomerForm.module.css';
import {
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Box,
  Radio, RadioGroup, FormControlLabel, Grid, Typography, MenuItem
} from '@mui/material';
import provincesData from '../data/provinces.json';
import districtsData from '../data/districts.json';
import wardsData from '../data/wards.json';

export default function EditCustomerForm({ open, onClose, onSave, customerToEdit, showAlert }) {
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
  // Dữ liệu địa chỉ
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (open) {
      setProvinces(provincesData);
    }
  }, [open]);

  useEffect(() => {
    if (!customerToEdit || !open || provinces.length === 0) return;
    setIsEditing(true);
    setFormData(prev => ({
      ...prev,
      customer_type: customerToEdit.customer_type,
      customer_code: customerToEdit.customer_code,
      name: customerToEdit.name,
      tax_code: customerToEdit.tax_code,
      primary_contact_name: customerToEdit.primary_contact_name,
      primary_contact_position: customerToEdit.primary_contact_position,
      primary_contact_phone: customerToEdit.primary_contact_phone,
      primary_contact_email: customerToEdit.primary_contact_email,
      address: customerToEdit.address,
      site_contact_name: customerToEdit.site_contact_name,
      site_contact_position: customerToEdit.site_contact_position,
      site_contact_phone: customerToEdit.site_contact_phone,
      notes: customerToEdit.notes,
      google_map_code: customerToEdit.google_map_code,
      province: '',
      district: '',
      ward: ''
    }));
    setTimeout(() => {
      setFormData(prev => ({ ...prev, province: customerToEdit.province }));
    }, 0);
  }, [customerToEdit, open, provinces.length]);

  useEffect(() => {
    if (formData.province) {
      const filteredDistricts = districtsData.filter(d => d.province_code === formData.province);
      setDistricts(filteredDistricts);
      if (!isEditing) {
        const validDistrict = filteredDistricts.find(d => d.code === formData.district);
        if (!validDistrict) {
          setFormData(prev => ({ ...prev, district: '', ward: '' }));
          setWards([]);
        }
      }
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [formData.province, formData.district, isEditing]);

  useEffect(() => {
    if (
      customerToEdit &&
      open &&
      formData.province === customerToEdit.province &&
      districts.length > 0 &&
      !formData.district
    ) {
      setFormData(prev => ({ ...prev, district: customerToEdit.district }));
    }
  }, [customerToEdit, open, formData.province, districts.length, formData.district]);

  useEffect(() => {
    if (formData.district) {
      const filteredWards = wardsData.filter(w => w.district_code === formData.district);
      setWards(filteredWards);
      if (!isEditing) {
        const validWard = filteredWards.find(w => w.code === formData.ward);
        if (!validWard) {
          setFormData(prev => ({ ...prev, ward: '' }));
        }
      }
    } else {
      setWards([]);
    }
  }, [formData.district, formData.ward, isEditing]);

  useEffect(() => {
    if (
      customerToEdit &&
      open &&
      formData.district === customerToEdit.district &&
      wards.length > 0 &&
      !formData.ward
    ) {
      setFormData(prev => ({ ...prev, ward: customerToEdit.ward }));
      setIsEditing(false);
    }
  }, [customerToEdit, open, formData.district, wards.length, formData.ward]);





  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const provinceText = provinces.find(p => p.code === formData.province)?.name || '';
    const districtText = districts.find(d => d.code === formData.district)?.name || '';
    const wardText = wards.find(w => w.code === formData.ward)?.name || '';
    const dataToSave = {
      ...formData,
      province_name: provinceText,
      district_name: districtText,
      ward_name: wardText
    };
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(dataToSave)
        .eq('id', customerToEdit.id)
        .select()
        .single();
      if (error) throw error;
      showAlert && showAlert('Cập nhật khách hàng thành công!', 'success');
      onSave(data);
      onClose();
    } catch (error) {
      showAlert && showAlert('Lỗi: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Giao diện

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Sửa thông tin Khách hàng</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ px: 0 }}>
          {/* Section 1: Thông tin chung */}
          <Box mb={3} p={2} border={1} borderRadius={2} borderColor="grey.200">
            <Typography variant="h6" mb={2}>1. Thông Tin Chung</Typography>

            <Grid container spacing={2}>
              {/* Dòng 1: Loại khách hàng */}
              <Grid item xs={12}>
                <Typography variant="subtitle1">Loại khách hàng</Typography>
                <RadioGroup
                  row
                  name="customer_type"
                  value={formData.customer_type}
                  onChange={e => setFormData(prev => ({ ...prev, customer_type: e.target.value }))}
                  sx={{ gap: 2 }}
                >
                  <FormControlLabel value="company" control={<Radio />} label="Doanh nghiệp" />
                  <FormControlLabel value="personal" control={<Radio />} label="Cá nhân" />
                </RadioGroup>
              </Grid>

              {/* Dòng 2: Mã KH | Tên KH | Mã số thuế */}
              <Grid container item xs={12} spacing={2}>
                <Grid item xs={12} md={4}>
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
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Tên khách hàng / Tên công ty"
                    name="name"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    fullWidth
                    variant="standard"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Mã số thuế"
                    name="tax_code"
                    value={formData.tax_code}
                    onChange={e => setFormData(prev => ({ ...prev, tax_code: e.target.value }))}
                    required={formData.customer_type === 'company'}
                    disabled={formData.customer_type !== 'company'}
                    fullWidth
                    variant="standard"
                    style={formData.customer_type === 'personal' ? { opacity: 0, pointerEvents: 'none' } : {}}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Box>

          {/* Section 2: Người liên hệ chính */}
          <Box mb={3} p={2} border={1} borderRadius={2} borderColor="grey.200">
            <Typography variant="h6" mb={2}>2. Người Liên Hệ Chính (Hợp đồng, Báo cáo)</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Họ tên người liên hệ"
                  name="primary_contact_name"
                  value={formData.primary_contact_name}
                  onChange={e => setFormData(prev => ({ ...prev, primary_contact_name: e.target.value }))}
                  required
                  fullWidth
                  variant="standard"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Chức vụ"
                  name="primary_contact_position"
                  value={formData.primary_contact_position}
                  onChange={e => setFormData(prev => ({ ...prev, primary_contact_position: e.target.value }))}
                  fullWidth
                  variant="standard"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Số điện thoại"
                  name="primary_contact_phone"
                  value={formData.primary_contact_phone}
                  onChange={e => setFormData(prev => ({ ...prev, primary_contact_phone: e.target.value }))}
                  required
                  fullWidth
                  variant="standard"
                  type="tel"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email (Gửi báo cáo)"
                  name="primary_contact_email"
                  value={formData.primary_contact_email}
                  onChange={e => setFormData(prev => ({ ...prev, primary_contact_email: e.target.value }))}
                  required
                  fullWidth
                  variant="standard"
                  type="email"
                />
              </Grid>
            </Grid>
          </Box>

          {/* Section 3: Địa điểm & liên hệ hiện trường */}
          <Box mb={3} p={2} border={1} borderRadius={2} borderColor="grey.200">
            <Typography variant="h6" mb={2}>3. Địa Điểm & Liên Hệ Tại Hiện Trường</Typography>
            <div className={styles.addressRow}>
              <TextField
                label="Số nhà, tên đường"
                name="address"
                value={formData.address}
                onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                required
                className={styles.addressField}
              />
              <TextField
                select
                label="Tỉnh/Thành phố"
                name="province"
                value={formData.province}
                onChange={e => {
                  const code = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    province: code,
                    district: '',
                    ward: ''
                  }));
                }}
                required
                className={styles.addressField}
              >
                {provinces.map(p => (
                  <MenuItem key={p.code} value={p.code}>{p.name}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Quận/Huyện"
                name="district"
                value={formData.district}
                onChange={e => {
                  const code = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    district: code,
                    ward: ''
                  }));
                }}
                required
                className={styles.addressField}
                disabled={!formData.province}
              >
                {districts.map(d => (
                  <MenuItem key={d.code} value={d.code}>{d.name}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Phường/Xã"
                name="ward"
                value={formData.ward}
                onChange={e => {
                  const code = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    ward: code
                  }));
                }}
                required
                className={styles.addressField}
                disabled={!formData.district}
              >
                {wards.map(w => (
                  <MenuItem key={w.code} value={w.code}>{w.name}</MenuItem>
                ))}
              </TextField>
            </div>

            <Box mb={2}>
              <TextField
                label="Mã số vị trí Google Maps (Lat,Lng)"
                name="google_map_code"
                value={formData.google_map_code}
                onChange={e => setFormData(prev => ({ ...prev, google_map_code: e.target.value }))}
                fullWidth
                variant="standard"
                helperText={
                  <span>
                    <span style={{ color: 'red', fontWeight: 'bold' }}>
                      Ví dụ: @10.7907774,106.6953672
                    </span>
                    <br />
                    Hãy copy đoạn <span style={{ color: 'red', fontWeight: 'bold' }}>@10.7907774,106.6953672</span> từ đường dẫn Google Maps:<br />
                    <span style={{ color: 'gray' }}>
                      Hồ+Chí+Minh+700000/<span style={{ color: 'red', fontWeight: 'bold' }}>@10.7907774,106.6953672</span>,17z/data=!3m1!4b1!
                    </span>
                  </span>
                }
              />
            </Box>

            <Grid container spacing={2} mt={1}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Tên người liên hệ tại hiện trường"
                  name="site_contact_name"
                  value={formData.site_contact_name}
                  onChange={e => setFormData(prev => ({ ...prev, site_contact_name: e.target.value }))}
                  required
                  fullWidth
                  variant="standard"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Chức vụ (tại hiện trường)"
                  name="site_contact_position"
                  value={formData.site_contact_position}
                  onChange={e => setFormData(prev => ({ ...prev, site_contact_position: e.target.value }))}
                  required={formData.customer_type === 'company'}
                  fullWidth
                  variant="standard"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Số điện thoại (tại hiện trường)"
                  name="site_contact_phone"
                  value={formData.site_contact_phone}
                  onChange={e => setFormData(prev => ({ ...prev, site_contact_phone: e.target.value }))}
                  required
                  fullWidth
                  variant="standard"
                  type="tel"
                />
              </Grid>
            </Grid>
          </Box>

          {/* Section 4: Thông tin bổ sung */}
          <Box mb={3} p={2} border={1} borderRadius={2} borderColor="grey.200">
            <Typography variant="h6" mb={2}>4. Ghi chú</Typography>
            <TextField
              label="Ghi chú"
              name="notes"
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              fullWidth
              multiline
              rows={3}
              variant="standard"
              placeholder="Ví dụ: Chỉ làm việc ngoài giờ hành chính, khu vực xử lý có nuôi thú cưng..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu Thông Tin'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}