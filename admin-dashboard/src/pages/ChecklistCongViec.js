import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Grid, Paper, Divider, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert
} from '@mui/material';
import { Delete, Edit, Add } from '@mui/icons-material';
import { supabase } from '../supabaseClient';

export default function ChecklistCongViec({ session }) {
  const [checklistItems, setChecklistItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    unit: 'cái',
    notes: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, type: 'success', message: '' });

  useEffect(() => {
    fetchChecklistItems();
  }, []);

  const fetchChecklistItems = async () => {
    const { data, error } = await supabase
      .from('checklist')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching checklist items:', error);
      setSnackbar({ 
        open: true, 
        type: 'error', 
        message: `Lỗi khi tải danh sách: ${error.message}` 
      });
    } else {
      setChecklistItems(data || []);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        label: item.label,
        unit: item.unit || 'cái',
        notes: item.notes || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        label: '',
        unit: 'cái',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setFormData({
      label: '',
      unit: 'cái',
      notes: ''
    });
  };

  const handleSave = async () => {
    if (!formData.label.trim()) {
      setSnackbar({ 
        open: true, 
        type: 'error', 
        message: 'Vui lòng nhập tên checklist' 
      });
      return;
    }

    const value = formData.label.toLowerCase().replace(/\s+/g, '_');
    
    try {
      if (editingItem) {
        // Cập nhật
        const { error } = await supabase
          .from('checklist')
          .update({
            label: formData.label,
            value: value,
            unit: formData.unit,
            notes: formData.notes
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        
        setSnackbar({ 
          open: true, 
          type: 'success', 
          message: 'Cập nhật thành công!' 
        });
      } else {
        // Thêm mới
        const { error } = await supabase
          .from('checklist')
          .insert([{
            label: formData.label,
            value: value,
            unit: formData.unit,
            notes: formData.notes
          }]);

        if (error) throw error;
        
        setSnackbar({ 
          open: true, 
          type: 'success', 
          message: 'Thêm mới thành công!' 
        });
      }

      handleCloseDialog();
      fetchChecklistItems();
    } catch (error) {
      console.error('Error saving checklist item:', error);
      setSnackbar({ 
        open: true, 
        type: 'error', 
        message: `Lỗi khi lưu: ${error.message}` 
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa checklist này?')) {
      try {
        const { error } = await supabase
          .from('checklist')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setSnackbar({ 
          open: true, 
          type: 'success', 
          message: 'Xóa thành công!' 
        });
        fetchChecklistItems();
      } catch (error) {
        console.error('Error deleting checklist item:', error);
        setSnackbar({ 
          open: true, 
          type: 'error', 
          message: `Lỗi khi xóa: ${error.message}` 
        });
      }
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: '#f5f6fa', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 4 }, borderRadius: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={700}>Checklist Công việc</Typography>
            <Typography color="text.secondary" mt={1}>
              Quản lý các mục công việc cần kiểm tra (không bao gồm số lượng cụ thể).
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ height: 'fit-content' }}
          >
            Thêm mới
          </Button>
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><strong>Tên Checklist</strong></TableCell>
                <TableCell><strong>Đơn vị</strong></TableCell>
                <TableCell><strong>Ghi chú</strong></TableCell>
                <TableCell align="center"><strong>Thao tác</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {checklistItems.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.label}</TableCell>
                  <TableCell>{item.unit || 'cái'}</TableCell>
                  <TableCell>{item.notes || '-'}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(item)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {checklistItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Chưa có checklist nào. Nhấn "Thêm mới" để tạo checklist đầu tiên.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dialog thêm/sửa */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingItem ? 'Sửa Checklist' : 'Thêm Checklist Mới'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Tên checklist *"
                  value={formData.label}
                  onChange={(e) => setFormData({...formData, label: e.target.value})}
                  fullWidth
                  placeholder="Ví dụ: Đặt bẫy chuột, Kiểm tra bình thuốc..."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Đơn vị"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  fullWidth
                  placeholder="cái, lần, m2..."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Ghi chú"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Mô tả chi tiết công việc..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button onClick={handleSave} variant="contained">
              {editingItem ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.type} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
}
