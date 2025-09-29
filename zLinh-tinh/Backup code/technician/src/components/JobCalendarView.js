// src/components/JobCalendarView.js
import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const formatJobsToEvents = (jobs) =>
  jobs.map(job => {
    const startDate = job.scheduled_date ? new Date(job.scheduled_date) : new Date();
    const endDate = job.check_out_time ? new Date(job.check_out_time) : startDate;

    return {
      id: job.id,
      title: job.job_description || 'Không có mô tả',
      start: startDate,
      end: endDate,
      allDay: false,
      completed: !!job.completed,
    };
  });

function CustomEvent({ event }) {
  const indicatorStyle = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: event.completed ? 'green' : 'red',
    display: 'inline-block',
    marginRight: '4px',
    verticalAlign: 'middle',
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '100%', overflow: 'hidden' }}>
      <div style={indicatorStyle} title={event.title}></div>
    </div>
  );
}

const CustomDateHeader = React.memo(({ label, date, events }) => {
  const eventsInDay = events.filter(event =>
    moment(event.start).isSame(date, 'day')
  );

  const total = eventsInDay.length;
  const completed = eventsInDay.filter(e => e.completed).length;

  let completionPercentage = 0;
  if (total > 0) {
    completionPercentage = Math.round((completed / total) * 100);
  }

  let completionColor = 'red';
  if (completionPercentage === 100 && total > 0) {
    completionColor = 'green';
  } else if (completionPercentage > 0 && completionPercentage < 100) {
    completionColor = 'orange';
  }

  if (total === 0) {
    return (
      <div style={{ fontSize: 13, padding: '4px', textAlign: 'left' }}>
        <strong>{label}</strong><br />
      </div>
    );
  }

  return (
    <div style={{ fontSize: 13, padding: '4px', textAlign: 'left' }}>
      <strong>{label}</strong><br />
      <div>
        <div style={{ color: completionColor, fontWeight: 'bold' }}>
          Hoàn thành: {completionPercentage}%
        </div>
        <div style={{ fontSize: 11, marginTop: '2px' }}>
          ({completed}/{total} công việc)
        </div>
      </div>
    </div>
  );
});

export default function JobCalendarView({ jobs }) {
  const navigate = useNavigate();

  const events = useMemo(() => formatJobsToEvents(jobs), [jobs]);

  const eventPropGetter = useCallback((event) => {
    const backgroundColor = event.completed ? 'green' : 'red';
    return { style: { backgroundColor, border: 'none' } };
  }, []);

  const handleSelectSlot = useCallback((slotInfo) => {
    const selectedDate = moment(slotInfo.start).format('YYYY-MM-DD');
    navigate(`?tab=1&date=${selectedDate}`);
  }, [navigate]);

  return (
    <div style={{ height: '70vh', marginTop: 24 }}>
      <Calendar
        selectable
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        messages={{
          next: 'Sau',
          previous: 'Trước',
          today: 'Hôm nay',
          month: 'Tháng',
          week: 'Tuần',
          day: 'Ngày',
        }}
        eventPropGetter={eventPropGetter}
        components={{
          month: {
            dateHeader: (props) => <CustomDateHeader {...props} events={events} />,
            event: CustomEvent,
          }
        }}
        onSelectSlot={handleSelectSlot}
      />
    </div>
  );
}
