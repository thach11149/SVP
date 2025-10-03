// src/components/AddCustomerForm.js

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import styles from './AddCustomerForm.module.css';
import {
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Box,
  Radio, RadioGroup, FormControlLabel, Checkbox, Typography, MenuItem, FormGroup
} from '@mui/material';
import Grid from '@mui/material/Grid';

import provincesData from '../data/provinces.json';
import districtsData from '../data/districts.json';
import wardsData from '../data/wards.json';

// Đổi tên component cho rõ nghĩa hơn: Form này giờ dùng cho cả Thêm và Sửa
export default function AddCustomerForm({ open, onClose, onSave, showAlert }) {
  const [loading, setLoading] = useState(false);  // Thêm state loading
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
    google_map_code: '',
    service_types: [],  // Mảng cho multiple select
    plan: 'Lịch Định kỳ'  // Mặc định
  });
  const [copyContact, setCopyContact] = useState(false);
  // Dữ liệu địa chỉ
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Lấy danh sách tỉnh/thành phố khi mở form
  useEffect(() => {
    if (open) {
      setProvinces(provincesData);
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
        google_map_code: '',
        service_types: [],  // Thêm để tránh undefined
        plan: 'Lịch Định kỳ'  // Thêm để tránh undefined
      });
      setDistricts([]);
      setWards([]);
    }
  }, [open]);

  // Lấy danh sách quận/huyện khi chọn tỉnh/thành phố
  useEffect(() => {
    if (formData.province) {
      setDistricts(districtsData.filter(d => d.province_code === formData.province));
      setFormData(prev => ({ ...prev, district: '', ward: '' }));
      setWards([]);
    }
  }, [formData.province]);

  // Lấy danh sách phường/xã khi chọn quận/huyện
  useEffect(() => {
    if (formData.district) {
      setWards(wardsData.filter(w => w.district_code === formData.district));
    }
  }, [formData.district]);

  // Tự động sinh mã khách hàng theo loại, dựa trên mã lớn nhất hiện có
  useEffect(() => {
    if (open) {
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
    }
  }, [formData.customer_type, open]);

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
    const { name, value, checked } = e.target;
    if (name === 'service_types') {
      // Xử lý checkbox multiple
      setFormData(prev => ({
        ...prev,
        service_types: checked
          ? [...prev.service_types, value]
          : prev.service_types.filter(type => type !== value)
      }));
      return;
    }
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

  const handleViewMap = () => {
    // Ghép địa chỉ đầy đủ
    const addressFull = [
      formData.address,
      wards.find(w => w.code === formData.ward)?.name,
      districts.find(d => d.code === formData.district)?.name,
      provinces.find(p => p.code === formData.province)?.name
    ].filter(Boolean).join(', ');
    if (addressFull.trim()) {
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressFull)}`;
      window.open(mapUrl, '_blank');
    } else {
      showAlert && showAlert('Vui lòng nhập đầy đủ địa chỉ.', 'warning');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);  // Bỏ comment
    // Lấy tên địa chỉ từ code
    const provinceText = provinces.find(p => p.code === formData.province)?.name || '';
    const districtText = districts.find(d => d.code === formData.district)?.name || '';
    const wardText = wards.find(w => w.code === formData.ward)?.name || '';
    const dataToSave = {
      ...formData,
      province_name: provinceText,
      district_name: districtText,
      ward_name: wardText,
      service_types: formData.service_types,  // Thêm vào data lưu
      plan: formData.plan
    };

    console.log('Dữ liệu được lưu:', dataToSave);

    // Kiểm tra trùng mã khách hàng trước khi thêm mới
    const { data: existed } = await supabase
      .from('customers')
      .select('id')
      .eq('customer_code', formData.customer_code)
      .single();
    if (existed) {
      showAlert && showAlert('Mã khách hàng đã tồn tại!', 'error');
      setLoading(false);  // Bỏ comment
      return;
    }

    try {
      let savedData;
      const { data, error } = await supabase
        .from('customers')
        .insert([dataToSave])
        .select()
        .single();
      if (error) throw error;
      savedData = data;
      showAlert && showAlert('Thêm khách hàng thành công!', 'success');
      onSave && onSave(savedData);
      onClose && onClose();
    } catch (error) {
      showAlert && showAlert('Lỗi: ' + error.message, 'error');
    } finally {
      setLoading(false);  // Bỏ comment
    }
  };

  // Giao diện

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* Tiêu đề thay đổi tùy theo chế độ */}
      <DialogTitle>{'Tạo Mới Hồ Sơ Khách Hàng'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 2 }}>  {/* Thay px: 0 thành p: 2 để có padding như TestPage */}
          {/* Section 1: Thông tin chung */}
          <Box mb={3} p={2} border={1} borderRadius={2} borderColor="grey.200">
            <Typography variant="h6" mb={2}>1. Thông Tin Chung</Typography>
            <Grid container spacing={2} sx={{ width: '100%' }}>  {/* Thêm sx để ép full width */}
              <Grid size={{ xs: 12, sm: 12, md: 12 }}>
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
            </Grid>
            <Grid container spacing={2} sx={{ width: '100%' }}>  {/* Thêm sx để ép full width */}
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

          {/* Section 2: Người liên hệ chính */}
          <Box mb={3} p={2} border={1} borderRadius={2} borderColor="grey.200">
            <Typography variant="h6" mb={2}>2. Người Liên Hệ Chính (Hợp đồng, Báo cáo)</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Họ tên người liên hệ"
                  name="primary_contact_name"
                  value={formData.primary_contact_name}
                  onChange={handleChange}
                  required
                  fullWidth
                  variant="standard"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Chức vụ"
                  name="primary_contact_position"
                  value={formData.primary_contact_position}
                  onChange={handleChange}
                  fullWidth
                  variant="standard"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Số điện thoại"
                  name="primary_contact_phone"
                  value={formData.primary_contact_phone}
                  onChange={handleChange}
                  required
                  fullWidth
                  variant="standard"
                  type="tel"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Email (Gửi báo cáo)"
                  name="primary_contact_email"
                  value={formData.primary_contact_email}
                  onChange={handleChange}
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
                onChange={handleChange}
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
            <Button
              onClick={handleViewMap}
              sx={{ mt: 1, mb: 2 }}
              variant="outlined"
              color="primary"
            >
              📍 Xem trên Google Maps
            </Button>
            <Box mb={2}>
              <TextField
                label="Mã số vị trí Google Maps (Lat,Lng)"
                name="google_map_code"
                value={formData.google_map_code}
                onChange={handleChange}
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
            <Box mt={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={copyContact}
                    onChange={e => setCopyContact(e.target.checked)}
                    name="copyContact"
                  />
                }
                label="Sử dụng thông tin người liên hệ chính cho địa điểm này"
              />
            </Box>
            <Grid container spacing={2} mt={1}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Tên người liên hệ tại hiện trường"
                  name="site_contact_name"
                  value={formData.site_contact_name}
                  onChange={handleChange}
                  required
                  fullWidth
                  variant="standard"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Chức vụ (tại hiện trường)"
                  name="site_contact_position"
                  value={formData.site_contact_position}
                  onChange={handleChange}
                  required={formData.customer_type === 'company'}
                  fullWidth
                  variant="standard"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Số điện thoại (tại hiện trường)"
                  name="site_contact_phone"
                  value={formData.site_contact_phone}
                  onChange={handleChange}
                  required
                  fullWidth
                  variant="standard"
                  type="tel"
                />
              </Grid>
            </Grid>
          </Box>

          {/* Section 4: Loại hình dịch vụ và Kế hoạch */}
          <Box mb={3} p={2} border={1} borderRadius={2} borderColor="grey.200">
            <Typography variant="h6" mb={2}>4. Loại Hình Dịch Vụ & Kế Hoạch</Typography>
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom>Loại hình dịch vụ</Typography>
              <FormGroup row sx={{ gap: 2 }}>
                {['Dịch Hại Tổng Hợp', 'Diệt Muỗi', 'Diệt Chuột', 'Diệt Mối', 'Khác'].map((type) => (
                  <FormControlLabel
                    key={type}
                    control={
                      <Checkbox
                        checked={formData.service_types.includes(type)}
                        onChange={handleChange}
                        name="service_types"
                        value={type}
                      />
                    }
                    label={type}
                  />
                ))}
              </FormGroup>
            </Box>
            <Box>
              <Typography variant="subtitle1" gutterBottom>Kế hoạch</Typography>
              <RadioGroup
                row
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                sx={{ gap: 2 }}
              >
                <FormControlLabel value="Lịch Định kỳ" control={<Radio />} label="Lịch Định kỳ" />
                <FormControlLabel value="1 lần" control={<Radio />} label="1 lần" />
              </RadioGroup>
            </Box>
          </Box>

          {/* Section 5: Thông tin bổ sung */}
          <Box mb={3} p={2} border={1} borderRadius={2} borderColor="grey.200">
            <Typography variant="h6" mb={2}>5. Ghi chú</Typography>
            <TextField
              label="Ghi chú"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
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