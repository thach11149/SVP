import React from 'react';
import { Box, Typography } from '@mui/material';

export default function ESGHeader() {
  return (
    <Box sx={{ mb: 4, borderBottom: 1, borderColor: 'grey.200', pb: 2 }}>
      <Typography variant="h3" sx={{ fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: '2.5rem', mr: 1.5 }}>🌎</span> ESG Dashboard - Kiểm Soát Côn Trùng Bền Vững
      </Typography>
      <Typography sx={{ color: '#6b7280', mt: 0.5 }}>
        Theo dõi các Chỉ số Môi trường, Xã hội và Quản trị (E, S, G) theo chuẩn **GRI/SASB/ISO** (Quý Hiện Tại).
      </Typography>
    </Box>
  );
}