import React from 'react';
import { Box, VStack, Heading } from '@chakra-ui/react';
import { Paper, Typography, Divider } from '@mui/material';
import AnalyticsDashboard from '../analytics/AnalyticsDashboard';
import SettingsPanel from '../settings/SettingsPanel';
import MainDashboard from '../dashboard/MainDashboard';

// This component uses multiple features, making them proper intersection importers
export const DashboardHub = () => {
  return (
    <Box p={4}>
      <VStack spacing={6} align="stretch">
        <Paper elevation={2} sx={{ p: 3 }}>
          <Heading size="lg">Dashboard Hub</Heading>
          <Typography variant="body1">
            This hub combines multiple dashboard features
          </Typography>
        </Paper>

        <Divider />

        <Box>
          <AnalyticsDashboard />
        </Box>

        <Divider />

        <Box>
          <MainDashboard />
        </Box>

        <Divider />

        <Box>
          <SettingsPanel />
        </Box>
      </VStack>
    </Box>
  );
};

export default DashboardHub;