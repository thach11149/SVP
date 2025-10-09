// src/components/ScheduleCalendar.js

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { supabase } from '../../supabaseClient';
import { Box, Typography } from '@mui/material';
import JobForm from './JobForm';
import AlertMessage from '../ui/AlertMessage'; // Import component thông báo

const localizer = momentLocalizer(moment);

// Hàm chuyển đổi dữ liệu từ Supabase sang định dạng event
const formatJobToEvent = (job) => ({
  id: job.id,
  title: `${job.customer_name || job.customers?.name || 'Khách hàng không xác định'} - ${job.job_description}`,
  start: new Date(`${job.scheduled_date}T${job.start_time || '08:00'}`),
  end: new Date(job.check_out_time ? job.check_out_time : `${job.scheduled_date}T${job.end_time || '10:00'}`),
  resource: job, // Lưu lại toàn bộ object job
});

export default function ScheduleCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openJobDialog, setOpenJobDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null); // State cho event đang được chọn
  const [alert, setAlert] = useState(null); // Thêm state cho thông báo

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('jobs')
      .select(`*, customers ( name )`)
      .eq('is_deleted', false);
    if (error) {
      console.error('Lỗi lấy dữ liệu công việc:', error.message);
      setAlert({ type: 'error', message: 'Lỗi lấy dữ liệu công việc: ' + error.message });
    } else {
      setEvents(data.map(formatJobToEvent));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSelectSlot = useCallback((slotInfo) => {
    setSelectedEvent(null); // Đảm bảo không ở chế độ sửa
    setSelectedSlot(slotInfo);
    setOpenJobDialog(true);
  }, []);

  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event); // Lưu event được chọn
    setOpenJobDialog(true); // Mở dialog
  }, []);
  
  const handleCloseDialog = () => {
    setOpenJobDialog(false);
    setSelectedEvent(null);
    setSelectedSlot(null);
  };

  const handleSaveJob = (savedJob) => {
    const formattedEvent = formatJobToEvent(savedJob);
    if (selectedEvent) { // Chế độ sửa
      setEvents(events.map(e => e.id === formattedEvent.id ? formattedEvent : e));
    } else { // Chế độ thêm mới
      setEvents([...events, formattedEvent]);
    }
    handleCloseDialog();
  };

  const handleDeleteJob = async (jobId) => {
    try {
      const { error } = await supabase.from('jobs').delete().eq('id', jobId);
      if (error) throw error;
      setEvents(events.filter(e => e.id !== jobId));
      handleCloseDialog();
      setAlert({ type: 'success', message: 'Xóa công việc thành công!' });
    } catch (error) {
      alert('Lỗi khi xóa công việc: ' + error.message);
    }
  };

  if (loading) return <Typography>Đang tải lịch làm việc...</Typography>;

  return (
    <Box sx={{ height: '70vh', mt: 4 }}>
      <JobForm
        open={openJobDialog}
        onClose={handleCloseDialog}
        onSave={handleSaveJob}
        onDelete={handleDeleteJob}
        selectedSlot={selectedSlot}
        jobToEdit={selectedEvent}
      />
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        messages={{ next: "Sau", previous: "Trước", today: "Hôm nay", month: "Tháng", week: "Tuần", day: "Ngày" }}
        selectable={true}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent} // Thêm handler khi nhấn vào event
        views={['month', 'week', 'day']} // Thêm chế độ xem theo ngày
      />
      {alert && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          duration={4000}
          onClose={() => setAlert(null)}
        />
      )}
    </Box>
  );
}