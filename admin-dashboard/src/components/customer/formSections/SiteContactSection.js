import React from 'react';
import { TextField, Box, Typography, Button, Checkbox, FormControlLabel, MenuItem } from '@mui/material';
import Grid from '@mui/material/Grid';

export default function SiteContactSection({
  formData,
  handleChange,
  provinces,
  districts,
  wards,
  copyContact,
  setCopyContact,
  handleViewMap
}) {
  return (
    <Box mb={3} p={2} border={1} borderRadius={2} borderColor="grey.200">
      <Typography variant="h6" mb={2}>3. Địa Điểm & Liên Hệ Tại Hiện Trường</Typography>
      <Box mb={2}>
        <TextField
          label="Tên địa điểm thực hiện"
          name="site_name"
          value={formData.site_name || ''}
          onChange={handleChange}
          fullWidth
          variant="standard"
          helperText="Ví dụ: Vincom ABC"
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
        <TextField
          label="Số nhà, tên đường"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          sx={{ flex: 1 }}
        />
        <TextField
          select
          label="Tỉnh/Thành phố"
          name="province"
          value={formData.province}
          onChange={e => {
            const code = e.target.value;
            handleChange({
              target: {
                name: 'province',
                value: code
              }
            });
            // Reset district and ward
            handleChange({
              target: {
                name: 'district',
                value: ''
              }
            });
            handleChange({
              target: {
                name: 'ward',
                value: ''
              }
            });
          }}
          required
          sx={{ flex: 1 }}
          SelectProps={{
            MenuProps: {
              container: document.getElementById('root')
            }
          }}
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
            handleChange({
              target: {
                name: 'district',
                value: code
              }
            });
            // Reset ward
            handleChange({
              target: {
                name: 'ward',
                value: ''
              }
            });
          }}
          required
          sx={{ flex: 1 }}
          disabled={!formData.province}
          SelectProps={{
            MenuProps: {
              container: document.getElementById('root')
            }
          }}
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
            handleChange({
              target: {
                name: 'ward',
                value: code
              }
            });
          }}
          required
          sx={{ flex: 1 }}
          disabled={!formData.district}
          SelectProps={{
            MenuProps: {
              container: document.getElementById('root')
            }
          }}
        >
          {wards.map(w => (
            <MenuItem key={w.code} value={w.code}>{w.name}</MenuItem>
          ))}
        </TextField>
      </Box>
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
      <Box mb={2}>
        <TextField
          label="Khoảng cách từ Công ty đến Địa điểm thực hiện (km)"
          name="distance_km"
          value={formData.distance_km || ''}
          onChange={handleChange}
          fullWidth
          variant="standard"
          type="number"
          inputProps={{ min: 0, step: 0.1 }}
        />
      </Box>
      <Typography variant="h6" mt={2} mb={1}>Thông tin người liên hệ</Typography>
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
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={copyContact}
                onChange={e => setCopyContact(e.target.checked)}
                name="copyContact"
              />
            }
            label="Dùng thông tin người liên hệ chính"
            sx={{ mt: 2 }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}