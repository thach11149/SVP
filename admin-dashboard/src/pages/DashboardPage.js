// src/pages/DashboardPage.js

import React from 'react';
import { Box, Typography, Container } from '@mui/material';

export default function DashboardPage({ session }) {
  return (
    <Container component="main" maxWidth="xl">
      <Box sx={{
        marginTop: 4,
        marginBottom: 2,
      }}>
        <Typography component="h1" variant="h4" gutterBottom>
          Dashboard Quản lý
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Chào mừng {session.user.email} đến với hệ thống quản lý Sao Việt Pest
        </Typography>
      </Box>

      {/* Nội dung chính của Dashboard */}
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Tổng quan hệ thống
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Sử dụng menu bên trái để điều hướng đến các chức năng khác nhau của hệ thống:
        </Typography>
        <Box component="ul" sx={{ mt: 2 }}>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>Quản lý Khách hàng:</strong> Thêm, sửa, xóa thông tin khách hàng và quản lý hồ sơ
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>Lịch làm việc:</strong> Xem và quản lý lịch làm việc hàng ngày của kỹ thuật viên
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>Checklist công việc:</strong> Quản lý danh sách công việc cần thực hiện
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>Danh sách công việc:</strong> Xem tổng quan và trạng thái các công việc đã giao
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}