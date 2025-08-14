import React from 'react';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <List>
      <ListItem button component={Link} to="/lich-lam-viec">
        <ListItemIcon>
          <CalendarMonthIcon />
        </ListItemIcon>
        <ListItemText primary="Lịch làm việc" />
      </ListItem>
      {/* Các menu khác nếu có */}
    </List>
  );
}

export default Sidebar;