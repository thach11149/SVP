import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory';

function QuanLyTonKho() {
  const [activeTab, setActiveTab] = useState(0);

  // Demo data cho Kho Tổng
  const khoTongData = [
    { id: 'AZD240SC', name: 'AZENDA (Fipronil 2.9%)', unit: 'Lít', prev: 50, import: 100, export: 45, min: 30, hsd: '10/06/2026', price: 850000, status: 'OK' },
    { id: 'FEN120SC', name: 'FEN USD (Permethrin 12%)', unit: 'Lít', prev: 20, import: 0, export: 30, min: 10, hsd: '25/11/2025', price: 450000, status: 'LOW' },
    { id: 'BRD1KG', name: 'Bả Chuột (Brodifacoum)', unit: 'Kg', prev: 15, import: 50, export: 10, min: 20, hsd: '15/01/2026', price: 120000, status: 'MIN_STOCK' },
    { id: 'GLTRP', name: 'Bẫy Keo Chuột', unit: 'Hộp', prev: 150, import: 200, export: 80, min: 50, hsd: 'N/A', price: 25000, status: 'OK' },
    { id: 'CYP250', name: 'CYP USA (Cypermethrin)', unit: 'Lít', prev: 5, import: 0, export: 5, min: 5, hsd: '01/01/2025', price: 300000, status: 'EXPIRED' },
  ];

  // Demo data cho Tồn Kho KTV
  const tonKTVData = [
    { ktv: 'Nguyễn Văn A', chemical: 'AZENDA', prev: 10, received: 5, used: 3.5, value: 12750000, status: 'OK' },
    { ktv: 'Nguyễn Văn A', chemical: 'FEN USD', prev: 5, received: 10, used: 8.0, value: 3150000, status: 'OK' },
    { ktv: 'Trần Thị B', chemical: 'AZENDA', prev: 5, received: 0, used: 6.0, value: 0, status: 'SHORTAGE' },
    { ktv: 'Lê Văn C', chemical: 'BRD1KG', prev: 8, received: 5, used: 1.5, value: 1380000, status: 'OK' },
  ];

  // Demo data cho Lịch Sử Sử Dụng
  const lichSuData = [
    { time: '05/10/2025 10:30', ktv: 'Văn A', client: 'Vincom Plaza (VP2025)', chemical: 'AZENDA', usage: 0.5, purpose: 'Bơm Tổng Thể', status: 'Đã ký' },
    { time: '04/10/2025 15:45', ktv: 'Thị B', client: 'Mega Mall (MM1120)', chemical: 'FEN USD', usage: 1.2, purpose: 'Diệt Muỗi SOS', status: 'Chờ duyệt' },
    { time: '03/10/2025 09:00', ktv: 'Văn A', client: 'Techlink (TL998)', chemical: 'Bả Chuột', usage: 0.2, purpose: 'Đặt Bả Chuột', status: 'Đã ký' },
    { time: '02/10/2025 11:15', ktv: 'Lê C', client: 'Hoa Lan Hotel (HL001)', chemical: 'AZENDA', usage: 0.8, purpose: 'Kiểm Soát Gián', status: 'Đã ký' },
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ 
      p: 3, 
      maxWidth: '100%', 
      mx: 'auto',
      backgroundColor: '#f7f9fc',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif'
    }}>
      <Box sx={{ 
        maxWidth: '100%',
        mx: 'auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        p: { xs: 3, md: 4 }
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            mb: 3, 
            fontWeight: 'bold', 
            color: '#1f2937',
            borderBottom: '1px solid #e5e7eb',
            pb: 1.5
          }}
        >
          <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#1f2937' }} />
          Quản Lý Tồn Kho Hóa Chất & Vật Tư
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: '#6b7280' }}>
          Theo dõi tồn kho tổng, tồn kho KTV và lịch sử xuất/sử dụng để đảm bảo an toàn và tối ưu chi phí.
        </Typography>

      {/* Toolbar */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 3 }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: '#16a34a',
            color: 'white',
            fontWeight: 'semibold',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              backgroundColor: '#15803d',
            },
            transition: 'all 0.15s ease'
          }}
        >
          Nhập Kho Mới
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Card sx={{ 
            minWidth: 120, 
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px'
          }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#dc2626', fontWeight: 'bold' }}>5</Typography>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>Mặt hàng Sắp/Hết Hạn</Typography>
            </CardContent>
          </Card>
          <Card sx={{ 
            minWidth: 120, 
            backgroundColor: '#fefce8',
            border: '1px solid #fde047',
            borderRadius: '8px'
          }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#ca8a04', fontWeight: 'bold' }}>3</Typography>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>Mặt hàng Dưới Min Stock</Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: '1px solid #e5e7eb', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="inventory tabs"
          sx={{
            '& .MuiTab-root': {
              color: '#6b7280',
              fontWeight: 500,
              textTransform: 'none',
              fontSize: '0.875rem',
              minHeight: '48px',
              borderBottom: '2px solid transparent',
              '&:hover': {
                borderBottomColor: '#3b82f6',
              },
            },
            '& .MuiTab-root.Mui-selected': {
              color: '#1d4ed8',
              fontWeight: 600,
              borderBottom: '3px solid #3b82f6',
            },
            '& .MuiTabs-indicator': {
              display: 'none',
            },
          }}
        >
          <Tab label="Kho Tổng (Nhập/Xuất)" />
          <Tab label="Tồn Kho KTV & Phân Bổ" />
          <Tab label="Nhật Ký Sử Dụng Chi Tiết (Theo Job)" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <TableContainer component={Paper} sx={{ mt: 2, maxHeight: '70vh', overflow: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Mã HC</TableCell>
                <TableCell>Tên Hóa Chất (Hoạt Chất)</TableCell>
                <TableCell align="center">ĐVT</TableCell>
                <TableCell align="center">Tồn Đầu Kỳ</TableCell>
                <TableCell align="center" sx={{ backgroundColor: '#dbeafe' }}>Lượng Nhập Thêm</TableCell>
                <TableCell align="center" sx={{ backgroundColor: '#fee2e2' }}>Lượng Xuất KTV</TableCell>
                <TableCell align="center" sx={{ backgroundColor: '#dcfce7' }}>Tồn Kho Hiện Tại</TableCell>
                <TableCell align="center">Min Stock</TableCell>
                <TableCell align="center">HSD Gần Nhất</TableCell>
                <TableCell align="center">Giá Mua TB</TableCell>
                <TableCell align="center">Hành Động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {khoTongData.map((item) => {
                const currentStock = item.prev + item.import - item.export;
                return (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ fontWeight: 'medium' }}>{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="center">{item.unit}</TableCell>
                    <TableCell align="center">{item.prev}</TableCell>
                    <TableCell align="center" sx={{ color: '#1d4ed8', fontWeight: 'bold' }}>+{item.import}</TableCell>
                    <TableCell align="center" sx={{ color: '#dc2626', fontWeight: 'bold' }}>-{item.export}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: currentStock <= item.min ? '#dc2626' : '#374151' }}>
                      {currentStock}
                    </TableCell>
                    <TableCell align="center">{item.min}</TableCell>
                    <TableCell align="center" sx={{ color: item.status === 'EXPIRED' ? 'purple.main' : 'inherit', fontWeight: item.status === 'EXPIRED' ? 'bold' : 'normal' }}>
                      {item.hsd}
                    </TableCell>
                    <TableCell align="center">{item.price.toLocaleString('vi-VN')} đ</TableCell>
                    <TableCell align="center">
                      <Button size="small" sx={{ color: '#1d4ed8' }}>Chi tiết</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {activeTab === 1 && (
        <TableContainer component={Paper} sx={{ mt: 2, maxHeight: '70vh', overflow: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Tên KTV</TableCell>
                <TableCell>Tên Hóa Chất</TableCell>
                <TableCell align="center">Tồn Đầu KTV</TableCell>
                <TableCell align="center" sx={{ backgroundColor: '#dbeafe' }}>Lượng Nhận Thêm</TableCell>
                <TableCell align="center" sx={{ backgroundColor: '#fee2e2' }}>Lượng Đã Dùng Job</TableCell>
                <TableCell align="center" sx={{ backgroundColor: '#dcfce7' }}>Tồn Kho Hiện Tại KTV</TableCell>
                <TableCell align="center">Tình Trạng</TableCell>
                <TableCell align="center">Giá Trị Tồn</TableCell>
                <TableCell align="center">Hành Động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tonKTVData.map((item, index) => {
                const currentStock = item.prev + item.received - item.used;
                const statusText = currentStock < 0 ? 'Âm kho (Sai lệch)' : (currentStock === 0 && item.used > 0 ? 'Đã hết' : 'Đủ');
                return (
                  <TableRow key={index} hover>
                    <TableCell sx={{ color: '#1d4ed8', fontWeight: 'medium' }}>{item.ktv}</TableCell>
                    <TableCell>{item.chemical}</TableCell>
                    <TableCell align="center">{item.prev}</TableCell>
                    <TableCell align="center" sx={{ color: '#1d4ed8', fontWeight: 'bold' }}>{item.received}</TableCell>
                    <TableCell align="center" sx={{ color: '#dc2626', fontWeight: 'bold' }}>-{item.used.toFixed(1)}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: currentStock < 0 ? '#dc2626' : '#374151' }}>
                      {currentStock.toFixed(1)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={statusText} 
                        sx={{
                          backgroundColor: statusText === 'Âm kho (Sai lệch)' ? '#fee2e2' : statusText === 'Đủ' ? '#dcfce7' : '#f3f4f6',
                          color: statusText === 'Âm kho (Sai lệch)' ? '#dc2626' : statusText === 'Đủ' ? '#16a34a' : '#374151'
                        }}
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="center">{item.value.toLocaleString('vi-VN')} đ</TableCell>
                    <TableCell align="center">
                      <Button size="small" sx={{ color: '#7c3aed' }}>Kiểm Kê</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {activeTab === 2 && (
        <Box>
          <Box sx={{ p: 2, backgroundColor: '#f9fafb', borderRadius: 1, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: '#374151' }}>Lọc Theo:</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Tất cả KTV</InputLabel>
                <Select value="">
                  <MenuItem value="">Tất cả KTV</MenuItem>
                  <MenuItem value="nguyen-a">Nguyễn Văn A</MenuItem>
                  <MenuItem value="tran-b">Trần Thị B</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Tất cả Hóa Chất</InputLabel>
                <Select value="">
                  <MenuItem value="">Tất cả Hóa Chất</MenuItem>
                  <MenuItem value="azenda">AZENDA</MenuItem>
                  <MenuItem value="fen-usd">FEN USD</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Thời Gian</TableCell>
                  <TableCell>KTV</TableCell>
                  <TableCell>Khách Hàng (Mã Job)</TableCell>
                  <TableCell>Tên Hóa Chất</TableCell>
                  <TableCell align="center" sx={{ backgroundColor: '#fee2e2' }}>Lượng Sử Dụng</TableCell>
                  <TableCell>Mục Đích</TableCell>
                  <TableCell align="center">Trạng Thái BCCT</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lichSuData.map((item, index) => (
                  <TableRow key={index} hover>
                    <TableCell sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>{item.time}</TableCell>
                    <TableCell sx={{ color: '#1d4ed8', fontWeight: 'medium' }}>{item.ktv}</TableCell>
                    <TableCell>{item.client}</TableCell>
                    <TableCell>{item.chemical}</TableCell>
                    <TableCell align="center" sx={{ color: '#dc2626', fontWeight: 'bold' }}>-{item.usage.toFixed(1)}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{item.purpose}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={item.status} 
                        sx={{
                          backgroundColor: item.status === 'Đã ký' ? '#dcfce7' : '#fef3c7',
                          color: item.status === 'Đã ký' ? '#16a34a' : '#ca8a04'
                        }}
                        size="small" 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      </Box>
    </Box>
  );
}

export default QuanLyTonKho;