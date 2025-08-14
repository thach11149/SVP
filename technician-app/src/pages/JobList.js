import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { Container } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';

import JobListHeader from '../components/JobListHeader';
import JobTabsAndSort from '../components/JobTabsAndSort';
import JobListView from '../components/JobListView';
import JobCalendarView from '../components/JobCalendarView';

export default function JobList({ session }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [initialStateFromUrl] = useState(() => {
    const queryParams = new URLSearchParams(location.search);
    return {
      tabIndex: parseInt(queryParams.get('tab') || '0', 10),
      page: parseInt(queryParams.get('page') || '1', 10),
      sortOrder: queryParams.get('sort') || 'newest',
      selectedDate: queryParams.get('date') || '',
    };
  });

  const [tabIndex, setTabIndex] = useState(initialStateFromUrl.tabIndex);
  const [page, setPage] = useState(initialStateFromUrl.page);
  const [sortOrder, setSortOrder] = useState(initialStateFromUrl.sortOrder);
  const [selectedDate, setSelectedDate] = useState(initialStateFromUrl.selectedDate);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const JOBS_PER_PAGE = 10;

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);

    const urlTabIndex = parseInt(queryParams.get('tab') || '0', 10);
    const urlPage = parseInt(queryParams.get('page') || '1', 10);
    const urlSort = queryParams.get('sort') || 'newest';
    const urlDate = queryParams.get('date') || '';

    if (urlTabIndex !== tabIndex) setTabIndex(urlTabIndex);
    if (urlPage !== page) setPage(urlPage);
    if (urlSort !== sortOrder) setSortOrder(urlSort);
    if (urlDate !== selectedDate) setSelectedDate(urlDate);

    const params = new URLSearchParams();
    if (tabIndex !== 0) params.set('tab', tabIndex.toString());
    if (page !== 1) params.set('page', page.toString());
    if (sortOrder !== 'newest') params.set('sort', sortOrder);
    if (selectedDate) params.set('date', selectedDate);

    const newUrlString = `?${params.toString()}`;
    if (location.search !== newUrlString) {
      navigate(newUrlString, { replace: true });
    }
  }, [location.search, navigate, tabIndex, page, sortOrder, selectedDate]);

  useEffect(() => {
    async function fetchUserJobs() {
      if (!session || !session.user) {
        setLoading(false);
        setJobs([]);
        console.warn('Không có session hoặc user. Không thể fetch công việc.');
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('jobs')
          .select(`*, customers ( name, address, phone_number )`)
          .eq('user_id', session.user.id);
        if (error) throw error;
        setJobs(data);
      } catch (error) {
        console.error('Lỗi lấy dữ liệu công việc:', error.message);
        alert('Lỗi lấy dữ liệu công việc: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUserJobs();
  }, [session]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const handleTabChange = useCallback((event, newValue) => {
    setTabIndex(newValue);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((order) => {
    setSortOrder(order);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((event, value) => {
    setPage(value);
  }, []);

  const handleDateFilterChange = useCallback((dateValue) => {
    setSelectedDate(dateValue);
    setPage(1);
  }, []);

  const filteredAndSortedJobs = useMemo(() => {
    let currentJobs = [...jobs];

    if (tabIndex === 1) {
      currentJobs = currentJobs.filter(job => !job.completed);
    } else if (tabIndex === 2) {
      currentJobs = currentJobs.filter(job => job.completed);
    }

    if (selectedDate) {
      currentJobs = currentJobs.filter(job =>
        moment(job.scheduled_date).format('YYYY-MM-DD') === selectedDate
      );
    }

    return currentJobs.sort((a, b) => {
      const timeA = new Date(a.scheduled_date).getTime();
      const timeB = new Date(b.scheduled_date).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });
  }, [jobs, tabIndex, sortOrder, selectedDate]);

  const totalJobs = filteredAndSortedJobs.length;
  const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE);
  const paginatedJobs = filteredAndSortedJobs.slice((page - 1) * JOBS_PER_PAGE, page * JOBS_PER_PAGE);

  const pendingJobsCount = jobs.filter(j => !j.completed).length;
  const completedJobsCount = jobs.filter(j => j.completed).length;

  return (
    <Container component="main" maxWidth="md">
      <JobListHeader onLogout={handleLogout} />

      <JobTabsAndSort
        tabIndex={tabIndex}
        onTabChange={handleTabChange}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        pendingJobsCount={pendingJobsCount}
        completedJobsCount={completedJobsCount}
        showSortButton={tabIndex !== 0}
      />

      {tabIndex === 0 ? (
        <JobCalendarView jobs={jobs} />
      ) : (
        <JobListView
          jobs={paginatedJobs}
          loading={loading}
          page={page}
          jobsPerPage={JOBS_PER_PAGE}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          selectedDate={selectedDate}
          onDateFilterChange={handleDateFilterChange}
        />
      )}
    </Container>
  );
}
