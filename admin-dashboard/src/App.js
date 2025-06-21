// src/App.js

import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { CssBaseline } from '@mui/material'; // Giúp giao diện đồng nhất trên các trình duyệt

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Lấy phiên đăng nhập hiện tại nếu có
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Lắng nghe các thay đổi về trạng thái đăng nhập (đăng nhập, đăng xuất)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Dọn dẹp listener khi component bị hủy
    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <CssBaseline />
      <div className="App">
        {/* Nếu không có session (chưa đăng nhập), hiển thị trang Login */}
        {/* Nếu có session (đã đăng nhập), hiển thị trang Dashboard */}
        {!session ? (
          <LoginPage />
        ) : (
          <DashboardPage key={session.user.id} session={session} />
        )}
      </div>
    </>
  );
}

export default App;