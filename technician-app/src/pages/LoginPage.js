// src/pages/LoginPage.js
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Button, TextField, Box, Typography, Container } from '@mui/material';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.error_description || error.message);
    // App.js sẽ xử lý chuyển trang
    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ mb: 2 }}>
          <img 
            src="https://dichvudietcontrung.vn/wp-content/uploads/2024/03/sao-viet-pest-logo-1024x307.webp" 
            alt="Sao Việt Pest Logo" 
            style={{ maxWidth: '300px', width: '100%', height: 'auto' }}
          />
        </Box>
        <Typography component="h1" variant="h5">Kỹ thuật viên Đăng nhập</Typography>
        <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
          <TextField margin="normal" required fullWidth id="email" label="Email" name="email" onChange={(e) => setEmail(e.target.value)} />
          <TextField margin="normal" required fullWidth name="password" label="Mật khẩu" type="password" id="password" onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>{loading ? 'Đang xử lý...' : 'Đăng nhập'}</Button>
        </Box>
      </Box>
    </Container>
  );
}