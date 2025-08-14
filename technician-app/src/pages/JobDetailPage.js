// src/pages/JobDetailPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
  Container, Box, Typography, CircularProgress, Button, Paper, Divider,
  Stack, TextField, Grid, IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import moment from 'moment';

export default function JobDetailPage({ session }) {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname + location.state?.from?.search || '/jobs';

  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportNotes, setReportNotes] = useState('');
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchJobData = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_job_details_with_reports', { job_id_input: Number(jobId) });
      if (error) throw error;
      setJobDetails(Array.isArray(data) ? data[0] || null : data || null);
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

  const handleCheckIn = async () => {
    setIsSubmitting(true);
    try {
      await supabase.from('jobs').update({ status: 'Đang xử lý' }).eq('id', jobId);
      await supabase.from('work_reports').insert([{
        job_id: jobId,
        user_id: session.user.id,
        check_in_time: new Date(),
        user_email: session.user.email,
      }]);
      fetchJobData();
    } catch (error) {
      alert('Lỗi khi check-in: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    const lastReport = jobDetails.work_reports?.find(r => !r.check_out_time);
    if (!lastReport) return alert("Không tìm thấy phiên làm việc để check-out!");

    setIsSubmitting(true);
    try {
      await supabase.from('work_reports').update({ check_out_time: new Date() }).eq('id', lastReport.id);
      await supabase.from('jobs').update({ status: 'Hoàn thành', completed: true }).eq('id', jobId);
      fetchJobData();
    } catch (error) {
      alert('Lỗi khi check-out: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => setSelectedFiles(e.target.files);

  const handleSaveReport = async () => {
    if (!reportNotes && (!selectedFiles || selectedFiles.length === 0)) {
      return alert('Vui lòng nhập ghi chú hoặc chọn ảnh.');
    }

    setIsSubmitting(true);
    try {
      const lastReport = jobDetails.work_reports?.find(r => r.id);
      if (!lastReport) {
        alert("Bạn cần Check-in trước khi lưu báo cáo!");
        return;
      }

      await supabase.from('work_reports').update({ notes: reportNotes }).eq('id', lastReport.id);

      if (selectedFiles && selectedFiles.length > 0) {
        for (const file of Array.from(selectedFiles)) {
          const filePath = `${jobId}/${lastReport.id}/${Date.now()}-${file.name}`;
          await supabase.storage.from('report-images').upload(filePath, file, { cacheControl: '3600', upsert: false });
          const { data: { publicUrl } } = supabase.storage.from('report-images').getPublicUrl(filePath);
          await supabase.from('job_report_images').insert([{ report_id: lastReport.id, image_url: publicUrl }]);
        }
      }

      alert('Lưu báo cáo thành công!');
      fetchJobData();
      setReportNotes('');
      setSelectedFiles(null);
    } catch (error) {
      alert('Lỗi khi lưu báo cáo: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteImage = async (image) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hình ảnh này không?')) return;
    try {
      const filePath = image.image_url.split('/report-images/')[1];
      await supabase.storage.from('report-images').remove([filePath]);
      await supabase.from('job_report_images').delete().eq('id', image.id);
      fetchJobData();
      alert('Đã xóa hình ảnh thành công.');
    } catch (error) {
      alert('Lỗi khi xóa hình ảnh: ' + error.message);
    }
  };

  if (loading) return <Container><Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box></Container>;
  if (!jobDetails) return <Container><Typography>Không tìm thấy công việc.</Typography></Container>;

  const sortedReports = jobDetails.work_reports?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const latestReport = sortedReports?.[0];

  return (
    <Container maxWidth="md" sx={{ mt: 2, mb: 4 }}>
      <Button onClick={() => navigate(from)} startIcon={<ArrowBackIcon />}>
        Quay lại danh sách
      </Button>

      <Paper sx={{ p: { xs: 2, md: 3 }, mt: 2, mb: 4 }}>
        <Typography variant="h4" gutterBottom>{jobDetails.customers?.name}</Typography>
        <Typography variant="h6" color="text.secondary">
          {moment(jobDetails.scheduled_date).format('dddd, DD/MM/YYYY, h:mm a')}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body1"><strong>Địa chỉ:</strong> {jobDetails.customers?.address}</Typography>
        <Typography variant="body1"><strong>Mô tả:</strong> {jobDetails.job_description}</Typography>
        <Typography variant="body1"><strong>Trạng thái:</strong> {jobDetails.status}</Typography>
      </Paper>

      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Hành động</Typography>
        <Stack direction="row" spacing={2}>
          {(!latestReport || latestReport.check_out_time) && (
            <Button variant="contained" onClick={handleCheckIn} disabled={isSubmitting}>Check-in</Button>
          )}
          {latestReport && !latestReport.check_out_time && (
            <Button variant="contained" color="secondary" onClick={handleCheckOut} disabled={isSubmitting}>Check-out</Button>
          )}
        </Stack>
      </Paper>

      {latestReport && !latestReport.check_out_time && (
        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
          <Typography variant="h5" gutterBottom>Cập nhật Báo cáo</Typography>
          <Box>
            <TextField label="Ghi chú tại hiện trường" multiline rows={4} fullWidth variant="outlined"
              value={reportNotes} onChange={(e) => setReportNotes(e.target.value)} sx={{ mb: 2 }} />
            <Button variant="contained" component="label" sx={{ mb: 2 }}>Chọn Ảnh
              <input type="file" hidden multiple onChange={handleFileChange} />
            </Button>
            {selectedFiles && <Typography variant="body2" sx={{ mb: 2 }}>Đã chọn: {selectedFiles.length} ảnh</Typography>}
            <Button variant="contained" color="success" fullWidth onClick={handleSaveReport} disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Lưu Báo cáo'}
            </Button>
          </Box>
        </Paper>
      )}

      <Typography variant="h5" gutterBottom>Lịch sử Báo cáo</Typography>
      {jobDetails.work_reports?.length > 0 ? (
        <Stack spacing={2}>
          {sortedReports.map(report => (
            <Paper key={report.id} sx={{ p: 2 }}>
              <Typography variant="subtitle1"><strong>Báo cáo ngày:</strong> {moment(report.created_at).format('DD/MM/YYYY h:mm a')}</Typography>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Thực hiện bởi:</strong> {report.user_email || 'N/A'}
                {report.check_in_time && ` - Check-in: ${moment(report.check_in_time).format('h:mm a')}`}
                {report.check_out_time && ` - Check-out: ${moment(report.check_out_time).format('h:mm a')}`}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                <strong>Ghi chú:</strong> {report.notes || 'Không có ghi chú'}
              </Typography>
              {report.images?.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Hình ảnh đính kèm:</Typography>
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    {report.images.map(image => (
                      <Grid item xs={4} sm={3} key={image.id}>
                        <Box sx={{ position: 'relative' }}>
                          <img src={image.image_url} alt="report" style={{ width: '100%', borderRadius: '4px', display: 'block' }} />
                          <IconButton aria-label="delete" onClick={() => handleDeleteImage(image)} size="small"
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              backgroundColor: 'rgba(255, 255, 255, 0.7)',
                              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
                            }}>
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
