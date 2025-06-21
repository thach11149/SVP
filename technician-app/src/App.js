// src/App.js

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Import thêm Navigate
import { supabase } from './supabaseClient';
import LoginPage from './pages/LoginPage';
import JobList from './pages/JobList';
import JobDetailPage from './pages/JobDetailPage';
import { CssBaseline, Container, Typography } from '@mui/material';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <Container><Typography sx={{ mt: 5, textAlign: 'center' }}>Đang tải ứng dụng...</Typography></Container>;
  }

  return (
    <>
      <CssBaseline />
      <Routes>
        {/* Nếu chưa đăng nhập, tất cả các đường dẫn không phải /login sẽ bị điều hướng về /login */}
        <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/" element={session ? <JobList session={session} /> : <Navigate to="/login" />} />
        <Route path="/job/:jobId" element={session ? <JobDetailPage session={session} /> : <Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default App;