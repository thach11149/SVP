import React from 'react';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Typography, Divider, Button } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChecklistIcon from '@mui/icons-material/Checklist';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import WorkIcon from '@mui/icons-material/Work'; // Import icon for Dịch Vụ Khách Hàng
import MapIcon from '@mui/icons-material/Map'; // Import icon for Khoảng cách di chuyển
import NatureIcon from '@mui/icons-material/Nature'; // Import icon for ESG
import InventoryIcon from '@mui/icons-material/Inventory'; // Import icon for Quản lý tồn kho
import ScheduleIcon from '@mui/icons-material/Schedule'; // Import icon for Lập kế hoạch giao việc

function Sidebar({ session }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/loginpage', { replace: true });
  };

  return (
    <Box sx={{ width: 'fit-content', height: '100%', display: 'flex', flexDirection: 'column', borderRight: 1, borderColor: 'divider' }}>
      {/* Logo/Header */}
      <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#df1e26', color: 'white' }}>
        <Typography variant="h6" component={Link} to="/dashboard" sx={{ textDecoration: 'none', color: 'inherit' }}>
          Sao Việt Pest
        </Typography>
        <Typography variant="caption" display="block">
          Quản lý công việc
        </Typography>
      </Box>
      
      <Divider />
      
      {/* Navigation Menu */}
      <List sx={{ flex: 1, overflowY: 'auto' }}>
        <ListItem>
          <ListItemButton component={Link} to="/dashboard" sx={{ bgcolor: location.pathname === '/dashboard' ? 'rgba(255, 0, 0, 0.1)' : 'transparent', width: '100%' }}>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" sx={{ whiteSpace: 'nowrap' }} />
          </ListItemButton>
        </ListItem>
        
        <ListItem>
          <ListItemButton component={Link} to="/quan-ly-khach-hang" sx={{ bgcolor: location.pathname === '/quan-ly-khach-hang' ? 'rgba(255, 0, 0, 0.1)' : 'transparent', width: '100%' }}>
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Quản lý Khách hàng" sx={{ whiteSpace: 'nowrap' }} />
          </ListItemButton>
        </ListItem>
        
        <ListItem>
          <ListItemButton component={Link} to="/dich-vu-khach-hang" sx={{ bgcolor: location.pathname === '/dich-vu-khach-hang' ? 'rgba(255, 0, 0, 0.1)' : 'transparent', width: '100%' }}>
            <ListItemIcon>
              <WorkIcon />
            </ListItemIcon>
            <ListItemText primary="Dịch Vụ Khách Hàng" sx={{ whiteSpace: 'nowrap' }} />
          </ListItemButton>
        </ListItem>

        <ListItem>
          <ListItemButton component={Link} to="/lap-ke-hoach-giao-viec" sx={{ bgcolor: location.pathname === '/lap-ke-hoach-giao-viec' ? 'rgba(255, 0, 0, 0.1)' : 'transparent', width: '100%' }}>
            <ListItemIcon>
              <ScheduleIcon />
            </ListItemIcon>
            <ListItemText primary="Lập Kế Hoạch Giao Việc" sx={{ whiteSpace: 'nowrap' }} />
          </ListItemButton>
        </ListItem>

        <ListItem>
          <ListItemButton component={Link} to="/lich-lam-viec" sx={{ bgcolor: location.pathname === '/lich-lam-viec' ? 'rgba(255, 0, 0, 0.1)' : 'transparent', width: '100%' }}>
            <ListItemIcon>
              <CalendarMonthIcon />
            </ListItemIcon>
            <ListItemText primary="Lịch làm việc" sx={{ whiteSpace: 'nowrap' }} />
          </ListItemButton>
        </ListItem>
        
        {/* <ListItem button component={Link} to="/lich-thang">
          <ListItemIcon>
            <EventIcon />
          </ListItemIcon>
          <ListItemText primary="Lịch tháng" />
        </ListItem> */}
        
        <ListItem>
          <ListItemButton component={Link} to="/danh-sach-cong-viec" sx={{ bgcolor: location.pathname === '/danh-sach-cong-viec' ? 'rgba(255, 0, 0, 0.1)' : 'transparent', width: '100%' }}>
            <ListItemIcon>
              <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary="Danh sách công việc" sx={{ whiteSpace: 'nowrap' }} />
          </ListItemButton>
        </ListItem>

        <ListItem>
          <ListItemButton component={Link} to="/checklist-cong-viec" sx={{ bgcolor: location.pathname === '/checklist-cong-viec' ? 'rgba(255, 0, 0, 0.1)' : 'transparent', width: '100%' }}>
            <ListItemIcon>
              <ChecklistIcon />
            </ListItemIcon>
            <ListItemText primary="Checklist công việc" sx={{ whiteSpace: 'nowrap' }} />
          </ListItemButton>
        </ListItem>
        
        <ListItem>
          <ListItemButton component={Link} to="/khoang-cach-di-chuyen" sx={{ bgcolor: location.pathname === '/khoang-cach-di-chuyen' ? 'rgba(255, 0, 0, 0.1)' : 'transparent', width: '100%' }}>
            <ListItemIcon>
              <MapIcon />
            </ListItemIcon>
            <ListItemText primary="Khoảng cách di chuyển" sx={{ whiteSpace: 'nowrap' }} />
          </ListItemButton>
        </ListItem>

        <ListItem>
          <ListItemButton component={Link} to="/test" sx={{ bgcolor: location.pathname === '/test' ? 'rgba(255, 0, 0, 0.1)' : 'transparent', width: '100%' }}>
            <ListItemIcon>
              <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary="Test Page" sx={{ whiteSpace: 'nowrap' }} />
          </ListItemButton>
        </ListItem>

        <ListItem>
          <ListItemButton component={Link} to="/esg" sx={{ bgcolor: location.pathname === '/esg' ? 'rgba(0, 128, 0, 0.2)' : 'transparent', width: '100%' }}>
            <ListItemIcon>
              <NatureIcon sx={{ color: 'green' }} />
            </ListItemIcon>
            <ListItemText primary="ESG" sx={{ whiteSpace: 'nowrap' }} />
          </ListItemButton>
        </ListItem>

        <ListItem>
          <ListItemButton component={Link} to="/quan-ly-ton-kho" sx={{ bgcolor: location.pathname === '/quan-ly-ton-kho' ? 'rgba(255, 0, 0, 0.1)' : 'transparent', width: '100%' }}>
            <ListItemIcon>
              <InventoryIcon />
            </ListItemIcon>
            <ListItemText primary="Quản lý Tồn kho" sx={{ whiteSpace: 'nowrap' }} />
          </ListItemButton>
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