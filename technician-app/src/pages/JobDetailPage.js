// src/pages/JobDetailPage.js (Phiên bản HOÀN CHỈNH cuối cùng)

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Container, Box, Typography, CircularProgress, Button, Paper, Divider, Stack, TextField, Grid, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import moment from 'moment';

export default function JobDetailPage({ session }) {
  const { jobId } = useParams();
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State cho form tạo báo cáo mới
  const [reportNotes, setReportNotes] = useState('');
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dùng useCallback để tránh việc hàm bị tạo lại không cần thiết
  const fetchJobData = React.useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_job_details_with_reports', { job_id_input: Number(jobId) });

      if (error) throw error;
      setJobDetails(data);
    } catch (error) {
      console.error("Lỗi lấy chi tiết công việc:", error);
      alert('Lỗi lấy dữ liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (jobId) {
      fetchJobData();
    }
  }, [jobId, fetchJobData]);

  // THÊM LẠI CÁC HÀM XỬ LÝ NÚT BẤM
  const handleCheckIn = async () => {
    setIsSubmitting(true);
    const { error } = await supabase
      .from('jobs')
      .update({ status: 'Đang xử lý' }) // Chỉ cập nhật status, thời gian sẽ được ghi trong work_reports
      .eq('id', jobId);
    
    if (error) { alert('Lỗi khi check-in: ' + error.message); } 
    else {
      // Cập nhật lại UI và tạo một báo cáo trống với thời gian check-in
      await supabase.from('work_reports').insert([{ job_id: jobId, user_id: session.user.id, check_in_time: new Date() }]);
      fetchJobData(); // Tải lại toàn bộ dữ liệu để cập nhật
    }
    setIsSubmitting(false);
  };

  const handleCheckOut = async () => {
    // Tìm báo cáo gần nhất chưa check-out để cập nhật
    const lastReport = jobDetails.work_reports?.find(r => !r.check_out_time);
    if (!lastReport) {
      alert("Không tìm thấy phiên làm việc để check-out!");
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase
      .from('work_reports')
      .update({ check_out_time: new Date() })
      .eq('id', lastReport.id);
    
    if (error) { alert('Lỗi khi check-out: ' + error.message); }
    else {
      // Cập nhật trạng thái công việc chung
      await supabase.from('jobs').update({ status: 'Hoàn thành' }).eq('id', jobId);
      fetchJobData(); // Tải lại toàn bộ dữ liệu
    }
    setIsSubmitting(false);
  };

  const handleFileChange = (e) => { setSelectedFiles(e.target.files); };

  const handleSaveReport = async () => {
    if (!reportNotes && !selectedFiles) {
      alert('Vui lòng nhập ghi chú hoặc chọn ảnh.');
      return;
    }
    setIsSubmitting(true);
    try {
      // Tìm báo cáo gần nhất để thêm ghi chú/ảnh
      const lastReport = jobDetails.work_reports?.find(r => r.id);
      if(!lastReport) {
          alert("Bạn cần Check-in trước khi lưu báo cáo!");
          setIsSubmitting(false);
          return;
      }

      // Cập nhật ghi chú cho báo cáo gần nhất
      const { error: notesError } = await supabase.from('work_reports').update({ notes: reportNotes }).eq('id', lastReport.id);
      if (notesError) throw notesError;

      // Upload ảnh và gắn vào báo cáo gần nhất
      if (selectedFiles) {
        for (const file of Array.from(selectedFiles)) {
          const filePath = `${jobId}/${lastReport.id}/${Date.now()}-${file.name}`;
          await supabase.storage.from('report-images').upload(filePath, file);
          const { data: { publicUrl } } = supabase.storage.from('report-images').getPublicUrl(filePath);
          await supabase.from('job_report_images').insert([{ report_id: lastReport.id, image_url: publicUrl }]);
        }
      }
      alert('Lưu báo cáo thành công!');
      fetchJobData(); // Tải lại dữ liệu
      setReportNotes('');
      setSelectedFiles(null);
    } catch (error) {
      alert('Lỗi khi lưu báo cáo: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteImage = async (imageToDelete) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hình ảnh này không?')) return;
    try {
      const filePath = imageToDelete.image_url.split('/report-images/')[1];
      await supabase.storage.from('report-images').remove([filePath]);
      await supabase.from('job_report_images').delete().eq('id', imageToDelete.id);
      fetchJobData(); // Tải lại dữ liệu sau khi xóa
      alert('Đã xóa hình ảnh thành công.');
    } catch (error) {
      alert('Lỗi khi xóa hình ảnh: ' + error.message);
    }
  };

  if (loading) { return <Container><Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box></Container>; }
  if (!jobDetails) { return <Container><Typography>Không tìm thấy công việc.</Typography></Container>; }

  const latestReport = jobDetails.work_reports?.[0]; // Lấy báo cáo gần nhất (do đã sắp xếp)

  return (
    <Container maxWidth="md" sx={{ mt: 2, mb: 4 }}>
      <Button component={Link} to="/" startIcon={<ArrowBackIcon />}>Quay lại danh sách</Button>
      <Paper sx={{ p: { xs: 2, md: 3 }, mt: 2, mb: 4 }}>
        <Typography variant="h4" gutterBottom>{jobDetails.customers?.name}</Typography>
        <Typography variant="h6" color="text.secondary">{moment(jobDetails.scheduled_date).format('dddd, DD/MM/YYYY, h:mm a')}</Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body1"><strong>Địa chỉ:</strong> {jobDetails.customers?.address}</Typography>
        <Typography variant="body1"><strong>Mô tả:</strong> {jobDetails.job_description}</Typography>
        <Typography variant="body1"><strong>Trạng thái:</strong> {jobDetails.status}</Typography>
      </Paper>

      {/* Check-in/Check-out Actions */}
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Hành động</Typography>
        <Stack direction="row" spacing={2}>
            {/* Chỉ hiện nút Check-in khi không có phiên làm việc nào đang mở */}
            {(!latestReport || latestReport.check_out_time) && (
                <Button variant="contained" color="primary" onClick={handleCheckIn} disabled={isSubmitting}>Check-in</Button>
            )}
            {/* Chỉ hiện nút Check-out khi có phiên làm việc đang mở (đã checkin, chưa checkout) */}
            {latestReport && !latestReport.check_out_time && (
                <Button variant="contained" color="secondary" onClick={handleCheckOut} disabled={isSubmitting}>Check-out</Button>
            )}
        </Stack>
      </Paper>
      
      {/* Report Form - Chỉ hiện khi đã check-in */}
      {latestReport && !latestReport.check_out_time && (
        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
            <Typography variant="h5" gutterBottom>Cập nhật Báo cáo</Typography>
            <Box>
                <TextField label="Ghi chú tại hiện trường" multiline rows={4} fullWidth variant="outlined" value={reportNotes} onChange={(e) => setReportNotes(e.target.value)} sx={{ mb: 2 }} />
                <Button variant="contained" component="label" sx={{ mb: 2 }}>Chọn Ảnh</Button>
                <input type="file" hidden multiple onChange={handleFileChange} />
                {selectedFiles && <Typography variant="body2" sx={{ mb: 2 }}>Đã chọn: {selectedFiles.length} ảnh</Typography>}
                <Button variant="contained" color="success" fullWidth onClick={handleSaveReport} disabled={isSubmitting}>
                    {isSubmitting ? 'Đang lưu...' : 'Lưu Báo cáo'}
                </Button>
            </Box>
        </Paper>
      )}

      {/* Historical Reports */}
      <Typography variant="h5" gutterBottom>Lịch sử Báo cáo</Typography>
      {jobDetails.work_reports && jobDetails.work_reports.length > 0 ? (
        <Stack spacing={2}>
          {jobDetails.work_reports.map(report => (
            <Paper key={report.id} sx={{ p: 2 }}>
              <Typography variant="subtitle1"><strong>Báo cáo ngày:</strong> {moment(report.created_at).format('DD/MM/YYYY h:mm a')}</Typography>
              <Typography variant="subtitle2" color="text.secondary" sx={{mb: 1}}>
                <strong>Thực hiện bởi:</strong> {report.user_email} 
                {report.check_in_time && ` - <strong>Check-in:</strong> ${moment(report.check_in_time).format('h:mm a')}`}
                {report.check_out_time && ` - <strong>Check-out:</strong> ${moment(report.check_out_time).format('h:mm a')}`}
              </Typography>
              <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}><strong>Ghi chú:</strong> {report.notes}</Typography>
              {report.images && report.images.length > 0 && (
                 <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{fontWeight: 'bold'}}>Hình ảnh đính kèm:</Typography>
                    <Grid container spacing={1} sx={{mt: 1}}>
                      {report.images.map(image => (
                        <Grid item xs={4} sm={3} key={image.id}>
                           <Box sx={{ position: 'relative' }}>
                            <img src={image.image_url} alt="report" style={{ width: '100%', borderRadius: '4px' }} />
                            <IconButton aria-label="delete" onClick={() => handleDeleteImage(image)} size="small" sx={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(255, 255, 255, 0.7)', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)'}}}>
                              <DeleteIcon fontSize="inherit" />
                            </IconButton>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                 </Box>
              )}
            </Paper>
          ))}
        </Stack>
      ) : (
        <Typography>Chưa có báo cáo nào cho công việc này.</Typography>
      )}
    </Container>
  );
}