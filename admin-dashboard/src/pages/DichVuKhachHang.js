import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Tooltip, Dialog
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import { supabase } from '../supabaseClient';
import CustomerForm from '../components/customer/AddCustomerForm';
import AlertMessage from '../components/ui/AlertMessage';
import provincesData from '../data/provinces.json';
import districtsData from '../data/districts.json';
import wardsData from '../data/wards.json';

export default function DichVuKhachHang({ session }) {
  const [services, setServices] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          customer_sites (
            site_name, address, province, district, ward, google_map_code
          ),
          customer_service_plans (
            service_types, plan, days_of_week, frequency, start_date, end_date, report_date, report_frequency
          )
        `);

      if (error) {
        console.error('Error fetching services:', error);
      } else {
        setServices(data || []);
      }
    };

    fetchServices();
  }, []);

  const formatContractPeriod = (start, end) => {
    if (!start || !end) return '';
    return `${new Date(start).toLocaleDateString('vi-VN')} - ${new Date(end).toLocaleDateString('vi-VN')}`;
  };

  const formatReportInfo = (reportDate, reportFrequency) => {
    if (!reportDate || !reportFrequency) return '';
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayIndex = parseInt(reportDate) - 1; // Assuming 1=Monday, 7=Sunday
    const dayName = days[dayIndex] || '';
    return `${dayName}, ${reportFrequency}`;
  };

  const showAlert = (message, severity = 'info') => {
    setAlert({ open: true, message, severity });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const handleEdit = (customer) => {
    setCustomerToEdit(customer);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCustomerToEdit(null);
  };

  const handleSave = (savedCustomer) => {
    // Update the services list with the saved customer
    setServices(services.map(s => s.id === savedCustomer.id ? { ...s, ...savedCustomer } : s));
    showAlert('Cập nhật khách hàng thành công!', 'success');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dịch Vụ Khách Hàng
      </Typography>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>STT</TableCell>
                <TableCell>Tên khách hàng</TableCell>
                <TableCell>Địa điểm</TableCell>
                <TableCell>Loại hình dịch vụ</TableCell>
                <TableCell>Tần suất thực hiện</TableCell>
                <TableCell>Thời hạn hợp đồng</TableCell>
                <TableCell>Ngày báo cáo</TableCell>
                <TableCell>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((service, index) => (
                <TableRow key={service.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography fontWeight={500}>{service.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {service.customer_sites?.[0]?.address || ''}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const site = service.customer_sites?.[0];
                      if (!site) return '';
                      const provinceName = provincesData.find(p => p.code === site.province)?.name || '';
                      const districtName = districtsData.find(d => d.code === site.district)?.name || '';
                      const wardName = wardsData.find(w => w.code === site.ward)?.name || '';
                      return [provinceName, districtName, wardName].filter(Boolean).join(', ');
                    })()}
                  </TableCell>
                  <TableCell>{service.customer_service_plans?.[0]?.service_types?.join(', ') || ''}</TableCell>
                  <TableCell>{service.customer_service_plans?.[0]?.frequency || ''}</TableCell>
                  <TableCell>
                    {formatContractPeriod(service.customer_service_plans?.[0]?.start_date, service.customer_service_plans?.[0]?.end_date)}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const reportDate = service.customer_service_plans?.[0]?.report_date;
                      const reportFrequency = service.customer_service_plans?.[0]?.report_frequency;
                      if (!reportDate || !reportFrequency) return '';
                      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
                      const dayIndex = new Date(reportDate).getDay(); // 0=Sunday, 1=Monday, etc.
                      const dayName = days[dayIndex] || '';
                      return `${dayName} (${reportFrequency})`;
                    })()}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Tooltip title="Sửa thông tin khách hàng">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEdit(service)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit Dialog */}
      <CustomerForm
        open={openDialog}
        onClose={handleCloseDialog}
        onSave={handleSave}
        showAlert={showAlert}
        customerToEdit={customerToEdit}
      />

      {/* Alert Message */}
      <AlertMessage
        type={alert.severity}
        message={alert.message}
        open={alert.open}
        onClose={handleCloseAlert}
      />
    </Box>
  );
}