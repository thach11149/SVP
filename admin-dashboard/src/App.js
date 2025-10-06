import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { CssBaseline, Box, CircularProgress } from '@mui/material';  // Thêm CircularProgress cho loading
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ForgotPassword from './components/ui/ForgotPassword';
import ResetPassword from './components/ui/ResetPassword';
import LichLamViec from './pages/LichLamViec';
import QuanLyKhachHang from './pages/QuanLyKhachHang';
import LichThang from './pages/LichThang';
import LapKeHoachCongViec from './pages/LapKeHoachCongViec';
import ChecklistCongViec from './pages/ChecklistCongViec';
import DanhSachCongViec from './pages/DanhSachCongViec';
import Sidebar from './components/ui/Sidebar';
import TestPage from './pages/TestPage';
import KhoangCachDiChuyen from './pages/KhoangCachDiChuyen'; // Thêm import
import ESGPage from './pages/ESGPage';
import QuanLyTonKho from './pages/QuanLyTonKho';
import DichVuKhachHang from './pages/DichVuKhachHang';
import LapKeHoachGiaoViec from './pages/LapKeHoachGiaoViec';
import RoleManagement from './pages/RoleManagement';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);  // Thêm loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);  // Set loading false sau khi get session
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);  // Set loading false khi auth state change
    });

    return () => subscription.unsubscribe();
  }, []);

  // Hiển thị loading spinner khi đang load session
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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
                  <Box>
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
                      <Route path="/test" element={<TestPage />} />
                      <Route path="/khoang-cach-di-chuyen" element={<KhoangCachDiChuyen />} />  {/* Thêm route */}
                      <Route path="/esg" element={<ESGPage />} />
                      <Route path="/quan-ly-ton-kho" element={<QuanLyTonKho />} />
                      <Route path="/dich-vu-khach-hang" element={<DichVuKhachHang session={session} />} />
                      <Route path="/lap-ke-hoach-giao-viec" element={<LapKeHoachGiaoViec session={session} />} />
                      <Route path="/role-management" element={<RoleManagement session={session} />} /> {/* Thêm route cho RoleManagement */}
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
