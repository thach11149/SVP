import { useEffect, useState } from 'react';

export default function AlertMessage({ type = 'info', message = '', duration = 3000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

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
  };

  return <div style={style}>{message}</div>;
}
