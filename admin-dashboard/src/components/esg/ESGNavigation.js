import React from 'react';
import { Box, Button } from '@mui/material';

export default function ESGNavigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'environment', label: '🌎 Môi trường (E)', color: '#10b981' },
    { id: 'social', label: '🧑‍🤝‍🧑 Xã hội (S)', color: '#10b981' }, // Sử dụng green cho active, như HTML
    { id: 'governance', label: '💼 Quản trị (G)', color: '#10b981' },
  ];

  return (
    <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'grey.200', mb: 3, gap: 3 }}>
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          sx={{
            pb: 1.5,
            fontSize: '1.125rem',
            fontWeight: activeTab === tab.id ? 600 : 400,
            color: activeTab === tab.id ? tab.color : '#6b7280',
            borderBottom: activeTab === tab.id ? `3px solid ${tab.color}` : 'none',
            transition: 'all 0.2s',
            '&:hover': {
              color: activeTab === tab.id ? tab.color : '#374151',
            },
          }}
        >
          {tab.label}
        </Button>
      ))}
    </Box>
  );
}