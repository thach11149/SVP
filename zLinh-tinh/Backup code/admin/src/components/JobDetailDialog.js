import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Chip, 
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Divider, Box, Typography
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

export default function JobDetailDialog({ 
  open, 
  onClose, 
  selectedJob, 
  checklistItems = [] 
}) {
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

  const getTechniciansDetails = (job) => {
    if (!job.job_assignments || job.job_assignments.length === 0) {
      return [];
    }
    
    const teamLeadId = job.team_lead_id;
    return job.job_assignments.map(assignment => {
      const tech = assignment.technicians;
      if (!tech) return null;
      
      return {
        id: tech.id,
        name: tech.name || 'N/A',
        tech_code: tech.tech_code || '',
        email: tech.email || 'N/A',
        phone: tech.phone || 'N/A',
        position: tech.position || 'N/A',
        isTeamLead: tech.id === teamLeadId
      };
    }).filter(Boolean);
  };

  const getChecklistDetails = (jobChecklist) => {
    if (!jobChecklist || !Array.isArray(jobChecklist) || jobChecklist.length === 0) {
      return [];
    }
    
    return jobChecklist.map(checklistValue => {
      // Handle both old format (simple strings) and new format (objects)
      if (typeof checklistValue === 'object' && checklistValue !== null) {
        // New format with quantity, unit, notes
        const checklistItem = checklistItems.find(item => item.value === checklistValue.value);
        return {
          value: checklistValue.value,
          label: checklistItem?.label || checklistValue.label || checklistValue.value,
          quantity: checklistValue.quantity || 1,
          unit: checklistValue.unit || checklistItem?.unit || 'cái',
          notes: checklistValue.notes || checklistItem?.notes || ''
        };
      } else {
        // Old format - simple string values
        const checklistItem = checklistItems.find(item => item.value === checklistValue);
        return {
          value: checklistValue,
          label: checklistItem?.label || checklistValue,
          quantity: 1, // Default quantity for old format
          unit: checklistItem?.unit || 'cái',
          notes: checklistItem?.notes || ''
        };
      }
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Chi tiết Công việc
      </DialogTitle>
      <DialogContent>
        {selectedJob && (
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Mã công việc:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedJob.id}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Trạng thái:
                </Typography>
                <Chip 
                  label={selectedJob.status} 
                  size="small"
                  color={getStatusColor(selectedJob.status)}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Nội dung công việc:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedJob.job_content}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Khách hàng:
                </Typography>
                <Typography variant="body1">
                  {selectedJob.customers?.name || 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  Mã KH: {selectedJob.customers?.customer_code || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Loại dịch vụ:
                </Typography>
                <Chip 
                  label={selectedJob.service_type} 
                  size="small"
                  color={selectedJob.service_type === 'SOS' ? 'error' : 'default'}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Ngày thực hiện:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {formatDate(selectedJob.scheduled_date)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  Người thực hiện:
                </Typography>
                {getTechniciansDetails(selectedJob).length === 0 ? (
                  <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic', color: 'text.secondary' }}>
                    Chưa phân công
                  </Typography>
                ) : (
                  <Box sx={{ mb: 2 }}>
                    {getTechniciansDetails(selectedJob).map((tech, index) => (
                      <Paper 
                        key={tech.id} 
                        variant="outlined" 
                        sx={{ p: 2, mb: 1, bgcolor: tech.isTeamLead ? 'primary.50' : 'background.paper' }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body1" fontWeight={500}>
                            {tech.name} ({tech.tech_code})
                          </Typography>
                          {tech.isTeamLead && (
                            <Chip 
                              label="Team Lead" 
                              size="small" 
                              color="primary" 
                              sx={{ fontSize: '0.75rem' }}
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          📧 Email: {tech.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          📱 SĐT: {tech.phone}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          💼 Chức vụ: {tech.position}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                )}
              </Grid>
              {selectedJob.notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ghi chú:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedJob.notes}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Ngày tạo:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {formatDate(selectedJob.created_at)}
                </Typography>
              </Grid>
              
              {/* Checklist Section */}
              {selectedJob.checklist && selectedJob.checklist.length > 0 && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
                    📋 Checklist Công việc ({getChecklistDetails(selectedJob.checklist).length} mục)
                  </Typography>
                  
                  {/* Checklist Table */}
                  <Box sx={{ width: '80%', mx: 'auto' }}>
                    <Paper variant="outlined" sx={{ mt: 2 }}>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                              <TableCell sx={{ fontWeight: 600, width: '40%' }}>Tên công việc</TableCell>
                              <TableCell sx={{ fontWeight: 600, width: '15%', textAlign: 'center' }}>Số lượng</TableCell>
                              <TableCell sx={{ fontWeight: 600, width: '15%', textAlign: 'center' }}>Đơn vị tính</TableCell>
                              <TableCell sx={{ fontWeight: 600, width: '30%' }}>Ghi chú</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {getChecklistDetails(selectedJob.checklist).map((item, index) => (
                              <TableRow key={index} hover>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircle color="primary" fontSize="small" />
                                    <Typography variant="body2" fontWeight={500}>
                                      {item.label}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="center">
                                  <Typography variant="body2" fontWeight={600} color="primary">
                                    {item.quantity}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Chip 
                                    label={item.unit} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ fontSize: '0.75rem' }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" color="text.secondary">
                                    {item.notes || '-'}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  </Box>
                </Grid>
              )}
              
              {(!selectedJob.checklist || selectedJob.checklist.length === 0) && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body2" color="text.secondary" align="center">
                      📋 Công việc này chưa có checklist được thiết lập
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
