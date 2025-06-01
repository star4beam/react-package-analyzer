import React from 'react';
import { Container, SimpleGrid, Box, Text } from '@chakra-ui/react';
import { Typography, Paper, Button as MUIButton } from '@mui/material';
import AnalyticsDashboard from '../analytics/AnalyticsDashboard';
import SettingsPanel from '../settings/SettingsPanel';
import DataDisplay from '../common/DataDisplay';
import IntermediatePanel from '../ui/IntermediatePanel';
import BaseCard from '../ui/BaseCard';

// Another intersection component that uses features and hubs
export const AdminPanel = () => {
  const adminStats = [
    { label: 'Total Users', value: '10,234' },
    { label: 'Active Sessions', value: '1,456' },
    { label: 'System Health', value: 'Good' },
  ];

  return (
    <Container maxW="container.xl" py={6}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4">Admin Control Panel</Typography>
        <Text fontSize="sm" color="gray.600">
          Manage system settings and view analytics
        </Text>
      </Paper>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
        <Box>
          <BaseCard title="System Overview" variant="chakra">
            <DataDisplay
              data={adminStats}
              variant="mui"
              onItemClick={(item) => console.log('Admin action:', item)}
            />
          </BaseCard>
        </Box>

        <Box>
          <IntermediatePanel
            title="Quick Admin Actions"
            content="Perform administrative tasks"
            actions={[
              { label: 'Backup Data', onClick: () => console.log('Backup') },
              { label: 'Clear Cache', onClick: () => console.log('Clear cache') },
              { label: 'View Logs', onClick: () => console.log('View logs') },
            ]}
            variant="chakra"
          />
        </Box>
      </SimpleGrid>

      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Embedded Analytics
        </Typography>
        <AnalyticsDashboard />
      </Paper>

      <Box mt={6}>
        <Typography variant="h6" gutterBottom>
          System Settings
        </Typography>
        <SettingsPanel />
      </Box>

      <Box mt={4} display="flex" gap={2}>
        <MUIButton variant="contained" color="primary">
          Save All Changes
        </MUIButton>
        <MUIButton variant="outlined">
          Export Configuration
        </MUIButton>
      </Box>
    </Container>
  );
};

export default AdminPanel;