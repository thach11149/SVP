import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, Select, MenuItem, FormControl, InputLabel,
  RadioGroup, FormControlLabel, Radio, Checkbox, Button, Grid, Divider, Snackbar, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ChecklistPopup from '../components/job/ChecklistPopup';

export default function DichVuKhachHang({ session }) {
  const [searchParams] = useSearchParams();
  const preselectedCustomerId = searchParams.get('customer_id');
  // Comment để tránh lỗi ESLint no-unused-vars
  // const preselectedCustomerName = searchParams.get('customer_name');
  
  const [customer, setCustomer] = useState(preselectedCustomerId || '');
  const [serviceType, setServiceType] = useState('Định kỳ');
  const [datetime, setDatetime] = useState('');
  const [taskContent, setTaskContent] = useState('');
  const [notes, setNotes] = useState('');
  const [technicians, setTechnicians] = useState([]);
  const [teamLead, setTeamLead] = useState(''); // ID của team lead
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
  // Vật tư/hóa chất
  const [materialsList, setMaterialsList] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]); // [{material_id, name, unit, category, required_quantity}]

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
        // Sắp xếp theo ABC
        const sortedData = (data || []).sort((a, b) => a.label.localeCompare(b.label));
        setChecklistOptionsState(sortedData);
      }
    };

    fetchCustomers();
    fetchTechnicians();
    fetchChecklist();
    // Fetch materials
    const fetchMaterials = async () => {
      const { data, error } = await supabase
        .from('materials')
        .select('id, name, unit, category')
        .eq('active', true)
        .order('name', { ascending: true });
      if (!error && data) setMaterialsList(data);
    };
    fetchMaterials();
    
  }, []); // Chỉ chạy một lần khi mount

  // useEffect riêng cho set selectedCustomer khi preselectedCustomerId hoặc customers thay đổi
  useEffect(() => {
    if (preselectedCustomerId && customers.length > 0) {
      const preselectedCustomer = customers.find(c => c.id === preselectedCustomerId);
      if (preselectedCustomer) {
        setSelectedCustomer(preselectedCustomer);
      }
    }
  }, [preselectedCustomerId, customers]);

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
    setTeamLead('');
    setChecklist([]);
    setSearchTech('');
    setSearchCustomer('');
    setSelectedCustomer(null);
    setCustomChecklist('');
    setSelectedMaterials([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer || !serviceType || !datetime || !taskContent || technicians.length === 0) {
      setSnackbar({ open: true, type: 'error', message: 'Vui lòng điền đầy đủ các trường bắt buộc (*)' });
      return;
    }

    try {
      // Tách ngày và giờ
      const [date, time] = datetime.split('T');
      
      // Xác định team members names cho hiển thị
      const selectedTechNames = techniciansData
        .filter(tech => technicians.includes(tech.id))
        .map(tech => tech.name);
      const teamMembersString = selectedTechNames.length > 1 ? selectedTechNames.join(', ') : null;
      
      // Tạo một job chung cho tất cả technicians
      const jobData = {
        customer_id: customer,
        created_by: session?.user?.id, // Người tạo job
        service_type: serviceType,
        scheduled_date: date,
        scheduled_time: time || null,
        job_content: taskContent,
        job_description: taskContent,
        notes: notes || null,
        special_requests: notes || null,
        contact_person: selectedCustomer?.primary_contact_name || '',
        contact_phone: selectedCustomer?.primary_contact_phone || '',
        address: formatFullAddress(selectedCustomer),
        checklist: checklist,
        status: 'Đã giao',
        team_members: teamMembersString,
        team_lead_id: teamLead || null,
        team_size: technicians.length
      };

      // Lưu công việc vào bảng jobs
      const { data: jobResult, error: jobError } = await supabase
        .from('jobs')
        .insert([jobData])
        .select()
        .single();

      if (jobError) {
        throw new Error(`Lỗi khi tạo công việc: ${jobError.message}`);
      }

      // Tạo job assignments cho từng technician
      const assignmentPromises = technicians.map(async (technicianUserId) => {
        // Lấy technician record từ user_id
        const { data: techData, error: techError } = await supabase
          .from('technicians')
          .select('id')
          .eq('user_id', technicianUserId)
          .single();

        if (techError || !techData) {
          throw new Error(`Không tìm thấy technician record cho user ${technicianUserId}: ${techError?.message}`);
        }

        const assignmentData = {
          job_id: jobResult.id,
          technician_id: techData.id, // Sử dụng technicians.id
          role: technicianUserId === teamLead ? 'lead' : 'member',
          status: 'assigned'
        };

        const { error: assignmentError } = await supabase
          .from('job_assignments')
          .insert([assignmentData]);

        if (assignmentError) {
          throw new Error(`Lỗi khi phân công cho technician ${technicianUserId}: ${assignmentError.message}`);
        }

        return assignmentData;
      });

      // Chờ tất cả assignments được tạo
      await Promise.all(assignmentPromises);

      // Lưu checklist vào bảng job_checklist_items
      if (jobResult && jobResult.id && checklist.length > 0) {
        const checklistItems = checklist.map(value => ({
          job_id: jobResult.id,
          checklist_id: checklistOptionsState.find(opt => opt.value === value)?.id,
          completed: false
        }));
        await supabase.from('job_checklist_items').insert(checklistItems);
      }

      // Lưu vật tư/hóa chất vào bảng job_materials
      if (jobResult && jobResult.id && selectedMaterials.length > 0) {
        const materialsData = selectedMaterials.map(mat => ({
          job_id: jobResult.id,
          material_id: mat.material_id,
          required_quantity: mat.required_quantity,
          notes: mat.notes || ''
        }));
        await supabase.from('job_materials').insert(materialsData);
      }

      setSnackbar({ 
        open: true, 
        type: 'success', 
        message: `Đã tạo và phân công thành công công việc cho ${selectedTechNames.join(', ')}! Mã công việc: ${jobResult.id}` 
      });
      resetForm();

    } catch (error) {
      setSnackbar({ open: true, type: 'error', message: 'Có lỗi không mong muốn xảy ra. Vui lòng thử lại.' });
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
          {/* Comment dòng này để không hiển thị */}
          {/* {preselectedCustomerName && (
            <Typography color="primary" fontWeight={500} mt={1}>
              📋 Tạo công việc cho khách hàng: {decodeURIComponent(preselectedCustomerName)}
            </Typography>
          )} */}
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4} alignItems="stretch">
            {/* Left Column */}
            <Grid size={{ xs: 12, md: 6 }}>
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
                {/* Thay TextField thành Typography cho các trường không sửa được */}
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Người liên hệ:</strong> {selectedCustomer?.primary_contact_name || ''}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Chức vụ:</strong> {selectedCustomer?.primary_contact_position || ''}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Số điện thoại liên hệ:</strong> {selectedCustomer?.primary_contact_phone || ''}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Địa chỉ thực hiện:</strong> {formatFullAddress(selectedCustomer)}
                </Typography>
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
            <Grid size={{ xs: 12, md: 6 }}>
              {/* Nhóm 3b: Vật tư/Hóa chất cần chuẩn bị */}
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
                        <TableCell>Ghi chú</TableCell>
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
                                // Nếu là người đầu tiên được chọn, tự động set làm lead
                                if (technicians.length === 0) {
                                  setTeamLead(tech.id);
                                }
                                setTechnicians([...technicians, tech.id]);
                              } else {
                                setTechnicians(technicians.filter(id => id !== tech.id));
                                // Nếu bỏ chọn lead, reset teamLead
                                if (teamLead === tech.id) {
                                  setTeamLead('');
                                }
                              }
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography fontWeight={500}>{tech.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {tech.tech_code} - {tech.position}
                            </Typography>
                          </Box>
                        }
                        sx={{ mb: 1 }}
                      />
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Nhóm 3: Checklist Công việc - Chiếm 100% chiều rộng */}
          <Paper variant="outlined" sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" fontWeight={600} color="warning.main" gutterBottom>
              Nhóm 3: Checklist Công việc (Tùy chọn)
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {/* Cột trái: Chọn checklist - Chiếm 60% */}
              <Grid size={{ xs: 12, md: 7 }}>
                <Typography variant="subtitle1" gutterBottom>Chọn checklist:</Typography>
                <Box>
                  {checklistOptionsState.map(opt => (
                    <FormControlLabel
                      key={opt.value}
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
                      sx={{ display: 'block', mb: 0.5 }}  // Giảm margin bottom để gần nhau hơn
                    />
                  ))}
                </Box>
              </Grid>
              {/* Cột phải: Hiển thị kết quả đã chọn - Chiếm 40% */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Typography variant="subtitle1" gutterBottom>Đã chọn:</Typography>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, minHeight: 100 }}>
                  {checklist.length > 0 ? (
                    checklistOptionsState
                      .filter(opt => checklist.includes(opt.value))
                      .map((opt, index) => (
                        <Typography key={opt.value} variant="body1">
                          {/* Đổi từ body2 thành body1 để size chữ to bằng */}
                          {index + 1}. {opt.label}
                        </Typography>
                      ))
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      {/* Đổi từ body2 thành body1 */}
                      Chưa chọn checklist nào.
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
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

          {/* Nút tạo công việc */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button 
              type="submit" 
              variant="contained" 
              size="large"
              sx={{ 
                px: 4, 
                py: 2, 
                fontSize: '1rem',
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: '#fff',
                '&:hover': {
                  bgcolor: 'primary.dark',
                }
              }}
            >
              <Typography fontWeight={600}>Tạo và phân công công việc</Typography>
            </Button>
          </Box>
        </form>

        {/* Snackbar thông báo */}
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

        {/* Popup thêm checklist mới */}
        <ChecklistPopup 
          open={openChecklistPopup} 
          onClose={() => setOpenChecklistPopup(false)}
          onChecklistAdded={handleChecklistAdded}
        />
      </Paper>
    </Box>
  );
}