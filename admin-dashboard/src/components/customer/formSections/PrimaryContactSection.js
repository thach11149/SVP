import React from 'react';
import { TextField, Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';

export default function PrimaryContactSection({ formData, handleChange }) {
  return (
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
  );
}