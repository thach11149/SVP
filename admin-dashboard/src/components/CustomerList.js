import React from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Checkbox
} from '@mui/material';

const CustomerList = ({
  customers,
  selectedCustomers,
  handleSelectCustomer,
  handleSelectAllCustomers,
  handleGenerateJobs,
  formatContractPeriod,
  formatReportDay
}) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Danh sách địa điểm dịch vụ
        {selectedCustomers.length > 0 && (
          <Typography component="span" variant="body2" color="primary" sx={{ ml: 1 }}>
            ({selectedCustomers.length === customers.length ? 'Đã chọn tất cả ' : 'Đã chọn '}
            {selectedCustomers.length} địa điểm)
          </Typography>
        )}
      </Typography>
      <TableContainer sx={{ maxHeight: '50vh', overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>
                <Checkbox
                  checked={selectedCustomers.length === customers.length && customers.length > 0}
                  indeterminate={selectedCustomers.length > 0 && selectedCustomers.length < customers.length}
                  onChange={handleSelectAllCustomers}
                />
              </TableCell>
              <TableCell>STT</TableCell>
              <TableCell>Tên khách hàng - Địa điểm</TableCell>
              <TableCell>Loại hình dịch vụ</TableCell>
              <TableCell>Tần suất thực hiện</TableCell>
              <TableCell>Thời hạn hợp đồng</TableCell>
              <TableCell>Ngày báo cáo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((service, index) => (
              <TableRow key={service.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedCustomers.includes(service.id)}
                    onChange={() => handleSelectCustomer(service.id)}
                  />
                </TableCell>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Box>
                    <Typography fontWeight={500}>
                      {service.customers?.name} - {service.site_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {service.address}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{service.customer_sites_plans?.[0]?.service_types?.join(', ') || ''}</TableCell>
                <TableCell>{service.customer_sites_plans?.[0]?.frequency || ''}</TableCell>
                <TableCell>
                  {formatContractPeriod(service.customer_sites_plans?.[0]?.start_date, service.customer_sites_plans?.[0]?.end_date)}
                </TableCell>
                <TableCell>
                  {formatReportDay(service.customer_sites_plans?.[0]?.days_of_week, service.customer_sites_plans?.[0]?.report_frequency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button variant="contained" onClick={handleGenerateJobs}>
          Tạo Công Việc
        </Button>
      </Box>
    </Paper>
  );
};

export default CustomerList;
