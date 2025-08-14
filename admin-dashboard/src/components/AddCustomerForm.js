// src/components/AddCustomerForm.js

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import styles from './AddCustomerForm.module.css';
import {
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Box,
  Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Checkbox, Grid, Typography, MenuItem
} from '@mui/material';

// Đổi tên component cho rõ nghĩa hơn: Form này giờ dùng cho cả Thêm và Sửa
export default function CustomerForm({ open, onClose, onSave, customerToEdit, showAlert }) {
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
    province_name: '',
    district_name: '',
    ward_name: '',
    site_contact_name: '',
    site_contact_position: '',
    site_contact_phone: '',
    notes: '',
    google_map_code: ''
  });
  const [copyContact, setCopyContact] = useState(false);
  
  // Dữ liệu địa chỉ
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Lấy danh sách tỉnh/thành phố khi mở form
  useEffect(() => {
    if (open) {
      fetch('https://provinces.open-api.vn/api/p/')
        .then(res => res.json())
        .then(data => {
          setProvinces(data);
        });
    }
  }, [open]);

  // Lấy danh sách quận/huyện khi chọn tỉnh/thành phố
  useEffect(() => {
    if (formData.province) {
      fetch(`https://provinces.open-api.vn/api/p/${formData.province}?depth=2`)
        .then(res => res.json())
        .then(data => setDistricts(data.districts || []));
      setFormData(prev => ({ ...prev, district: '', ward: '' }));
      setWards([]);
    }
  }, [formData.province]);

  // Lấy danh sách phường/xã khi chọn quận/huyện
  useEffect(() => {
    if (formData.district) {
      fetch(`https://provinces.open-api.vn/api/d/${formData.district}?depth=2`)
        .then(res => res.json())
        .then(data => setWards(data.wards || []));
      // Không reset ward ở đây để giữ giá trị khi edit
      // setFormData(prev => ({ ...prev, ward: '' })); 
    }
  }, [formData.district]);

  // THAY THẾ HOÀN TOÀN useEffect cũ bằng đoạn code này
  useEffect(() => {
    // Tạo một hàm async để xử lý tuần tự các API call
    const populateFormForEdit = async () => {
      // Chỉ thực thi khi ở chế độ Sửa và đã có danh sách Tỉnh
      if (!customerToEdit || !open || provinces.length === 0) {
        return;
      }

      try {
        // Bắt đầu với dữ liệu gốc của khách hàng
        const newFormData = { ...customerToEdit };

        // Bước 1: Lấy tên Tỉnh (đã có sẵn)
        newFormData.province_name = provinces.find(p => p.code === newFormData.province)?.name || '';

        // Bước 2: Đợi fetch xong danh sách Quận/Huyện
        if (newFormData.province) {
          const districtResponse = await fetch(`https://provinces.open-api.vn/api/p/${newFormData.province}?depth=2`);
          const districtData = await districtResponse.json();
          const loadedDistricts = districtData.districts || [];
          setDistricts(loadedDistricts); // Cập nhật state cho dropdown

          // Sau khi có danh sách Quận, lấy tên Quận
          newFormData.district_name = loadedDistricts.find(d => d.code === newFormData.district)?.name || '';

          // Bước 3: Đợi fetch xong danh sách Phường/Xã
          if (newFormData.district) {
            const wardResponse = await fetch(`https://provinces.open-api.vn/api/d/${newFormData.district}?depth=2`);
            const wardData = await wardResponse.json();
            const loadedWards = wardData.wards || [];
            setWards(loadedWards); // Cập nhật state cho dropdown

            // Sau khi có danh sách Phường, lấy tên Phường
            newFormData.ward_name = loadedWards.find(w => w.code === newFormData.ward)?.name || '';
          }
        }
        
        // Bước 4: Sau khi tất cả đã xong, cập nhật Form một lần duy nhất với đầy đủ dữ liệu
        setFormData(newFormData);

      } catch (error) {
        console.error("Lỗi khi điền form sửa:", error);
        showAlert && showAlert('Không thể tải dữ liệu địa chỉ.', 'error');
      }
    };

    populateFormForEdit();

    // Logic reset form khi tạo mới (giữ nguyên)
    if (!customerToEdit && open) {
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
        province_name: '',
        district_name: '',
        ward_name: '',
        site_contact_name: '',
        site_contact_position: '',
        site_contact_phone: '',
        notes: '',
        google_map_code: ''
      });
      setDistricts([]);
      setWards([]);
    }
  }, [customerToEdit, open, provinces]); // Phụ thuộc vào `provinces` để chạy

  // Tự động sinh mã khách hàng theo loại, dựa trên mã lớn nhất hiện có
  useEffect(() => {
    if (!customerToEdit && open) {
      const fetchLatestCode = async () => {
        const prefix = formData.customer_type === 'company' ? 'DN' : 'CN';
        const { data, error } = await supabase
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
  }, [formData.customer_type, open, customerToEdit]);

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
      const provinceObj = provinces.find(p => p.code === value);
      setFormData(prev => ({
        ...prev,
        province: value,
        province_name: provinceObj?.name || '',
        district: '',
        district_name: '',
        ward: '',
        ward_name: ''
      }));
      return;
    }
    if (name === 'district') {
      const districtObj = districts.find(d => d.code === value);
      setFormData(prev => ({
        ...prev,
        district: value,
        district_name: districtObj?.name || '',
        ward: '',
        ward_name: ''
      }));
      return;
    }
    if (name === 'ward') {
      const wardObj = wards.find(w => w.code === value);
      setFormData(prev => ({
        ...prev,
        ward: value,
        ward_name: wardObj?.name || ''
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
    setLoading(true);

    // Lấy text hiển thị từ các ô select dựa vào name
    const getSelectText = (name) => {
      const input = document.querySelector(`input[name="${name}"]`);
      if (!input) return '';
      // Tìm phần tử .MuiSelect-select phía trước input
      let el = input.previousElementSibling;
      while (el && !el.classList.contains('MuiSelect-select')) {
        el = el.previousElementSibling;
      }
      return el ? el.textContent : '';
    };

    const provinceText = getSelectText('province');
    const districtText = getSelectText('district');
    const wardText = getSelectText('ward');

    const dataToSave = {
      ...formData,
      province_name: provinceText,
      district_name: districtText,
      ward_name: wardText
    };

    console.log('Dữ liệu được lưu:', dataToSave);

    // Kiểm tra trùng mã khách hàng trước khi thêm mới
    if (!customerToEdit) {
      const { data: existed } = await supabase
        .from('customers')
        .select('id')
        .eq('customer_code', formData.customer_code)
        .single();
      if (existed) {
        showAlert && showAlert('Mã khách hàng đã tồn tại!', 'error');
        setLoading(false);
        return;
      }
    }

    try {
      let savedData;
      if (customerToEdit) {
        const { data, error } = await supabase
          .from('customers')
          .update(dataToSave)
          .eq('id', customerToEdit.id)
          .select()
          .single();
        if (error) throw error;
        savedData = data;
        showAlert && showAlert('Cập nhật khách hàng thành công!', 'success');
      } else {
        const { data, error } = await supabase
          .from('customers')
          .insert([dataToSave])
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

  function getAddressNames(provinceCode, districtCode, wardCode, provinces, districts, wards) {
    const province_name = provinces.find(p => p.code === provinceCode)?.name || '';
    const district_name = districts.find(d => d.code === districtCode)?.name || '';
    const ward_name = wards.find(w => w.code === wardCode)?.name || '';
    return { province_name, district_name, ward_name };
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* Tiêu đề thay đổi tùy theo chế độ */}
      <DialogTitle>{customerToEdit ? 'Sửa thông tin Khách hàng' : 'Tạo Mới Hồ Sơ Khách Hàng'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {/* Section 1: Thông tin chung */}
          <Box mb={3} p={2} border={1} borderRadius={2} borderColor="grey.200">
            <Typography variant="h6" mb={2}>1. Thông Tin Chung</Typography>
            <Grid container spacing={2} alignItems="flex-end">
              {/* Dòng 1: Loại khách hàng */}
              <Grid item xs={12}>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend">Loại khách hàng</FormLabel>
                  <RadioGroup
                    row
                    name="customer_type"
                    value={formData.customer_type}
                    onChange={handleChange}
                  >
                    <FormControlLabel value="company" control={<Radio />} label="Doanh nghiệp" />
                    <FormControlLabel value="personal" control={<Radio />} label="Cá nhân" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              {/* Dòng 2: Mã khách hàng | Tên khách hàng | Mã số thuế */}
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
                  onChange={handleChange}
                  required
                  fullWidth
                  variant="standard"
                />
              </Grid>
              {/* Chỉ hiển thị ô Mã số thuế khi là Doanh nghiệp */}
              {formData.customer_type === 'company' && (
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Mã số thuế"
                    name="tax_code"
                    value={formData.tax_code}
                    onChange={handleChange}
                    required
                    fullWidth
                    variant="standard"
                  />
                </Grid>
              )}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
                  fullWidth
                  variant="standard"
                />
              </Grid>
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
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
                  const name = provinces.find(p => p.code === code)?.name || '';
                  setFormData(prev => ({
                    ...prev,
                    province: code,
                    province_name: name,
                    district: '',
                    district_name: '',
                    ward: '',
                    ward_name: ''
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
                  const name = districts.find(d => d.code === code)?.name || '';
                  setFormData(prev => ({
                    ...prev,
                    district: code,
                    district_name: name,
                    ward: '',
                    ward_name: ''
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
                  const name = wards.find(w => w.code === code)?.name || '';
                  setFormData(prev => ({
                    ...prev,
                    ward: code,
                    ward_name: name
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
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
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

          {/* Section 4: Thông tin bổ sung */}
          <Box mb={3} p={2} border={1} borderRadius={2} borderColor="grey.200">
            <Typography variant="h6" mb={2}>4. Ghi chú</Typography>
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