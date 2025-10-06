import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const KPICard = ({
  title,
  value,
  subtitle,
  standard,
  gauge,
  borderColor = 'green'
}) => {
  const getGaugeColor = (color) => {
    switch (color) {
      case 'red': return '#ef4444';
      case 'yellow': return '#f59e0b';
      case 'blue': return '#3b82f6';
      case 'green': return '#10b981';
      case 'purple': return '#8b5cf6';
      default: return '#059669';
    }
  };

  const getBorderColor = (color) => {
    switch (color) {
      case 'red': return '#ef4444';
      case 'yellow': return '#f59e0b';
      case 'blue': return '#3b82f6';
      case 'green': return '#10b981';
      case 'purple': return '#8b5cf6';
      default: return '#10b981';
    }
  };

  return (
    <Card sx={{
      height: '100%',
      border: 1,
      borderColor: `${borderColor}.100`,
      borderTop: 4,
      borderTopColor: getBorderColor(borderColor),
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-1px)'
      },
      bgcolor: 'grey.50',
      boxShadow: 2
    }}>
      <CardContent sx={{ p: 5 }}>
        <Typography variant="h6" sx={{ fontWeight: 500, color: 'text.primary', mb: 1, fontSize: '1.125rem' }}>
          {title}
        </Typography>
        {standard && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 'bold' }}>
            {standard}
          </Typography>
        )}

        <Typography variant="h4" sx={{ fontWeight: 'bold', color: getBorderColor(borderColor), mb: 1, fontSize: '1.875rem' }}>
          {value}
        </Typography>

        {subtitle && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontSize: '0.875rem' }}>
            {subtitle}
          </Typography>
        )}

        {gauge && (
          <Box sx={{ mt: 1 }}>
            <Box sx={{
              width: '100%',
              height: '10px',
              bgcolor: 'grey.200',
              borderRadius: '5px',
              overflow: 'hidden',
              mb: 0.5
            }}>
              <Box sx={{
                width: `${gauge.percentage}%`,
                height: '100%',
                bgcolor: getGaugeColor(gauge.color),
                borderRadius: '5px',
                transition: 'width 0.5s ease'
              }} />
            </Box>
            <Typography variant="caption" sx={{ color: getBorderColor(borderColor), fontSize: '0.75rem' }}>
              {gauge.description}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default KPICard;