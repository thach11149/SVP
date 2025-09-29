import React from 'react';
import {
  Box, CircularProgress, Typography, Pagination, TextField, IconButton
} from '@mui/material';
import JobCard from './JobCard';
import CloseIcon from '@mui/icons-material/Close';

export default function JobListView({
  jobs, // Đây là paginatedJobs đã được lọc và sắp xếp từ component cha
  loading,
  page,
  jobsPerPage, // Cần jobsPerPage để tính số thứ tự
  totalPages,
  onPageChange,
  selectedDate,
  onDateFilterChange
}) {
  const handleDateChange = (e) => {
    onDateFilterChange(e.target.value);
  };

  const handleClearDateFilter = () => {
    onDateFilterChange('');
  };

  return (
    <Box className="cards-container">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <TextField
          type="date"
          size="small"
          value={selectedDate}
          onChange={handleDateChange}
          InputLabelProps={{
            shrink: true,
          }}
        />
        {selectedDate && (
          <>
            <Typography variant="body2" color="primary">
              Đang lọc theo ngày: {selectedDate}
            </Typography>
            <IconButton size="small" onClick={handleClearDateFilter} aria-label="clear date filter">
              <CloseIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : jobs.length === 0 ? (
        <Typography>Không có công việc nào.</Typography>
      ) : (
        // ********** ĐIỂM CẦN SỬA: Tính toán STT ở đây **********
        jobs.map((job, index) => {
          // Tính toán số thứ tự (stt) dựa trên trang hiện tại và vị trí trong mảng đã phân trang
          const stt = (page - 1) * jobsPerPage + index + 1;
          return (
            <JobCard
              key={job.id}
              job={job}
              stt={stt} // Truyền stt đã tính toán vào JobCard
            />
          );
        })
        // *******************************************************
      )}

      {totalPages > 1 && (
        <Box className="pagination-box">
          <Pagination
            count={totalPages}
            page={page}
            onChange={onPageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}