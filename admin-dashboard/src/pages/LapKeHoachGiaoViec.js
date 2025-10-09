import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, TextField, Select, MenuItem, FormControl, InputLabel,
  Button, Paper, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow,
  Autocomplete,
  TextField as MuiTextField,
  Tooltip,
  IconButton,
  Checkbox
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import { Edit } from '@mui/icons-material';
import { supabase } from '../supabaseClient';
import CustomerList from '../components/CustomerList';
import AlertMessage from '../components/ui/AlertMessage';
import JobFormDialog from '../components/job/JobFormDialog'; 

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

export default function TestPage({ session }) {
  const [jobs, setJobs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [techniciansData, setTechniciansData] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [filterType, setFilterType] = useState('week');
  const [filterStartDate, setFilterStartDate] = useState(new Date());
  const [filterEndDate, setFilterEndDate] = useState(new Date());
  const [alert, setAlert] = useState({ type: '', message: '', duration: 4000 });
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [selectedBulkTechnicians, setSelectedBulkTechnicians] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);

  // Di chuyển fetchServicesAndJobs ra ngoài useEffect
  const fetchServicesAndJobs = useCallback(async () => {
    // Fetch services (giữ nguyên)
    const { data: servicesData, error: servicesError } = await supabase
      .from('customer_sites')
      .select(`
        id, site_name, address, province_name,
        customers!inner (id, name),
        customer_sites_plans (
          id, site_id, service_types, plan, days_of_week, frequency, start_date, end_date, report_date, report_frequency
        )
      `);

    if (servicesError) {
      console.error('Error fetching services:', servicesError);
      return;
    }

    // Fetch existing jobs, join với job_assignments để lấy technicians
    const { data: jobsData, error: jobsError } = await supabase
      .from('jobs')
      .select(`
        *,
        customer_sites_plans!inner (
          site_id,
          customer_sites!inner (site_name)
        ),
        job_assignments (
          technician_id,
          status,
          role,
          notes,
          profiles!inner (id, name, tech_code)
        )
      `)
      .order('scheduled_date', { ascending: true });

    if (jobsError) {
      console.error('Error fetching jobs:', jobsError);
      return;
    }

    // Xử lý jobs với assignedTechs từ job_assignments
    const existingJobKeys = new Set(
      (jobsData || []).map(job => `${job.customer_id}_${job.scheduled_date}`)
    );

    if (jobsData && jobsData.length > 0) {
      const existingJobs = jobsData.map(job => ({
        id: job.id,
        customerId: job.customer_id,
        clientName: job.customer_name,
        date: new Date(job.scheduled_date),
        status: job.status,
        assignedTechs: (job.job_assignments || []).map(assignment => ({
          technician_id: assignment.technician_id,
          name: assignment.profiles?.name,
          role: assignment.role,
          status: assignment.status,
          notes: assignment.notes
        })),
        startTime: job.start_time || '08:00',
        endTime: job.end_time || '10:00',
        isDeleted: job.is_deleted || false,
        deleteNote: job.delete_note || '',
        serviceContent: job.service_content || '',
        notes: job.notes,
        planId: job.plan_id,
        siteName: job.customer_sites_plans?.customer_sites?.site_name || ''
      }));
      setJobs(existingJobs);
    } else {
      // Auto generate jobs from services and insert to database
      const generatedJobs = [];
      servicesData.forEach(site => {
        site.customer_sites_plans?.forEach(plan => {
          if (plan.days_of_week && plan.frequency && plan.start_date && plan.end_date) {
            plan.days_of_week.forEach(day => {
              const jobsForDay = generateContractJobs(
                `${site.customers.name} - ${site.site_name}`,
                new Date(plan.start_date),
                new Date(plan.end_date),
                day.toString(),
                plan.frequency.toString()
              );
              console.log('Jobs for day:', jobsForDay.length);
              
              // Filter out jobs that already exist
              const newJobsForDay = jobsForDay.filter(job => {
                const jobKey = `${site.customers.id}_${job.date.toISOString().split('T')[0]}`;
                return !existingJobKeys.has(jobKey);
              });
              
              generatedJobs.push(...newJobsForDay.map(job => ({
                ...job,
                customerId: site.customers.id,
                serviceContent: plan.service_types?.join(', ') || '',
                planId: plan.id,
                siteName: site.site_name  
              })));
            });
          } else {
            console.log('Plan missing required fields:', plan);
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
          // Bỏ assigned_technicians khỏi insert
          start_time: job.startTime,
          end_time: job.endTime,
          is_deleted: job.isDeleted,
          delete_note: job.deleteNote,
          service_content: job.serviceContent,
          notes: job.notes || '',
          plan_id: job.planId,
          created_by: session?.user?.id || null,
          job_description: `Công việc định kỳ cho ${job.clientName}`,
          scheduled_time: null,
          service_type: 'Định kỳ',
          job_content: job.serviceContent,
          checklist: [],
          completed: false,
          contact_person: null,
          contact_phone: null,
          special_requests: null,
          team_lead_id: null,
          team_size: null,
          team_members: null
        }));

        const { data: insertedJobs, error: insertError } = await supabase
          .from('jobs')
          .insert(jobsToInsert)
          .select();

        if (insertError) {
          console.error('Error inserting jobs:', insertError);
        } else {
          const jobsWithIds = insertedJobs.map((dbJob, index) => ({
            ...generatedJobs[index],
            id: dbJob.id
          }));
          setJobs(jobsWithIds);
        }
      }
    }
  }, [session?.user?.id]);

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await supabase
        .from('customer_sites')
        .select(`
          id, site_name, address, province_name,
          customers!inner (id, name),
          customer_sites_plans (
            service_types, plan, days_of_week, frequency, start_date, end_date, report_date, report_frequency
          )
        `);
      
      if (error) {
        console.error('Error fetching sites:', error);
      } else {
        setCustomers(data || []);
      }
    };

    const fetchTechnicians = async () => {
      const { data, error } = await supabase
        .from('profiles')  
        .select('id, tech_code, name, phone, email, position, profile_roles!inner(name)')
        .eq('active', true)
        .eq('profile_roles.name', 'technician');  
    if (error) {
      console.error('Error fetching technicians:', error);
    } else {
      setTechniciansData(data);
    }
  };

    fetchCustomers();
    fetchTechnicians();
    fetchServicesAndJobs();  // Gọi hàm đã di chuyển
  }, [session?.user?.id, fetchServicesAndJobs]); 

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
      setAlert({ type: 'warning', message: 'Vui lòng chọn ít nhất một địa điểm.', duration: 4000 });
      return;
    }

    // First, get existing jobs for selected customers to avoid duplicates
    const { data: existingJobs, error: fetchError } = await supabase
      .from('jobs')
      .select('customer_id, scheduled_date')
      .in('customer_id', selectedCustomers.map(siteId => {
        const site = customers.find(c => c.id === siteId);
        return site?.customers?.id;
      }).filter(id => id))
      .eq('is_deleted', false);

    if (fetchError) {
      console.error('Error fetching existing jobs:', fetchError);
      setAlert({ type: 'error', message: 'Lỗi khi kiểm tra công việc hiện có!', duration: 4000 });
      return;
    }

    // Create a set of existing job keys for quick lookup
    const existingJobKeys = new Set(
      existingJobs.map(job => `${job.customer_id}_${job.scheduled_date}`)
    );

    // Generate jobs for selected sites
    const generatedJobs = [];
    selectedCustomers.forEach(siteId => {
      const site = customers.find(c => c.id === siteId);
      if (site) {
        site.customer_sites_plans?.forEach(plan => {
          console.log('Processing plan for site:', site.customers.name, site.site_name, plan);
          if (plan.days_of_week && plan.frequency && plan.start_date && plan.end_date) {
            const frequency = parseFrequency(plan.frequency);
            plan.days_of_week.forEach(day => {
              const dayNumber = typeof day === 'string' ? dayMap[day] : day;
              if (dayNumber) {
                console.log('Generating for day:', day, '->', dayNumber, 'frequency:', frequency);
                const jobsForDay = generateContractJobs(
                  `${site.customers.name} - ${site.site_name}`,
                  new Date(plan.start_date),
                  new Date(plan.end_date),
                  dayNumber.toString(),
                  frequency.toString()
                );
                console.log('Jobs for day:', jobsForDay.length);
                
                // Filter out jobs that already exist
                const newJobsForDay = jobsForDay.filter(job => {
                  const jobKey = `${site.customers.id}_${job.date.toISOString().split('T')[0]}`;
                  return !existingJobKeys.has(jobKey);
                });
                
                generatedJobs.push(...newJobsForDay.map(job => ({
                  ...job,
                  customerId: site.customers.id,
                  serviceContent: plan.service_types?.join(', ') || '',
                  planId: plan.id 
                })));
              }
            });
          } else {
            console.log('Plan missing required fields:', plan);
          }
        });
      }
    });

    console.log('Total new jobs to create:', generatedJobs.length);

    if (generatedJobs.length === 0) {
      setAlert({ type: 'info', message: 'Tất cả công việc đã tồn tại. Không có công việc mới nào được tạo.', duration: 4000 });
      return;
    }

    // Insert to database
    const jobsToInsert = generatedJobs.map(job => ({
      customer_id: job.customerId,
      customer_name: job.clientName,
      scheduled_date: job.date.toISOString().split('T')[0],
      status: job.status,
      // Bỏ assigned_technicians khỏi insert
      start_time: job.startTime,
      end_time: job.endTime,
      is_deleted: job.isDeleted,
      delete_note: job.deleteNote,
      service_content: job.serviceContent,
      notes: job.notes || '',
      plan_id: job.planId, 
      // Thêm các trường còn thiếu
      created_by: session?.user?.id || null,
      job_description: `Công việc định kỳ cho ${job.clientName}`,
      scheduled_time: null,
      service_type: 'Định kỳ',
      job_content: job.serviceContent,
      checklist: [],
      completed: false,
      contact_person: null,
      contact_phone: null,
      special_requests: null,
      team_lead_id: null,
      team_size: null,
      team_members: null
    }));

    const { data: insertedJobs, error: insertError } = await supabase
      .from('jobs')
      .insert(jobsToInsert)
      .select();

    if (insertError) {
      console.error('Error inserting jobs:', insertError);
      setAlert({ type: 'error', message: 'Lỗi khi tạo lịch công việc!', duration: 4000 });
    } else {
      // Set jobs with database ids
      const jobsWithIds = insertedJobs.map((dbJob, index) => ({
        ...generatedJobs[index],
        id: dbJob.id
      }));
      setJobs(prevJobs => [...prevJobs, ...jobsWithIds]);
      setAlert({ type: 'success', message: `${generatedJobs.length} công việc mới đã được tạo và lưu thành công!`, duration: 4000 });
    }
  };

  // Thêm hàm xử lý chỉnh sửa công việc
  const handleEditJob = (job) => {
    setJobToEdit(job); 
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setJobToEdit(null);
  };

  const handleSaveEdit = () => {
    // Refresh data sau khi save từ JobFormDialog
    fetchServicesAndJobs();  
    setEditDialogOpen(false);
    setJobToEdit(null);
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
        .from('jobs')
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
      .from('jobs')
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
      .filter(job => typeof job.id === 'string')
      .map(job => ({
        id: job.id,
        customer_id: job.customerId,
        customer_name: job.clientName,
        scheduled_date: job.date.toISOString().split('T')[0],
        status: job.status,
        // Bỏ assigned_technicians
        start_time: job.startTime,
        end_time: job.endTime,
        is_deleted: job.isDeleted,
        delete_note: job.deleteNote,
        service_content: job.serviceContent,
        notes: job.notes || '',
        plan_id: job.planId,
        created_by: session?.user?.id || null,
        job_description: `Công việc định kỳ cho ${job.clientName}`,
        scheduled_time: null,
        service_type: 'Định kỳ',
        job_content: job.serviceContent,
        checklist: [],
        completed: false,
        contact_person: null,
        contact_phone: null,
        special_requests: null,
        team_lead_id: null,
        team_size: null,
        team_members: null
      }));

    // Insert jobs mới
    const newJobsToInsert = jobs
      .filter(job => typeof job.id === 'number')
      .map(job => ({
        // Giống như trên, bỏ assigned_technicians
        customer_id: job.customerId,
        customer_name: job.clientName,
        scheduled_date: job.date.toISOString().split('T')[0],
        status: job.status,
        start_time: job.startTime,
        end_time: job.endTime,
        is_deleted: job.isDeleted,
        delete_note: job.deleteNote,
        service_content: job.serviceContent,
        notes: job.notes || '',
        plan_id: job.planId,
        created_by: session?.user?.id || null,
        job_description: `Công việc định kỳ cho ${job.clientName}`,
        scheduled_time: null,
        service_type: 'Định kỳ',
        job_content: job.serviceContent,
        checklist: [],
        completed: false,
        contact_person: null,
        contact_phone: null,
        special_requests: null,
        team_lead_id: null,
        team_size: null,
        team_members: null
      }));

    let errorOccurred = false;

    if (jobsToUpsert.length > 0) {
      const { error } = await supabase
        .from('jobs')
        .upsert(jobsToUpsert, { onConflict: 'id' });
      if (error) {
        console.error('Error upserting jobs:', error);
        errorOccurred = true;
      }
    }

    if (newJobsToInsert.length > 0) {
      const jobsToInsert = newJobsToInsert.map(job => ({
        customer_id: job.customerId,
        customer_name: job.clientName,
        scheduled_date: job.date.toISOString().split('T')[0],
        status: job.status,
        start_time: job.startTime,
        end_time: job.endTime,
        is_deleted: job.isDeleted,
        delete_note: job.deleteNote,
        service_content: job.serviceContent,
        notes: job.notes || '',
        plan_id: job.planId, // Thêm plan_id
        // Thêm các trường còn thiếu
        created_by: session?.user?.id || null,
        job_description: `Công việc định kỳ cho ${job.clientName}`,
        scheduled_time: null,
        service_type: 'Định kỳ',
        job_content: job.serviceContent,
        checklist: [],
        completed: false,
        contact_person: null,
        contact_phone: null,
        special_requests: null,
        team_lead_id: null,
        team_size: null,
        team_members: null
      }));
      const { data: insertedJobs, error } = await supabase
        .from('jobs')
        .insert(jobsToInsert)
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
      setAlert({ type: 'error', message: 'Lỗi khi lưu dữ liệu!', duration: 4000 });
    } else {
      setAlert({ type: 'success', message: 'Dữ liệu đã được lưu thành công!', duration: 4000 });
    }
  };

  // Helper function to normalize date to start of day (remove time component)
  const normalizeDate = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Group jobs by date for display
  const filteredJobs = jobs.filter(job => {
    // Loại bỏ job đã xóa khỏi danh sách chính
    if (job.isDeleted) return false;
    
    const jobDateNormalized = normalizeDate(job.date);
    if (filterType === 'week') {
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(now.setDate(diff));
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const startNormalized = normalizeDate(startOfWeek);
      const endNormalized = normalizeDate(endOfWeek);
      return jobDateNormalized >= startNormalized && jobDateNormalized <= endNormalized;
    } else if (filterType === 'month') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const startNormalized = normalizeDate(startOfMonth);
      const endNormalized = normalizeDate(endOfMonth);
      return jobDateNormalized >= startNormalized && jobDateNormalized <= endNormalized;
    } else if (filterType === 'range') {
      const startNormalized = normalizeDate(filterStartDate);
      const endNormalized = normalizeDate(filterEndDate);
      return jobDateNormalized >= startNormalized && jobDateNormalized <= endNormalized;
    }
    return true;
  });

  const groupedJobs = filteredJobs.reduce((acc, job) => {
    const dateKey = job.date.toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(job);
    return acc;
  }, {});

  const deletedJobs = jobs.filter(job => {
    if (!job.isDeleted) return false;
    
    const jobDateNormalized = normalizeDate(job.date);
    if (filterType === 'week') {
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(now.setDate(diff));
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const startNormalized = normalizeDate(startOfWeek);
      const endNormalized = normalizeDate(endOfWeek);
      return jobDateNormalized >= startNormalized && jobDateNormalized <= endNormalized;
    } else if (filterType === 'month') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const startNormalized = normalizeDate(startOfMonth);
      const endNormalized = normalizeDate(endOfMonth);
      return jobDateNormalized >= startNormalized && jobDateNormalized <= endNormalized;
    } else if (filterType === 'range') {
      const startNormalized = normalizeDate(filterStartDate);
      const endNormalized = normalizeDate(filterEndDate);
      return jobDateNormalized >= startNormalized && jobDateNormalized <= endNormalized;
    }
    return true;
  });

  const handleNotesChange = (jobId, value) => {
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId
          ? { ...job, notes: value }
          : job
      )
    );
    // Update database
    supabase
      .from('jobs')
      .update({ notes: value })
      .eq('id', jobId)
      .then(({ error }) => {
        if (error) console.error('Error updating job notes:', error);
      });
  };

  // Handler cho bulk assign
  const handleBulkAssign = () => {
    if (selectedJobs.length === 0 || selectedBulkTechnicians.length === 0) {
      setAlert({ type: 'warning', message: 'Vui lòng chọn công việc và nhân viên.', duration: 4000 });
      return;
    }

    // Insert vào job_assignments cho mỗi job và technician
    const assignmentsToInsert = [];
    selectedJobs.forEach(jobId => {
      selectedBulkTechnicians.forEach(techId => {
        assignmentsToInsert.push({
          job_id: jobId,
          technician_id: techId,
          status: 'assigned',
          role: 'member', // Mặc định member, có thể sửa nếu cần lead
          notes: null
        });
      });
    });

    supabase
      .from('job_assignments')
      .insert(assignmentsToInsert)
      .then(({ error }) => {
        if (error) {
          console.error('Error inserting assignments:', error);
          setAlert({ type: 'error', message: 'Lỗi khi giao việc!', duration: 4000 });
        } else {
          // Refresh jobs sau khi insert
          fetchServicesAndJobs();
          setSelectedJobs([]);
          setSelectedBulkTechnicians([]);
          setAlert({ type: 'success', message: `Đã thêm ${selectedBulkTechnicians.length} nhân viên vào ${selectedJobs.length} công việc.`, duration: 4000 });
        }
      });
  };

  // Handler cho select all jobs
  const handleSelectAllJobs = () => {
    if (selectedJobs.length === filteredJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(filteredJobs.map(job => job.id));
    }
  };

  // Thêm hàm handleTimeChange sau handleNotesChange
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
      .from('jobs')
      .update({ [field]: value })
      .eq('id', jobId)
      .then(({ error }) => {
        if (error) console.error('Error updating job time:', error);
      });
  };

  // Thêm hàm handleRemoveTechnician sau handleTimeChange
  const handleRemoveTechnician = (jobId, technicianId) => {
    supabase
      .from('job_assignments')
      .delete()
      .eq('job_id', jobId)
      .eq('technician_id', technicianId)
      .then(({ error }) => {
        if (error) {
          console.error('Error removing technician:', error);
        } else {
          // Refresh jobs
          fetchServicesAndJobs();
        }
      });
  };

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Lập Kế Hoạch Giao Việc
        </Typography>

        {/* Danh sách khách hàng */}
        <CustomerList
          customers={customers}
          selectedCustomers={selectedCustomers}
          handleSelectCustomer={handleSelectCustomer}
          handleSelectAllCustomers={handleSelectAllCustomers}
          handleGenerateJobs={handleGenerateJobs}
          formatContractPeriod={formatContractPeriod}
          formatReportDay={formatReportDay}
        />

        {/* Filter Jobs */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
            Lọc Công Việc
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Phạm vi</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Phạm vi"
                  sx={{ borderRadius: 1 }}
                >
                  <MenuItem value="week">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      📅 Tuần này
                    </Box>
                  </MenuItem>
                  <MenuItem value="month">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      📆 Tháng này
                    </Box>
                  </MenuItem>
                  <MenuItem value="range">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      📅 Phạm vi ngày
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {filterType === 'range' && (
              <>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Từ ngày"
                    type="date"
                    value={filterStartDate.toISOString().split('T')[0]}
                    onChange={(e) => setFilterStartDate(new Date(e.target.value))}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: 1 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Đến ngày"
                    type="date"
                    value={filterEndDate.toISOString().split('T')[0]}
                    onChange={(e) => setFilterEndDate(new Date(e.target.value))}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: 1 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setFilterStartDate(new Date());
                      setFilterEndDate(new Date());
                    }}
                    sx={{ borderRadius: 1, minWidth: 80 }}
                  >
                    Reset
                  </Button>
                </Grid>
              </>
            )}
            {filterType !== 'range' && (
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {filterType === 'week' 
                    ? (() => {
                        const now = new Date();
                        const day = now.getDay();
                        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
                        const startOfWeek = new Date(now.setDate(diff));
                        const endOfWeek = new Date(startOfWeek);
                        endOfWeek.setDate(startOfWeek.getDate() + 6);
                        return `Hiển thị công việc từ ${startOfWeek.toLocaleDateString('vi-VN')} đến ${endOfWeek.toLocaleDateString('vi-VN')}`;
                      })()
                    : (() => {
                        const now = new Date();
                        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                        return `Hiển thị công việc từ ${startOfMonth.toLocaleDateString('vi-VN')} đến ${endOfMonth.toLocaleDateString('vi-VN')}`;
                      })()}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Danh sách công việc */}
        <Typography variant="h6" gutterBottom>Danh Sách Công Việc</Typography>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Autocomplete
            multiple
            options={techniciansData}
            getOptionLabel={(option) => option.name}
            value={techniciansData.filter(tech => selectedBulkTechnicians.includes(tech.id))}
            onChange={(event, newValue) => {
              setSelectedBulkTechnicians(newValue.map(tech => tech.id));
            }}
            renderInput={(params) => (
              <MuiTextField {...params} label="Chọn nhân viên" size="small" sx={{ minWidth: 300 }} />
            )}
            size="small"
          />
          <Button
            variant="contained"
            onClick={handleBulkAssign}
            disabled={selectedJobs.length === 0 || selectedBulkTechnicians.length === 0}
          >
            Giao cho công việc đã chọn
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedJobs.length > 0 && selectedJobs.length < filteredJobs.length}
                    checked={filteredJobs.length > 0 && selectedJobs.length === filteredJobs.length}
                    onChange={handleSelectAllJobs}
                  />
                </TableCell>
                <TableCell>Ngày</TableCell>
                <TableCell>Địa Điểm Thực Hiện</TableCell>
                <TableCell>Nội Dung Công Việc</TableCell>
                <TableCell>Thời Gian Thực Hiện</TableCell>
                <TableCell>Trạng Thái</TableCell>
                <TableCell>Nhân Viên Phân Bổ</TableCell>
                <TableCell>Ghi Chú</TableCell>
                <TableCell>Thao Tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(groupedJobs).map(([dateKey, dayJobs]) =>
  dayJobs
    .sort((a, b) => {
      if (a.status === 'unassigned' && b.status === 'assigned') return 1;
      if (a.status === 'assigned' && b.status === 'unassigned') return -1;
      return a.startTime.localeCompare(b.startTime);
    })
    .map((job, index) => (
      <TableRow key={job.id} sx={{ bgcolor: job.status === 'unassigned' ? 'grey.100' : 'success.50' }}>
        <TableCell padding="checkbox">
          <Checkbox
            checked={selectedJobs.includes(job.id)}
            onChange={() => {
              setSelectedJobs(prev =>
                prev.includes(job.id)
                  ? prev.filter(id => id !== job.id)
                  : [...prev, job.id]
              );
            }}
          />
        </TableCell>
        <TableCell>
          {index === 0 && formatDateWithDay(new Date(dateKey))}
        </TableCell>
        <TableCell>
          {job.siteName || ''} 
        </TableCell>
        <TableCell>
          {job.serviceContent}
        </TableCell>
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
            const techInfo = techniciansData.find(t => t.id === tech.technician_id); 
            return (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  {techInfo?.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ color: 'error.main', cursor: 'pointer', fontWeight: 'bold' }}
                  onClick={() => handleRemoveTechnician(job.id, tech.technician_id)} 
                >
                  ×
                </Typography>
              </Box>
            );
          })}
        </TableCell>
        <TableCell>
          <TextField
            fullWidth
            multiline
            minRows={2}
            maxRows={10}
            value={job.notes || ''}
            onChange={(e) => handleNotesChange(job.id, e.target.value)}
            placeholder="Nhập ghi chú..."
            size="small"
            variant="outlined"
            sx={{ minWidth: 120 }}
          />
        </TableCell>
        <TableCell>
          <Tooltip title="Sửa thông tin công việc">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => { e.currentTarget.blur(); handleEditJob(job); }}
              sx={{ mr: 1 }}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteJob(job.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
    ))
)}
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
                    <TableCell>Địa Điểm Thực Hiện</TableCell>
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
                      <TableCell sx={{ textDecoration: 'line-through' }}>
                        {job.customer_sites_plans?.customer_sites?.site_name || ''}

                      </TableCell>
                      <TableCell sx={{ textDecoration: 'line-through' }}>{job.serviceContent || ''}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TextField
                            type="time"
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
                          const techInfo = techniciansData.find(t => t.id === tech.technician_id); 
                          return (
                            <Chip
                              key={idx}
                              label={`${techInfo?.name} (${tech.startTime?.slice(0,5) || 'N/A'}-${tech.endTime?.slice(0,5) || 'N/A'})`}
                              sx={{ mr: 1, textDecoration: 'line-through' }}
                              size="small"
                            />
                          );
                        })}
                      </TableCell>
                      <TableCell sx={{ textDecoration: 'line-through' }}>{job.deleteNote}</TableCell>
                      <TableCell>
                        <Tooltip title="Khôi phục">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleRestoreJob(job.id)}
                          >
                            <RestoreIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {filteredJobs.length === 0 && (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 3, textAlign: 'center', fontStyle: 'italic' }}>
            Không có công việc cần thực hiện trong thời gian được chọn, vui lòng chọn khoảng thời gian khác
          </Typography>
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

        {/* Edit Job Dialog */}
        <JobFormDialog
          open={editDialogOpen}
          onClose={handleCloseEditDialog}
          onSave={handleSaveEdit}
          editJob={jobToEdit}
          session={session}
        />

        {/* Alert Message */}
        <AlertMessage 
          type={alert.type} 
          message={alert.message} 
          duration={alert.duration}
        />
      </Box>
    </>
  );
}