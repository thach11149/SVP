import React from 'react';
import { Button, Box, Tabs, Tab, Menu, MenuItem } from '@mui/material';
import { ArrowDropDown, Check as CheckIcon } from '@mui/icons-material';

export default function JobTabsAndSort({
  tabIndex,
  onTabChange,
  sortOrder,
  onSortChange,
  pendingJobsCount,
  completedJobsCount,
  showSortButton // Thêm prop để kiểm soát việc hiển thị nút sắp xếp
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClickSortButton = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseSortMenu = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (order) => {
    onSortChange(order);
    handleCloseSortMenu();
  };

  return (
    <Box className="sort-and-tabs-box">
      <Tabs value={tabIndex} onChange={onTabChange} className="custom-tab-root">
        <Tab label="Lịch làm việc" />
        <Tab label={`Chờ xử lý (${pendingJobsCount})`} />
        <Tab label={`Hoàn thành (${completedJobsCount})`} />
      </Tabs>

      {showSortButton && (
        <>
          <Button
            id="sort-button"
            aria-controls={open ? 'sort-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClickSortButton}
            variant="outlined"
            endIcon={<ArrowDropDown />}
          >
            Sắp xếp
          </Button>
          <Menu
            id="sort-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleCloseSortMenu}
            MenuListProps={{
              'aria-labelledby': 'sort-button',
            }}
          >
            <MenuItem onClick={() => handleMenuItemClick('newest')}>
              Gần nhất {sortOrder === 'newest' && <CheckIcon fontSize="small" sx={{ ml: 1 }} />}
            </MenuItem>
            <MenuItem onClick={() => handleMenuItemClick('oldest')}>
              Xa nhất {sortOrder === 'oldest' && <CheckIcon fontSize="small" sx={{ ml: 1 }} />}
            </MenuItem>
          </Menu>
        </>
      )}
    </Box>
  );
}