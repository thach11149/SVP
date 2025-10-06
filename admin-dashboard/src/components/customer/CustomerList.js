// src/components/CustomerList.js

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button, Box, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from '@mui/material';
import { Edit, Delete, Work } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CustomerForm from './AddCustomerForm'; // Giữ import này
import AlertMessage from '../ui/AlertMessage'; // Thêm import
import provincesData from '../../data/provinces.json';
import districtsData from '../../data/districts.json';
import wardsData from '../../data/wards.json';

export default function CustomerList() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null); // Đổi tên state cho rõ ràng
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info', confirm: false, onConfirm: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, customerId: null });

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setCustomers(data);
    } catch (error) {
      showAlert('Lỗi lấy dữ liệu khách hàng: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Hiển thị thông báo
  const showAlert = (message, severity = 'info') => {
    setAlert({ open: true, message, severity, confirm: false, onConfirm: null });
  };

  // Đóng alert
  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const handleDeleteClick = (customerId) => {
    setDeleteDialog({ open: true, customerId });
  };

  const handleConfirmDelete = async () => {
    try {
      await supabase.from('customers').delete().eq('id', deleteDialog.customerId);
      showAlert('Xóa khách hàng thành công!', 'success');
      fetchCustomers();
    } catch (error) {
      showAlert('Lỗi xóa khách hàng: ' + error.message, 'error');
    } finally {
      setDeleteDialog({ open: false, customerId: null });
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialog({ open: false, customerId: null });
  };

  // Xử lý khi nhấn nút "Thêm mới"
  const handleAddNew = () => {
    setCustomerToEdit(null);
    setOpenDialog(true);
  };

  // Xử lý khi nhấn nút "Sửa"
  const handleEdit = (customer) => {
    setCustomerToEdit(customer);
    setOpenDialog(true);
  };

  // Xử lý khi đóng dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCustomerToEdit(null); // Reset state
  };

  // Xử lý sau khi lưu form (cả thêm mới và sửa)
  const handleSave = (savedCustomer) => {
    if (customerToEdit) {
      setCustomers(customers.map(c => (c.id === savedCustomer.id ? savedCustomer : c)));
      showAlert('Cập nhật khách hàng thành công!', 'success');
    } else {
      setCustomers([savedCustomer, ...customers]);
      showAlert('Thêm khách hàng thành công!', 'success');
    }
  };

  // Xử lý khi nhấn nút "Thêm công việc"
  const handleAddJob = (customer) => {
    // Chuyển đến trang lập kế hoạch với customer_id trong URL params
    navigate(`/lap-ke-hoach-cong-viec?customer_id=${customer.id}&customer_name=${encodeURIComponent(customer.name)}`);
  };

  // Hàm lấy tên địa chỉ từ code
  const getAddressString = (customer) => {
    const provinceName = provincesData.find(p => p.code === customer.province)?.name || customer.province_name || '';
    const districtName = districtsData.find(d => d.code === customer.district)?.name || customer.district_name || '';
    const wardName = wardsData.find(w => w.code === customer.ward)?.name || customer.ward_name || '';
    return [customer.address, wardName, districtName, provinceName].filter(Boolean).join(', ');
  };

  useEffect(() => {
    fetchCustomers();
    // Không cần fetchProvinces nữa
  }, [fetchCustomers]);

  if (loading) return <Typography>Đang tải dữ liệu...</Typography>;

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Danh sách Khách hàng</Typography>
        <Button variant="contained" onClick={handleAddNew}>Thêm Khách Hàng Mới</Button>
      </Box>

      {/* Hiển thị form thêm hoặc sửa */}
      <CustomerForm
        open={openDialog}
        onClose={handleCloseDialog}
        onSave={handleSave}
        showAlert={showAlert}
        customerToEdit={customerToEdit}
      />

      <AlertMessage
        type={alert.severity}
        message={alert.message}
        duration={alert.confirm ? null : (alert.duration || 4000)}
        open={alert.open}
        onClose={handleCloseAlert}
        confirm={alert.confirm}
        onConfirm={alert.onConfirm}
      />

      <Dialog open={deleteDialog.open} onClose={handleCancelDelete} ModalProps={{ container: document.getElementById('root') }}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          Bạn có chắc chắn muốn xóa khách hàng này không?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Hủy</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Đồng ý</Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ textAlign: 'center' }}>Mã KH</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>Khách hàng</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>Người Liên Hệ Chính</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>Số điện thoại</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map(customer => (
              <TableRow key={customer.id}>
                <TableCell sx={{ textAlign: 'center' }}>{customer.customer_code}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">{customer.name}</Typography>
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>{customer.primary_contact_name}</TableCell>
                <TableCell sx={{ textAlign: 'center' }}>{customer.primary_contact_phone}</TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Tooltip title="Sửa thông tin">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEdit(customer)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Xóa khách hàng">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(customer.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      color="success"
                      startIcon={<Work />}
                      size="small"
                      onClick={() => handleAddJob(customer)}
                      sx={{ 
                        textTransform: 'none',
                        fontSize: '0.8rem'
                      }}
                    >
                      Thêm công việc
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}