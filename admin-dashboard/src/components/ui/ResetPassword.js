import { useState } from 'react';
import { supabase } from '../../supabaseClient';
import toast from 'react-hot-toast';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (password.length < 6) {
      toast.error('❌ Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (password !== confirm) {
      toast.error('❌ Mật khẩu không khớp');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error(`❌ Lỗi: ${error.message}`);
    } else {
      toast.success('✅ Mật khẩu đã được cập nhật thành công!');
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
          Đặt lại mật khẩu
        </Typography>
        <Box sx={{ mt: 2, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Mật khẩu mới"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Xác nhận mật khẩu"
            type={showPassword ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            onClick={handleReset}
            disabled={loading}
          >
            {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
  