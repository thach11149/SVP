import React from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Box, Typography, Divider, Button } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChecklistIcon from '@mui/icons-material/Checklist';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Sidebar({ session }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/loginpage', { replace: true });
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Header */}
      <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" component={Link} to="/dashboard" sx={{ textDecoration: 'none', color: 'inherit' }}>
          Sao Việt Pest
        </Typography>
        <Typography variant="caption" display="block">
          Quản lý công việc
        </Typography>
      </Box>
      
      <Divider />
      
      {/* Navigation Menu */}
      <List sx={{ flex: 1 }}>
        <ListItem button component={Link} to="/dashboard">
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        
        <ListItem button component={Link} to="/quan-ly-khach-hang">
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Quản lý Khách hàng" />
        </ListItem>
        
        <ListItem button component={Link} to="/lich-lam-viec">
          <ListItemIcon>
            <CalendarMonthIcon />
          </ListItemIcon>
          <ListItemText primary="Lịch làm việc" />
        </ListItem>
        
        <ListItem button component={Link} to="/lich-thang">
          <ListItemIcon>
            <EventIcon />
          </ListItemIcon>
          <ListItemText primary="Lịch tháng" />
        </ListItem>
        
        <ListItem button component={Link} to="/checklist-cong-viec">
          <ListItemIcon>
            <ChecklistIcon />
          </ListItemIcon>
          <ListItemText primary="Checklist công việc" />
        </ListItem>
        
        <ListItem button component={Link} to="/danh-sach-cong-viec">
          <ListItemIcon>
            <AssignmentIcon />
          </ListItemIcon>
          <ListItemText primary="Danh sách công việc" />
        </ListItem>
      </List>
      
      <Divider />
      
      {/* User Info & Logout */}
      <Box sx={{ p: 2 }}>
        {session && (
          <Typography variant="caption" display="block" sx={{ mb: 1, color: 'text.secondary' }}>
            {session.user.email}
          </Typography>
        )}
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          size="small"
        >
          Đăng xuất
        </Button>
      </Box>
    </Box>
  );
}

export default Sidebar;