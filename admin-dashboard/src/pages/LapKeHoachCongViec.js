import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, Select, MenuItem, FormControl, InputLabel,
  RadioGroup, FormControlLabel, Radio, Checkbox, Button, Grid, Divider, Snackbar, Alert
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ChecklistPopup from '../components/ChecklistPopup';

export default function LapKeHoachCongViec({ session }) {
  const [searchParams] = useSearchParams();
  const preselectedCustomerId = searchParams.get('customer_id');
  const preselectedCustomerName = searchParams.get('customer_name');
  
  const [customer, setCustomer] = useState(preselectedCustomerId || '');
  const [serviceType, setServiceType] = useState('Định kỳ');
  const [datetime, setDatetime] = useState('');
  const [taskContent, setTaskContent] = useState('');
  const [notes, setNotes] = useState('');
  const [technicians, setTechnicians] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, type: 'success', message: '' });
  const [searchTech, setSearchTech] = useState('');
  const [checklistOptionsState, setChecklistOptionsState] = useState([]);
  const [customChecklist, setCustomChecklist] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [techniciansData, setTechniciansData] = useState([]);
  const [openChecklistPopup, setOpenChecklistPopup] = useState(false);

  useEffect(() => {
    console.log('Component mounted, starting data fetch...');
    
    const fetchCustomers = async () => {
      console.log('Starting to fetch customers...');
      const { data, error } = await supabase
        .from('customers')
        .select('id, customer_code, name, address, ward_name, district_name, province_name, primary_contact_name, primary_contact_phone');
      
      if (error) {
        console.error('Error fetching customers:', error);
        setSnackbar({ 
          open: true, 
          type: 'error', 
          message: `Lỗi khi tải danh sách khách hàng: ${error.message}` 
        });
      } else {
        console.log('Customers loaded successfully:', data?.length || 0, data);
        setCustomers(data || []);
      }
    };

    const fetchTechnicians = async () => {
      const { data, error } = await supabase
        .from('technicians')
        .select('id, tech_code, name, phone, email, position')
        .eq('active', true);
      if (error) {
        console.error('Error fetching technicians:', error);
      } else {
        setTechniciansData(data);
      }
    };

    const fetchChecklist = async () => {
      const { data, error } = await supabase
        .from('checklist')
        .select('id, label, value, unit, notes')
        .order('created_at', { ascending: true });
      if (error) {
        console.error('Error fetching checklist:', error);
      } else {
        setChecklistOptionsState(data || []);
      }
    };

    fetchCustomers();
    fetchTechnicians();
    fetchChecklist();
    
    // Nếu có preselected customer, tìm và set selected customer
    if (preselectedCustomerId && customers.length > 0) {
      const preselectedCustomer = customers.find(c => c.id === preselectedCustomerId);
      if (preselectedCustomer) {
        setSelectedCustomer(preselectedCustomer);
      }
    }
  }, [preselectedCustomerId, customers.length]);

  const handleChecklistAdded = (newItems) => {
    // Refresh checklist sau khi thêm mới từ popup
    const fetchChecklist = async () => {
      const { data, error } = await supabase
        .from('checklist')
        .select('id, label, value, unit, notes')
        .order('created_at', { ascending: true });
      if (error) {
        console.error('Error fetching checklist:', error);
      } else {
        setChecklistOptionsState(data || []);
      }
    };
    fetchChecklist();
    setSnackbar({ 
      open: true, 
      type: 'success', 
      message: `Đã thêm ${newItems.length} checklist mới!` 
    });
  };

  const filteredTechnicians = techniciansData.filter(
    tech => {
      if (!searchTech) return true;
      const searchTerm = searchTech.toLowerCase();
      return (
        tech.name.toLowerCase().includes(searchTerm) ||
        (tech.tech_code && tech.tech_code.toLowerCase().includes(searchTerm)) ||
        tech.id.toString().toLowerCase().includes(searchTerm)
      );
    }
  );

  const filteredCustomers = customers.filter(c => {
    if (!searchCustomer.trim()) return true;
    
    const searchTerm = searchCustomer.toLowerCase().trim();
    const customerName = (c.name || '').toLowerCase();
    const customerCode = (c.customer_code || '').toLowerCase();
    
    return customerName.includes(searchTerm) || customerCode.includes(searchTerm);
  });

  // Function để format địa chỉ đầy đủ
  const formatFullAddress = (customer) => {
    if (!customer) return '';
    
    const parts = [];
    if (customer.address) parts.push(customer.address);
    if (customer.ward_name) parts.push(customer.ward_name);
    if (customer.district_name) parts.push(customer.district_name);
    if (customer.province_name) parts.push(customer.province_name);
    
    return parts.join(', ');
  };

  const resetForm = () => {
    setCustomer('');
    setServiceType('Định kỳ');
    setDatetime('');
    setTaskContent('');
    setNotes('');
    setTechnicians([]);
    setChecklist([]);
    setSearchTech('');
    setSearchCustomer('');
    setSelectedCustomer(null);
    setCustomChecklist('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer || !serviceType || !datetime || !taskContent || technicians.length === 0) {
      setSnackbar({ open: true, type: 'error', message: 'Vui lòng điền đầy đủ các trường bắt buộc (*)' });
      return;
    }

    try {
      // Tạo object dữ liệu công việc phù hợp với schema
      const jobData = {
        customer_id: customer,
        user_id: session?.user?.id || '00000000-0000-0000-0000-000000000000',
        service_type: serviceType,
        scheduled_date: datetime,
        job_content: taskContent,
        job_description: taskContent,
        notes: notes || null,
        checklist: checklist,
        status: 'Mới tạo'
      };

      // Lưu công việc vào bảng jobs
      const { data: jobResult, error: jobError } = await supabase
        .from('jobs')
        .insert([jobData])
        .select()
        .single();

      if (jobError) {
        console.error('Error creating job:', jobError);
        setSnackbar({ 
          open: true, 
          type: 'error', 
          message: `Lỗi khi tạo công việc: ${jobError.message}` 
        });
        return;
      }

      // Nếu có job_id, tạo các bản ghi phân công trong bảng job_assignments
      if (jobResult && jobResult.id && technicians.length > 0) {
        const assignmentData = technicians.map(techId => ({
          job_id: jobResult.id,
          technician_id: techId,
          status: 'assigned'
        }));

        const { error: assignmentError } = await supabase
          .from('job_assignments')
          .insert(assignmentData);

        if (assignmentError) {
          console.error('Error creating job assignments:', assignmentError);
          setSnackbar({ 
            open: true, 
            type: 'warning', 
            message: 'Công việc đã được tạo nhưng có lỗi khi phân công nhân viên' 
          });
          return;
        }
      }

      // Thành công
      setSnackbar({ 
        open: true, 
        type: 'success', 
        message: `Công việc đã được tạo và giao thành công! Mã công việc: ${jobResult.id}` 
      });
      resetForm();

    } catch (error) {
      console.error('Unexpected error:', error);
      setSnackbar({ 
        open: true, 
        type: 'error', 
        message: 'Có lỗi không mong muốn xảy ra. Vui lòng thử lại.' 
      });
    }
  };

  // Thêm mục checklist mới vào Supabase
  const handleAddChecklist = async () => {
    const label = customChecklist.trim();
    if (
      label &&
      !checklistOptionsState.some(opt => opt.label === label)
    ) {
      const value = label.toLowerCase().replace(/\s+/g, '_');
      const { data, error } = await supabase
        .from('checklist')
        .insert([{ 
          label, 
          value,
          unit: 'cái',
          notes: ''
        }])
        .select();
      if (!error && data && data.length > 0) {
        setChecklistOptionsState([...checklistOptionsState, data[0]]);
        setCustomChecklist('');
      }
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: '#f5f6fa', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 4 }, borderRadius: 4 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" fontWeight={700}>Lập kế hoạch & Phân công Công việc</Typography>
          <Typography color="text.secondary" mt={1}>
            Điền thông tin chi tiết để tạo và giao việc cho nhân viên kỹ thuật.
          </Typography>
          {preselectedCustomerName && (
            <Typography color="primary" fontWeight={500} mt={1}>
              📋 Tạo công việc cho khách hàng: {decodeURIComponent(preselectedCustomerName)}
            </Typography>
          )}
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4} alignItems="stretch">
            {/* Left Column */}
            <Grid item xs={12} md={6}>
              {/* Nhóm 1: Thông tin Khách hàng */}
              <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" fontWeight={600} color="primary" gutterBottom>
                  Nhóm 1: Thông tin Khách hàng
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <TextField
                  label="Tìm kiếm khách hàng"
                  value={searchCustomer}
                  onChange={e => setSearchCustomer(e.target.value)}
                  fullWidth
                  sx={{ mb: 2 }}
                  placeholder="Nhập tên hoặc mã khách hàng..."
                />
                
                <FormControl fullWidth required sx={{ mb: 2 }}>
                  <InputLabel>Khách hàng *</InputLabel>
                  <Select
                    value={customer}
                    onChange={e => {
                      setCustomer(e.target.value);
                      const cust = customers.find(c => c.id === e.target.value);
                      setSelectedCustomer(cust || null);
                    }}
                    label="Khách hàng *"
                  >
                    <MenuItem value=""><em>-- Chọn khách hàng --</em></MenuItem>
                    {filteredCustomers.map(c => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Mã Khách hàng"
                  value={selectedCustomer?.customer_code || ''}
                  InputProps={{ readOnly: true }}
                  fullWidth sx={{ mb: 2 }}
                  variant="outlined"
                />
                <TextField
                  label="Người liên hệ"
                  value={selectedCustomer?.primary_contact_name || ''}
                  InputProps={{ readOnly: true }}
                  fullWidth sx={{ mb: 2 }}
                  variant="outlined"
                />
                <TextField
                  label="Địa chỉ thực hiện"
                  value={formatFullAddress(selectedCustomer)}
                  InputProps={{ readOnly: true }}
                  fullWidth multiline rows={2}
                  sx={{ mb: 2 }}
                  variant="outlined"
                />
                <TextField
                  label="Số điện thoại"
                  value={selectedCustomer?.primary_contact_phone || ''}
                  InputProps={{ readOnly: true }}
                  fullWidth sx={{ mb: 2 }}
                  variant="outlined"
                />
              </Paper>
              {/* Nhóm 2: Thông tin Công việc */}
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} color="success.main" gutterBottom>
                  Nhóm 2: Thông tin Công việc
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <FormControl component="fieldset" sx={{ mb: 2 }}>
                  <Typography fontWeight={500} mb={1}>Loại hình dịch vụ *</Typography>
                  <RadioGroup
                    row
                    value={serviceType}
                    onChange={e => setServiceType(e.target.value)}
                  >
                    <FormControlLabel value="Định kỳ" control={<Radio />} label="Định kỳ" />
                    <FormControlLabel value="1 lần" control={<Radio />} label="1 lần" />
                    <FormControlLabel value="SOS" control={<Radio />} label="SOS (Khẩn cấp)" />
                  </RadioGroup>
                </FormControl>
                <TextField
                  label="Ngày giờ thực hiện *"
                  type="datetime-local"
                  value={datetime}
                  onChange={e => setDatetime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth sx={{ mb: 2 }}
                  required
                />
                <TextField
                  label="Nội dung công việc *"
                  value={taskContent}
                  onChange={e => setTaskContent(e.target.value)}
                  multiline rows={4}
                  fullWidth sx={{ mb: 2 }}
                  required
                  placeholder="Ví dụ: Kiểm tra vệ sinh bẫy đèn côn trùng, Bơm tổng thể khu vực kho..."
                />
                <TextField
                  label="Yêu cầu/Lưu ý khác"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  multiline rows={3}
                  fullWidth sx={{ mb: 2 }}
                  placeholder="Ghi chú các yêu cầu đặc biệt từ khách hàng hoặc lưu ý cho KTV..."
                />
              </Paper>
            </Grid>
            {/* Right Column */}
            <Grid item xs={12} md={6}>
              {/* Nhóm 3: Checklist Công việc */}
              <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" fontWeight={600} color="warning.main" gutterBottom>
                  Nhóm 3: Checklist Công việc (Tùy chọn)
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {checklistOptionsState.map(opt => (
                  <Box key={opt.value} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checklist.includes(opt.value)}
                          onChange={e => {
                            if (e.target.checked) {
                              setChecklist([...checklist, opt.value]);
                            } else {
                              setChecklist(checklist.filter(v => v !== opt.value));
                            }
                          }}
                        />
                      }
                      label={opt.label}
                      sx={{ mb: 1 }}
                    />
                    {checklist.includes(opt.value) && (
                      <Box sx={{ ml: 4, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <TextField
                          label="Số lượng"
                          type="number"
                          defaultValue={1}
                          size="small"
                          sx={{ width: 100 }}
                        />
                        <TextField
                          label="Đơn vị"
                          defaultValue={opt.unit || 'cái'}
                          size="small"
                          sx={{ width: 80 }}
                        />
                        <TextField
                          label="Ghi chú"
                          defaultValue={opt.notes || ''}
                          size="small"
                          sx={{ flexGrow: 1, minWidth: 150 }}
                          placeholder="Ghi chú thêm..."
                        />
                      </Box>
                    )}
                  </Box>
                ))}
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <TextField
                    label="Thêm mục checklist"
                    value={customChecklist}
                    onChange={e => setCustomChecklist(e.target.value)}
                    size="small"
                    sx={{ flexGrow: 1 }}
                  />
                  <Button variant="contained" onClick={handleAddChecklist}>Thêm mục</Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => setOpenChecklistPopup(true)}
                  >
                    Thêm nhiều
                  </Button>
                </Box>
              </Paper>
              {/* Nhóm 4: Phân công Nhân viên */}
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} color="secondary" gutterBottom>
                  Nhóm 4: Phân công Nhân viên
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TextField
                  label="Tìm kiếm nhân viên"
                  value={searchTech}
                  onChange={e => setSearchTech(e.target.value)}
                  fullWidth
                  sx={{ mb: 2 }}
                  placeholder="Nhập tên hoặc mã nhân viên..."
                />
                <Box>
                  {filteredTechnicians.map(tech => (
                    <Box key={tech.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={technicians.includes(tech.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setTechnicians([...technicians, tech.id]);
                              } else {
                                setTechnicians(technicians.filter(id => id !== tech.id));
                              }
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {tech.name} ({tech.tech_code})
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {tech.position} - {tech.phone}
                            </Typography>
                          </Box>
                        }
                      />
                    </Box>
                  ))}
                </Box>
                <Typography variant="caption" color="text.secondary" mt={1}>
                  Chọn một hoặc nhiều nhân viên thực hiện.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          {/* Action Buttons */}
          <Divider sx={{ my: 4 }} />
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="outlined" color="inherit" onClick={resetForm}>
              Reset Form
            </Button>
            <Button variant="contained" color="primary" type="submit" size="large">
              Tạo và Giao Công việc
            </Button>
          </Box>
        </form>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.type}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Popup thêm checklist */}
        <ChecklistPopup
          open={openChecklistPopup}
          onClose={() => setOpenChecklistPopup(false)}
          onChecklistAdded={handleChecklistAdded}
        />
      </Paper>
    </Box>
  );
}