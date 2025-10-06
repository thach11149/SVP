import React from 'react';
import {
  Paper, Typography, Divider, Grid, Box, FormControlLabel, Checkbox, TextField, Button
} from '@mui/material';

const Checklist = ({
  checklistOptionsState,
  checklist,
  setChecklist,
  customChecklist,
  setCustomChecklist,
  handleAddChecklist,
  setOpenChecklistPopup
}) => {
  return (
    <Paper variant="outlined" sx={{ p: 3, mt: 4 }}>
      <Typography variant="h6" fontWeight={600} color="warning.main" gutterBottom>
        Nhóm 3: Checklist Công việc (Tùy chọn)
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        {/* Cột trái: Chọn checklist - Chiếm 60% */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant="subtitle1" gutterBottom>Chọn checklist:</Typography>
          <Box>
            {checklistOptionsState.map(opt => (
              <FormControlLabel
                key={opt.value}
                control={
                  <Checkbox
                    checked={checklist.includes(opt.value)}
                    onChange={e => {
                      if (e.target.checked) {
                        setChecklist([...checklist, opt.value]);
                      } else {
                        setChecklist(checklist.filter(v => v !== opt.value));
                      }
                    }}
                  />
                }
                label={opt.label}
                sx={{ display: 'block', mb: 0.5 }}  // Giảm margin bottom để gần nhau hơn
              />
            ))}
          </Box>
        </Grid>
        {/* Cột phải: Hiển thị kết quả đã chọn - Chiếm 40% */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Typography variant="subtitle1" gutterBottom>Đã chọn:</Typography>
          <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, minHeight: 100 }}>
            {checklist.length > 0 ? (
              checklistOptionsState
                .filter(opt => checklist.includes(opt.value))
                .map((opt, index) => (
                  <Typography key={opt.value} variant="body1">
                    {/* Đổi từ body2 thành body1 để size chữ to bằng */}
                    {index + 1}. {opt.label}
                  </Typography>
                ))
            ) : (
              <Typography variant="body1" color="text.secondary">
                {/* Đổi từ body2 thành body1 */}
                Chưa chọn checklist nào.
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <TextField
          label="Thêm mục checklist"
          value={customChecklist}
          onChange={e => setCustomChecklist(e.target.value)}
          size="small"
          sx={{ flexGrow: 1 }}
        />
        <Button variant="contained" onClick={handleAddChecklist}>Thêm mục</Button>
        <Button
          variant="outlined"
          onClick={() => setOpenChecklistPopup(true)}
        >
          Thêm nhiều
        </Button>
      </Box>
    </Paper>
  );
};

export default Checklist;