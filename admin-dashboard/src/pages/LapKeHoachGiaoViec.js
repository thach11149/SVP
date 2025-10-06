import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, TextField, Select, MenuItem, FormControl, InputLabel,
  Button, Paper, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, ListItemButton, Autocomplete, Checkbox, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase } from '../supabaseClient';

const generateContractJobs = (clientName, startDate, endDate, targetDayOfWeek, frequencyWeeks) => {
  const jobs = [];
  const currentDate = new Date(startDate);
  const end = new Date(endDate);
  const targetDay = parseInt(targetDayOfWeek);
  const frequency = parseInt(frequencyWeeks) * 7;

  // Move to first execution day
  while (currentDate.getDay() + 1 !== targetDay && currentDate <= end) {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Generate jobs
  while (currentDate <= end) {
    if (currentDate >= startDate) {
      jobs.push({
        id: Date.now() + Math.random(),
        clientName,
        date: new Date(currentDate),
        status: 'unassigned',
        assignedTechs: [],
        startTime: '08:00',
        endTime: '10:00',
        isDeleted: false,
        deleteNote: ''
      });
    }
    currentDate.setDate(currentDate.getDate() + frequency);
  }

  return jobs;
};

export default function TestPage() {
  const [formData, setFormData] = useState({
    clientName: '',
    startDate: new Date(),
    endDate: new Date(),
    targetDayOfWeek: '7', // Chủ Nhật
    frequencyWeeks: '2',
    reportDate: new Date()
  });

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTechnicians, setSelectedTechnicians] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [techniciansData, setTechniciansData] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [filterType, setFilterType] = useState('week'); // 'week', 'month', 'range'
  const [filterStartDate, setFilterStartDate] = useState(new Date());
  const [filterEndDate, setFilterEndDate] = useState(new Date());

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          id, name, address, province_name,
          customer_service_plans (
            service_types, plan, days_of_week, frequency, start_date, end_date, report_date, report_frequency
          )
        `);
      
      if (error) {
        console.error('Error fetching customers:', error);
      } else {
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

    const fetchServicesAndJobs = async () => {
      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('customers')
        .select(`
          id, name, address, province_name,
          customer_service_plans (
            service_types, plan, days_of_week, frequency, start_date, end_date, report_date, report_frequency
          )
        `);

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
        return;
      }

      // Fetch existing jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('scheduled_jobs')
        .select('*')
        .order('scheduled_date', { ascending: true });

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError);
        return;
      }

      if (jobsData && jobsData.length > 0) {
        // Convert to job format
        const existingJobs = jobsData.map(job => ({
          id: job.id,
          customerId: job.customer_id,
          clientName: job.customer_name,
          date: new Date(job.scheduled_date),
          status: job.status,
          assignedTechs: job.assigned_technicians || [],
          startTime: job.start_time || '08:00',
          endTime: job.end_time || '10:00',
          isDeleted: job.is_deleted || false,
          deleteNote: job.delete_note || '',
          serviceContent: job.service_content || ''
        }));
        setJobs(existingJobs);
      } else {
        // Auto generate jobs from services and insert to database
        const generatedJobs = [];
        servicesData.forEach(customer => {
          customer.customer_service_plans?.forEach(plan => {
            if (plan.days_of_week && plan.frequency && plan.start_date && plan.end_date) {
              plan.days_of_week.forEach(day => {
                const jobsForDay = generateContractJobs(
                  customer.name,
                  new Date(plan.start_date),
                  new Date(plan.end_date),
                  day.toString(),
                  plan.frequency.toString()
                ).map(job => ({
                  ...job,
                  customerId: customer.id,
                  serviceContent: plan.service_types?.join(', ') || ''
                }));
                generatedJobs.push(...jobsForDay);
              });
            }
          });
        });

        // Insert to database
        if (generatedJobs.length > 0) {
          const jobsToInsert = generatedJobs.map(job => ({
            customer_id: job.customerId,
            customer_name: job.clientName,
            scheduled_date: job.date.toISOString().split('T')[0],
            status: job.status,
            assigned_technicians: job.assignedTechs,
            start_time: job.startTime,
            end_time: job.endTime,
            is_deleted: job.isDeleted,
            delete_note: job.deleteNote,
            service_content: job.serviceContent
          }));

          const { data: insertedJobs, error: insertError } = await supabase
            .from('scheduled_jobs')
            .insert(jobsToInsert)
            .select();

          if (insertError) {
            console.error('Error inserting jobs:', insertError);
          } else {
            // Set jobs with database ids
            const jobsWithIds = insertedJobs.map((dbJob, index) => ({
              ...generatedJobs[index],
              id: dbJob.id
            }));
            setJobs(jobsWithIds);
          }
        }
      }
    };

    fetchCustomers();
    fetchTechnicians();
    fetchServicesAndJobs();
  }, []);

  const formatContractPeriod = (start, end) => {
    if (!start || !end) return '';
    return `${new Date(start).toLocaleDateString('vi-VN')} - ${new Date(end).toLocaleDateString('vi-VN')}`;
  };

  const formatDateWithDay = (date) => {
    const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayName = days[date.getDay()];
    const dateStr = date.toLocaleDateString('vi-VN');
    return `${dayName}, ${dateStr}`;
  };

  const formatReportDay = (daysOfWeek, reportFrequency) => {
    if (!daysOfWeek || daysOfWeek.length === 0) return '';
    const daysStr = daysOfWeek.join(', ');
    return `${daysStr} (${reportFrequency})`;
  };

  const handleSelectCustomer = (customerId) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAllCustomers = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map(customer => customer.id));
    }
  };

  const dayMap = { 'Chủ Nhật': 1, 'Thứ 2': 2, 'Thứ 3': 3, 'Thứ 4': 4, 'Thứ 5': 5, 'Thứ 6': 6, 'Thứ 7': 7 };

  const parseFrequency = (freq) => {
    if (typeof freq === 'number') return freq;
    if (freq === 'Hàng tuần') return 1;
    if (freq === '2 tuần') return 2;
    if (freq === '4 tuần') return 4;
    return parseInt(freq) || 1;
  };

  const handleGenerateJobs = async () => {
    if (selectedCustomers.length === 0) {
      alert('Vui lòng chọn ít nhất một khách hàng.');
      return;
    }

    // Generate jobs for selected customers
    const generatedJobs = [];
    selectedCustomers.forEach(customerId => {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        customer.customer_service_plans?.forEach(plan => {
          console.log('Processing plan for customer:', customer.name, plan);
          if (plan.days_of_week && plan.frequency && plan.start_date && plan.end_date) {
            const frequency = parseFrequency(plan.frequency);
            plan.days_of_week.forEach(day => {
              const dayNumber = typeof day === 'string' ? dayMap[day] : day;
              if (dayNumber) {
                console.log('Generating for day:', day, '->', dayNumber, 'frequency:', frequency);
                const jobsForDay = generateContractJobs(
                  customer.name,
                  new Date(plan.start_date),
                  new Date(plan.end_date),
                  dayNumber.toString(),
                  frequency.toString()
                );
                console.log('Jobs for day:', jobsForDay.length);
                generatedJobs.push(...jobsForDay.map(job => ({
                  ...job,
                  customerId: customer.id,
                  serviceContent: plan.service_types?.join(', ') || ''
                })));
              }
            });
          } else {
            console.log('Plan missing required fields:', plan);
          }
        });
      }
    });

    console.log('Total generated jobs:', generatedJobs.length);

    // Insert to database
    if (generatedJobs.length > 0) {
      const jobsToInsert = generatedJobs.map(job => ({
        customer_id: job.customerId,
        customer_name: job.clientName,
        scheduled_date: job.date.toISOString().split('T')[0],
        status: job.status,
        assigned_technicians: job.assignedTechs,
        start_time: job.startTime,
        end_time: job.endTime,
        is_deleted: job.isDeleted,
        delete_note: job.deleteNote,
        service_content: job.serviceContent
      }));

      const { data: insertedJobs, error: insertError } = await supabase
        .from('scheduled_jobs')
        .insert(jobsToInsert)
        .select();

      if (insertError) {
        console.error('Error inserting jobs:', insertError);
        alert('Lỗi khi tạo lịch công việc!');
      } else {
        // Set jobs with database ids
        const jobsWithIds = insertedJobs.map((dbJob, index) => ({
          ...generatedJobs[index],
          id: dbJob.id
        }));
        setJobs(prevJobs => [...prevJobs, ...jobsWithIds]);
        alert('Lịch công việc đã được tạo và lưu thành công!');
      }
    } else {
      alert('Không có công việc nào được tạo. Kiểm tra dữ liệu hợp đồng.');
    }
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setIsEditing(job.status === 'assigned');
    setSelectedTechnicians(job.status === 'assigned' ? job.assignedTechs.map(a => a.techId) : []);
    setAssignDialogOpen(true);
  };

  const handleAssignTech = (techId, startTime, endTime) => {
    const newAssigned = [...selectedJob.assignedTechs, { techId, startTime, endTime }];
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === selectedJob.id
          ? {
              ...job,
              assignedTechs: newAssigned,
              status: 'assigned'
            }
          : job
      )
    );
    // Update database
    supabase
      .from('scheduled_jobs')
      .update({
        assigned_technicians: newAssigned,
        status: 'assigned'
      })
      .eq('id', selectedJob.id)
      .then(({ error }) => {
        if (error) console.error('Error updating job:', error);
      });
  };

  const handleToggleTechnician = (techId) => {
    setSelectedTechnicians(prev =>
      prev.includes(techId) ? prev.filter(id => id !== techId) : [...prev, techId]
    );
  };

  const handleRemoveSelectedTechnician = (techId) => {
    setSelectedTechnicians(prev => prev.filter(id => id !== techId));
  };

  const handleAssignSelectedTechnicians = () => {
    const newAssigned = selectedTechnicians.map(techId => ({
      techId,
      startTime: selectedJob.startTime,
      endTime: selectedJob.endTime
    }));
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === selectedJob.id
          ? {
              ...job,
              assignedTechs: newAssigned,
              status: newAssigned.length > 0 ? 'assigned' : 'unassigned'
            }
          : job
      )
    );
    // Update database
    supabase
      .from('scheduled_jobs')
      .update({
        assigned_technicians: newAssigned,
        status: newAssigned.length > 0 ? 'assigned' : 'unassigned'
      })
      .eq('id', selectedJob.id)
      .then(({ error }) => {
        if (error) console.error('Error updating job:', error);
      });
    setSelectedTechnicians([]);
    setAssignDialogOpen(false);
  };

  const handleTimeChange = (jobId, field, value) => {
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId
          ? { ...job, [field]: value }
          : job
      )
    );
    // Update database
    supabase
      .from('scheduled_jobs')
      .update({ [field]: value })
      .eq('id', jobId)
      .then(({ error }) => {
        if (error) console.error('Error updating job time:', error);
      });
  };

  const handleDeleteJob = (jobId) => {
    const note = prompt('Lý do xóa công việc:');
    if (note) {
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job.id === jobId
            ? { ...job, isDeleted: true, deleteNote: note }
            : job
        )
      );
      // Update database
      supabase
        .from('scheduled_jobs')
        .update({
          is_deleted: true,
          delete_note: note
        })
        .eq('id', jobId)
        .then(({ error }) => {
          if (error) console.error('Error updating job:', error);
        });
    }
  };

  const handleRestoreJob = (jobId) => {
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId
          ? { ...job, isDeleted: false, deleteNote: '' }
          : job
      )
    );
    // Update database
    supabase
      .from('scheduled_jobs')
      .update({
        is_deleted: false,
        delete_note: ''
      })
      .eq('id', jobId)
      .then(({ error }) => {
        if (error) console.error('Error updating job:', error);
      });
  };

  const handleSave = async () => {
    // Chỉ upsert jobs đã có id UUID từ Supabase
    const jobsToUpsert = jobs
      .filter(job => typeof job.id === 'string') // UUID từ database
      .map(job => ({
        id: job.id,
        customer_id: job.customerId,
        customer_name: job.clientName,
        scheduled_date: job.date.toISOString().split('T')[0],
        status: job.status,
        assigned_technicians: job.assignedTechs,
        start_time: job.startTime,
        end_time: job.endTime,
        is_deleted: job.isDeleted,
        delete_note: job.deleteNote,
        service_content: job.serviceContent
      }));

    // Insert jobs mới (từ generateContractJobs, id là số)
    const newJobsToInsert = jobs
      .filter(job => typeof job.id === 'number')
      .map(job => ({
        customer_id: job.customerId,
        customer_name: job.clientName,
        scheduled_date: job.date.toISOString().split('T')[0],
        status: job.status,
        assigned_technicians: job.assignedTechs,
        start_time: job.startTime,
        end_time: job.endTime,
        is_deleted: job.isDeleted,
        delete_note: job.deleteNote,
        service_content: job.serviceContent
      }));

    let errorOccurred = false;

    if (jobsToUpsert.length > 0) {
      const { error } = await supabase
        .from('scheduled_jobs')
        .upsert(jobsToUpsert, { onConflict: 'id' });
      if (error) {
        console.error('Error upserting jobs:', error);
        errorOccurred = true;
      }
    }

    if (newJobsToInsert.length > 0) {
      const { data: insertedJobs, error } = await supabase
        .from('scheduled_jobs')
        .insert(newJobsToInsert)
        .select();
      if (error) {
        console.error('Error inserting new jobs:', error);
        errorOccurred = true;
      } else {
        // Cập nhật state với id UUID từ Supabase
        const updatedJobs = jobs.map(job => {
          if (typeof job.id === 'number') {
            const inserted = insertedJobs.find(ij => ij.customer_id === job.customerId && ij.scheduled_date === job.date.toISOString().split('T')[0]);
            return inserted ? { ...job, id: inserted.id } : job;
          }
          return job;
        });
        setJobs(updatedJobs);
      }
    }

    if (errorOccurred) {
      alert('Lỗi khi lưu dữ liệu!');
    } else {
      alert('Dữ liệu đã được lưu thành công!');
    }
  };

  // Group jobs by date for display
  const filteredJobs = jobs.filter(job => {
    const jobDate = job.date;
    if (filterType === 'week') {
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return jobDate >= startOfWeek && jobDate <= endOfWeek;
    } else if (filterType === 'month') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return jobDate >= startOfMonth && jobDate <= endOfMonth;
    } else if (filterType === 'range') {
      return jobDate >= filterStartDate && jobDate <= filterEndDate;
    }
    return true;
  });

  const groupedJobs = filteredJobs.reduce((acc, job) => {
    const dateKey = job.date.toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(job);
    return acc;
  }, {});

  const deletedJobs = jobs.filter(job => job.isDeleted);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Lập Kế Hoạch Giao Việc - Giao Diện Cải Tiến
      </Typography>

      {/* Danh sách khách hàng */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Danh sách khách hàng
          {selectedCustomers.length > 0 && (
            <Typography component="span" variant="body2" color="primary" sx={{ ml: 1 }}>
              ({selectedCustomers.length === customers.length ? 'Đã chọn tất cả ' : 'Đã chọn '}
              {selectedCustomers.length} khách hàng)
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
                <TableCell>Tên khách hàng</TableCell>
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
                      <Typography fontWeight={500}>{service.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {service.address}
                      </Typography>
                    </Box>
                  </TableCell>
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
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button variant="contained" onClick={handleGenerateJobs}>
            Làm mới công việc
          </Button>
        </Box>
      </Paper>

      {/* Filter Jobs */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Lọc Công Việc</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Loại lọc</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="week">Tuần này</MenuItem>
                <MenuItem value="month">Tháng này</MenuItem>
                <MenuItem value="range">Phạm vi ngày</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {filterType === 'range' && (
            <>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Từ ngày"
                  type="date"
                  value={filterStartDate.toISOString().split('T')[0]}
                  onChange={(e) => setFilterStartDate(new Date(e.target.value))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Đến ngày"
                  type="date"
                  value={filterEndDate.toISOString().split('T')[0]}
                  onChange={(e) => setFilterEndDate(new Date(e.target.value))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

        {/* Job Calendar */}
        <Typography variant="h6" gutterBottom>Danh Sách Công Việc</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ngày</TableCell>
                <TableCell>Khách Hàng</TableCell>
                <TableCell>Nội Dung Công Việc</TableCell>
                <TableCell>Thời Gian Thực Hiện</TableCell>
                <TableCell>Trạng Thái</TableCell>
                <TableCell>Nhân Viên Phân Bổ</TableCell>
                <TableCell>Ghi Chú</TableCell>
                <TableCell>Thao Tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(groupedJobs).map(([dateKey, dayJobs]) => (
                <React.Fragment key={dateKey}>
                  {dayJobs
                    .sort((a, b) => {
                      if (a.isDeleted && !b.isDeleted) return 1;
                      if (!a.isDeleted && b.isDeleted) return -1;
                      if (a.status === 'unassigned' && b.status === 'assigned') return 1;
                      if (a.status === 'assigned' && b.status === 'unassigned') return -1;
                      return a.startTime.localeCompare(b.startTime);
                    })
                    .map((job, index) => (
                    <TableRow key={job.id} sx={{ bgcolor: job.status === 'unassigned' ? 'grey.100' : 'success.50' }}>
                      <TableCell>
                        {index === 0 && formatDateWithDay(new Date(dateKey))}
                      </TableCell>
                      <TableCell>{job.clientName}</TableCell>
                      <TableCell sx={{ textDecoration: job.isDeleted ? 'line-through' : 'none' }}>{job.serviceContent || ''}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TextField
                            type="time"
                            value={job.startTime}
                            onChange={(e) => handleTimeChange(job.id, 'startTime', e.target.value)}
                            size="small"
                            sx={{ width: 80, mr: 1 }}
                          />
                          -
                          <TextField
                            type="time"
                            value={job.endTime}
                            onChange={(e) => handleTimeChange(job.id, 'endTime', e.target.value)}
                            size="small"
                            sx={{ width: 80, ml: 1 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={job.status === 'unassigned' ? 'Chưa Phân Bổ' : 'Đã Phân Bổ'}
                          color={job.status === 'unassigned' ? 'default' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {job.assignedTechs.map((tech, idx) => {
                          const techInfo = techniciansData.find(t => t.id === tech.techId);
                          return (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <Chip
                                label={`${techInfo?.name} (${tech.startTime.slice(0,5)}-${tech.endTime.slice(0,5)})`}
                                sx={{ mr: 1, textDecoration: job.isDeleted ? 'line-through' : 'none' }}
                                size="small"
                              />
                            </Box>
                          );
                        })}
                      </TableCell>
                      <TableCell sx={{ textDecoration: job.isDeleted ? 'line-through' : 'none' }}>
                        {job.deleteNote}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<PersonAddIcon />}
                          onClick={() => handleJobClick(job)}
                          disabled={job.isDeleted}
                        >
                          {job.status === 'assigned' ? 'Sửa' : 'Thêm'}
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={job.isDeleted}
                          sx={{ ml: 1 }}
                        >
                          Xóa
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {deletedJobs.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Công Việc Đã Xóa
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ngày</TableCell>
                    <TableCell>Khách Hàng</TableCell>
                    <TableCell>Nội Dung Công Việc</TableCell>
                    <TableCell>Thời Gian Thực Hiện</TableCell>
                    <TableCell>Trạng Thái</TableCell>
                    <TableCell>Nhân Viên Phân Bổ</TableCell>
                    <TableCell>Ghi Chú</TableCell>
                    <TableCell>Thao Tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deletedJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>{formatDateWithDay(job.date)}</TableCell>
                      <TableCell sx={{ textDecoration: 'line-through' }}>{job.clientName}</TableCell>
                      <TableCell sx={{ textDecoration: 'line-through' }}>{job.serviceContent || ''}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TextField
                            type="time"
                            value={job.startTime}
                            onChange={(e) => handleTimeChange(job.id, 'startTime', e.target.value)}
                            size="small"
                            sx={{ width: 80, mr: 1 }}
                            disabled={job.isDeleted}
                          />
                          -
                          <TextField
                            type="time"
                            value={job.endTime}
                            onChange={(e) => handleTimeChange(job.id, 'endTime', e.target.value)}
                            size="small"
                            sx={{ width: 80, ml: 1 }}
                            disabled={job.isDeleted}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={job.status === 'unassigned' ? 'Chưa Phân Bổ' : 'Đã Phân Bổ'}
                          color={job.status === 'unassigned' ? 'default' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {job.assignedTechs.map((tech, idx) => {
                          const techInfo = techniciansData.find(t => t.id === tech.techId);
                          return (
                            <Chip
                              key={idx}
                              label={`${techInfo?.name} (${tech.startTime.slice(0,5)}-${tech.endTime.slice(0,5)})`}
                              sx={{ mr: 1, textDecoration: 'line-through' }}
                              size="small"
                            />
                          );
                        })}
                      </TableCell>
                      <TableCell sx={{ textDecoration: 'line-through' }}>{job.deleteNote}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          onClick={() => handleRestoreJob(job.id)}
                        >
                          Khôi phục
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* Nút Lưu */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            color="success"
            onClick={handleSave}
            sx={{ px: 4, py: 1 }}
          >
            Lưu Dữ Liệu
          </Button>
        </Box>

        {/* Assignment Dialog */}
        <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{isEditing ? 'Sửa Phân Bổ Nhân Viên' : 'Phân Bổ Nhân Viên'}</DialogTitle>
          <DialogContent>
            {selectedJob && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Công Việc: {selectedJob.clientName} - {selectedJob.date.toLocaleDateString('vi-VN')}
                </Typography>
                {selectedTechnicians.length > 0 && (
                  <>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Nhân viên đã chọn:
                    </Typography>
                    <List>
                      {selectedTechnicians.map((techId) => {
                        const tech = techniciansData.find(t => t.id === techId);
                        return (
                          <ListItem key={techId} secondaryAction={
                            <IconButton edge="end" onClick={() => handleRemoveSelectedTechnician(techId)}>
                              <DeleteIcon />
                            </IconButton>
                          }>
                            <ListItemText primary={tech?.name} />
                          </ListItem>
                        );
                      })}
                    </List>
                  </>
                )}
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Chọn nhân viên:
                </Typography>
                <List>
                  {techniciansData.map((tech) => (
                    <ListItem key={tech.id}>
                      <Checkbox
                        checked={selectedTechnicians.includes(tech.id)}
                        onChange={() => handleToggleTechnician(tech.id)}
                        disabled={!isEditing && selectedJob.assignedTechs.some(assigned => assigned.techId === tech.id)}
                      />
                      <ListItemText primary={tech.name} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssignDialogOpen(false)}>Đóng</Button>
            <Button
              onClick={handleAssignSelectedTechnicians}
              disabled={selectedTechnicians.length === 0}
              variant="contained"
            >
              Giao việc
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
}