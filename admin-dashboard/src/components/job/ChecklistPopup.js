import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, Box, Typography,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Paper
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { supabase } from '../../supabaseClient';

export default function ChecklistPopup({ open, onClose, onChecklistAdded }) {
  const [newItems, setNewItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    label: '',
    unit: 'cái',
    notes: ''
  });

  const handleAddToList = () => {
    if (!currentItem.label.trim()) return;
    
    const newItem = {
      ...currentItem,
      tempId: Date.now() // ID tạm thời
    };
    
    setNewItems([...newItems, newItem]);
    setCurrentItem({
      label: '',
      unit: 'cái',
      notes: ''
    });
  };

  const handleRemoveFromList = (tempId) => {
    setNewItems(newItems.filter(item => item.tempId !== tempId));
  };

  const handleSaveAll = async () => {
    if (newItems.length === 0) {
      onClose();
      return;
    }

    try {
      const itemsToInsert = newItems.map(item => ({
        label: item.label,
        value: item.label.toLowerCase().replace(/\s+/g, '_'),
        unit: item.unit,
        notes: item.notes
      }));

      const { data, error } = await supabase
        .from('checklist')
        .insert(itemsToInsert)
        .select();

      if (error) throw error;

      // Thông báo về parent component để refresh list
      onChecklistAdded(data);
      
      // Reset form
      setNewItems([]);
      setCurrentItem({
        label: '',
        unit: 'cái',
        notes: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving checklist items:', error);
      alert(`Lỗi khi lưu: ${error.message}`);
    }
  };

  const handleClose = () => {
    setNewItems([]);
    setCurrentItem({
      label: '',
      unit: 'cái',
      notes: ''
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Thêm Checklist Công việc</Typography>
        <Typography variant="body2" color="text.secondary">
          Thêm một hoặc nhiều mục công việc cần kiểm tra
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {/* Form thêm mục mới */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Thêm mục mới
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Tên checklist *"
                value={currentItem.label}
                onChange={(e) => setCurrentItem({...currentItem, label: e.target.value})}
                fullWidth
                placeholder="Ví dụ: Đặt bẫy chuột, Kiểm tra bình thuốc..."
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Đơn vị"
                value={currentItem.unit}
                onChange={(e) => setCurrentItem({...currentItem, unit: e.target.value})}
                fullWidth
                placeholder="cái, lần, m2..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Ghi chú"
                value={currentItem.notes}
                onChange={(e) => setCurrentItem({...currentItem, notes: e.target.value})}
                fullWidth
                multiline
                rows={2}
                placeholder="Mô tả chi tiết công việc..."
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={handleAddToList}
                startIcon={<Add />}
                disabled={!currentItem.label.trim()}
              >
                Thêm vào danh sách
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Danh sách các mục đã thêm */}
        {newItems.length > 0 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Danh sách sẽ được lưu ({newItems.length} mục)
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell>Tên Checklist</TableCell>
                    <TableCell>Đơn vị</TableCell>
                    <TableCell>Ghi chú</TableCell>
                    <TableCell align="center">Xóa</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {newItems.map((item) => (
                    <TableRow key={item.tempId}>
                      <TableCell>{item.label}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.notes || '-'}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveFromList(item.tempId)}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Hủy</Button>
        <Button 
          onClick={handleSaveAll} 
          variant="contained"
          disabled={newItems.length === 0}
        >
          Lưu tất cả ({newItems.length} mục)
        </Button>
      </DialogActions>
    </Dialog>
  );
}
