import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import CustomerList from '../components/CustomerList';

export default function QuanLyKhachHang() {
  return (
    <Container component="main" maxWidth="xl">
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Quản lý Khách hàng
        </Typography>
        <CustomerList />
      </Box>
    </Container>
  );
}
