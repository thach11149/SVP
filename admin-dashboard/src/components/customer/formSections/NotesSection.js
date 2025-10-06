import React from 'react';
import { TextField, Box, Typography } from '@mui/material';

export default function NotesSection({ formData, handleChange }) {
  return (
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
  );
}