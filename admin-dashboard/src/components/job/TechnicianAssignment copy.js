import React from 'react';
import {
  Paper, Typography, Divider, TextField, Box, FormControlLabel, Checkbox
} from '@mui/material';

const TechnicianAssignment = ({
  searchTech,
  setSearchTech,
  technicians,
  setTechnicians,
  teamLead,
  setTeamLead,
  techniciansData
}) => {
  const filteredTechnicians = techniciansData.filter(
    tech => {
      if (!searchTech) return true;
      const searchTerm = searchTech.toLowerCase();
      return (
        tech.name.toLowerCase().includes(searchTerm) ||
        (tech.tech_code && tech.tech_code.toLowerCase().includes(searchTerm)) ||
        tech.id.toString().toLowerCase().includes(searchTerm)
      );
    }
  );

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={600} color="secondary" gutterBottom>
        Nhóm 4: Phân công Nhân viên
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <TextField
        label="Tìm kiếm nhân viên"
        value={searchTech}
        onChange={e => setSearchTech(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        placeholder="Nhập tên hoặc mã nhân viên..."
      />
      <Box>
        {filteredTechnicians.map(tech => (
          <Box key={tech.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={technicians.includes(tech.id)}
                  onChange={e => {
                    if (e.target.checked) {
                      // Nếu là người đầu tiên được chọn, tự động set làm lead
                      if (technicians.length === 0) {
                        setTeamLead(tech.id);
                      }
                      setTechnicians([...technicians, tech.id]);
                    } else {
                      setTechnicians(technicians.filter(id => id !== tech.id));
                      // Nếu bỏ chọn lead, reset teamLead
                      if (teamLead === tech.id) {
                        setTeamLead('');
                      }
                    }
                  }}
                />
              }
              label={
                <Box>
                  <Typography fontWeight={500}>{tech.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tech.tech_code} - {tech.position}
                  </Typography>
                </Box>
              }
              sx={{ mb: 1 }}
            />
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default TechnicianAssignment;