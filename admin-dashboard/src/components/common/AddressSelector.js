import React from 'react';
import { TextField, MenuItem } from '@mui/material';
import Grid from '@mui/material/Grid';

const AddressSelector = ({
  formData,
  handleChange,
  provinces,
  districts,
  wards,
  styles = {},
  showGoogleMaps = true,
  googleMapsHelperText = ''
}) => {
  return (
    <>
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
            handleChange({
              target: {
                name: 'ward',
                value: code
              }
            });
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

      {showGoogleMaps && (
        <TextField
          label="Mã số vị trí Google Maps (Lat,Lng)"
          name="google_map_code"
          value={formData.google_map_code}
          onChange={handleChange}
          fullWidth
          variant="standard"
          helperText={googleMapsHelperText}
        />
      )}
    </>
  );
};

export default AddressSelector;