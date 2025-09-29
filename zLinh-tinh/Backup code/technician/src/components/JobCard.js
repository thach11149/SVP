import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import moment from 'moment';
import 'moment/locale/vi';

function capitalizeWordsVi(str) {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function JobCard({ job, stt }) {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const selectedDate = query.get('date'); // Lấy đúng ngày nếu có

  // Tạo URL cố định chỉ thêm `?date=...` nếu đang lọc theo ngày
  const detailLink = selectedDate ? `/job/${job.id}?date=${selectedDate}` : `/job/${job.id}`;

  return (
    <Link to={detailLink} style={{ textDecoration: 'none' }}>
      <Card sx={{ mb: 2 }}>
        <CardActionArea>
          <CardContent>
            <Typography variant="h6">{`${stt}. ${job.customers?.name || 'N/A'}`}</Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
              {job.scheduled_date
                ? capitalizeWordsVi(moment(job.scheduled_date).locale('vi').format('dddd, DD/MM/YYYY, HH:mm'))
                : 'Ngày không xác định'}
            </Typography>
            <Typography variant="body2"><strong>Địa chỉ:</strong> {job.customers?.address || 'N/A'}</Typography>
            <Typography variant="body2"><strong>Mô tả:</strong> {job.job_description}</Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Link>
  );
}
