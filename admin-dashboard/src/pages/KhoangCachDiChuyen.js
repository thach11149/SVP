import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Snackbar, Alert
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { supabase } from '../supabaseClient';

export default function KhoangCachDiChuyen() {
  const [distances, setDistances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, type: 'success', message: '' });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ diemDi: '', diemDen: '', khoangCach: '' });

  useEffect(() => {
    fetchDistances();
  }, []);

  const fetchDistances = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('distances')
      .select('*')
      .order('diem_di', { ascending: true });
    if (error) {
      setSnackbar({ open: true, type: 'error', message: 'Lỗi khi tải dữ liệu: ' + error.message });
    } else {
      setDistances(data || []);
    }
    setLoading(false);
  };

  const handleOpen = (item = null) => {
    setEditing(item);
    setFormData(item ? { ...item } : { diemDi: '', diemDen: '', khoangCach: '' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
  };

  const handleSave = async () => {
    const tenChang = `${formData.diemDi} → ${formData.diemDen}`;
    const dataToSave = { diem_di: formData.diemDi, diem_den: formData.diemDen, khoang_cach: parseFloat(formData.khoangCach), ten_chang: tenChang };
    
    try {
      if (editing) {
        const { error } = await supabase
          .from('distances')
          .update(dataToSave)
          .eq('id', editing.id);
        if (error) throw error;
        setSnackbar({ open: true, type: 'success', message: 'Cập nhật thành công!' });
      } else {
        const { error } = await supabase
          .from('distances')
          .insert([dataToSave]);
        if (error) throw error;
        setSnackbar({ open: true, type: 'success', message: 'Thêm mới thành công!' });
      }
      fetchDistances(); // Refresh data
      handleClose();
    } catch (error) {
      setSnackbar({ open: true, type: 'error', message: 'Lỗi: ' + error.message });
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('distances')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setSnackbar({ open: true, type: 'success', message: 'Xóa thành công!' });
      fetchDistances(); // Refresh data
    } catch (error) {
      setSnackbar({ open: true, type: 'error', message: 'Lỗi khi xóa: ' + error.message });
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: '#f5f6fa', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 4 }, borderRadius: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight={700}>Khoảng cách di chuyển</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
            Thêm mới
          </Button>
        </Box>

        {loading ? (
          <Typography align="center">Đang tải...</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ width: 70 }}>Mã chặng</TableCell>
                  <TableCell align="center">Điểm đi</TableCell>
                  <TableCell align="center">Điểm đến</TableCell>
                  <TableCell align="center">Khoảng cách (km)</TableCell>
                  <TableCell align="center">Tên chặng</TableCell>
                  <TableCell align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {distances.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell align="center" sx={{ width: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.id}</TableCell>
                    <TableCell align="center">{row.diem_di}</TableCell>
                    <TableCell align="center">{row.diem_den}</TableCell>
                    <TableCell align="center">{row.khoang_cach}</TableCell>
                    <TableCell align="center">{row.ten_chang}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handleOpen(row)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(row.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>{editing ? 'Sửa khoảng cách' : 'Thêm khoảng cách'}</DialogTitle>
          <DialogContent>
            <TextField
              label="Điểm đi"
              value={formData.diemDi}
              onChange={e => setFormData({ ...formData, diemDi: e.target.value })}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Điểm đến"
              value={formData.diemDen}
              onChange={e => setFormData({ ...formData, diemDen: e.target.value })}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Khoảng cách (km)"
              type="number"
              value={formData.khoangCach}
              onChange={e => setFormData({ ...formData, khoangCach: e.target.value })}
              fullWidth
              margin="dense"
            />
            {/* Tên chặng tự động tạo từ điểm đi và điểm đến */}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Hủy</Button>
            <Button onClick={handleSave} variant="contained">Lưu</Button>
          </DialogActions>
        </Dialog>

        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.type} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
}
