import React from 'react';
import { TextField, Box, Typography, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import Grid from '@mui/material/Grid';

export default function GeneralInfoSection({ formData, handleChange }) {
  return (
    <Box mb={3} p={2} border={1} borderRadius={2} borderColor="grey.200">
      <Typography variant="h6" mb={2}>1. Thông Tin Chung</Typography>
      <Grid container spacing={2} sx={{ width: '100%' }}>
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
      <Grid container spacing={2} sx={{ width: '100%' }}>
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
  );
}