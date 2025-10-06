import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import ESGHeader from '../components/esg/ESGHeader';
import ESGNavigation from '../components/esg/ESGNavigation';
import EnvironmentTab from '../components/esg/EnvironmentTab';
import SocialTab from '../components/esg/SocialTab';
import GovernanceTab from '../components/esg/GovernanceTab';

export default function ESGPage() {
  const [activeTab, setActiveTab] = useState('environment');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'environment':
        return <EnvironmentTab />;
      case 'social':
        return <SocialTab />;
      case 'governance':
        return <GovernanceTab />;
      default:
        return <EnvironmentTab />;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7fafc', p: { xs: 2, md: 4 }, fontFamily: 'Inter, sans-serif' }}>
      <Container maxWidth="xl" sx={{
        bgcolor: 'white',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // shadow-2xl
        borderRadius: '0.75rem', // rounded-xl
        p: { xs: 3, md: 5 }
      }}>
        <ESGHeader />
        <ESGNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        <Box sx={{ p: 1 }}>
          {renderTabContent()}
        </Box>
      </Container>
    </Box>
  );
}