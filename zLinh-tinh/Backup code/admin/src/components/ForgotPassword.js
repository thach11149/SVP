import { useState } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSendResetEmail = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('❌ Email không hợp lệ');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      toast.error(`❌ Lỗi: ${error.message}`);
    } else {
      toast.success('✅ Email khôi phục mật khẩu đã được gửi!');
      setEmailSent(true);
    }

    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Quên mật khẩu
        </Typography>

        <Box component="form" onSubmit={handleSendResetEmail} sx={{ mt: 2, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Địa chỉ Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={emailSent}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            disabled={loading || emailSent}
          >
            {loading ? 'Đang gửi...' : 'Gửi email khôi phục'}
          </Button>
        </Box>

        {emailSent && (
          <>
            <Alert severity="info" sx={{ mt: 3 }}>
              📬 Vui lòng kiểm tra email để đặt lại mật khẩu
            </Alert>
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => navigate('/loginpage')}
            >
              🔙 Quay lại đăng nhập
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
}
