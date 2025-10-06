import React from 'react';
import {
  Paper, Typography, Divider, TextField, Box, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Radio
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
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">Chọn</TableCell>
                <TableCell align="center">Team Lead</TableCell>
                <TableCell>Tên KTV</TableCell>
                <TableCell align="center">#Job Tuần</TableCell>
                <TableCell align="center">#Job Tháng</TableCell>
                <TableCell align="center">#Km Tuần</TableCell>
                <TableCell align="center">#Km Tháng</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTechnicians.map(tech => (
                <TableRow key={tech.id}>
                  <TableCell align="center">
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
                  </TableCell>
                  <TableCell align="center">
                    <Radio
                      checked={teamLead === tech.id}
                      onChange={e => {
                        if (e.target.checked) {
                          setTeamLead(tech.id);
                        } else {
                          setTeamLead('');
                        }
                      }}
                      disabled={!technicians.includes(tech.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography fontWeight={500}>{tech.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tech.tech_code} - {tech.position}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">0</TableCell> {/* Placeholder for #Job Tuần */}
                  <TableCell align="center">0</TableCell> {/* Placeholder for #Job Tháng */}
                  <TableCell align="center">0</TableCell> {/* Placeholder for #Km Tuần */}
                  <TableCell align="center">0</TableCell> {/* Placeholder for #Km Tháng */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
  );
};

export default TechnicianAssignment;