import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Button, Grid, Snackbar, Alert
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ChecklistPopup from '../components/job/ChecklistPopup';
import CustomerInfo from '../components/job/CustomerInfo';
import JobInfo from '../components/job/JobInfo';
import Materials from '../components/job/Materials';
import TechnicianAssignment from '../components/job/TechnicianAssignment';
import Checklist from '../components/job/Checklist';

export default function LapKeHoachCongViec({ session }) {
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
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);  // Đã có, giữ nguyên
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [techniciansData, setTechniciansData] = useState([]);
  const [openChecklistPopup, setOpenChecklistPopup] = useState(false);
  // Vật tư/hóa chất
  const [materialsList, setMaterialsList] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]); // [{material_id, name, unit, category, required_quantity}]
  // Service plan data
  const [customerServicePlan, setCustomerServicePlan] = useState(null);

  useEffect(() => {
    console.log('Component mounted, starting data fetch...');
    
    const fetchCustomers = async () => {
      console.log('Starting to fetch customers...');
      setIsLoadingCustomers(true);
      try {
        const { data, error } = await supabase
          .from('customer_sites')
          .select('id, site_name, address, ward_name, district_name, province_name, customers(id, customer_code, name, primary_contact_name, primary_contact_phone, primary_contact_position)');
        
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
      } catch (err) {
        console.error('Unexpected error fetching customers:', err);
      } finally {
        // QUAN TRỌNG: Đảm bảo setIsLoadingCustomers(false) luôn được gọi
        setIsLoadingCustomers(false);
        console.log('Set isLoadingCustomers to false');
      }
    };

    const fetchTechnicians = async () => {
      const { data, error } = await supabase
        .from('profiles')
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

  // Fetch service plan data khi chọn customer
  const fetchCustomerServicePlan = useCallback(async (customerId) => {
    try {
      const { data, error } = await supabase
        .from('customer_sites')
        .select(`
          *,
          customer_sites_plans(*)  // Join đúng với bảng customer_sites_plans
        `)
        .eq('customer_id', customerId)
        .limit(1);  // Lấy site đầu tiên; điều chỉnh nếu cần tất cả sites
    
      if (error) {
        console.error('Error fetching customer service plan:', error);
        setCustomerServicePlan(null);
      } else {
        // Lấy plan đầu tiên của site đầu tiên (hoặc xử lý nhiều plans nếu cần)
        const site = data?.[0];
        const plan = site?.customer_sites_plans?.[0] || null;
        setCustomerServicePlan(plan);
      }
    } catch (error) {
      console.error('Error in fetchCustomerServicePlan:', error);
      setCustomerServicePlan(null);
    }
  }, []);

  // useEffect riêng cho set selectedCustomer khi preselectedCustomerId hoặc customers thay đổi
  useEffect(() => {
    if (preselectedCustomerId && customers.length > 0) {
      // Bước 1: Tìm theo customer_id trong customer_sites (c.customers?.id) - MỤC TIÊU CHÍNH
      let preselectedCustomer = customers.find(c => c.customers?.id === preselectedCustomerId);
      
      if (preselectedCustomer) {
        // Tìm thấy customer qua customer_id trong sites
        console.log('Found preselected customer via customer_id in sites:', preselectedCustomer.customers?.name);
        setSelectedCustomer(preselectedCustomer);
        setCustomer(preselectedCustomerId); // Dùng customer_id làm value
        fetchCustomerServicePlan(preselectedCustomerId);
      } else {
        // Bước 2: Kiểm tra xem có phải là site_id không
        const siteCustomer = customers.find(c => c.id === preselectedCustomerId);
        if (siteCustomer && siteCustomer.customers?.id) {
          console.log('Found customer via site_id, converting to customer_id:', siteCustomer.customers?.name);
          setSelectedCustomer(siteCustomer);
          setCustomer(siteCustomer.customers.id); // Dùng customer_id, không phải site_id
          fetchCustomerServicePlan(siteCustomer.customers.id);
        } else {
          // Bước 3: Customer tồn tại nhưng chưa có site, fetch trực tiếp từ customers table
          const fetchDirectCustomer = async () => {
            try {
              const { data, error } = await supabase
                .from('customers')
                .select('id, customer_code, name, primary_contact_name, primary_contact_phone, primary_contact_position')
                .eq('id', preselectedCustomerId)
                .single();
              
              if (!error && data) {
                console.log('Found customer directly from customers table (no sites yet):', data);
                // Tạo customer object trực tiếp, không cần fake site
                setSelectedCustomer(data);  // Direct customer object
                setCustomer(preselectedCustomerId); // Customer ID
                fetchCustomerServicePlan(preselectedCustomerId);
              }
            } catch (err) {
              console.error('Error fetching customer directly:', err);
            }
          };
          fetchDirectCustomer();
        }
      }
    }
  }, [preselectedCustomerId, customers, fetchCustomerServicePlan]);  // Thêm fetchCustomerServicePlan vào dependencies

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

  // Function để chuyển đổi ngày thành thứ trong tuần
  const getDayOfWeek = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    const date = new Date(dateString);
    const daysOfWeek = ['Chủ Nhật ', 'Thứ 2 ', 'Thứ 3 ', 'Thứ 4 ', 'Thứ 5 ', 'Thứ 6 ', 'Thứ 7 '];
    return daysOfWeek[date.getDay()];
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
      // Bỏ teamMembersString (không dùng nữa, vì team members lưu trong job_assignments)
      // const selectedTechNames = techniciansData
      //   .filter(tech => technicians.includes(tech.id))
      //   .map(tech => tech.name);
      // const teamMembersString = selectedTechNames.length > 1 ? selectedTechNames.join(', ') : null;
      
      // Bỏ populate assigned_technicians JSONB (dùng job_assignments thay thế)
      // const assignedTechnicians = technicians.map(techId => {
      //   const tech = techniciansData.find(t => t.id === techId);
      //   return {
      //     technician_id: techId,
      //     role: techId === teamLead ? 'lead' : 'member',
      //     status: 'assigned',
      //     name: tech?.name || 'N/A'
      //   };
      // });

      // Tạo một job chung cho tất cả technicians
      const jobData = {
        // Bỏ customer_id (lấy từ join customer_sites_plans -> customer_sites -> customers)
        created_by: session?.user?.id, // Người tạo job
        // Bỏ service_type (không có trong schema, có thể bỏ hoặc thêm nếu cần)
        scheduled_date: date,
        scheduled_time: time || null,
        job_content: taskContent,
        job_description: taskContent,
        notes: notes || null,
        special_requests: notes || null,
        contact_person: selectedCustomer?.primary_contact_name || '',
        contact_phone: selectedCustomer?.primary_contact_phone || '',
        // Bỏ address (lấy từ join customer_sites_plans -> customer_sites)
        checklist: checklist,  // Array, Supabase sẽ tự chuyển JSONB
        status: 'Đã giao',
        // Bỏ team_members (không có trong schema)
        // Bỏ team_lead_id (không có trong schema)
        team_size: technicians.length,
        // Bỏ assigned_technicians (không có trong schema, dùng job_assignments nếu cần)
        start_time: null,  // Set null nếu không có logic cụ thể
        end_time: null,     // Set null nếu không có logic cụ thể
        plan_id: customerServicePlan?.id || null  // Thêm plan_id (đã có trong schema)
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

      // Thêm insert job_assignments (thay thế assigned_technicians jsonb)
      const assignmentsToInsert = technicians.map(techId => ({
        job_id: jobResult.id,
        technician_id: techId,
        status: 'assigned',
        role: techId === teamLead ? 'lead' : 'member',  // Dùng role từ job_assignments
        notes: null
      }));
      const { error: assignmentError } = await supabase
        .from('job_assignments')
        .insert(assignmentsToInsert);
      if (assignmentError) {
        console.error('Error inserting assignments:', assignmentError);
        // Có thể rollback job nếu cần
      }

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

      // Trong snackbar, dùng trực tiếp selectedTechNames.join(', ')
      setSnackbar({ 
        open: true, 
        type: 'success', 
        message: `Đã tạo và phân công thành công công việc cho ${techniciansData.filter(tech => technicians.includes(tech.id)).map(tech => tech.name).join(', ')}!` 
      });
      resetForm();

    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setSnackbar({ open: true, type: 'error', message: `Có lỗi xảy ra: ${error.message}` });
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

  const filteredCustomers = customers.filter(c => {
    if (!searchCustomer.trim()) return true;

    const searchTerm = searchCustomer.toLowerCase().trim();
    const customerName = (c.customers?.name || '').toLowerCase();
    const customerCode = (c.customers?.customer_code || '').toLowerCase();

    return customerName.includes(searchTerm) || customerCode.includes(searchTerm);
  });

  // Đảm bảo khách hàng đã chọn luôn có trong danh sách, ngay cả khi không khớp bộ lọc  
  // QUAN TRỌNG: So sánh với customer ID, không phải site ID
  if (customer && !filteredCustomers.some(c => 
    (c.customers?.id === customer) || (!c.customers && c.id === customer)
  )) {
    // Tìm theo customer ID trước
    const selectedCust = customers.find(c => 
      (c.customers?.id === customer) || (!c.customers && c.id === customer)
    );
    if (selectedCust) {
      filteredCustomers.push(selectedCust);
      console.log('Added selected customer to parent filtered list:', selectedCust.customers?.name || selectedCust.name);
    } else if (selectedCustomer) {
      // Nếu không tìm thấy nhưng có selectedCustomer (từ direct fetch)
      filteredCustomers.push(selectedCustomer);
      console.log('Added selected customer from direct fetch:', selectedCustomer.customers?.name || selectedCustomer.name);
    }
  }

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
            {/* 1. Thông tin khách hàng */}
            <Grid size={{ xs: 12 }}>
              <CustomerInfo
                searchCustomer={searchCustomer}
                setSearchCustomer={setSearchCustomer}
                customer={customer}
                setCustomer={setCustomer}
                customers={customers}
                selectedCustomer={selectedCustomer}
                setSelectedCustomer={setSelectedCustomer}
                customerServicePlan={customerServicePlan}
                setCustomerServicePlan={setCustomerServicePlan}
                fetchCustomerServicePlan={fetchCustomerServicePlan}
                formatFullAddress={formatFullAddress}
                isLoadingCustomers={isLoadingCustomers}  // <<<<<< Thêm prop này
              />
            </Grid>
            {/* 2. Thông tin công việc */}
            <Grid size={{ xs: 12 }}>
              <JobInfo
                customerServicePlan={customerServicePlan}
                serviceType={serviceType}
                setServiceType={setServiceType}
                datetime={datetime}
                setDatetime={setDatetime}
                taskContent={taskContent}
                setTaskContent={setTaskContent}
                notes={notes}
                setNotes={setNotes}
                getDayOfWeek={getDayOfWeek}
              />
            </Grid>
            {/* 3. Checklist Công việc (Tùy chọn) */}
            <Grid size={{ xs: 12 }}>
              <Checklist
                checklistOptionsState={checklistOptionsState}
                checklist={checklist}
                setChecklist={setChecklist}
                customChecklist={customChecklist}
                setCustomChecklist={setCustomChecklist}
                handleAddChecklist={handleAddChecklist}
                setOpenChecklistPopup={setOpenChecklistPopup}
              />
            </Grid>
            {/* 3b. Vật tư/Hóa chất cần chuẩn bị */}
            <Grid size={{ xs: 12 }}>
              <Materials
                materialsList={materialsList}
                selectedMaterials={selectedMaterials}
                setSelectedMaterials={setSelectedMaterials}
              />
            </Grid>
            {/* 4. Phân công Nhân viên */}
            <Grid size={{ xs: 12 }}>
              <TechnicianAssignment
                searchTech={searchTech}
                setSearchTech={setSearchTech}
                technicians={technicians}
                setTechnicians={setTechnicians}
                teamLead={teamLead}
                setTeamLead={setTeamLead}
                techniciansData={techniciansData}
              />
            </Grid>
          </Grid>

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