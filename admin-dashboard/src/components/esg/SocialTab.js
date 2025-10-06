import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import KPICard from './KPICard';

const SocialTab = () => {
  const kpis = [
    {
      title: '7. Tần suất Sự cố Lao động (TRIR)',
      value: '1.8',
      subtitle: '1 Sự cố mất thời gian làm việc (LTI) trong Quý.',
      standard: 'GRI 403-9/ISO 45001',
      gauge: {
        percentage: 80,
        color: 'red',
        description: 'Mục tiêu toàn cầu ≤1.5. Cần điều tra nguyên nhân sâu xa của sự cố.'
      },
      borderColor: 'red'
    },
    {
      title: '8. Giờ Đào tạo KTV/Năm',
      value: '14.5 Giờ',
      subtitle: 'Đào tạo IPM, An toàn Hóa chất, Sử dụng Thiết bị. Mục tiêu ≥16 Giờ.',
      standard: 'GRI 404-1',
      gauge: {
        percentage: 90,
        color: 'blue',
        description: 'Đang đạt gần mục tiêu. Cần thêm 1.5 giờ/KTV để hoàn thành.'
      },
      borderColor: 'blue'
    },
    {
      title: '9. Khiếu nại An toàn/Môi trường',
      value: '2 Vụ',
      subtitle: '2 phàn nàn về quy trình thông báo tồn dư hóa chất.',
      standard: 'GRI 413-1',
      gauge: {
        percentage: 40,
        color: 'yellow',
        description: 'Đã xử lý 100%. Cần cải thiện quy trình truyền thông với khách hàng.'
      },
      borderColor: 'yellow'
    },
    {
      title: '10. Tỷ lệ Giữ chân Nhân viên',
      value: '92%',
      subtitle: 'Chỉ 2/25 KTV nghỉ việc trong Quý. Tốt hơn 85% trung bình ngành.',
      standard: 'GRI 401',
      gauge: {
        percentage: 92,
        color: 'green',
        description: 'Tuyệt vời. Cho thấy sự hài lòng và ổn định của đội ngũ Kỹ thuật viên.'
      },
      borderColor: 'green'
    },
    {
      title: '11. Tỷ lệ Thành công Lần đầu',
      value: '95%',
      subtitle: '7/140 Jobs cần xử lý lại. Mục tiêu 95%.',
      standard: 'ISO 9001',
      gauge: {
        percentage: 95,
        color: 'blue',
        description: 'Giữ vững tiêu chuẩn Chất lượng cao (ISO 9001).'
      },
      borderColor: 'blue'
    }
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 3, borderLeft: 4, borderColor: 'orange.500', pl: 2 }}>
        Chỉ số Xã hội (S) - An toàn và Con người
      </Typography>
      <Grid container spacing={2}>
        {kpis.map((kpi, index) => (
          <Grid size={4} key={index}>
            <KPICard {...kpi} />
          </Grid>
        ))}
        {/* Thêm item trống để căn chỉnh đều */}
        <Grid size={4} key="empty">
          <Box />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SocialTab;