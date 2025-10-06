import React from 'react';
import {
  Paper, Typography, TextField, FormControl, RadioGroup, FormControlLabel, Radio, Divider, Box, Grid
} from '@mui/material';

const JobInfo = ({
  customerServicePlan,
  serviceType,
  setServiceType,
  datetime,
  setDatetime,
  taskContent,
  setTaskContent,
  notes,
  setNotes,
  getDayOfWeek
}) => {
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={600} color="success.main" gutterBottom>
        Nhóm 2: Thông tin Công việc
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Hiển thị thông tin service plan của khách hàng */}
      {customerServicePlan && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
            📋 Thông tin dịch vụ của khách hàng
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body2" fontWeight={500}>
                Loại hình dịch vụ:
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {customerServicePlan.service_types && customerServicePlan.service_types.length > 0
                  ? customerServicePlan.service_types.join(', ')
                  : 'Chưa cập nhật'}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body2" fontWeight={500}>
                Thời gian hạn triển khai:
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {customerServicePlan.start_date ? (() => {
                  const d = new Date(customerServicePlan.start_date);
                  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                })() : 'Chưa cập nhật'} - {' '}
                {customerServicePlan.end_date ? (() => {
                  const d = new Date(customerServicePlan.end_date);
                  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                })() : 'Chưa cập nhật'}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body2" fontWeight={500}>
                Kế hoạch:
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {customerServicePlan.plan || 'Chưa cập nhật'}
              </Typography>
            </Grid>

            {customerServicePlan.plan === 'Lịch Định kỳ' && (
              <>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" fontWeight={500}>
                    Ngày trong tuần:
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {customerServicePlan.days_of_week && customerServicePlan.days_of_week.length > 0
                      ? customerServicePlan.days_of_week.join(', ')
                      : 'Chưa cập nhật'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" fontWeight={500}>
                    Tần suất:
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {customerServicePlan.frequency || 'Chưa cập nhật'}
                  </Typography>
                </Grid>
              </>
            )}



            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body2" fontWeight={500}>
                Báo cáo:
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {customerServicePlan.report_date ? getDayOfWeek(customerServicePlan.report_date) : 'Chưa cập nhật'}
                ({customerServicePlan.report_frequency || 'Chưa cập nhật'})
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}

      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <Typography fontWeight={500} mb={1}>Loại hình dịch vụ *</Typography>
        <RadioGroup
          row
          value={serviceType}
          onChange={e => setServiceType(e.target.value)}
        >
          <FormControlLabel value="Định kỳ" control={<Radio />} label="Định kỳ" />
          <FormControlLabel value="1 lần" control={<Radio />} label="1 lần" />
          <FormControlLabel value="SOS" control={<Radio />} label="SOS (Khẩn cấp)" />
        </RadioGroup>
      </FormControl>
      <TextField
        label="Ngày giờ thực hiện *"
        type="datetime-local"
        value={datetime}
        onChange={e => setDatetime(e.target.value)}
        InputLabelProps={{ shrink: true }}
        fullWidth sx={{ mb: 2 }}
        required
      />
      <TextField
        label="Nội dung công việc *"
        value={taskContent}
        onChange={e => setTaskContent(e.target.value)}
        multiline rows={4}
        fullWidth sx={{ mb: 2 }}
        required
        placeholder="Ví dụ: Kiểm tra vệ sinh bẫy đèn côn trùng, Bơm tổng thể khu vực kho..."
      />
      <TextField
        label="Yêu cầu/Lưu ý khác"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        multiline rows={3}
        fullWidth sx={{ mb: 2 }}
        placeholder="Ghi chú các yêu cầu đặc biệt từ khách hàng hoặc lưu ý cho KTV..."
      />
    </Paper>
  );
};

export default JobInfo;