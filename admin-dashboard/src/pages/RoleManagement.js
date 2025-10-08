import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Tabs, Tab, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton, Snackbar, Alert, Checkbox
} from '@mui/material';
import { Add, Edit, Delete, Save, Cancel } from '@mui/icons-material';
import { supabase } from '../supabaseClient';

export default function RoleManagement({ session }) {
  const [tabValue, setTabValue] = useState(0);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', position: '', email: '', phone: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [editUser, setEditUser] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!session?.user?.id) return;
      const { data } = await supabase
        .from('profiles')
        .select('role_id, profile_roles(name)')
        .eq('id', session.user.id)
        .single();
      setCurrentUserRole(data?.profile_roles?.name);
    };
    checkAccess();
    fetchData();
  }, [session]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permsRes, rpRes, usersRes] = await Promise.all([
        supabase.from('profile_roles').select('*').order('name'),
        supabase.from('permissions').select('*').order('name'),
        supabase.from('profile_role_permissions').select('*, profile_roles(name), permissions(name)'),
        supabase.from('profiles').select('*, profile_roles(name)').order('id')
      ]);
      setRoles(rolesRes.data || []);
      setPermissions(permsRes.data || []);
      setRolePermissions(rpRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSnackbar({ open: true, message: 'Lỗi khi tải dữ liệu', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (item = null, isUser = false) => {
    if (isUser) {
      setEditUser(item);
      setFormData({
        name: item?.name || '',
        position: item?.position || '',
        email: item?.email || '',
        phone: item?.phone || ''
      });
    } else {
      setEditItem(item);
      setFormData(item ? { name: item.name, description: item.description || '' } : { name: '', description: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditItem(null);
    setEditUser(null);
    setFormData({ name: '', description: '', position: '', email: '', phone: '' });
  };

  const handleSave = async () => {
    try {
      if (editUser) {
        await supabase.from('profiles').update({
          name: formData.name,
          position: formData.position,
          email: formData.email,
          phone: formData.phone
        }).eq('id', editUser.id);
        setSnackbar({ open: true, message: 'Cập nhật người dùng thành công', severity: 'success' });
      } else {
        const table = tabValue === 1 ? 'profile_roles' : 'permissions';
        if (editItem) {
          await supabase.from(table).update(formData).eq('id', editItem.id);
          setSnackbar({ open: true, message: 'Cập nhật thành công', severity: 'success' });
        } else {
          await supabase.from(table).insert([formData]);
          setSnackbar({ open: true, message: 'Thêm mới thành công', severity: 'success' });
        }
      }
      fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving:', error);
      setSnackbar({ open: true, message: 'Lỗi khi lưu', severity: 'error' });
    }
  };

  const handleDelete = async (id, table) => {
    try {
      const actualTable = table === 'roles' ? 'profile_roles' : table;
      await supabase.from(actualTable).delete().eq('id', id);
      setSnackbar({ open: true, message: 'Xóa thành công', severity: 'success' });
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      setSnackbar({ open: true, message: 'Lỗi khi xóa', severity: 'error' });
    }
  };

  const handleAssignPermission = async (roleId, permId, assign) => {
    try {
      if (assign) {
        await supabase.from('profile_role_permissions').insert([{ role_id: roleId, permission_id: permId }]);
      } else {
        await supabase.from('profile_role_permissions').delete().eq('role_id', roleId).eq('permission_id', permId);
      }
      fetchData();
      setSnackbar({ open: true, message: assign ? 'Gán quyền thành công' : 'Bỏ quyền thành công', severity: 'success' });
    } catch (error) {
      console.error('Error assigning permission:', error);
      setSnackbar({ open: true, message: 'Lỗi khi gán quyền', severity: 'error' });
    }
  };

  const handleAssignRole = async (userId, roleId) => {
    try {
      await supabase.from('profiles').update({ role_id: roleId }).eq('id', userId);
      fetchData();
      setSnackbar({ open: true, message: 'Gán vai trò thành công', severity: 'success' });
    } catch (error) {
      console.error('Error assigning role:', error);
      setSnackbar({ open: true, message: 'Lỗi khi gán vai trò', severity: 'error' });
    }
  };

  if (loading) {
    return <Box sx={{ p: 4, textAlign: 'center' }}><Typography>Đang tải...</Typography></Box>;
  }

  if (!currentUserRole || currentUserRole !== 'admin') {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Bạn không có quyền truy cập trang này. Chỉ dành cho Admin.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: '#f5f6fa', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 2, sm: 4 }, borderRadius: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Quản Lý Quyền và Vai Trò
        </Typography>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Gán Vai Trò Cho Người Dùng" />
          <Tab label="Vai Trò (Roles)" />
          <Tab label="Quyền (Permissions)" />
          <Tab label="Gán Quyền Cho Vai Trò" />
        </Tabs>

        {tabValue === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>Gán Vai Trò Cho Người Dùng</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tên Người Dùng</TableCell>
                    <TableCell>Chức Vụ</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>SĐT</TableCell>
                    <TableCell>Vai Trò</TableCell>
                    <TableCell>Sửa</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.position || 'Chưa có'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>
                        {roles.map(role => (
                          <Button
                            key={role.id}
                            size="small"
                            variant={user.role_id === role.id ? 'contained' : 'outlined'}
                            onClick={() => handleAssignRole(user.id, role.id)}
                            sx={{ mr: 1 }}
                          >
                            {role.name}
                          </Button>
                        ))}
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpenDialog(user, true)}><Edit /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {tabValue === 1 && (
          <Box>
            <Button startIcon={<Add />} onClick={() => handleOpenDialog()} sx={{ mb: 2 }}>
              Thêm Vai Trò
            </Button>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tên</TableCell>
                    <TableCell>Mô tả</TableCell>
                    <TableCell>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roles.map(role => (
                    <TableRow key={role.id}>
                      <TableCell>{role.name}</TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpenDialog(role)}><Edit /></IconButton>
                        <IconButton onClick={() => handleDelete(role.id, 'roles')}><Delete /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {tabValue === 2 && (
          <Box>
            <Button startIcon={<Add />} onClick={() => handleOpenDialog()} sx={{ mb: 2 }}>
              Thêm Quyền
            </Button>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tên</TableCell>
                    <TableCell>Mô tả</TableCell>
                    <TableCell>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {permissions.map(perm => (
                    <TableRow key={perm.id}>
                      <TableCell>{perm.name}</TableCell>
                      <TableCell>{perm.description}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpenDialog(perm)}><Edit /></IconButton>
                        <IconButton onClick={() => handleDelete(perm.id, 'permissions')}><Delete /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {tabValue === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>Gán Quyền Cho Vai Trò</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Vai Trò</TableCell>
                    {permissions.map(perm => (
                      <TableCell key={perm.id} align="center">{perm.description}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roles.map(role => (
                    <TableRow key={role.id}>
                      <TableCell align="center">{role.name}</TableCell>
                      {permissions.map(perm => {
                        const hasPerm = rolePermissions.some(rp => rp.role_id === role.id && rp.permission_id === perm.id);
                        return (
                          <TableCell key={perm.id} align="center">
                            <Checkbox
                              checked={hasPerm}
                              onChange={() => handleAssignPermission(role.id, perm.id, !hasPerm)}
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        <Dialog open={dialogOpen} onClose={handleCloseDialog}>
          <DialogTitle>{editUser ? 'Sửa Người Dùng' : ((editItem ? 'Sửa' : 'Thêm') + ' ' + (tabValue === 1 ? 'Vai Trò' : 'Quyền'))}</DialogTitle>
          <DialogContent>
            {editUser ? (
              <>
                <TextField
                  label="Tên Người Dùng"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  fullWidth
                  sx={{ mt: 2 }}
                />
                <TextField
                  label="Chức Vụ"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  fullWidth
                  sx={{ mt: 2 }}
                />
                <TextField
                  label="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  fullWidth
                  sx={{ mt: 2 }}
                />
                <TextField
                  label="Số Điện Thoại"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  fullWidth
                  sx={{ mt: 2 }}
                />
              </>
            ) : (
              <>
                <TextField
                  label="Tên"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  fullWidth
                  sx={{ mt: 2 }}
                />
                <TextField
                  label="Mô tả"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                  sx={{ mt: 2 }}
                />
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button 
              onClick={handleCloseDialog} 
              variant="outlined" 
              color="error"
              startIcon={<Cancel />}
              sx={{ mr: 2 }}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleSave} 
              variant="contained" 
              color="primary"
              startIcon={<Save />}
            >
              Lưu
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
}
