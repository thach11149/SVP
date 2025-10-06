import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Chip, 
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Divider, Box, Typography, ImageList, ImageListItem, ImageListItemBar
} from '@mui/material';
import { CheckCircle, Image } from '@mui/icons-material';
import { supabase } from '../../supabaseClient';

export default function JobDetailDialog({ 
  open, 
  onClose, 
  selectedJob, 
  checklistItems = [] 
}) {
  const [jobImages, setJobImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);

  // Reset images when dialog closes
  useEffect(() => {
    if (!open) {
      setJobImages([]);
    }
  }, [open]);

  // Fetch job images when selectedJob changes
  useEffect(() => {
    if (selectedJob?.id && open) {
      fetchJobImages(selectedJob.id);
    }
  }, [selectedJob?.id, open]);

  const fetchJobImages = async (jobId) => {
    try {
      setLoadingImages(true);
      
      // Fetch work reports for this job and their associated images
      const { data: reports, error: reportsError } = await supabase
        .from('work_reports')
        .select(`
          id,
          job_id,
          user_email,
          check_in_time,
          check_out_time,
          notes,
          job_report_images (
            id,
            image_url,
            created_at
          )
        `)
        .eq('job_id', jobId);

      if (reportsError) {
        console.error('Error fetching job reports:', reportsError);
        return;
      }

      // Extract all images from all reports
      const allImages = [];
      reports?.forEach(report => {
        if (report.job_report_images) {
          report.job_report_images.forEach(image => {
            allImages.push({
              ...image,
              reportId: report.id,
              reportDate: report.check_in_time || report.created_at,
              reportNotes: report.notes
            });
          });
        }
      });

      setJobImages(allImages);
    } catch (error) {
      console.error('Error fetching job images:', error);
    } finally {
      setLoadingImages(false);
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
      ModalProps={{ container: document.getElementById('root') }}
    >
      <DialogTitle>
        Chi tiết Công việc
      </DialogTitle>
      <DialogContent>
        {selectedJob && (
          <Box sx={{ pt: 2 }}>
            {/* Thông tin cơ bản - dạng bảng responsive */}
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, overflowX: 'auto' }}>
              <Table size="small" sx={{ display: { xs: 'block', sm: 'table' } }}>
                <TableBody>
                  {/* Hàng 1: Mã công việc | Trạng thái | Loại dịch vụ | Ngày tạo */}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, width: '15%' }}>Mã công việc</TableCell>
                    <TableCell sx={{ width: '35%' }}>{selectedJob.id}</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: '15%' }}>Trạng thái</TableCell>
                    <TableCell sx={{ width: '35%' }}>
                      <Chip 
                        label={selectedJob.status} 
                        size="small"
                        color={getStatusColor(selectedJob.status)}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Loại dịch vụ</TableCell>
                    <TableCell>
                      <Chip 
                        label={selectedJob.service_type} 
                        size="small"
                        color={selectedJob.service_type === 'SOS' ? 'error' : 'default'}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Ngày tạo</TableCell>
                    <TableCell>{formatDate(selectedJob.created_at)}</TableCell>
                  </TableRow>
                  {/* Hàng 2: Khách hàng | Liên hệ */}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Khách hàng</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {selectedJob.customers?.name || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Địa chỉ: {selectedJob.customers?.address || 'N/A'}, {selectedJob.customers?.ward_name || ''}, {selectedJob.customers?.district_name || ''}, {selectedJob.customers?.province_name || ''}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Liên hệ</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {selectedJob.customers?.primary_contact_name || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {selectedJob.customers?.primary_contact_phone || 'N/A'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  {/* Hàng 3: Nội dung công việc | Ngày thực hiện */}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Nội dung công việc</TableCell>
                    <TableCell colSpan={1}>{selectedJob.job_content}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Ngày thực hiện</TableCell>
                    <TableCell colSpan={1}>{formatDate(selectedJob.scheduled_date)}</TableCell>
                  </TableRow>
                  {/* Ghi chú nếu có */}
                  {selectedJob.notes && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Ghi chú</TableCell>
                      <TableCell colSpan={3}>{selectedJob.notes}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Người thực hiện */}
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
              👥 Người thực hiện
            </Typography>
            {getTechniciansDetails(selectedJob).length === 0 ? (
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                Chưa phân công
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {getTechniciansDetails(selectedJob).map((tech) => (
                  <Grid item xs={12} sm={6} key={tech.id}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: tech.isTeamLead ? 'primary.50' : 'background.paper' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body1" fontWeight={500}>
                          {tech.name} ({tech.tech_code})
                        </Typography>
                        {tech.isTeamLead && (
                          <Chip label="Team Lead" size="small" color="primary" />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        📧 {tech.email} | 📱 {tech.phone} | 💼 {tech.position}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Job Images Section */}
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
              📷 Hình ảnh Công việc ({jobImages.length} ảnh)
            </Typography>
            {loadingImages ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Đang tải hình ảnh...
                </Typography>
              </Box>
            ) : jobImages.length > 0 ? (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <ImageList sx={{ width: '100%', height: 'auto' }} cols={3} rowHeight={200}>
                  {jobImages.map((image, index) => (
                    <ImageListItem key={image.id} sx={{ borderRadius: 1, overflow: 'hidden' }}>
                      <img
                        src={image.image_url}
                        alt={`Ảnh công việc ${index + 1}`}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          cursor: 'pointer'
                        }}
                        onClick={() => window.open(image.image_url, '_blank')}
                      />
                      <ImageListItemBar
                        title={`Ảnh #${index + 1}`}
                        subtitle={
                          <Typography variant="caption">
                            {new Date(image.reportDate).toLocaleDateString('vi-VN')}
                            {image.reportNotes && ` - ${image.reportNotes.substring(0, 30)}...`}
                          </Typography>
                        }
                        sx={{
                          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                        }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              </Paper>
            ) : (
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Image sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Công việc này chưa có hình ảnh nào được upload
                  </Typography>
                </Box>
              </Paper>
            )}

            {/* Checklist Section */}
            {selectedJob.checklist && selectedJob.checklist.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
                  📋 Checklist Công việc ({getChecklistDetails(selectedJob.checklist).length} mục)
                </Typography>
                <Paper variant="outlined">
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Tên công việc</TableCell>
                          <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Số lượng</TableCell>
                          <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Đơn vị tính</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Ghi chú</TableCell>
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
              </>
            )}

            {(!selectedJob.checklist || selectedJob.checklist.length === 0) && (
              <>
                <Divider sx={{ my: 3 }} />
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    📋 Công việc này chưa có checklist được thiết lập
                  </Typography>
                </Paper>
              </>
            )}
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
