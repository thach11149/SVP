import React from 'react';
import { Box, Typography, RadioGroup, FormControlLabel, Radio, FormGroup, Checkbox, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

export default function ServicePlanSection({ formData, handleChange }) {
  const { service_types = [], days_of_week = [], plan = 'Lịch Định kỳ', frequency = 'Hàng tuần', start_date = '', end_date = '', report_date = '', report_frequency = '1 tuần/lần' } = formData;
  const reportDateLabel = plan === '1 lần' ? 'Ngày gửi báo cáo' : 'Ngày gửi báo cáo đầu tiên';
  return (
    <Box mb={3} p={2} border={1} borderRadius={2} borderColor="grey.200">
      <Typography variant="h6" mb={2}>4. Loại Hình Dịch Vụ & Kế Hoạch</Typography>
      <Box mb={3}>
        <Typography variant="subtitle1" gutterBottom>Loại hình dịch vụ</Typography>
        <FormGroup row sx={{ gap: 2 }}>
          {['Dịch Hại Tổng Hợp', 'Diệt Muỗi', 'Diệt Chuột', 'Diệt Mối', 'Khác'].map((type) => (
            <FormControlLabel
              key={type}
              control={
                <Checkbox
                  checked={service_types.includes(type)}
                  onChange={handleChange}
                  name="service_types"
                  value={type}
                />
              }
              label={type}
            />
          ))}
        </FormGroup>
      </Box>
      {/* New Box for start_date and end_date on the same row */}
      <Box mt={2} display="flex" gap={2} flexWrap="wrap">
        <TextField
          label="Ngày bắt đầu dịch vụ"
          type="date"
          name="start_date"
          value={start_date}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 200, flex: 1 }}
        />
        <TextField
          label="Ngày kết thúc dịch vụ"
          type="date"
          name="end_date"
          value={end_date}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 200, flex: 1 }}
        />
      </Box>
      
      <Box mt={2}>
        <Typography variant="subtitle1" gutterBottom>Kế hoạch</Typography>
        <RadioGroup
          row
          name="plan"
          value={plan}
          onChange={handleChange}
          sx={{ gap: 2 }}
        >
          <FormControlLabel value="Lịch Định kỳ" control={<Radio />} label="Lịch Định kỳ" />
          <FormControlLabel value="1 lần" control={<Radio />} label="1 lần" />
        </RadioGroup>
      </Box>
      {plan === 'Lịch Định kỳ' && (
        <>
          <Box mt={2}>
            <Typography variant="subtitle1" gutterBottom>Ngày trong tuần</Typography>
            <FormGroup row sx={{ gap: 2 }}>
              {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'].map((day) => (
                <FormControlLabel
                  key={day}
                  control={
                    <Checkbox
                      checked={days_of_week.includes(day)}
                      onChange={handleChange}
                      name="days_of_week"
                      value={day}
                    />
                  }
                  label={day}
                />
              ))}
            </FormGroup>
          </Box>
          <Box mt={2}>
            <Typography variant="subtitle1" gutterBottom>Tần suất thực hiện dịch vụ</Typography>
            <RadioGroup
              row
              name="frequency"
              value={frequency}
              onChange={handleChange}
              sx={{ gap: 2 }}
            >
              <FormControlLabel value="Hàng tuần" control={<Radio />} label="Hàng tuần" />
              <FormControlLabel value="2 tuần/lần" control={<Radio />} label="2 tuần/lần" />
              <FormControlLabel value="Hàng tháng" control={<Radio />} label="Hàng tháng" />
            </RadioGroup>
          </Box>
        </>
      )}
      {/* Remaining date fields */}
      <Box mt={2} display="flex" gap={2} flexWrap="wrap">
        <TextField
          label={reportDateLabel}
          type="date"
          name="report_date"
          value={report_date}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          fullWidth
          sx={{ minWidth: 200 }}
        />
        {plan === 'Lịch Định kỳ' && (
          <FormControl fullWidth sx={{ minWidth: 200 }}>
            <InputLabel>Định kỳ báo cáo</InputLabel>
            <Select
              name="report_frequency"
              value={report_frequency}
              onChange={handleChange}
              label="Định kỳ báo cáo"
            >
              <MenuItem value="1 tuần/lần">1 tuần/lần</MenuItem>
              <MenuItem value="2 tuần/lần">2 tuần/lần</MenuItem>
              <MenuItem value="1 tháng/lần">1 tháng/lần</MenuItem>
            </Select>
          </FormControl>
        )}
      </Box>
    </Box>
  );
}
