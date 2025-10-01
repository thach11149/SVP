import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton, TextField, InputAdornment,
  MenuItem, Select, FormControl, InputLabel, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Snackbar, Alert
} from '@mui/material';
import { Search, Visibility, Edit, Delete, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import JobFormDialog from '../components/JobFormDialog';
import JobDetailDialog from '../components/JobDetailDialog';

export default function DanhSachCongViec({ session }) {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [technicianFilter, setTechnicianFilter] = useState('');
  const [technicians, setTechnicians] = useState([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [checklistItems, setChecklistItems] = useState([]);
  
  // Edit dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editJobData, setEditJobData] = useState(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching jobs...');
      
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id,
          job_content,
          service_type,
          scheduled_date,
          status,
          notes,
          created_at,
          checklist,
          team_lead_id,
          customers (
            id,
            name,
            customer_code,
            address,
            ward_name,
            district_name,
            province_name,
            primary_contact_name,
            primary_contact_phone
          ),
          job_assignments (
            technicians (
              id,
              name,
              tech_code,
              email,
              phone,
              position
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        throw error;
      }
      
      console.log('Jobs fetched successfully:', data?.length || 0, data);
      setJobs(data || []);
    } catch (error) {
      console.error('Error in fetchJobs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchChecklistItems();
    fetchTechnicians();
  }, [fetchJobs]);

  const fetchTechnicians = async () => {
    try {
      const { data, error } = await supabase
        .from('technicians')
        .select('id, name, tech_code')
        .eq('active', true)
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching technicians:', error);
      } else {
        setTechnicians(data || []);
      }
    } catch (error) {
      console.error('Error in fetchTechnicians:', error);
    }
  };

  const fetchChecklistItems = async () => {
    try {
      const { data, error } = await supabase
        .from('checklist')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching checklist items:', error);
      } else {
        setChecklistItems(data || []);
      }
    } catch (error) {
      console.error('Error in fetchChecklistItems:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Mới tạo': return 'info';
      case 'Đang thực hiện': return 'warning';
      case 'Hoàn thành': return 'success';
      case 'Hủy': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTechniciansNames = (job) => {
    if (!job.job_assignments || job.job_assignments.length === 0) {
      return 'Chưa phân công';
    }
    
    const teamLeadId = job.team_lead_id;
    const techniciansNames = job.job_assignments
      .map(assignment => {
        const techName = assignment.technicians?.name || 'N/A';
        const techId = assignment.technicians?.id;
        const isTeamLead = techId === teamLeadId;
        return isTeamLead ? `${techName} (Team Lead)` : techName;
      })
      .join(', ');
    
    return techniciansNames;
  };

  // Handle view job details
  const handleViewJob = (job) => {
    setSelectedJob(job);
    setViewDialogOpen(true);
  };

  // Handle edit job
  const handleEditJob = (job) => {
    setEditJobData(job);
    setEditDialogOpen(true);
  };

  // Handle save after edit
  const handleSaveJob = () => {
    fetchJobs(); // Refresh jobs list
    setEditDialogOpen(false);
    setEditJobData(null);
  };

  // Handle delete job
  const handleDeleteJob = (job) => {
    setJobToDelete(job);
    setDeleteDialogOpen(true);
  };

  // Confirm delete job
  const confirmDeleteJob = async () => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobToDelete.id);

      if (error) throw error;

      setJobs(jobs.filter(job => job.id !== jobToDelete.id));
      setSnackbar({
        open: true,
        message: 'Xóa công việc thành công',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting job:', error);
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi xóa công việc',
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.job_content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customers?.customer_code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || job.status === statusFilter;
    
    const matchesTechnician = !technicianFilter || 
      (job.job_assignments && job.job_assignments.some(
        assignment => assignment.technicians?.id === technicianFilter
      ));
    
    return matchesSearch && matchesStatus && matchesTechnician;
  });

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Đang tải danh sách công việc...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: '#f5f6fa', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 2, sm: 4 }, borderRadius: 4 }}>
        <Box mb={4}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Danh sách Công việc
          </Typography>
          <Typography color="text.secondary">
            Quản lý và theo dõi tất cả các công việc đã được tạo.
          </Typography>
        </Box>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo nội dung công việc, tên khách hàng, mã khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Lọc theo trạng thái</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Lọc theo trạng thái"
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="Mới tạo">Mới tạo</MenuItem>
                <MenuItem value="Đang thực hiện">Đang thực hiện</MenuItem>
                <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
                <MenuItem value="Hủy">Hủy</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Lọc theo nhân viên</InputLabel>
              <Select
                value={technicianFilter}
                onChange={(e) => setTechnicianFilter(e.target.value)}
                label="Lọc theo nhân viên"
              >
                <MenuItem value="">Tất cả nhân viên</MenuItem>
                {technicians.map(tech => (
                  <MenuItem key={tech.id} value={tech.id}>
                    {tech.name} ({tech.tech_code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/lap-ke-hoach-cong-viec')}
              fullWidth
              sx={{ 
                height: '56px',
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              Thêm công việc
            </Button>
          </Grid>
        </Grid>

        {/* Results count */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Hiển thị {filteredJobs.length} / {jobs.length} công việc
            {technicianFilter && (
              <span style={{ marginLeft: '10px', fontWeight: 500, color: '#1976d2' }}>
                (Nhân viên: {technicians.find(t => t.id === technicianFilter)?.name || 'N/A'})
              </span>
            )}
          </Typography>
        </Box>

        {/* Jobs Table */}
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><strong>Mã CV</strong></TableCell>
                <TableCell><strong>Nội dung công việc</strong></TableCell>
                <TableCell><strong>Khách hàng</strong></TableCell>
                <TableCell><strong>Loại dịch vụ</strong></TableCell>
                <TableCell><strong>Ngày thực hiện</strong></TableCell>
                <TableCell><strong>Người thực hiện</strong></TableCell>
                <TableCell><strong>Trạng thái</strong></TableCell>
                <TableCell align="center"><strong>Thao tác</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {String(job.id).slice(0, 8)}...
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ 
                      maxWidth: 200, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {job.job_content}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {job.customers?.name || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {job.customers?.customer_code || ''}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={job.service_type} 
                      size="small"
                      color={job.service_type === 'SOS' ? 'error' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(job.scheduled_date)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ 
                      maxWidth: 150, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {getTechniciansNames(job)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={job.status} 
                      size="small"
                      color={getStatusColor(job.status)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleViewJob(job)}
                      title="Xem chi tiết"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="warning"
                      onClick={() => handleEditJob(job)}
                      title="Chỉnh sửa"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteJob(job)}
                      title="Xóa"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredJobs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      {jobs.length === 0 
                        ? 'Chưa có công việc nào được tạo. Hãy tạo công việc đầu tiên từ trang "Lập kế hoạch công việc".' 
                        : 'Không tìm thấy công việc nào phù hợp với bộ lọc.'
                      }
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Job Detail Dialog */}
        <JobDetailDialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          selectedJob={selectedJob}
          checklistItems={checklistItems}
        />

        {/* Job Form Dialog - Used for editing */}
        <JobFormDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setEditJobData(null);
          }}
          onSave={handleSaveJob}
          editJob={editJobData}
          session={session}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>
            Xác nhận xóa công việc
          </DialogTitle>
          <DialogContent>
            <Typography>
              Bạn có chắc chắn muốn xóa công việc này không? Hành động này không thể hoàn tác.
            </Typography>
            {jobToDelete && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2">
                  Mã CV: {jobToDelete.id}
                </Typography>
                <Typography variant="body2">
                  Nội dung: {jobToDelete.job_content}
                </Typography>
                <Typography variant="body2">
                  Khách hàng: {jobToDelete.customers?.name || 'N/A'}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button 
              onClick={confirmDeleteJob} 
              color="error" 
              variant="contained"
            >
              Xóa
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
}
