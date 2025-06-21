// src/pages/JobList.js

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom'; // Import Link
import { Button, Box, Typography, Container, Card, CardActionArea, CardContent, CircularProgress } from '@mui/material';
import moment from 'moment';

export default function JobList({ session }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserJobs() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('jobs')
          .select(`*, customers ( name, address, phone_number )`)
          .eq('user_id', session.user.id)
          .order('scheduled_date', { ascending: true });
        if (error) throw error;
        setJobs(data);
      } catch (error) {
        alert('Lỗi lấy dữ liệu công việc: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUserJobs();
  }, [session.user.id]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 2 }}>
        <Typography component="h1" variant="h5">Công việc của bạn</Typography>
        <Button variant="outlined" color="error" onClick={handleLogout}>Đăng xuất</Button>
      </Box>

      <Box sx={{ mt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
        ) : jobs.length === 0 ? (
          <Typography>Bạn không có công việc nào được giao.</Typography>
        ) : (
          jobs.map((job) => (
            // Bọc Card bằng Link, trỏ đến đường dẫn chi tiết công việc
            <Link to={`/job/${job.id}`} key={job.id} style={{ textDecoration: 'none' }}>
              <Card sx={{ mb: 2 }}>
                <CardActionArea> {/* Thêm hiệu ứng khi hover */}
                  <CardContent>
                    <Typography variant="h6" component="div">{job.customers?.name || 'N/A'}</Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                      {moment(job.scheduled_date).format('dddd, DD/MM/YYYY, h:mm a')}
                    </Typography>
                    <Typography variant="body2"><strong>Địa chỉ:</strong> {job.customers?.address || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Mô tả:</strong> {job.job_description}</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Link>
          ))
        )}
      </Box>
    </Container>
  );
}