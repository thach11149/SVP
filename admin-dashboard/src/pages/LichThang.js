import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import ScheduleCalendar from '../components/job/ScheduleCalendar';

export default function LichThang() {
  return (
    <Container component="main" maxWidth="xl">
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Lịch tháng
        </Typography>
        <ScheduleCalendar />
      </Box>
    </Container>
  );
}
