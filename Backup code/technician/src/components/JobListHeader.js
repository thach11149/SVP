import React from 'react';
import { Button, Box, Typography } from '@mui/material';

export default function JobListHeader({ onLogout }) {
  return (
    <Box className="job-list-header-box">
      <Typography component="h1" variant="h5">Công việc của bạn</Typography>
      <Button variant="outlined" color="error" onClick={onLogout}>Đăng xuất</Button>
    </Box>
  );
}