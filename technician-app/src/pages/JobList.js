import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import moment from 'moment';

export default function JobList({ session }) {
  // Hàm lấy ngày hiện tại
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('schedule');
  const [currentJob, setCurrentJob] = useState(null);
  const [jobStatus, setJobStatus] = useState({});
  const [dailyChemicalsStatus, setDailyChemicalsStatus] = useState({});
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [modalData, setModalData] = useState({ show: false, title: '', message: '' });
  const [chemicalsSummaryExpanded, setChemicalsSummaryExpanded] = useState(false);
  const [dateRange, setDateRange] = useState({ 
    startDate: getTodayDate(), 
    endDate: getTodayDate() 
  });
  const [isRangeMode, setIsRangeMode] = useState(false);
  
  // Ref để tránh fetch lại nhiều lần
  const hasInitialized = useRef(false);
  const currentUserId = useRef(null);

  // Data mẫu cho demo - sẽ được thay thế bằng dữ liệu từ Supabase
  // Removed sample data as we now fetch from database

  useEffect(() => {
    async function fetchUserJobs() {
      if (!session || !session.user) {
        setLoading(false);
        setJobs([]);
        hasInitialized.current = false;
        currentUserId.current = null;
        return;
      }

      // Kiểm tra xem đã fetch cho user này chưa
      if (hasInitialized.current && currentUserId.current === session.user.id) {
        return; // Đã fetch rồi, không fetch lại
      }

      try {
        setLoading(true);
        console.log('🔄 Fetching jobs for user:', session.user.email);
        
        // Tìm profile của user hiện tại
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('id', session.user.id)
          .maybeSingle();
          
        if (!userProfile) {
          console.log('❌ No profile found for user');
          setJobs([]);
          setLoading(false);
          return;
        }

        console.log('✅ Found user profile:', userProfile.name);

        // Bước 1: Lấy job_assignments đơn giản trước
        const { data: assignments, error: assignError } = await supabase
          .from('job_assignments')
          .select('job_id, role, status, assigned_at')
          .eq('technician_id', session.user.id)
          .eq('status', 'assigned');

        if (assignError) {
          console.error('❌ Error fetching assignments:', assignError);
          setJobs([]);
          setLoading(false);
          return;
        }

        if (!assignments || assignments.length === 0) {
          console.log('❌ No assignments found');
          setJobs([]);
          setLoading(false);
          return;
        }

        // Bước 2: Lấy jobs dựa trên job_ids
        const jobIds = assignments.map(a => a.job_id);
        const { data: directJobs, error: jobsError } = await supabase
          .from('jobs')
          .select(`
            *,
            customer_sites_plans (
              id,
              customer_sites (
                id,
                site_name,
                address,
                customers (
                  id,
                  name,
                  primary_contact_name,
                  primary_contact_phone
                )
              )
            )
          `)
          .in('id', jobIds);

        if (jobsError) {
          console.error('❌ Error fetching jobs:', jobsError);
          setJobs([]);
          setLoading(false);
          return;
        }
        
        if (directJobs && directJobs.length > 0) {
          console.log(`✅ Found ${directJobs.length} jobs, processing data...`);
          
          // Tạo map assignments theo job_id để dễ lookup
          const assignmentMap = {};
          assignments.forEach(assignment => {
            assignmentMap[assignment.job_id] = assignment;
          });
          
          const transformedJobs = directJobs.map(job => {
            const assignment = assignmentMap[job.id];
            const customerSite = job.customer_sites_plans?.customer_sites;
            const customer = customerSite?.customers;
            
            return {
              ...job,
              assignment_role: assignment?.role || 'member',
              assignment_status: assignment?.status || 'assigned',
              assigned_at: assignment?.assigned_at,
              customer_name: customer?.name || 'N/A',
              site_name: customerSite?.site_name || 'N/A',
              address: customerSite?.address || 'N/A',
              content: job.job_content || job.job_description || 'N/A',
              service_content: job.service_content || 'N/A',
              special_requests: job.notes || 'Không có',
              contact_person: customer?.primary_contact_name || 'N/A',
              phone_number: customer?.primary_contact_phone || 'N/A',
              team_lead_name: 'N/A', // Tạm thời set N/A, sẽ lấy sau
              required_chemicals: [], // Tạm thời để trống, sẽ lấy riêng
              checklist_items: [] // Tạm thời để trống, sẽ lấy riêng
            };
          });
          
          // Bước 3: Lấy materials và checklist cho từng job
          for (let job of transformedJobs) {
            try {
              // Lấy materials với join thủ công
              const { data: jobMaterials, error: materialsError } = await supabase
                .from('job_materials')
                .select('required_quantity, actual_quantity, material_id, notes')
                .eq('job_id', job.id);

              if (materialsError) {
                console.error(`❌ Error fetching materials for job ${job.id}:`, materialsError);
                job.required_chemicals = [];
              } else if (jobMaterials && jobMaterials.length > 0) {
                // Lấy thông tin materials riêng biệt
                const materialIds = jobMaterials.map(jm => jm.material_id).filter(Boolean);
                if (materialIds.length > 0) {
                  const { data: materialsDetails } = await supabase
                    .from('materials')
                    .select('id, name, unit, category')
                    .in('id', materialIds);

                  // Kết hợp job_materials với materials details
                  job.required_chemicals = jobMaterials.map(jm => {
                    const materialDetail = materialsDetails?.find(m => m.id === jm.material_id);
                    return {
                      id: materialDetail?.id || jm.material_id,
                      name: materialDetail?.name || 'Unknown Material',
                      quantity: jm.required_quantity,
                      actual_quantity: jm.actual_quantity,
                      unit: materialDetail?.unit || 'unit',
                      category: materialDetail?.category || 'Other',
                      shortage: parseFloat(jm.required_quantity) - parseFloat(jm.actual_quantity || 0)
                    };
                  });
                } else {
                  job.required_chemicals = [];
                }
              } else {
                job.required_chemicals = [];
              }

              // Lấy checklist
              const { data: checklist, error: checklistError } = await supabase
                .from('job_checklist_items')
                .select('id, completed, completed_at, label')
                .eq('job_id', job.id);

              if (checklistError) {
                console.error(`❌ Error fetching checklist for job ${job.id}:`, checklistError);
                job.checklist_items = [];
              } else if (checklist) {
                job.checklist_items = checklist.map(jci => ({
                  id: jci.id,
                  label: jci.label || 'Checklist item',
                  value: jci.id,
                  completed: jci.completed === true || jci.completed === 'true',
                  completed_at: jci.completed_at
                }));
              } else {
                job.checklist_items = [];
              }

              // Lấy team lead
              const { data: teamLead, error: teamLeadError } = await supabase
                .from('job_assignments')
                .select('technician_id')
                .eq('job_id', job.id)
                .eq('role', 'lead')
                .maybeSingle();

              if (teamLeadError) {
                console.error(`❌ Error fetching team lead for job ${job.id}:`, teamLeadError);
              } else if (teamLead?.technician_id) {
                // Lấy tên team lead từ profiles
                const { data: teamLeadProfile } = await supabase
                  .from('profiles')
                  .select('name')
                  .eq('id', teamLead.technician_id)
                  .maybeSingle();
                
                if (teamLeadProfile?.name) {
                  job.team_lead_name = teamLeadProfile.name;
                }
              }
            } catch (error) {
              console.error(`❌ Error fetching additional data for job ${job.id}:`, error);
            }
          }
          
          console.log(`✅ Processing complete: ${transformedJobs.length} jobs with materials & checklist loaded`);
          setJobs(transformedJobs);
          
          // Fetch trạng thái hóa chất hàng ngày
          const { data: chemicalStatusData, error: chemicalError } = await supabase
            .from('daily_chemical_status')
            .select('*')
            .eq('user_id', session.user.id);

          if (!chemicalError && chemicalStatusData) {
            const statusMap = {};
            chemicalStatusData.forEach(status => {
              statusMap[status.date] = {
                status: status.status,
                notes: status.notes,
                confirmed_at: status.confirmed_at,
                collected: status.status === 'confirmed' || status.status === 'ready'
              };
            });
            setDailyChemicalsStatus(statusMap);
          }
          
          // Đánh dấu đã fetch thành công
          hasInitialized.current = true;
          currentUserId.current = session.user.id;
          setLoading(false);
          return;
        }

        // Nếu không tìm thấy jobs nào
        console.log('❌ No jobs found via assignments');
        setJobs([]);

        // Fetch trạng thái hóa chất hàng ngày (luôn thực hiện khi không có jobs)
        const { data: chemicalStatusData, error: chemicalError } = await supabase
          .from('daily_chemical_status')
          .select('*')
          .eq('user_id', session.user.id);

        if (!chemicalError && chemicalStatusData) {
          const statusMap = {};
          chemicalStatusData.forEach(status => {
            statusMap[status.date] = {
              status: status.status,
              notes: status.notes,
              confirmed_at: status.confirmed_at,
              collected: status.status === 'confirmed' || status.status === 'ready'
            };
          });
          setDailyChemicalsStatus(statusMap);
        }

        // Đánh dấu đã fetch thành công (ngay cả khi không có jobs)
        hasInitialized.current = true;
        currentUserId.current = session.user.id;

      } catch (error) {
        console.error('❌ Error fetching jobs:', error);
        setJobs([]);
        // Reset trạng thái nếu có lỗi để có thể thử lại
        hasInitialized.current = false;
        currentUserId.current = null;
      } finally {
        setLoading(false);
      }
    }

    fetchUserJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]); // Chỉ depend vào user ID thay vì toàn bộ session object để tránh re-fetch không cần thiết

  // Initialize job status
  useEffect(() => {
    const newJobStatus = {};
    jobs.forEach(job => {
      if (!jobStatus[job.id]) {
        newJobStatus[job.id] = {
          status: 'pending',
          checkinTime: null,
          checkoutTime: null,
          reportData: { 
            notes: '', 
            images: [], 
            checklist: {}, 
            materials: [] 
          }
        };
      }
    });
    if (Object.keys(newJobStatus).length > 0) {
      setJobStatus(prev => ({ ...prev, ...newJobStatus }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const showTempNotification = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const showModal = (title, message) => {
    setModalData({ show: true, title, message });
  };

  const hideModal = () => {
    setModalData({ show: false, title: '', message: '' });
  };

  const handleJobClick = (job) => {
    setCurrentJob(job);
    setCurrentScreen('report');
  };

  const handleStartJob = async () => {
    if (!currentJob) return;
    
    // Kiểm tra xác nhận hóa chất trước khi check-in
    const jobDate = moment(currentJob.scheduled_date).format('YYYY-MM-DD');
    
    // Kiểm tra cả single date và range date
    let isChemicalConfirmed = false;
    
    // Kiểm tra single date
    const singleDateStatus = dailyChemicalsStatus[jobDate];
    if (singleDateStatus?.status === 'confirmed') {
      isChemicalConfirmed = true;
    }
    
    // Kiểm tra range dates (nếu có)
    if (!isChemicalConfirmed) {
      Object.keys(dailyChemicalsStatus).forEach(key => {
        if (key.includes('_')) { // Range key format: startDate_endDate
          const [startDate, endDate] = key.split('_');
          if (jobDate >= startDate && jobDate <= endDate && 
              dailyChemicalsStatus[key]?.status === 'confirmed') {
            isChemicalConfirmed = true;
          }
        }
      });
    }
    
    if (!isChemicalConfirmed) {
      showModal('Cảnh Báo', 'Vui lòng xác nhận lấy đủ hóa chất trước khi check-in công việc này.');
      return;
    }
    
    try {
      const checkinTime = new Date().toISOString();
      
      // Tạo work report khi check-in
      const { data: reportData, error: reportError } = await supabase
        .from('job_reports')
        .insert({
          job_id: currentJob.id,
          user_id: session.user.id,
          check_in_time: checkinTime,
          notes: ''
        })
        .select()
        .single();

      if (reportError) throw reportError;

      // Cập nhật status job
      const { error: jobError } = await supabase
        .from('jobs')
        .update({ 
          status: 'Đang thực hiện',
          start_time: new Date(checkinTime).toTimeString().slice(0, 8)
        })
        .eq('id', currentJob.id);

      if (jobError) throw jobError;

      setJobStatus(prev => ({
        ...prev,
        [currentJob.id]: {
          ...prev[currentJob.id],
          status: 'checkedIn',
          checkinTime,
          reportId: reportData.id
        }
      }));
      
      showModal('Check-in Thành Công', 
        `Bạn đã check-in vào công việc "${currentJob.customer_name}" lúc ${new Date(checkinTime).toLocaleString('vi-VN')}. (Tọa độ GPS sẽ được ghi nhận tự động)`);
    } catch (error) {
      console.error('Lỗi check-in:', error);
      showModal('Lỗi', 'Không thể check-in công việc. Vui lòng thử lại.');
    }
  };

  const handleCheckout = async () => {
    if (!currentJob || jobStatus[currentJob.id]?.status !== 'checkedIn') return;
    
    try {
      const checkoutTime = new Date().toISOString();
      const reportId = jobStatus[currentJob.id]?.reportId;
      const reportData = jobStatus[currentJob.id]?.reportData || {};

      // Cập nhật work report với check-out time và notes
      const { error: reportError } = await supabase
        .from('job_reports')
        .update({
          check_out_time: checkoutTime,
          notes: reportData.notes || '',
          updated_at: checkoutTime
        })
        .eq('id', reportId);

      if (reportError) throw reportError;

      // Lưu hình ảnh nếu có
      if (reportData.images && reportData.images.length > 0) {
        const imageInserts = reportData.images.map(imageUrl => ({
          report_id: reportId,
          image_url: imageUrl
        }));

        const { error: imageError } = await supabase
          .from('job_report_images')
          .insert(imageInserts);

        if (imageError) console.error('Lỗi lưu hình ảnh:', imageError);
      }

      // Cập nhật checklist items đã hoàn thành
      if (reportData.checklist && Object.keys(reportData.checklist).length > 0) {
        const checklistUpdates = Object.entries(reportData.checklist)
          .filter(([_, completed]) => completed)
          .map(([index, _]) => {
            const checklistItem = currentJob.checklist_items?.[parseInt(index)];
            if (checklistItem) {
              return supabase
                .from('job_checklist_items')
                .update({
                  completed: true,
                  completed_at: checkoutTime
                })
                .eq('id', checklistItem.id);
            }
            return null;
          })
          .filter(Boolean);

        await Promise.all(checklistUpdates);
      }

      // Cập nhật actual quantity cho materials
      if (reportData.materials && reportData.materials.length > 0) {
        const materialUpdates = reportData.materials.map(material => {
          const jobMaterial = currentJob.job_materials?.find(jm => jm.materials.name === material.name);
          if (jobMaterial && !material.isCustom) {
            return supabase
              .from('job_materials')
              .update({ actual_quantity: material.actualQuantity })
              .eq('id', jobMaterial.id);
          }
          return null;
        }).filter(Boolean);

        await Promise.all(materialUpdates);
      }

      // Cập nhật status job thành hoàn thành
      const { error: jobError } = await supabase
        .from('jobs')
        .update({ 
          status: 'Hoàn thành',
          completed: true,
          end_time: new Date(checkoutTime).toTimeString().slice(0, 8)
        })
        .eq('id', currentJob.id);

      if (jobError) throw jobError;

      setJobStatus(prev => ({
        ...prev,
        [currentJob.id]: {
          ...prev[currentJob.id],
          status: 'checkedOut',
          checkoutTime
        }
      }));
      
      showModal('Check-out Thành Công', 
        `Bạn đã check-out khỏi công việc "${currentJob.customer_name}" lúc ${new Date(checkoutTime).toLocaleString('vi-VN')}. Báo cáo đã được ghi nhận.`);
      
      setTimeout(() => {
        setCurrentScreen('schedule');
        hideModal();
      }, 2000);
    } catch (error) {
      console.error('Lỗi check-out:', error);
      showModal('Lỗi', 'Không thể check-out công việc. Vui lòng thử lại.');
    }
  };

  const handlePhoneCall = (phoneNumber) => {
    showTempNotification(`Đã copy số điện thoại: ${phoneNumber}`);
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleZaloCall = (phoneNumber) => {
    showTempNotification(`Đã copy số điện thoại Zalo: ${phoneNumber}`);
    const zaloNumber = phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber;
    window.open(`http://zalo.me/${zaloNumber}`, '_blank');
  };

  // Render daily chemicals summary
  const renderDailyChemicalsSummary = () => {
    const startDate = dateRange.startDate;
    const endDate = dateRange.endDate;
    const dailyChemicals = {};
    const teamWorkChemicals = {}; // Hóa chất từ công việc team mà user không phải lead
    
    // Tính tổng hóa chất theo phạm vi ngày
    jobs.filter(job => {
      const jobDate = moment(job.scheduled_date).format('YYYY-MM-DD');
      return jobDate >= startDate && jobDate <= endDate;
    }).forEach(job => {
      const isTeamLead = job.assignment_role === 'lead';
      const hasTeamLead = job.team_lead_name && job.team_lead_name !== 'N/A';
      const shouldCountChemicals = !hasTeamLead || isTeamLead;
      
      job.required_chemicals?.forEach(chem => {
        if (shouldCountChemicals) {
          // Hóa chất cần lấy thực tế (cho team lead hoặc công việc cá nhân)
          if (dailyChemicals[chem.name]) {
            dailyChemicals[chem.name].quantity += parseFloat(chem.quantity);
          } else {
            dailyChemicals[chem.name] = { ...chem, quantity: parseFloat(chem.quantity) };
          }
        } else {
          // Hóa chất team work mà user không phải lead (chỉ để hiển thị)
          if (teamWorkChemicals[chem.name]) {
            teamWorkChemicals[chem.name].quantity += parseFloat(chem.quantity);
          } else {
            teamWorkChemicals[chem.name] = { ...chem, quantity: parseFloat(chem.quantity) };
          }
        }
      });
    });

    // Kiểm tra trạng thái xác nhận cho phạm vi ngày
    let isConfirmed = true;
    
    if (isRangeMode && startDate !== endDate) {
      // Kiểm tra range mode
      const rangeKey = `${startDate}_${endDate}`;
      const rangeStatus = dailyChemicalsStatus[rangeKey];
      isConfirmed = rangeStatus?.status === 'confirmed';
    } else {
      // Kiểm tra single day mode
      const dayStatus = dailyChemicalsStatus[startDate];
      isConfirmed = dayStatus?.status === 'confirmed';
    }

    return (
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div 
          className="flex justify-between items-center cursor-pointer text-lg font-semibold text-gray-800 mb-2"
          onClick={() => setChemicalsSummaryExpanded(!chemicalsSummaryExpanded)}
        >
          <span>
            Tổng Hóa Chất Cần Lấy {isRangeMode && startDate !== endDate ? `Từ ${moment(startDate).format('DD/MM')} - ${moment(endDate).format('DD/MM')}` : `Ngày ${moment(startDate).format('DD/MM/YYYY')}`}
            <span className={`text-sm font-normal ml-2 ${isConfirmed ? 'text-green-600' : 'text-gray-500'}`}>
              ({isConfirmed ? 'Đã xác nhận' : 'Chưa xác nhận'})
            </span>
          </span>
          <i className={`fas ${chemicalsSummaryExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} ml-2`}></i>
        </div>
        
        {chemicalsSummaryExpanded && (
          <div className="mt-4">
            {/* Date range selector */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-3">
                <input 
                  type="checkbox" 
                  id="range-mode" 
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 mr-2"
                  checked={isRangeMode}
                  onChange={(e) => {
                    setIsRangeMode(e.target.checked);
                    if (!e.target.checked) {
                      setDateRange({ startDate: getTodayDate(), endDate: getTodayDate() });
                    }
                  }}
                />
                <label htmlFor="range-mode" className="text-sm font-medium text-gray-700">
                  Chế độ phạm vi ngày (đi công tác)
                </label>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Từ ngày:</label>
                  <input 
                    type="date" 
                    value={dateRange.startDate}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                    onChange={(e) => {
                      const newStartDate = e.target.value;
                      setDateRange(prev => ({
                        ...prev,
                        startDate: newStartDate,
                        endDate: isRangeMode ? prev.endDate : newStartDate
                      }));
                    }}
                  />
                </div>
                {isRangeMode && (
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Đến ngày:</label>
                    <input 
                      type="date" 
                      value={dateRange.endDate}
                      min={dateRange.startDate}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                      onChange={(e) => {
                        setDateRange(prev => ({
                          ...prev,
                          endDate: e.target.value
                        }));
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Hóa chất cần lấy thực tế */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">Hóa chất bạn cần lấy:</h4>
              {Object.keys(dailyChemicals).length > 0 ? (
                <ul className="list-disc list-inside text-gray-700 space-y-1 pl-4">
                  {Object.values(dailyChemicals).map((chem, index) => (
                    <li key={index}>
                      <span className="font-medium">{chem.name}</span>: {chem.quantity} {chem.unit}
                      <span className="text-sm text-gray-500 ml-2">({chem.category})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 text-sm">Không có hóa chất cần lấy.</p>
              )}
            </div>

            {/* Hóa chất team work (chỉ để tham khảo) */}
            {Object.keys(teamWorkChemicals).length > 0 && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-2">
                  <i className="fas fa-users mr-1"></i>
                  Hóa chất team work (Team lead sẽ lấy):
                </h4>
                <ul className="list-disc list-inside text-orange-700 space-y-1 pl-4 text-sm">
                  {Object.values(teamWorkChemicals).map((chem, index) => (
                    <li key={index}>
                      <span className="font-medium">{chem.name}</span>: {chem.quantity} {chem.unit}
                      <span className="text-xs text-orange-600 ml-2">
                        (Team lead sẽ lấy - bạn có thể nhắc nhở)
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-orange-600 mt-2 italic">
                  💡 Mục đích: Để bạn biết và có thể nhắc nhở team lead chuẩn bị đủ hóa chất
                </p>
              </div>
            )}

            {/* Hiển thị thông tin về công việc team work */}
            {jobs.filter(job => {
              const jobDate = moment(job.scheduled_date).format('YYYY-MM-DD');
              const hasTeamLead = job.team_lead_name && job.team_lead_name !== 'N/A';
              return jobDate >= startDate && jobDate <= endDate && hasTeamLead;
            }).length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Thông tin công việc nhóm:</h4>
                {jobs.filter(job => {
                  const jobDate = moment(job.scheduled_date).format('YYYY-MM-DD');
                  const hasTeamLead = job.team_lead_name && job.team_lead_name !== 'N/A';
                  return jobDate >= startDate && jobDate <= endDate && hasTeamLead;
                }).map(job => (
                  <div key={job.id} className="text-xs text-blue-700 mb-1">
                    • {job.customer_name} - {moment(job.scheduled_date).format('DD/MM')}
                    {job.assignment_role === 'lead' ? (
                      <span className="font-medium text-green-700"> (Bạn là team lead - sẽ lấy hóa chất)</span>
                    ) : (
                      <span className="text-orange-700"> (Team member - nhắc nhở team lead: {job.team_lead_name})</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!isConfirmed && Object.keys(dailyChemicals).length > 0 && (
              <>
                <div className="flex items-center mb-4">
                  <input 
                    type="checkbox" 
                    id="chemicals-collected-checkbox" 
                    className="h-5 w-5 text-green-600 rounded focus:ring-green-500"
                    checked={(isRangeMode && startDate !== endDate ? 
                      dailyChemicalsStatus[`${startDate}_${endDate}`]?.collected : 
                      dailyChemicalsStatus[startDate]?.collected) || false}
                    onChange={(e) => {
                      const key = isRangeMode && startDate !== endDate ? `${startDate}_${endDate}` : startDate;
                      setDailyChemicalsStatus(prev => ({
                        ...prev,
                        [key]: {
                          ...prev[key],
                          collected: e.target.checked,
                          status: e.target.checked ? 'ready' : 'pending'
                        }
                      }));
                    }}
                  />
                  <label htmlFor="chemicals-collected-checkbox" className="ml-3 text-gray-700 font-medium">
                    Đã xác nhận lấy đủ hóa chất
                  </label>
                </div>

                <button 
                  className={`w-full font-bold py-2 rounded-lg transition-colors shadow-md ${
                    (isRangeMode && startDate !== endDate ? 
                      dailyChemicalsStatus[`${startDate}_${endDate}`]?.collected : 
                      dailyChemicalsStatus[startDate]?.collected) 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!(isRangeMode && startDate !== endDate ? 
                    dailyChemicalsStatus[`${startDate}_${endDate}`]?.collected : 
                    dailyChemicalsStatus[startDate]?.collected)}
                  onClick={async () => {
                    try {
                      if (!session?.user?.id) {
                        throw new Error('Không có thông tin user. Vui lòng đăng nhập lại.');
                      }

                      const key = isRangeMode && startDate !== endDate ? `${startDate}_${endDate}` : startDate;
                      
                      // Tạo message tương ứng
                      const message = isRangeMode && startDate !== endDate ?
                        `Lấy đủ hóa chất từ ngày ${moment(startDate).format('DD/MM/YYYY')} đến ngày ${moment(endDate).format('DD/MM/YYYY')}` :
                        `Lấy đủ hóa chất ngày ${moment(startDate).format('DD/MM/YYYY')}`;
                      
                      // Chuẩn bị dữ liệu cho database
                      const insertData = {
                        user_id: session.user.id,
                        date: key,
                        status: 'confirmed',
                        notes: message,
                        confirmed_at: new Date().toISOString(),
                        date_type: isRangeMode && startDate !== endDate ? 'range' : 'single',
                        start_date: startDate,
                        end_date: endDate
                      };
                      
                      console.log('Dữ liệu sẽ lưu:', insertData);
                      
                      // Lưu vào database
                      const { data, error } = await supabase
                        .from('daily_chemical_status')
                        .upsert(insertData)
                        .select();

                      if (error) {
                        console.error('Chi tiết lỗi Supabase:', error);
                        console.error('Error code:', error.code);
                        console.error('Error message:', error.message);
                        console.error('Error details:', error.details);
                        console.error('Error hint:', error.hint);
                        throw error;
                      }

                      console.log('Lưu thành công:', data);

                      setDailyChemicalsStatus(prev => ({
                        ...prev,
                        [key]: {
                          ...prev[key],
                          status: 'confirmed',
                          notes: message
                        }
                      }));
                      
                      showTempNotification(`Đã lưu: ${message}`);
                      setChemicalsSummaryExpanded(false);
                    } catch (error) {
                      console.error('Lỗi lưu trạng thái hóa chất:', error);
                      showModal('Lỗi', 'Không thể lưu trạng thái hóa chất. Vui lòng thử lại.');
                    }
                  }}
                >
                  Lưu Trạng Thái Hóa Chất
                </button>
              </>
            )}

            {/* Thông báo cho team member không có hóa chất cần lấy */}
            {Object.keys(dailyChemicals).length === 0 && Object.keys(teamWorkChemicals).length > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm">
                  <i className="fas fa-check-circle mr-2"></i>
                  Bạn không cần lấy hóa chất vì các công việc đều có team lead khác phụ trách.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render job list
  const renderJobList = () => {
    const sortedJobs = [...jobs].sort((a, b) => {
      const dateA = new Date(`${a.scheduled_date}T${a.scheduled_time?.split(' - ')[0] || '00:00'}`);
      const dateB = new Date(`${b.scheduled_date}T${b.scheduled_time?.split(' - ')[0] || '00:00'}`);
      return dateA - dateB;
    });

    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Đang tải công việc...</p>
        </div>
      );
    }

    if (sortedJobs.length === 0) {
      return (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <i className="fas fa-calendar-times text-4xl text-gray-400 mb-4"></i>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Không có công việc nào</h3>
          <p className="text-gray-500 mb-4">
            Hiện tại bạn chưa được giao công việc nào. 
            Vui lòng liên hệ quản lý để được phân công công việc.
          </p>
          <div className="text-sm text-gray-400 space-y-1">
            <p>Email của bạn: {session?.user?.email}</p>
            <p>User ID: {session?.user?.id}</p>
            <p>Vui lòng cung cấp thông tin này cho quản lý để gán công việc.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {sortedJobs.map(job => {
          const currentJobStatus = jobStatus[job.id]?.status || 'pending';
          let statusBadge = '';
          
          if (currentJobStatus === 'checkedIn') {
            statusBadge = <span className="ml-2 px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-semibold rounded-full">Đang thực hiện</span>;
          } else if (currentJobStatus === 'checkedOut') {
            statusBadge = <span className="ml-2 px-2 py-1 bg-green-200 text-green-800 text-xs font-semibold rounded-full">Đã hoàn thành</span>;
          }

          return (
            <div 
              key={job.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleJobClick(job)}
            >
              <h3 className="text-lg font-semibold text-blue-700 flex items-center">
                {job.customer_name || job.customers?.name}
                {statusBadge}
              </h3>
              <p className="text-gray-600 text-sm mt-1 mb-2">
                <i className="far fa-calendar-alt mr-1 text-gray-500"></i> 
                {moment(job.scheduled_date).format('DD/MM/YYYY')}
                {job.scheduled_time && (
                  <>
                    {' - '}
                    <i className="far fa-clock mr-1 text-gray-500"></i> 
                    {job.scheduled_time}
                  </>
                )}
                <span className="ml-3">
                  <i className="fas fa-map-marker-alt mr-1 text-gray-500"></i> 
                  {job.address}
                </span>
              </p>
              <p className="text-gray-700 text-sm">
                <strong className="text-gray-800">Nội dung:</strong> {job.content}
                <span className="ml-4">
                  <strong className="text-gray-800">Vai trò:</strong> 
                  <span className="text-gray-700"> {job.assignment_role === 'lead' ? 'Team Lead' : 'Thành viên'}</span>
                </span>
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  // Render report screen
  const renderReportScreen = () => {
    if (!currentJob) return null;
    
    const currentJobStatus = jobStatus[currentJob.id]?.status || 'pending';
    const reportData = jobStatus[currentJob.id]?.reportData || { notes: '', images: [], checklist: {}, materials: [] };
    const isReportEditable = currentJobStatus === 'checkedIn' || currentJobStatus === 'checkedOut';

    return (
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {currentJobStatus === 'pending' ? 'Chi Tiết Công Việc' : 'Báo Cáo Công Tác'}
        </h2>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          {/* Job details */}
          <p className="text-gray-600 mb-2">
            <strong className="text-gray-800">Mã CV:</strong> {currentJob.id}
          </p>
          <p className="text-gray-600 mb-2">
            <strong className="text-gray-800">Khách hàng:</strong> {currentJob.customer_name || currentJob.customers?.name}
          </p>
          <p className="text-gray-600 mb-2">
            <strong className="text-gray-800">Địa chỉ:</strong> {currentJob.address}
          </p>
          <p className="text-gray-600 mb-2">
            <strong className="text-gray-800">Nội dung:</strong> {currentJob.content}
          </p>
          <p className="text-gray-600 mb-2">
            <strong className="text-gray-800">Vai trò của bạn:</strong>
            <span className="text-gray-700"> {currentJob.assignment_role === 'lead' ? 'Team Lead' : 'Thành viên'}</span>
            {currentJob.team_lead_name && currentJob.assignment_role !== 'lead' && (
              <span className="text-gray-700"> (Team Lead: {currentJob.team_lead_name})</span>
            )}
          </p>
          <p className="text-gray-600 mb-2">
            <strong className="text-gray-800">Người liên hệ:</strong> {currentJob.contact_person}
          </p>
          <div className="text-gray-600 mb-4 flex items-center flex-wrap">
            <strong className="text-gray-800 mr-2">Số điện thoại:</strong> 
            <span>{currentJob.phone_number || currentJob.customers?.phone_number}</span>
            <div className="flex space-x-2 mt-2 sm:mt-0 ml-0 sm:ml-2">
              <button 
                className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-md transition-colors shadow-sm flex items-center"
                onClick={() => handlePhoneCall(currentJob.phone_number || currentJob.customers?.phone_number)}
              >
                <i className="fas fa-phone-alt mr-1"></i> Gọi
              </button>
              <button 
                className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-md transition-colors shadow-sm flex items-center"
                onClick={() => handleZaloCall(currentJob.phone_number || currentJob.customers?.phone_number)}
              >
                <i className="fas fa-comment-dots mr-1"></i> Zalo
              </button>
            </div>
          </div>
          <p className="text-gray-600 mb-4">
            <strong className="text-gray-800">Yêu cầu đặc biệt:</strong> {currentJob.special_requests || 'Không có'}
          </p>

          {/* Checklist preview */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Checklist công việc thực hiện:</label>
            <ul className="list-disc list-inside text-gray-700 space-y-1 pl-4">
              {currentJob.checklist_items?.length > 0 ? (
                currentJob.checklist_items.map((item, index) => (
                  <li key={index} className={item.completed ? 'text-green-600' : 'text-gray-700'}>
                    {item.completed ? '✅' : '⏳'} {item.label}
                  </li>
                ))
              ) : (
                <li className="text-gray-500">Không có checklist cho công việc này.</li>
              )}
            </ul>
          </div>

          {/* Required chemicals preview */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Hóa chất cần chuẩn bị:</label>
            <ul className="list-disc list-inside text-gray-700 space-y-1 pl-4">
              {currentJob.required_chemicals?.length > 0 ? (
                currentJob.required_chemicals.map((chem, index) => (
                  <li key={index}>
                    {chem.name}: {chem.quantity} {chem.unit}
                    {currentJob.assignment_role !== 'lead' && currentJob.team_lead_name && (
                      <span className="text-sm text-blue-600 ml-2">
                        (Team lead ({currentJob.team_lead_name}) sẽ lấy)
                      </span>
                    )}
                  </li>
                ))
              ) : (
                <li className="text-gray-500">Không có hóa chất cần chuẩn bị cho công việc này.</li>
              )}
            </ul>
            {currentJob.team_lead_name && (
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-700">
                  <i className="fas fa-users mr-1"></i>
                  Công việc nhóm - 
                  {currentJob.assignment_role === 'lead' ? (
                    <span className="font-medium"> Bạn là team lead, chịu trách nhiệm lấy hóa chất</span>
                  ) : (
                    <span> Team lead ({currentJob.team_lead_name}) sẽ lấy hóa chất cho cả nhóm</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Start job button */}
          {currentJobStatus === 'pending' && (
            <button 
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-colors shadow-md mb-6"
              onClick={handleStartJob}
            >
              Bắt Đầu Công Việc (Check-in)
            </button>
          )}

          {/* Report editing area */}
          {currentJobStatus !== 'pending' && (
            <div>
              <hr className="my-6 border-gray-200" />
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Nhập Báo Cáo Hiện Trường</h3>

              {/* Notes */}
              <div className="mb-6">
                <label htmlFor="notes" className="block text-gray-700 text-sm font-bold mb-2">
                  Ghi chú / Khuyến cáo:
                </label>
                <div className="relative">
                  <textarea 
                    id="notes"
                    className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-y"
                    rows="4"
                    placeholder="Nhập ghi chú hoặc khuyến cáo..."
                    value={reportData.notes}
                    disabled={!isReportEditable}
                    onChange={(e) => {
                      setJobStatus(prev => ({
                        ...prev,
                        [currentJob.id]: {
                          ...prev[currentJob.id],
                          reportData: {
                            ...prev[currentJob.id].reportData,
                            notes: e.target.value
                          }
                        }
                      }));
                    }}
                  />
                  <button 
                    className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-full shadow-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Nhập liệu bằng giọng nói (chức năng demo)"
                    disabled={!isReportEditable}
                    onClick={() => showTempNotification('Tính năng nhập giọng nói đang được phát triển')}
                  >
                    <i className="fas fa-microphone"></i>
                  </button>
                </div>
              </div>

              {/* Image upload */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">Hình ảnh hiện trường:</label>
                <input 
                  type="file" 
                  id="image-upload" 
                  accept="image/*" 
                  multiple
                  className="hidden"
                  disabled={!isReportEditable}
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    if (files.length > 0) {
                      files.forEach(file => {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const imgSrc = event.target.result;
                          setJobStatus(prev => ({
                            ...prev,
                            [currentJob.id]: {
                              ...prev[currentJob.id],
                              reportData: {
                                ...prev[currentJob.id].reportData,
                                images: [...prev[currentJob.id].reportData.images, imgSrc]
                              }
                            }
                          }));
                        };
                        reader.readAsDataURL(file);
                      });
                      showModal('Ảnh Đã Chọn', `Đã chọn ${files.length} ảnh. Ảnh sẽ được tối ưu và tải lên.`);
                    }
                  }}
                />
                <button 
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-lg transition-colors flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!isReportEditable}
                  onClick={() => document.getElementById('image-upload').click()}
                >
                  <i className="fas fa-camera mr-2"></i> Chụp / Đính kèm ảnh (Tối ưu tự động)
                </button>
                
                {/* Image preview */}
                {reportData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {reportData.images.map((imgSrc, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={imgSrc} 
                          className="w-full h-24 object-cover rounded-md shadow-sm" 
                          alt="Ảnh hiện trường"
                        />
                        {isReportEditable && (
                          <button 
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              setJobStatus(prev => ({
                                ...prev,
                                [currentJob.id]: {
                                  ...prev[currentJob.id],
                                  reportData: {
                                    ...prev[currentJob.id].reportData,
                                    images: prev[currentJob.id].reportData.images.filter((_, i) => i !== index)
                                  }
                                }
                              }));
                              showTempNotification('Ảnh đã được xóa khỏi danh sách.');
                            }}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Interactive Checklist */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">Checklist công việc:</label>
                <div className="space-y-2">
                  {currentJob.checklist_items?.length > 0 ? (
                    currentJob.checklist_items.map((item, index) => (
                      <div key={index} className="flex items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <input 
                          type="checkbox" 
                          id={`checklist-item-${index}`}
                          className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                          disabled={!isReportEditable}
                          checked={reportData.checklist[index] || false}
                          onChange={(e) => {
                            setJobStatus(prev => ({
                              ...prev,
                              [currentJob.id]: {
                                ...prev[currentJob.id],
                                reportData: {
                                  ...prev[currentJob.id].reportData,
                                  checklist: {
                                    ...prev[currentJob.id].reportData.checklist,
                                    [index]: e.target.checked
                                  }
                                }
                              }
                            }));
                          }}
                        />
                        <label htmlFor={`checklist-item-${index}`} className="ml-3 text-gray-700 font-medium">
                          {item.label}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">Không có checklist để đánh dấu.</p>
                  )}
                </div>
              </div>

              {/* Material Report Table */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">Báo cáo hóa chất và vật tư đã sử dụng:</label>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <th className="py-3 px-4 border-b">Loại Hóa Chất/Vật Tư</th>
                        <th className="py-3 px-4 border-b text-right">Số Lượng Yêu Cầu</th>
                        <th className="py-3 px-4 border-b text-right">Số Lượng Thực Tế</th>
                        <th className="py-3 px-4 border-b text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {/* Required chemicals rows */}
                      {currentJob.required_chemicals?.map((chem, index) => {
                        const actualQuantity = reportData.materials.find(m => m.name === chem.name)?.actualQuantity || '';
                        return (
                          <tr key={`required-${index}`} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">
                              <span className="text-gray-700 font-medium">{chem.name}</span>
                            </td>
                            <td className="py-2 px-4 border-b text-right">
                              <span className="text-gray-700 font-medium">{chem.quantity} {chem.unit}</span>
                            </td>
                            <td className="py-2 px-4 border-b text-right">
                              <input 
                                type="number" 
                                value={actualQuantity}
                                min="0" 
                                step="any" 
                                placeholder="0"
                                className="w-20 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm text-right disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!isReportEditable}
                                onChange={(e) => {
                                  const newMaterials = [...reportData.materials];
                                  const existingIndex = newMaterials.findIndex(m => m.name === chem.name);
                                  const newMaterial = {
                                    name: chem.name,
                                    requiredQuantity: chem.quantity,
                                    unit: chem.unit,
                                    actualQuantity: parseFloat(e.target.value) || 0,
                                    isCustom: false
                                  };
                                  
                                  if (existingIndex >= 0) {
                                    newMaterials[existingIndex] = newMaterial;
                                  } else {
                                    newMaterials.push(newMaterial);
                                  }
                                  
                                  setJobStatus(prev => ({
                                    ...prev,
                                    [currentJob.id]: {
                                      ...prev[currentJob.id],
                                      reportData: {
                                        ...prev[currentJob.id].reportData,
                                        materials: newMaterials
                                      }
                                    }
                                  }));
                                }}
                              />
                            </td>
                            <td className="py-2 px-4 border-b text-center">
                              <span className="text-gray-400 text-sm">Yêu cầu</span>
                            </td>
                          </tr>
                        );
                      })}
                      
                      {/* Custom materials rows */}
                      {reportData.materials.filter(m => m.isCustom).map((material, index) => (
                        <tr key={`custom-${index}`} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b">
                            <input 
                              type="text" 
                              value={material.name}
                              placeholder="Tên hóa chất/vật tư"
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!isReportEditable}
                              onChange={(e) => {
                                const newMaterials = [...reportData.materials];
                                const materialIndex = newMaterials.findIndex(m => m.isCustom && m.name === material.name);
                                if (materialIndex >= 0) {
                                  newMaterials[materialIndex] = { ...material, name: e.target.value };
                                  setJobStatus(prev => ({
                                    ...prev,
                                    [currentJob.id]: {
                                      ...prev[currentJob.id],
                                      reportData: {
                                        ...prev[currentJob.id].reportData,
                                        materials: newMaterials
                                      }
                                    }
                                  }));
                                }
                              }}
                            />
                          </td>
                          <td className="py-2 px-4 border-b text-right">
                            <span className="text-gray-500">N/A</span>
                          </td>
                          <td className="py-2 px-4 border-b text-right">
                            <input 
                              type="number" 
                              value={material.actualQuantity || ''}
                              min="0" 
                              step="any" 
                              placeholder="0"
                              className="w-20 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm text-right disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!isReportEditable}
                              onChange={(e) => {
                                const newMaterials = [...reportData.materials];
                                const materialIndex = newMaterials.findIndex(m => m.isCustom && m.name === material.name);
                                if (materialIndex >= 0) {
                                  newMaterials[materialIndex] = { ...material, actualQuantity: parseFloat(e.target.value) || 0 };
                                  setJobStatus(prev => ({
                                    ...prev,
                                    [currentJob.id]: {
                                      ...prev[currentJob.id],
                                      reportData: {
                                        ...prev[currentJob.id].reportData,
                                        materials: newMaterials
                                      }
                                    }
                                  }));
                                }
                              }}
                            />
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            <button 
                              className="bg-red-400 hover:bg-red-500 text-white p-2 rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!isReportEditable}
                              onClick={() => {
                                const newMaterials = reportData.materials.filter(m => !(m.isCustom && m.name === material.name));
                                setJobStatus(prev => ({
                                  ...prev,
                                  [currentJob.id]: {
                                    ...prev[currentJob.id],
                                    reportData: {
                                      ...prev[currentJob.id].reportData,
                                      materials: newMaterials
                                    }
                                  }
                                }));
                              }}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="4" className="p-4 text-center">
                          <button 
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!isReportEditable}
                            onClick={() => {
                              const newCustomMaterial = {
                                name: '',
                                requiredQuantity: null,
                                unit: '',
                                actualQuantity: 0,
                                isCustom: true
                              };
                              setJobStatus(prev => ({
                                ...prev,
                                [currentJob.id]: {
                                  ...prev[currentJob.id],
                                  reportData: {
                                    ...prev[currentJob.id].reportData,
                                    materials: [...prev[currentJob.id].reportData.materials, newCustomMaterial]
                                  }
                                }
                              }));
                            }}
                          >
                            <i className="fas fa-plus mr-1"></i> Thêm Hóa Chất/Vật Tư Khác
                          </button>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Save report button */}
              {currentJobStatus === 'checkedIn' && (
                <>
                  <button 
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors shadow-md mb-3"
                    onClick={() => showTempNotification(`Báo cáo cho công việc "${currentJob.customer_name}" đã được lưu.`)}
                  >
                    <i className="fas fa-save mr-2"></i> Lưu Báo Cáo
                  </button>

                  <button 
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-colors shadow-md"
                    onClick={handleCheckout}
                  >
                    Kết Thúc Công Việc (Check-out)
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải ứng dụng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center z-10">
        {/* Left side - User info or Back button */}
        <div className="flex items-center min-w-0 flex-1">
          {currentScreen === 'report' ? (
            <button 
              className="text-xl p-2 rounded-full hover:bg-blue-700 transition-colors"
              onClick={() => setCurrentScreen('schedule')}
            >
              <i className="fas fa-arrow-left"></i>
            </button>
          ) : (
            session?.user && (
              <div className="text-sm text-blue-100 truncate">
                <i className="fas fa-user mr-2"></i>
                <span className="font-medium">Xin chào:</span> 
                <span className="text-white font-semibold ml-1">
                  {session.user.user_metadata?.full_name || session.user.email.split('@')[0]}
                </span>
              </div>
            )
          )}
        </div>

        {/* Center - Title */}
        <h1 className="text-xl font-bold text-center flex-1">
          {currentScreen === 'schedule' ? 'Lịch Làm Việc' : 'Chi Tiết Công Việc'}
        </h1>

        {/* Right side - Logout button or spacer */}
        <div className="flex items-center justify-end min-w-0 flex-1">
          {currentScreen === 'schedule' && (
            <button 
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              onClick={handleLogout}
            >
              Đăng xuất
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow p-4 overflow-auto">
        {currentScreen === 'schedule' && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Các Công Việc Được Giao</h2>
            
            {renderDailyChemicalsSummary()}
            {renderJobList()}
          </div>
        )}

        {currentScreen === 'report' && renderReportScreen()}
      </main>

      {/* Notification */}
      {showNotification && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-6 py-3 rounded-lg text-sm z-50">
          {notificationMessage}
        </div>
      )}

      {/* Modal */}
      {modalData.show && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-800">{modalData.title}</h3>
            <p className="mb-6 text-gray-700">{modalData.message}</p>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              onClick={hideModal}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
