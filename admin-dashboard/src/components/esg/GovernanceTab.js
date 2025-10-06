import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import KPICard from './KPICard';

const GovernanceTab = () => {
  const kpis = [
    {
      title: '12. Số vụ Vi phạm Môi trường',
      value: '0 Vụ',
      subtitle: 'Không có cảnh báo hay tiền phạt từ cơ quan quản lý Môi trường.',
      standard: 'GRI 307-1',
      gauge: {
        percentage: 100,
        color: 'green',
        description: 'Tuyệt đối! Đảm bảo tuân thủ Giấy phép Hóa chất và Xử lý Rác thải.'
      },
      borderColor: 'green'
    },
    {
      title: '13. Số vụ Tham nhũng Xác nhận',
      value: '0 Vụ',
      subtitle: 'Không có sự cố tham nhũng/hối lộ được xác nhận nội bộ/bên ngoài.',
      standard: 'GRI 205-3',
      gauge: {
        percentage: 100,
        color: 'green',
        description: 'Minh bạch. Bảo trì chính sách không khoan nhượng.'
      },
      borderColor: 'green'
    },
    {
      title: '14. Đào tạo Chống Tham nhũng',
      value: '90%',
      subtitle: '27/30 nhân viên đã hoàn thành và ký xác nhận Code of Conduct.',
      standard: 'MỚI',
      gauge: {
        percentage: 90,
        color: 'purple',
        description: 'Cần thúc đẩy 3 nhân viên còn lại hoàn thành ngay trong tháng này.'
      },
      borderColor: 'purple'
    },
    {
      title: '15. Tỷ lệ Site có Đánh giá Rủi ro',
      value: '78%',
      subtitle: '200/256 Khách hàng B2B có Hồ sơ Phân tích Nguy cơ (Hazard Analysis) cập nhật.',
      standard: 'IFS Pest Control Guideline',
      gauge: {
        percentage: 78,
        color: 'yellow',
        description: 'Cần hoàn thành 100% đánh giá rủi ro cho các site Nhà máy/Thực phẩm (IFS).'
      },
      borderColor: 'yellow'
    }
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 3, borderLeft: 4, borderColor: 'purple.500', pl: 2 }}>
        Chỉ số Quản trị (G) - Tuân thủ và Minh bạch
      </Typography>
      <Grid container spacing={2}>
        {kpis.map((kpi, index) => (
          <Grid item xs={4} sm={4} md={4} lg={4} key={index}>
            <KPICard {...kpi} />
          </Grid>
        ))}
        {/* Thêm item trống để căn chỉnh đều */}
        <Grid size={4} key="empty1">
          <Box />
        </Grid>
        <Grid size={4} key="empty2">
          <Box />
        </Grid>
      </Grid>
    </Box>
  );
};

export default GovernanceTab;