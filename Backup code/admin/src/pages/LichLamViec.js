import React, { useState, useEffect, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box, Typography } from '@mui/material';
import { supabase } from '../supabaseClient';
import JobDetailDialog from '../components/JobDetailDialog';

export default function LichLamViec() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [checklistItems, setChecklistItems] = useState([]);

  const getEventColor = useCallback((status) => {
    switch (status) {
      case 'Mới tạo': return '#2196f3'; // Blue
      case 'Đang thực hiện': return '#ff9800'; // Orange
      case 'Hoàn thành': return '#4caf50'; // Green
      case 'Hủy': return '#f44336'; // Red
      default: return '#9e9e9e'; // Grey
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      setError(null); // Clear any previous errors
      
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id,
          job_content,
          service_type,
          scheduled_date,
          status,
          notes,
          created_at,
          checklist,
          customers (
            id,
            name,
            customer_code
          ),
          job_assignments (
            technicians (
              id,
              name,
              tech_code
            )
          )
        `)
        .order('scheduled_date', { ascending: true });

      if (error) {
        console.error('Error fetching jobs:', error);
        throw error;
      }

      if (!data || !Array.isArray(data)) {
        console.warn('Invalid data received from jobs query:', data);
        setEvents([]);
        return;
      }

      // Transform jobs data to FullCalendar events format
      const calendarEvents = data
        .filter(job => job.scheduled_date) // Filter out jobs without dates first
        .map(job => {
          try {
            // Parse the scheduled_date to ensure proper datetime format
            const scheduledDateTime = new Date(job.scheduled_date);
            
            // Check if the date is valid
            if (isNaN(scheduledDateTime.getTime())) {
              console.warn('Invalid date for job:', job.id, job.scheduled_date);
              return null;
            }
            
            return {
              id: job.id,
              title: `${job.customers?.name || 'Khách hàng'} - ${job.job_content}`,
              start: scheduledDateTime.toISOString(), // Use ISO string for proper datetime
              allDay: false, // Explicitly set to false to show in time slots
              extendedProps: {
                jobData: job, // Store full job data for dialog
                scheduledTime: scheduledDateTime.toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })
              },
              backgroundColor: getEventColor(job.status),
              borderColor: getEventColor(job.status),
              textColor: '#fff'
            };
          } catch (error) {
            console.error('Error processing job event:', job.id, error);
            return null;
          }
        })
        .filter(event => event !== null); // Filter out null events

      // Create summary events for each day (all-day events showing job count)
      const jobsByDate = {};
      data
        .filter(job => job.scheduled_date) // Filter out jobs without dates
        .forEach(job => {
          try {
            const scheduledDateTime = new Date(job.scheduled_date);
            if (isNaN(scheduledDateTime.getTime())) {
              console.warn('Invalid date for summary:', job.id, job.scheduled_date);
              return;
            }
            
            const dateKey = scheduledDateTime.toISOString().split('T')[0]; // YYYY-MM-DD
            
            if (!jobsByDate[dateKey]) {
              jobsByDate[dateKey] = {
                total: 0,
                new: 0,
                inProgress: 0,
                completed: 0,
                cancelled: 0
              };
            }
            
            jobsByDate[dateKey].total++;
            switch (job.status) {
              case 'Mới tạo': jobsByDate[dateKey].new++; break;
              case 'Đang thực hiện': jobsByDate[dateKey].inProgress++; break;
              case 'Hoàn thành': jobsByDate[dateKey].completed++; break;
              case 'Hủy': jobsByDate[dateKey].cancelled++; break;
              default: break;
            }
          } catch (error) {
            console.error('Error processing job for summary:', job.id, error);
          }
        });

      // Create all-day summary events
      const summaryEvents = Object.entries(jobsByDate).map(([date, counts]) => ({
        id: `summary-${date}`,
        title: `📋 ${counts.total} công việc (${counts.new ? `${counts.new} mới` : ''}${counts.inProgress ? ` ${counts.inProgress} đang làm` : ''}${counts.completed ? ` ${counts.completed} xong` : ''}${counts.cancelled ? ` ${counts.cancelled} hủy` : ''})`.replace(/\s+/g, ' ').trim(),
        start: date,
        allDay: true,
        display: 'block',
        backgroundColor: '#e3f2fd',
        borderColor: '#1976d2',
        textColor: '#1976d2',
        extendedProps: {
          isSummary: true,
          counts: counts
        }
      }));

      // Combine time-specific events with summary events
      const allEvents = [...calendarEvents, ...summaryEvents];

      // Sort events by time for consistent ordering
      allEvents.sort((a, b) => {
        return new Date(a.start) - new Date(b.start);
      });

      setEvents(allEvents);
    } catch (error) {
      console.error('Error in fetchJobs:', error);
      setError('Không thể tải dữ liệu lịch làm việc. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [getEventColor]);

  const fetchChecklistItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('checklist')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching checklist items:', error);
      } else {
        setChecklistItems(data || []);
      }
    } catch (error) {
      console.error('Error in fetchChecklistItems:', error);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchChecklistItems();
  }, [fetchJobs, fetchChecklistItems]);

  const memoizedEvents = useMemo(() => events, [events]);

  const handleEventClick = (clickInfo) => {
    try {
      // Don't open dialog for summary events
      if (clickInfo.event.extendedProps.isSummary) {
        return;
      }
      
      const jobData = clickInfo.event.extendedProps.jobData;
      if (jobData) {
        setSelectedJob(jobData);
        setViewDialogOpen(true);
      }
    } catch (error) {
      console.error('Error handling event click:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ mt: 2, mx: 2, textAlign: 'center' }}>
        <Typography>Đang tải lịch làm việc...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2, mx: 2, textAlign: 'center' }}>
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
        <button 
          onClick={() => {
            setLoading(true);
            fetchJobs();
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Thử lại
        </button>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2, mx: 2 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Lịch làm việc
      </Typography>
      
      {/* Error boundary wrapper */}
      <Box sx={{
        '& .fc-day-today': {
          backgroundColor: '#e3f2fd !important', // Light blue background for today
        },
        '& .fc-day-today .fc-daygrid-day-number': {
          backgroundColor: '#1976d2 !important', // Blue background for today's date number
          color: 'white !important',
          borderRadius: '50%',
          width: '28px',
          height: '28px',
          display: 'flex !important',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold'
        },
        // Style for calendar buttons
        '& .fc-button': {
          backgroundColor: '#1976d2 !important',
          borderColor: '#1976d2 !important',
          color: 'white !important',
          '&:hover': {
            backgroundColor: '#1565c0 !important',
            borderColor: '#1565c0 !important',
          },
          '&:focus': {
            boxShadow: '0 0 0 0.2rem rgba(25, 118, 210, 0.25) !important'
          }
        },
        '& .fc-button:not(:disabled).fc-button-active': {
          backgroundColor: '#0d47a1 !important',
          borderColor: '#0d47a1 !important',
        },
        '& .fc-button:disabled': {
          backgroundColor: '#bbbbbb !important',
          borderColor: '#bbbbbb !important',
          opacity: '0.6 !important'
        }
      }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={memoizedEvents}
          eventClick={handleEventClick}
          height="80vh"
          locale="vi"
          eventDisplay="block"
          dayMaxEvents={3}
          moreLinkClick="popover"
          buttonText={{
            today: 'Hôm nay',
            month: 'Tháng',
            week: 'Tuần', 
            day: 'Ngày',
            list: 'Danh sách'
          }}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          slotDuration="01:00:00"
          slotLabelInterval="02:00:00"
          slotLabelFormat={{
            hour: 'numeric',
            minute: '2-digit',
            hour12: false
          }}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            hour12: false
          }}
          dayHeaderFormat={{ 
            month: 'short',
            day: 'numeric',
            weekday: 'short'
          }}
          titleFormat={{
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }}
          views={{
            timeGridWeek: {
              titleFormat: {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              },
              dayHeaderFormat: {
                month: 'short',
                day: 'numeric',
                weekday: 'short'
              },
              slotLabelFormat: {
                hour: 'numeric',
                minute: '2-digit',
                hour12: false
              }
            },
            timeGridDay: {
              titleFormat: {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              },
              slotLabelFormat: {
                hour: 'numeric',
                minute: '2-digit',
                hour12: false
              }
            },
            dayGridMonth: {
              titleFormat: {
                year: 'numeric',
                month: 'long'
              },
              dayHeaderFormat: {
                weekday: 'long'
              },
              // Show time in month view events
              eventTimeFormat: {
                hour: 'numeric',
                minute: '2-digit',
                hour12: false
              },
              // Order events by time within each day
              eventOrder: 'start'
            }
          }}
        />
      </Box>

      {/* Job Detail Dialog */}
      <JobDetailDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        selectedJob={selectedJob}
        checklistItems={checklistItems}
      />
    </Box>
  );
}