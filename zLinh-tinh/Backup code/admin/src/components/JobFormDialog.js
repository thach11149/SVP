import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Box, Typography, TextField, Select, MenuItem, FormControl, InputLabel,
  RadioGroup, FormControlLabel, Radio, Checkbox, Grid, Paper, Divider,
  Snackbar, Alert, Chip
} from '@mui/material';
import { supabase } from '../supabaseClient';

export default function JobFormDialog({ 
  open, 
  onClose, 
  onSave, 
  editJob = null, // null = tạo mới, có data = chỉnh sửa
  session 
}) {
  // Form states
  const [customers, setCustomers] = useState([]);
  const [techniciansData, setTechniciansData] = useState([]);
  const [checklistItems, setChecklistItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchTech, setSearchTech] = useState('');
  const [customChecklist, setCustomChecklist] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    customer_id: '',
    service_type: 'Định kỳ',
    scheduled_date: '',
    job_content: '',
    notes: '',
    checklist: [],
    technicians: [],
    team_lead_id: '', // Thêm field cho team lead
    status: 'Mới tạo'
  });

  const fetchData = async () => {
    try {
      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('id, customer_code, name, address, ward_name, district_name, province_name, primary_contact_name, primary_contact_phone');
      
      if (customersError) throw customersError;
      setCustomers(customersData || []);

      // Fetch technicians
      const { data: techniciansData, error: techniciansError } = await supabase
        .from('technicians')
        .select('id, tech_code, name, phone, email, position')
        .eq('active', true);
      
      if (techniciansError) throw techniciansError;
      setTechniciansData(techniciansData || []);

      // Fetch checklist items
      const { data: checklistData, error: checklistError } = await supabase
        .from('checklist')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (checklistError) throw checklistError;
      setChecklistItems(checklistData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      setSnackbar({
        open: true,
        message: 'Có lỗi khi tải dữ liệu',
        severity: 'error'
      });
    }
  };

  const loadEditData = useCallback(() => {
    if (!editJob) return;

    // Format datetime for input
    const formattedDate = editJob.scheduled_date 
      ? new Date(editJob.scheduled_date).toISOString().slice(0, 16)
      : '';
    
    // Get assigned technicians
    const assignedTechnicians = editJob.job_assignments 
      ? editJob.job_assignments.map(assignment => assignment.technicians?.id).filter(Boolean)
      : [];
    
    // Find and set selected customer
    const customer = customers.find(c => c.id === editJob.customers?.id);
    setSelectedCustomer(customer || null);
    
    setFormData({
      customer_id: editJob.customers?.id || '',
      service_type: editJob.service_type || 'Định kỳ',
      scheduled_date: formattedDate,
      job_content: editJob.job_content || '',
      notes: editJob.notes || '',
      checklist: editJob.checklist || [],
      technicians: assignedTechnicians,
      team_lead_id: editJob.team_lead_id || '', // Load team lead từ editJob
      status: editJob.status || 'Mới tạo'
    });
  }, [editJob, customers]);

  const resetForm = () => {
    setFormData({
      customer_id: '',
      service_type: 'Định kỳ',
      scheduled_date: '',
      job_content: '',
      notes: '',
      checklist: [],
      technicians: [],
      team_lead_id: '', // Reset team lead
      status: 'Mới tạo'
    });
    setSelectedCustomer(null);
    setSearchCustomer('');
    setSearchTech('');
    setCustomChecklist('');
  };

  // Load data when dialog opens
  useEffect(() => {
    if (open) {
      fetchData();
      if (editJob) {
        loadEditData();
      } else {
        resetForm();
      }
    }
  }, [open, editJob, loadEditData]);

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.customer_id || !formData.scheduled_date || !formData.job_content) {
        setSnackbar({
          open: true,
          message: 'Vui lòng điền đầy đủ các trường bắt buộc (*)',
          severity: 'error'
        });
        return;
      }

      // Validate team lead when multiple technicians
      if (formData.technicians.length > 1 && !formData.team_lead_id) {
        setSnackbar({
          open: true,
          message: 'Khi phân công nhiều nhân viên, vui lòng chọn Team Lead',
          severity: 'error'
        });
        return;
      }

      if (editJob) {
        // Update existing job
        const { error: jobError } = await supabase
          .from('jobs')
          .update({
            customer_id: formData.customer_id,
            service_type: formData.service_type,
            scheduled_date: formData.scheduled_date,
            job_content: formData.job_content,
            notes: formData.notes,
            checklist: formData.checklist,
            team_lead_id: formData.team_lead_id || null, // Update team lead
            status: formData.status
          })
          .eq('id', editJob.id)
          .select()
          .single();

        if (jobError) throw jobError;

        // Delete existing assignments
        await supabase
          .from('job_assignments')
          .delete()
          .eq('job_id', editJob.id);

        // Create new assignments
        if (formData.technicians.length > 0) {
          const assignmentData = formData.technicians.map(techId => ({
            job_id: editJob.id,
            technician_id: techId,
            status: 'assigned'
          }));

          const { error: assignmentError } = await supabase
            .from('job_assignments')
            .insert(assignmentData);

          if (assignmentError) {
            console.error('Error updating job assignments:', assignmentError);
          }
        }

        setSnackbar({
          open: true,
          message: 'Cập nhật công việc thành công!',
          severity: 'success'
        });
      } else {
        // Create new job
        const jobData = {
          customer_id: formData.customer_id,
          user_id: session?.user?.id || '00000000-0000-0000-0000-000000000000',
          service_type: formData.service_type,
          scheduled_date: formData.scheduled_date,
          job_content: formData.job_content,
          job_description: formData.job_content,
          notes: formData.notes || null,
          checklist: formData.checklist,
          team_lead_id: formData.team_lead_id || null, // Add team lead
          status: 'Mới tạo'
        };

        const { data: jobResult, error: jobError } = await supabase
          .from('jobs')
          .insert([jobData])
          .select()
          .single();

        if (jobError) throw jobError;

        // Create job assignments
        if (jobResult && jobResult.id && formData.technicians.length > 0) {
          const assignmentData = formData.technicians.map(techId => ({
            job_id: jobResult.id,
            technician_id: techId,
            status: 'assigned'
          }));

          const { error: assignmentError } = await supabase
            .from('job_assignments')
            .insert(assignmentData);

          if (assignmentError) {
            console.error('Error creating job assignments:', assignmentError);
          }
        }

        setSnackbar({
          open: true,
          message: `Công việc đã được tạo thành công! Mã công việc: ${jobResult.id}`,
          severity: 'success'
        });
      }

      // Call parent callback
      onSave && onSave();
      
      // Close dialog after short delay
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (error) {
      console.error('Error saving job:', error);
      setSnackbar({
        open: true,
        message: `Có lỗi xảy ra khi ${editJob ? 'cập nhật' : 'tạo'} công việc`,
        severity: 'error'
      });
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Add new checklist item
  const handleAddChecklist = async () => {
    const label = customChecklist.trim();
    if (
      label &&
      !checklistItems.some(opt => opt.label === label)
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
        setChecklistItems([...checklistItems, data[0]]);
        setCustomChecklist('');
        setSnackbar({
          open: true,
          message: 'Thêm checklist mới thành công!',
          severity: 'success'
        });
      }
    }
  };

  // Filter functions
  const filteredCustomers = customers.filter(customer => {
    if (!searchCustomer) return true;
    return customer.name?.toLowerCase().includes(searchCustomer.toLowerCase()) ||
           customer.customer_code?.toLowerCase().includes(searchCustomer.toLowerCase());
  });

  const filteredTechnicians = techniciansData.filter(tech => {
    if (!searchTech) return true;
    return tech.name?.toLowerCase().includes(searchTech.toLowerCase()) ||
           tech.tech_code?.toLowerCase().includes(searchTech.toLowerCase());
  });

  // Format address helper
  const formatFullAddress = (customer) => {
    if (!customer) return '';
    const parts = [
      customer.address,
      customer.ward_name,
      customer.district_name,
      customer.province_name
    ].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {editJob ? 'Chỉnh sửa Công việc' : 'Lập kế hoạch & Phân công Công việc'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              {/* Left Column */}
              <Grid item xs={12} md={6}>
                {/* Customer Information */}
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
                      value={formData.customer_id}
                      onChange={(e) => {
                        setFormData({...formData, customer_id: e.target.value});
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

                {/* Job Information */}
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} color="success.main" gutterBottom>
                    Nhóm 2: Thông tin Công việc
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <FormControl component="fieldset" sx={{ mb: 2 }}>
                    <Typography fontWeight={500} mb={1}>Loại hình dịch vụ *</Typography>
                    <RadioGroup
                      row
                      value={formData.service_type}
                      onChange={(e) => setFormData({...formData, service_type: e.target.value})}
                    >
                      <FormControlLabel value="Định kỳ" control={<Radio />} label="Định kỳ" />
                      <FormControlLabel value="1 lần" control={<Radio />} label="1 lần" />
                      <FormControlLabel value="SOS" control={<Radio />} label="SOS (Khẩn cấp)" />
                    </RadioGroup>
                  </FormControl>

                  <TextField
                    label="Ngày giờ thực hiện *"
                    type="datetime-local"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                    fullWidth sx={{ mb: 2 }}
                    required
                  />

                  <TextField
                    label="Nội dung công việc *"
                    value={formData.job_content}
                    onChange={(e) => setFormData({...formData, job_content: e.target.value})}
                    multiline rows={4}
                    fullWidth sx={{ mb: 2 }}
                    required
                    placeholder="Ví dụ: Kiểm tra vệ sinh bẫy đèn côn trùng, Bơm tổng thể khu vực kho..."
                  />

                  <TextField
                    label="Yêu cầu/Lưu ý khác"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    multiline rows={3}
                    fullWidth sx={{ mb: 2 }}
                    placeholder="Ghi chú các yêu cầu đặc biệt từ khách hàng hoặc lưu ý cho KTV..."
                  />

                  {editJob && (
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Trạng thái</InputLabel>
                      <Select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        label="Trạng thái"
                      >
                        <MenuItem value="Mới tạo">Mới tạo</MenuItem>
                        <MenuItem value="Đang thực hiện">Đang thực hiện</MenuItem>
                        <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
                        <MenuItem value="Hủy">Hủy</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                </Paper>
              </Grid>

              {/* Right Column */}
              <Grid item xs={12} md={6}>
                {/* Checklist */}
                <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" fontWeight={600} color="warning.main" gutterBottom>
                    Nhóm 3: Checklist Công việc (Tùy chọn)
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {checklistItems.map(opt => (
                    <Box key={opt.value} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.checklist.includes(opt.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({...formData, checklist: [...formData.checklist, opt.value]});
                              } else {
                                setFormData({...formData, checklist: formData.checklist.filter(v => v !== opt.value)});
                              }
                            }}
                          />
                        }
                        label={opt.label}
                        sx={{ mb: 1 }}
                      />
                      {formData.checklist.includes(opt.value) && (
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
                  </Box>
                </Paper>

                {/* Technicians */}
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

                  <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                    Chọn nhân viên tham gia:
                  </Typography>
                  
                  {filteredTechnicians.map(tech => (
                    <Box key={tech.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.technicians.includes(tech.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({...formData, technicians: [...formData.technicians, tech.id]});
                                } else {
                                  const newTechnicians = formData.technicians.filter(id => id !== tech.id);
                                  // Nếu xóa team lead, reset team_lead_id
                                  const newTeamLeadId = tech.id === formData.team_lead_id ? '' : formData.team_lead_id;
                                  // Nếu chỉ còn 1 người hoặc ít hơn, reset team lead
                                  const finalTeamLeadId = newTechnicians.length <= 1 ? '' : newTeamLeadId;
                                  
                                  setFormData({
                                    ...formData, 
                                    technicians: newTechnicians,
                                    team_lead_id: finalTeamLeadId
                                  });
                                }
                              }}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {tech.name} ({tech.tech_code})
                                {tech.id === formData.team_lead_id && (
                                  <Chip 
                                    label="Team Lead" 
                                    size="small" 
                                    color="primary" 
                                    sx={{ ml: 1, fontSize: '0.7rem' }}
                                  />
                                )}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {tech.position} - {tech.phone}
                              </Typography>
                            </Box>
                          }
                        />
                        
                        {/* Radio button chỉ hiện khi có > 1 nhân viên được chọn và nhân viên này đã được chọn */}
                        {formData.technicians.length > 1 && formData.technicians.includes(tech.id) && (
                          <FormControlLabel
                            control={
                              <Radio
                                checked={formData.team_lead_id === tech.id}
                                onChange={() => {
                                  setFormData({...formData, team_lead_id: tech.id});
                                }}
                                value={tech.id}
                                name="team-lead-radio"
                              />
                            }
                            label="Team Lead"
                            sx={{ color: 'primary.main' }}
                          />
                        )}
                      </Box>
                    </Box>
                  ))}

                  {/* Hiển thị thông báo khi có > 1 nhân viên nhưng chưa chọn team lead */}
                  {formData.technicians.length > 1 && !formData.team_lead_id && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Có nhiều hơn 1 nhân viên được chọn. Vui lòng chọn Team Lead bằng cách click vào radio button bên cạnh tên nhân viên.
                    </Alert>
                  )}

                  {formData.technicians.length > 0 && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
                      <Typography variant="body2" color="info.main">
                        <strong>Tóm tắt phân công:</strong>
                        <br />
                        • Số lượng nhân viên: {formData.technicians.length} người
                        <br />
                        • Team Lead: {formData.team_lead_id ? 
                          filteredTechnicians.find(t => t.id === formData.team_lead_id)?.name || 'N/A' 
                          : (formData.technicians.length > 1 ? 'Chưa chọn' : 'Không cần (làm cá nhân)')}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            color="primary"
          >
            {editJob ? 'Lưu thay đổi' : 'Tạo công việc'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
