import { Box, Button } from '@mui/material';
import { useEffect, useState } from 'react';

export default function AlertMessage({ type = 'info', message = '', duration = 3000, confirm, onClose, onConfirm }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true); // Reset lại mỗi khi có message/type mới
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [message, type, duration]);

  if (!visible || !message) return null;

  const colors = {
    success: { bg: '#d4edda', text: '#155724' },
    error: { bg: '#f8d7da', text: '#721c24' },
    warning: { bg: '#fff3cd', text: '#856404' },
    info: { bg: '#d1ecf1', text: '#0c5460' },
  };

  const style = {
    padding: '10px 16px',
    borderRadius: 6,
    marginTop: 10,
    backgroundColor: colors[type]?.bg || '#eee',
    color: colors[type]?.text || '#333',
    transition: 'opacity 0.5s ease',
    position: 'fixed',
    top: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9999,
    minWidth: 240,
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  };

  return (
    <div style={style}>
      {message}
      {confirm ? (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>Hủy</Button>
          <Button variant="contained" color="error" onClick={() => { onConfirm(); onClose(); }}>Đồng ý</Button>
        </Box>
      ) : null}
    </div>
  );
}

// Usage
<AlertMessage
  type={alert.severity}
  message={alert.message}
  duration={alert.duration || 4000}
/>
