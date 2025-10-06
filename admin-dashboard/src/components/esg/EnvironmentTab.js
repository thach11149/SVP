import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import KPICard from './KPICard';

const kpis = [
  {
    title: '1. Cường độ Hoạt chất Chính',
    value: '0.05 kg/Job',
    subtitle: 'Mục tiêu: < 0.04 kg/Job',
    standard: 'GRI 301-1/ISO 14001',
    gauge: {
      percentage: 75,
      color: 'red',
      description: 'Cần tối ưu hóa liều lượng/hoạt chất. Cường độ cao hơn 25% Baseline.'
    },
    borderColor: 'red'
  },
  {
    title: '2. Tỷ lệ Áp dụng IPM',
    value: '85%',
    subtitle: 'Đã áp dụng IPM cho 120/140 Jobs trong quý.',
    standard: 'GRI 301-2/IFS',
    gauge: {
      percentage: 85,
      color: 'green',
      description: 'Tuyệt vời! Đã vượt qua mục tiêu tối thiểu (≥80%) theo IFS.'
    },
    borderColor: 'green'
  },
  {
    title: '3. Phát thải GHG (Scope 1)',
    value: '1.5 tCO₂e',
    subtitle: 'Tăng 5% so với Quý trước do quãng đường di chuyển tăng.',
    standard: 'GRI 305-1',
    gauge: {
      percentage: 50,
      color: 'yellow',
      description: 'Cần kiểm soát nhiên liệu và tối ưu hóa tuyến đường dịch vụ.'
    },
    borderColor: 'yellow'
  },
  {
    title: '4. Tỷ lệ Xe Phát thải Thấp',
    value: '12%',
    subtitle: '3/25 xe trong đội hình là xe Hybrid/Tiêu chuẩn Euro 4 trở lên.',
    standard: 'GRI 305-4',
    gauge: {
      percentage: 12,
      color: 'blue',
      description: 'Mục tiêu 30% trong vòng 2 năm. Cần đẩy nhanh tiến độ.'
    },
    borderColor: 'blue'
  },
  {
    title: '5. Tỷ lệ Thu hồi Rác thải Nguy hại',
    value: '98%',
    subtitle: 'Tổng thu hồi: 180 kg/183 kg vỏ chai/bả chuột đã sử dụng.',
    standard: 'GRI 306-2',
    gauge: {
      percentage: 98,
      color: 'green',
      description: 'Xuất sắc! Đã vượt mục tiêu 90%. Đảm bảo chứng từ xử lý hợp pháp.'
    },
    borderColor: 'green'
  },
  {
    title: '6. Tiêu thụ Năng lượng (Văn phòng)',
    value: '2,500 kWh',
    subtitle: 'Tương đương cường độ 10 kWh/Job. Không tăng trưởng.',
    standard: 'GRI 302-1',
    gauge: {
      percentage: 60,
      color: 'yellow',
      description: 'Cần áp dụng các biện pháp tiết kiệm điện tại văn phòng.'
    },
    borderColor: 'yellow'
  }
];

export default function EnvironmentTab() {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 3, borderLeft: 4, borderColor: '#10b981', pl: 2 }}>
        Chỉ số Môi trường (E) - Giảm thiểu Tác động
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
}