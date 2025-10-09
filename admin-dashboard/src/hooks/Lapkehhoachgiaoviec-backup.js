// src/pages/TestPage.js - Improved Job Scheduling Interface

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, TextField, Select, MenuItem, FormControl, InputLabel,
  Button, Paper, Chip, Alert, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, ListItemButton, IconButton, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { supabase } from '../supabaseClient';

const KTV_LIST = [
  { id: 1, name: "Nguyễn Văn A (Đội 1)", color: '#e3f2fd' },
  { id: 2, name: "Trần Thị B (Đội 1)", color: '#f3e5f5' },
  { id: 3, name: "Lê Văn C (Đội 2)", color: '#e8f5e8' },
  { id: 4, name: "Phạm Thị D (Đội 2)", color: '#fff3e0' },
];

const generateContractJobs = (clientName, startDate, endDate, targetDayOfWeek, frequencyWeeks) => {
  const jobs = [];
  const currentDate = new Date(startDate);
  const end = new Date(endDate);
  const targetDay = parseInt(targetDayOfWeek);
  const frequency = parseInt(frequencyWeeks) * 7;

  // Move to first execution day
  while (currentDate.getDay() + 1 !== targetDay && currentDate <= end) {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Generate jobs
  while (currentDate <= end) {
    if (currentDate >= startDate) {
      jobs.push({
        id: Date.now() + Math.random(),
        clientName,
        date: new Date(currentDate),
        status: 'unassigned',
        assignedTechs: [],
        startTime: '08:00',
        endTime: '10:00',
        isDeleted: false,
        deleteNote: ''
      });
    }
    currentDate.setDate(currentDate.getDate() + frequency);
  }

  return jobs;
};

export default function TestPage() {
  const [formData, setFormData] = useState({
    clientName: 'Mega Mall',
    startDate: new Date('2025-10-05'),
    endDate: new Date('2026-03-30'),
    targetDayOfWeek: '7', // Chủ Nhật
    frequencyWeeks: '2',
    reportDate: new Date('2025-10-10')
  });

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          id, name, address, province_name,
          customer_sites_plans (
            service_types, plan, days_of_week, frequency, start_date, end_date, report_date, report_frequency
          )
        `);

      if (error) {
        console.error('Error fetching services:', error);
      } else {
        setServices(data || []);
        // Auto generate jobs from services
        const generatedJobs = [];
        data.forEach(customer => {
          customer.customer_sites_plans?.forEach(plan => {
            if (plan.days_of_week && plan.frequency && plan.start_date && plan.end_date) {
              plan.days_of_week.forEach(day => {
                const jobsForDay = generateContractJobs(
                  customer.name,
                  new Date(plan.start_date),
                  new Date(plan.end_date),
                  day.toString(),
                  plan.frequency.toString()
                );
                generatedJobs.push(...jobsForDay);
              });
            }
          });
        });
        setJobs(generatedJobs);
      }
    };

    fetchServices();
  }, []);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateJobs = () => {
    const newJobs = generateContractJobs(
      formData.clientName,
      formData.startDate,
      formData.endDate,
      formData.targetDayOfWeek,
      formData.frequencyWeeks
    );
    setJobs(newJobs);
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setAssignDialogOpen(true);
  };

  const handleAssignTech = (techId, startTime, endTime) => {
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === selectedJob.id
          ? {
              ...job,
              assignedTechs: [...job.assignedTechs, { techId, startTime, endTime }],
              status: 'assigned'
            }
          : job
      )
    );
    setAssignDialogOpen(false);
  };

  const handleDeleteJob = (jobId) => {
    const note = prompt('Lý do xóa công việc:');
    if (note) {
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job.id === jobId
            ? { ...job, isDeleted: true, deleteNote: note }
            : job
        )
      );
    }
  };

  // Group jobs by date for display
  const groupedJobs = jobs.reduce((acc, job) => {
    const dateKey = job.date.toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(job);
    return acc;
  }, {});

  const deletedJobs = jobs.filter(job => job.isDeleted);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Lập Kế Hoạch Giao Việc - Giao Diện Cải Tiến
      </Typography>

      {/* Form Input */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Thông Tin Hợp Đồng</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tên Khách Hàng"
              value={formData.clientName}
              onChange={(e) => handleFormChange('clientName', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Ngày Bắt Đầu"
              type="date"
              value={formData.startDate.toISOString().split('T')[0]}
              onChange={(e) => handleFormChange('startDate', new Date(e.target.value))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Ngày Kết Thúc"
              type="date"
              value={formData.endDate.toISOString().split('T')[0]}
              onChange={(e) => handleFormChange('endDate', new Date(e.target.value))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Ngày Thực Hiện</InputLabel>
              <Select
                value={formData.targetDayOfWeek}
                onChange={(e) => handleFormChange('targetDayOfWeek', e.target.value)}
              >
                <MenuItem value="1">Chủ Nhật</MenuItem>
                <MenuItem value="2">Thứ Hai</MenuItem>
                <MenuItem value="3">Thứ Ba</MenuItem>
                <MenuItem value="4">Thứ Tư</MenuItem>
                <MenuItem value="5">Thứ Năm</MenuItem>
                <MenuItem value="6">Thứ Sáu</MenuItem>
                <MenuItem value="7">Thứ Bảy</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Tần Suất (tuần)</InputLabel>
              <Select
                value={formData.frequencyWeeks}
                onChange={(e) => handleFormChange('frequencyWeeks', e.target.value)}
              >
                <MenuItem value="1">1 tuần</MenuItem>
                <MenuItem value="2">2 tuần</MenuItem>
                <MenuItem value="4">4 tuần</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Ngày Báo Cáo"
              type="date"
              value={formData.reportDate.toISOString().split('T')[0]}
              onChange={(e) => handleFormChange('reportDate', new Date(e.target.value))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button variant="contained" onClick={handleGenerateJobs} fullWidth>
              Tạo Lịch Công Việc
            </Button>
          </Grid>
        </Grid>
      </Paper>

        {/* Job Calendar */}
        <Typography variant="h6" gutterBottom>Danh Sách Công Việc</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ngày</TableCell>
                <TableCell>Khách Hàng</TableCell>
                <TableCell>Trạng Thái</TableCell>
                <TableCell>Nhân Viên Phân Bổ</TableCell>
                <TableCell>Ghi Chú</TableCell>
                <TableCell>Thao Tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(groupedJobs).map(([dateKey, dayJobs]) => (
                <React.Fragment key={dateKey}>
                  {dayJobs
                    .sort((a, b) => {
                      if (a.isDeleted && !b.isDeleted) return 1;
                      if (!a.isDeleted && b.isDeleted) return -1;
                      if (a.status === 'unassigned' && b.status === 'assigned') return 1;
                      if (a.status === 'assigned' && b.status === 'unassigned') return -1;
                      return a.startTime.localeCompare(b.startTime);
                    })
                    .map((job, index) => (
                    <TableRow key={job.id} sx={{ bgcolor: job.status === 'unassigned' ? 'grey.100' : 'success.light' }}>
                      <TableCell>
                        {index === 0 && new Date(dateKey).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>{job.clientName}</TableCell>
                      <TableCell>
                        <Chip
                          label={job.status === 'unassigned' ? 'Chưa Phân Bổ' : 'Đã Phân Bổ'}
                          color={job.status === 'unassigned' ? 'default' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {job.assignedTechs.map((tech, idx) => {
                          const techInfo = KTV_LIST.find(t => t.id === tech.techId);
                          return (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <Chip
                                label={`${techInfo?.name} (${tech.startTime}-${tech.endTime})`}
                                sx={{ bgcolor: techInfo?.color, mr: 1, textDecoration: job.isDeleted ? 'line-through' : 'none' }}
                                size="small"
                              />
                            </Box>
                          );
                        })}
                      </TableCell>
                      <TableCell sx={{ textDecoration: job.isDeleted ? 'line-through' : 'none' }}>
                        {job.deleteNote}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<PersonAddIcon />}
                          onClick={() => handleJobClick(job)}
                          disabled={job.isDeleted}
                        >
                          Thêm NV
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={job.isDeleted}
                          sx={{ ml: 1 }}
                        >
                          Xóa
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {deletedJobs.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Công Việc Đã Xóa
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ngày</TableCell>
                    <TableCell>Khách Hàng</TableCell>
                    <TableCell>Trạng Thái</TableCell>
                    <TableCell>Nhân Viên Phân Bổ</TableCell>
                    <TableCell>Ghi Chú</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deletedJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>{job.date.toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell sx={{ textDecoration: 'line-through' }}>{job.clientName}</TableCell>
                      <TableCell>
                        <Chip
                          label={job.status === 'unassigned' ? 'Chưa Phân Bổ' : 'Đã Phân Bổ'}
                          color={job.status === 'unassigned' ? 'default' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {job.assignedTechs.map((tech, idx) => {
                          const techInfo = KTV_LIST.find(t => t.id === tech.techId);
                          return (
                            <Chip
                              key={idx}
                              label={`${techInfo?.name} (${tech.startTime}-${tech.endTime})`}
                              sx={{ bgcolor: techInfo?.color, mr: 1, textDecoration: 'line-through' }}
                              size="small"
                            />
                          );
                        })}
                      </TableCell>
                      <TableCell sx={{ textDecoration: 'line-through' }}>{job.deleteNote}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* Assignment Dialog */}
        <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Phân Bổ Nhân Viên</DialogTitle>
          <DialogContent>
            {selectedJob && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Công Việc: {selectedJob.clientName} - {selectedJob.date.toLocaleDateString('vi-VN')}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Chọn nhân viên và thời gian thực hiện
                </Typography>
                <List>
                  {KTV_LIST.map((tech) => (
                    <ListItem key={tech.id} disablePadding>
                      <ListItemButton onClick={() => {
                        const startTime = prompt('Giờ bắt đầu (HH:MM):', '08:00') || '08:00';
                        const endTime = prompt('Giờ kết thúc (HH:MM):', '10:00') || '10:00';
                        handleAssignTech(tech.techId, startTime, endTime);
                      }}>
                        <ListItemText primary={tech.name} />
                        <AddIcon />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssignDialogOpen(false)}>Đóng</Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
}