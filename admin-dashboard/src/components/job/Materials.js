import React from 'react';
import {
  Paper, Typography, Divider, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Checkbox, TextField
} from '@mui/material';

const Materials = ({
  materialsList,
  selectedMaterials,
  setSelectedMaterials
}) => {
  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight={600} color="info.main" gutterBottom>
        Nhóm 3b: Vật tư/Hóa chất cần chuẩn bị
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">Chọn</TableCell>
              <TableCell>Tên vật tư</TableCell>
              <TableCell align="center">Số lượng</TableCell>
              <TableCell align="center">Đơn vị</TableCell>
              <TableCell>Ghi chú khu vực xử lý</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {materialsList.map(mat => {
              const selected = selectedMaterials.find(m => m.material_id === mat.id);
              return (
                <TableRow key={mat.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={!!selected}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedMaterials([...selectedMaterials, {
                            material_id: mat.id,
                            name: mat.name,
                            unit: mat.unit,
                            category: mat.category,
                            required_quantity: 1,
                            notes: ''
                          }]);
                        } else {
                          setSelectedMaterials(selectedMaterials.filter(m => m.material_id !== mat.id));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>{mat.name}</TableCell>
                  <TableCell align="center">
                    <TextField
                      label="Số lượng"
                      type="number"
                      size="small"
                      sx={{ width: 80 }}
                      value={selected?.required_quantity || ''}
                      disabled={!selected}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0;
                        setSelectedMaterials(selectedMaterials.map(m => m.material_id === mat.id ? { ...m, required_quantity: val } : m));
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">{mat.unit}</TableCell>
                  <TableCell>
                    <TextField
                      label="Ghi chú"
                      size="small"
                      fullWidth
                      value={selected?.notes || ''}
                      disabled={!selected}
                      onChange={e => {
                        setSelectedMaterials(selectedMaterials.map(m => m.material_id === mat.id ? { ...m, notes: e.target.value } : m));
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default Materials;