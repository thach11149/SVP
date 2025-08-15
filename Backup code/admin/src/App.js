import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { CssBaseline, Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import LichLamViec from './pages/LichLamViec';
import QuanLyKhachHang from './pages/QuanLyKhachHang';
import LichThang from './pages/LichThang';
import LapKeHoachCongViec from './pages/LapKeHoachCongViec';
import ChecklistCongViec from './pages/ChecklistCongViec';
import DanhSachCongViec from './pages/DanhSachCongViec';
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
        <Routes>
          {/* Routes không cần sidebar (Login, etc.) */}
          <Route path="/loginpage" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Routes với sidebar - cần authentication */}
          <Route
            path="/*"
            element={
              session ? (
                <Box sx={{ display: 'flex', height: '100vh' }}>
                  <Box sx={{ width: 240, borderRight: 1, borderColor: 'divider' }}>
                    <Sidebar session={session} />
                  </Box>
                  <Box sx={{ flex: 1, overflow: 'auto' }}>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" />} />
                      <Route path="/dashboard" element={<DashboardPage session={session} />} />
                      <Route path="/quan-ly-khach-hang" element={<QuanLyKhachHang />} />
                      <Route path="/lich-lam-viec" element={<LichLamViec />} />
                      <Route path="/lich-thang" element={<LichThang />} />
                      <Route path="/lap-ke-hoach-cong-viec" element={<LapKeHoachCongViec session={session} />} />
                      <Route path="/checklist-cong-viec" element={<ChecklistCongViec session={session} />} />
                      <Route path="/danh-sach-cong-viec" element={<DanhSachCongViec session={session} />} />
                    </Routes>
                  </Box>
                </Box>
              ) : (
                <Navigate to="/loginpage" />
              )
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
