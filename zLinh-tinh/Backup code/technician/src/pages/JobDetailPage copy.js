// src/pages/JobDetailPage.js (Phiên bản có thêm chức năng Xóa ảnh)

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Container, Box, Typography, CircularProgress, Button, Paper, Divider, Stack, TextField, Grid, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete'; // Import icon thùng rác
import moment from 'moment';

export default function JobDetailPage({ session }) {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportNotes, setReportNotes] = useState('');
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);

  useEffect(() => {
    async function fetchJobDetail() {
      try {
        setLoading(true);
        const { data: jobData, error: jobError } = await supabase.from('jobs').select(`*, customers(*)`).eq('id', jobId).single();
        if (jobError) throw jobError;
        setJob(jobData);
        setReportNotes(jobData.report_notes || '');
        const { data: imagesData, error: imagesError } = await supabase.from('job_report_images').select('id, image_url').eq('job_id', jobId);
        if (imagesError) throw imagesError;
        setUploadedImages(imagesData);
      } catch (error) {
        console.error("Lỗi lấy chi tiết công việc:", error);
        alert('Lỗi lấy chi tiết công việc: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchJobDetail();
  }, [jobId]);

  const handleCheckIn = async () => {
    setIsSubmitting(true);
    const checkInTime = new Date();
    const { data, error } = await supabase.from('jobs').update({ check_in_time: checkInTime, status: 'Đang xử lý' }).eq('id', jobId).select('*, customers(*)').single();
    if (error) { alert('Lỗi khi check-in: ' + error.message); } else { setJob(data); }
    setIsSubmitting(false);
  };

  const handleCheckOut = async () => {
    setIsSubmitting(true);
    const checkOutTime = new Date();
    const { data, error } = await supabase.from('jobs').update({ check_out_time: checkOutTime, status: 'Hoàn thành' }).eq('id', jobId).select('*, customers(*)').single();
    if (error) { alert('Lỗi khi check-out: ' + error.message); } else { setJob(data); }
    setIsSubmitting(false);
  };

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleSaveReport = async () => {
    if (!reportNotes && !selectedFiles) {
      alert('Vui lòng nhập ghi chú hoặc chọn ảnh.');
      return;
    }
    setIsSubmitting(true);
    try {
      const { error: notesError } = await supabase.from('jobs').update({ report_notes: reportNotes }).eq('id', jobId);
      if (notesError) throw notesError;

      if (selectedFiles) {
        for (const file of Array.from(selectedFiles)) {
          // Dòng code đã được sửa lỗi, xóa "public/"
          const filePath = `${jobId}/${Date.now()}-${file.name}`;

          const { error: uploadError } = await supabase.storage.from('report-images').upload(filePath, file);
          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage.from('report-images').getPublicUrl(filePath);

          const { error: insertError } = await supabase.from('job_report_images').insert([{ job_id: jobId, image_url: publicUrl }]);
          if (insertError) throw insertError;
        }
      }
      alert('Lưu báo cáo thành công!');
      window.location.reload();
    } catch (error) {
      alert('Lỗi khi lưu báo cáo: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

   // ==========================================================
  // HÀM MỚI: XỬ LÝ XÓA HÌNH ẢNH
  // ==========================================================
  const handleDeleteImage = async (imageToDelete) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hình ảnh này không?')) {
      return;
    }
    try {
      // Bước 1: Trích xuất đường dẫn file từ URL đầy đủ
      // Ví dụ URL: ".../storage/v1/object/public/report-images/1/12345.png"
      // Chúng ta cần lấy phần: "1/12345.png"
      const filePath = imageToDelete.image_url.split('/report-images/')[1];

      // Bước 2: Xóa file khỏi Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('report-images')
        .remove([filePath]);
      if (storageError) throw storageError;

      // Bước 3: Xóa dòng dữ liệu khỏi bảng database
      const { error: dbError } = await supabase
        .from('job_report_images')
        .delete()
        .eq('id', imageToDelete.id);
      if (dbError) throw dbError;

      // Bước 4: Cập nhật lại giao diện
      setUploadedImages(uploadedImages.filter(img => img.id !== imageToDelete.id));
      alert('Đã xóa hình ảnh thành công.');

    } catch (error) {
      alert('Lỗi khi xóa hình ảnh: ' + error.message);
    }
  }; 

  if (loading) {
    return <Container><Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box></Container>;
  }

  if (!job) {
    return <Container><Typography>Không tìm thấy công việc.</Typography></Container>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 2, mb: 4 }}>
      <Button component={Link} to="/" startIcon={<ArrowBackIcon />}>Quay lại danh sách</Button>
      <Paper sx={{ p: { xs: 2, md: 3 }, mt: 2 }}>
        <Typography variant="h4" gutterBottom>{job.customers?.name}</Typography>
        <Typography variant="h6" color="text.secondary">{moment(job.scheduled_date).format('dddd, DD/MM/YYYY, h:mm a')}</Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body1" sx={{ mb: 1 }}><strong>Địa chỉ:</strong> {job.customers?.address}</Typography>
        <Typography variant="body1" sx={{ mb: 1 }}><strong>SĐT Khách hàng:</strong> {job.customers?.phone_number}</Typography>
        <Typography variant="body1" sx={{ mb: 1 }}><strong>Mô tả công việc:</strong> {job.job_description}</Typography>
        <Typography variant="body1" sx={{ mb: 1 }}><strong>Trạng thái:</strong> {job.status}</Typography>
        <Typography variant="body1"><strong>Ghi chú:</strong> {job.report_notes}</Typography>
        {job.check_in_time && <Typography variant="body1" color="green"><strong>Đã Check-in lúc:</strong> {moment(job.check_in_time).format('h:mm:ss a, DD/MM/YYYY')}</Typography>}
        {job.check_out_time && <Typography variant="body1" color="red"><strong>Đã Check-out lúc:</strong> {moment(job.check_out_time).format('h:mm:ss a, DD/MM/YYYY')}</Typography>}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mt: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Hành động:</Typography>
          <Stack direction="row" spacing={2}>
            {!job.check_in_time && (<Button variant="contained" color="primary" onClick={handleCheckIn} disabled={isSubmitting}>Check-in</Button>)}
            {job.check_in_time && !job.check_out_time && (<Button variant="contained" color="secondary" onClick={handleCheckOut} disabled={isSubmitting}>Check-out</Button>)}
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>Báo cáo Công việc</Typography>
          <TextField label="Cập nhật Ghi chú tại hiện trường" multiline rows={4} fullWidth variant="outlined" value={reportNotes} onChange={(e) => setReportNotes(e.target.value)} sx={{ mb: 2 }} />
          <Button variant="contained" component="label" sx={{ mb: 2 }}>
            Chọn Ảnh
            <input type="file" hidden multiple onChange={handleFileChange} />
          </Button>
          {selectedFiles && <Typography variant="body2" sx={{ mb: 2 }}>Đã chọn: {selectedFiles.length} ảnh</Typography>}
          <Button variant="contained" color="success" fullWidth onClick={handleSaveReport} disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Lưu Báo cáo'}
          </Button>
        </Box>

        {/* CẬP NHẬT PHẦN HIỂN THỊ ẢNH */}
        {uploadedImages.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Hình ảnh đã Upload</Typography>
            <Grid container spacing={2}>
              {uploadedImages.map((image) => (
                <Grid item xs={6} sm={4} md={3} key={image.id}>
                  <Box sx={{ position: 'relative' }}>
                    <img src={image.image_url} alt={`Report`} style={{ width: '100%', height: 'auto', borderRadius: '4px' }} />
                    <IconButton
                      aria-label="delete"
                      onClick={() => handleDeleteImage(image)}
                      sx={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 1)',
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
}