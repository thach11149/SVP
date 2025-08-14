// src/components/CustomerList.js

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button, Box, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from '@mui/material';
import { Edit, Delete, Work } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CustomerForm from './AddCustomerForm'; // Đổi tên import cho đúng
import AlertMessage from './AlertMessage'; // Thêm import

export default function CustomerList() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null); // State để lưu khách hàng đang được sửa
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info', confirm: false, onConfirm: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, customerId: null });
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    fetchCustomers();
    fetchProvinces();
  }, []);

  async function fetchCustomers() {
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
  }

  async function fetchProvinces() {
    // Xóa hoặc comment đoạn fetch từ Supabase cho provinces
    // Chỉ dùng fetch('https://provinces.open-api.vn/api/p/') để lấy danh sách tỉnh/thành
    const response = await fetch('https://provinces.open-api.vn/api/p/');
    const data = await response.json();
    setProvinces(data);
  }

  async function fetchDistricts(provinceCode) {
    const { data, error } = await supabase
      .from('vn_districts')
      .select('id, name, code')
      .eq('province_code', provinceCode);
    if (error) {
      console.error('Lỗi khi lấy danh sách quận huyện:', error);
    } else {
      setDistricts(data);
    }
  }

  async function fetchWards(districtCode) {
    const { data, error } = await supabase
      .from('vn_wards')
      .select('id, name, code')
      .eq('district_code', districtCode);
    if (error) {
      console.error('Lỗi khi lấy danh sách phường xã:', error);
    } else {
      setWards(data);
    }
  }

  // Hiển thị thông báo
  const showAlert = (message, severity = 'info') => {
    setAlert({ open: true, message, severity, confirm: false, onConfirm: null });
  };

  // Hiển thị xác nhận xóa
  const showConfirmDelete = (onConfirm) => {
    setAlert({
      open: true,
      message: 'Bạn có chắc chắn muốn xóa khách hàng này không?',
      severity: 'warning',
      confirm: true,
      onConfirm,
    });
  };

  // Đóng alert
  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  // Xử lý xóa
  const handleDelete = async (customerId) => {
    showConfirmDelete(async () => {
      try {
        const { error } = await supabase.from('customers').delete().eq('id', customerId);
        if (error) throw error;
        setCustomers(customers.filter(customer => customer.id !== customerId));
        showAlert('Xóa khách hàng thành công!', 'success');
      } catch (error) {
        showAlert('Lỗi khi xóa khách hàng: ' + error.message, 'error');
      }
    });
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
    setEditingCustomer(null); // Đảm bảo không có khách hàng nào đang được sửa
    setOpenDialog(true);
  };

  // Xử lý khi nhấn nút "Sửa"
  const handleEdit = (customer) => {
    setEditingCustomer(customer); // Lưu thông tin khách hàng cần sửa vào state
    setOpenDialog(true); // Mở dialog
  };

  // Xử lý khi đóng dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCustomer(null); // Reset state sửa
  };

  // Xử lý sau khi lưu form (cả thêm mới và sửa)
  const handleSave = (savedCustomer) => {
    if (editingCustomer) {
      setCustomers(customers.map(c => (c.id === savedCustomer.id ? savedCustomer : c)));
      showAlert('Cập nhật khách hàng thành công!', 'success');
    } else {
      setCustomers([savedCustomer, ...customers]);
      if (showAlert) showAlert('Thêm khách hàng thành công!', 'success');
    }
  };

  const handleProvinceChange = (provinceCode) => {
    fetchDistricts(provinceCode);
  };

  const handleDistrictChange = (districtCode) => {
    fetchWards(districtCode);
  };

  // Xử lý khi nhấn nút "Thêm công việc"
  const handleAddJob = (customer) => {
    // Chuyển đến trang lập kế hoạch với customer_id trong URL params
    navigate(`/lap-ke-hoach-cong-viec?customer_id=${customer.id}&customer_name=${encodeURIComponent(customer.name)}`);
  };

  if (loading) return <Typography>Đang tải dữ liệu...</Typography>;

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Danh sách Khách hàng</Typography>
        <Button variant="contained" onClick={handleAddNew}>Thêm Khách Hàng Mới</Button>
      </Box>

      <CustomerForm
        open={openDialog}
        onClose={handleCloseDialog}
        onSave={handleSave}
        customerToEdit={editingCustomer}
        showAlert={showAlert}
        provinces={provinces}
        districts={districts}
        wards={wards}
        onProvinceChange={handleProvinceChange}
        onDistrictChange={handleDistrictChange}
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

      <Dialog open={deleteDialog.open} onClose={handleCancelDelete}>
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
              <TableCell>Mã KH</TableCell>
              <TableCell>Tên KH</TableCell>
              <TableCell>Địa chỉ</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>Tên</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map(customer => (
              <TableRow key={customer.id}>
                <TableCell>{customer.customer_code}</TableCell>
                <TableCell>{customer.name}</TableCell>
                <TableCell>
                  {[
                    customer.address,
                    customer.ward_name,
                    customer.district_name,
                    customer.province_name
                  ].filter(Boolean).join(', ')}
                </TableCell>
                <TableCell>{customer.primary_contact_phone}</TableCell>
                <TableCell>{customer.primary_contact_name}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
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
                  
                  <Box sx={{ mt: 1 }}>
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