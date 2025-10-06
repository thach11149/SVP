import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { supabase } from '../supabaseClient';

export default function DichVuKhachHang({ session }) {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          id, name, address, province_name,
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

  const formatReportDay = (daysOfWeek, reportFrequency) => {
    if (!daysOfWeek || daysOfWeek.length === 0) return '';
    const daysStr = daysOfWeek.join(', ');
    return `${daysStr} (${reportFrequency})`;
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
                        {service.address}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{service.province_name}</TableCell>
                  <TableCell>{service.customer_service_plans?.[0]?.service_types?.join(', ') || ''}</TableCell>
                  <TableCell>{service.customer_service_plans?.[0]?.frequency || ''}</TableCell>
                  <TableCell>
                    {formatContractPeriod(service.customer_service_plans?.[0]?.start_date, service.customer_service_plans?.[0]?.end_date)}
                  </TableCell>
                  <TableCell>
                    {formatReportDay(service.customer_service_plans?.[0]?.days_of_week, service.customer_service_plans?.[0]?.report_frequency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}