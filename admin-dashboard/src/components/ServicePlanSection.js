import React from 'react';
import { Box, Typography, RadioGroup, FormControlLabel, Radio, FormGroup, Checkbox } from '@mui/material';

export default function ServicePlanSection({ formData, handleChange }) {
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
                  checked={formData.service_types.includes(type)}
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
      <Box>
        <Typography variant="subtitle1" gutterBottom>Kế hoạch</Typography>
        <RadioGroup
          row
          name="plan"
          value={formData.plan}
          onChange={handleChange}
          sx={{ gap: 2 }}
        >
          <FormControlLabel value="Lịch Định kỳ" control={<Radio />} label="Lịch Định kỳ" />
          <FormControlLabel value="1 lần" control={<Radio />} label="1 lần" />
        </RadioGroup>
      </Box>
      {formData.plan === 'Lịch Định kỳ' && (
        <>
          <Box mt={2}>
            <Typography variant="subtitle1" gutterBottom>Ngày trong tuần</Typography>
            <FormGroup row sx={{ gap: 2 }}>
              {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'].map((day) => (
                <FormControlLabel
                  key={day}
                  control={
                    <Checkbox
                      checked={formData.days_of_week.includes(day)}
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
            <Typography variant="subtitle1" gutterBottom>Tần suất</Typography>
            <RadioGroup
              row
              name="frequency"
              value={formData.frequency}
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
    </Box>
  );
}
