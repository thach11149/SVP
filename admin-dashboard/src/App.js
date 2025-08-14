import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { CssBaseline, Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import LichLamViec from './pages/LichLamViec';
import Sidebar from './components/Sidebar';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', height: '100vh' }}>
          <Box sx={{ width: 240 }}>
            <Sidebar />
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <Routes>
              <Route
                path="/"
                element={!session ? <Navigate to="/loginpage" /> : <Navigate to="/dashboard" />}
              />
              <Route path="/loginpage" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/dashboard"
                element={session ? <DashboardPage session={session} /> : <Navigate to="/loginpage" />}
              />
              <Route path="/lich-lam-viec" element={<LichLamViec />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </>
  );
}

export default App;
