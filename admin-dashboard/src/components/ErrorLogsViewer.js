import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem, FormControl, InputLabel,
  IconButton, Tooltip, Grid, Card, CardContent
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { supabase } from '../supabaseClient';
import AlertMessage from './ui/AlertMessage';

const ErrorLogsViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    level: 'all',
    resolved: 'all',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [stats, setStats] = useState({ total: 0, errors: 0, warnings: 0, info: 0, resolved: 0 });

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('error_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      // Apply filters
      if (filter.level !== 'all') {
        query = query.eq('level', filter.level);
      }

      if (filter.resolved !== 'all') {
        query = query.eq('resolved', filter.resolved === 'true');
      }

      if (filter.search) {
        query = query.ilike('message', `%${filter.search}%`);
      }

      if (filter.dateFrom) {
        query = query.gte('timestamp', filter.dateFrom);
      }

      if (filter.dateTo) {
        query = query.lte('timestamp', filter.dateTo + 'T23:59:59');
      }

      const { data, error } = await query.limit(1000);

      if (error) throw error;

      setLogs(data || []);

      // Calculate stats
      const total = data?.length || 0;
      const errors = data?.filter(log => log.level === 'error').length || 0;
      const warnings = data?.filter(log => log.level === 'warning').length || 0;
      const info = data?.filter(log => log.level === 'info').length || 0;
      const resolved = data?.filter(log => log.resolved).length || 0;

      setStats({ total, errors, warnings, info, resolved });

    } catch (error) {
      console.error('Error fetching logs:', error);
      setAlert({ open: true, message: 'Lỗi khi tải logs: ' + error.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleResolveLog = async (logId, notes) => {
    try {
      const { error } = await supabase
        .from('error_logs')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          notes: notes
        })
        .eq('id', logId);

      if (error) throw error;

      setAlert({ open: true, message: 'Đã đánh dấu log đã xử lý', severity: 'success' });
      fetchLogs();
      setResolveDialogOpen(false);
    } catch (error) {
      setAlert({ open: true, message: 'Lỗi khi cập nhật: ' + error.message, severity: 'error' });
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'error': return <ErrorIcon color="error" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'info': return <InfoIcon color="info" />;
      default: return <InfoIcon />;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('vi-VN');
  };

  const truncateMessage = (message, maxLength = 100) => {
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Nhật Ký Lỗi Hệ Thống
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tổng Logs
              </Typography>
              <Typography variant="h4">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Lỗi
              </Typography>
              <Typography variant="h4" color="error">
                {stats.errors}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Cảnh Báo
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.warnings}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Đã Xử Lý
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.resolved}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Bộ Lọc
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Mức Độ</InputLabel>
              <Select
                value={filter.level}
                onChange={(e) => setFilter({ ...filter, level: e.target.value })}
                label="Mức Độ"
              >
                <MenuItem value="all">Tất Cả</MenuItem>
                <MenuItem value="error">Lỗi</MenuItem>
                <MenuItem value="warning">Cảnh Báo</MenuItem>
                <MenuItem value="info">Thông Tin</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Trạng Thái</InputLabel>
              <Select
                value={filter.resolved}
                onChange={(e) => setFilter({ ...filter, resolved: e.target.value })}
                label="Trạng Thái"
              >
                <MenuItem value="all">Tất Cả</MenuItem>
                <MenuItem value="false">Chưa Xử Lý</MenuItem>
                <MenuItem value="true">Đã Xử Lý</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Tìm Kiếm"
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Từ Ngày"
              type="date"
              value={filter.dateFrom}
              onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Đến Ngày"
              type="date"
              value={filter.dateTo}
              onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={1}>
            <Button
              fullWidth
              variant="outlined"
              onClick={fetchLogs}
              startIcon={<RefreshIcon />}
            >
              Làm Mới
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Logs Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mức Độ</TableCell>
              <TableCell>Thời Gian</TableCell>
              <TableCell>Thông Điệp</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>User Agent</TableCell>
              <TableCell>Trạng Thái</TableCell>
              <TableCell>Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography>Đang tải...</Typography>
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography>Không có logs nào</Typography>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getLevelIcon(log.level)}
                      <Chip
                        label={log.level.toUpperCase()}
                        color={getLevelColor(log.level)}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatTimestamp(log.timestamp)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {truncateMessage(log.message)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.url}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.user_agent}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {log.resolved ? (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Đã Xử Lý"
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip
                        label="Chưa Xử Lý"
                        color="warning"
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Xem Chi Tiết">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedLog(log);
                          setDetailDialogOpen(true);
                        }}
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    </Tooltip>
                    {!log.resolved && (
                      <Tooltip title="Đánh Dấu Đã Xử Lý">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => {
                            setSelectedLog(log);
                            setResolveDialogOpen(true);
                          }}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chi Tiết Log</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Mức Độ:</Typography>
                  <Chip label={selectedLog.level.toUpperCase()} color={getLevelColor(selectedLog.level)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Thời Gian:</Typography>
                  <Typography>{formatTimestamp(selectedLog.timestamp)}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Thông Điệp:</Typography>
                  <Typography sx={{ wordBreak: 'break-word' }}>{selectedLog.message}</Typography>
                </Grid>
                {selectedLog.stack_trace && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Stack Trace:</Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.100', maxHeight: 300, overflow: 'auto' }}>
                      <pre style={{ fontSize: '0.8rem', margin: 0 }}>
                        {selectedLog.stack_trace}
                      </pre>
                    </Paper>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">URL:</Typography>
                  <Typography sx={{ wordBreak: 'break-word' }}>{selectedLog.url}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">User Agent:</Typography>
                  <Typography sx={{ wordBreak: 'break-word' }}>{selectedLog.user_agent}</Typography>
                </Grid>
                {selectedLog.request_data && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Request Data:</Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.100', maxHeight: 200, overflow: 'auto' }}>
                      <pre style={{ fontSize: '0.8rem', margin: 0 }}>
                        {JSON.stringify(selectedLog.request_data, null, 2)}
                      </pre>
                    </Paper>
                  </Grid>
                )}
                {selectedLog.response_data && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Response Data:</Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.100', maxHeight: 200, overflow: 'auto' }}>
                      <pre style={{ fontSize: '0.8rem', margin: 0 }}>
                        {JSON.stringify(selectedLog.response_data, null, 2)}
                      </pre>
                    </Paper>
                  </Grid>
                )}
                {selectedLog.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Ghi Chú:</Typography>
                    <Typography>{selectedLog.notes}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog
        open={resolveDialogOpen}
        onClose={() => setResolveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Đánh Dấu Đã Xử Lý</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Ghi Chú (tùy chọn)"
            fullWidth
            multiline
            rows={3}
            onChange={(e) => setSelectedLog({ ...selectedLog, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialogOpen(false)}>Hủy</Button>
          <Button
            onClick={() => handleResolveLog(selectedLog.id, selectedLog.notes)}
            variant="contained"
            color="success"
          >
            Xác Nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert */}
      <AlertMessage
        type={alert.severity}
        message={alert.message}
        duration={4000}
        open={alert.open}
        onClose={() => setAlert({ ...alert, open: false })}
      />
    </Box>
  );
};

export default ErrorLogsViewer;
