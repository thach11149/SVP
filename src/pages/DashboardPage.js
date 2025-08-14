// src/pages/DashboardPage.js

import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Button, Box, Typography, Container, Tabs, Tab } from '@mui/material';
import CustomerList from '../components/CustomerList';
import ScheduleCalendar from '../components/ScheduleCalendar'; // Import component lịch
import { useNavigate } from 'react-router-dom';

export default function DashboardPage({ session }) {
  const navigate = useNavigate();

  const [tabIndex, setTabIndex] = useState(0); // State để quản lý tab đang được chọn

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/loginpage', { replace: true });
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Container component="main" maxWidth="xl"> {/* Tăng độ rộng tối đa */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 2,
      }}>
        <Typography component="h1" variant="h4">
          Dashboard Quản lý
        </Typography>
        <Box>
          <Typography component="span" sx={{ mr: 2 }}>{session.user.email}</Typography>
          <Button variant="contained" color="error" onClick={handleLogout}>Đăng xuất</Button>
        </Box>
      </Box>

      {/* Phần Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="dashboard tabs">
          <Tab label="Quản lý Khách hàng" />
          <Tab label="Lịch làm việc" />
        </Tabs>
      </Box>

      {/* Phần nội dung của Tabs */}
      {tabIndex === 0 && (
        <Box sx={{ p: 3 }}>
          <CustomerList />
        </Box>
      )}
      {tabIndex === 1 && (
        <Box sx={{ p: 3 }}>
          <ScheduleCalendar />
        </Box>
      )}
    </Container>
  );
}