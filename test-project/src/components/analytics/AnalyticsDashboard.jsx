import React from 'react';
import { Container, Box, Heading, Text } from '@chakra-ui/react';
import { Typography, Grid as MUIGrid, Paper, Divider } from '@mui/material';
import BaseCard from '../ui/BaseCard';
import BaseButton from '../ui/BaseButton';
import IntermediatePanel from '../ui/IntermediatePanel';
import DataDisplay from '../common/DataDisplay';

// Feature component that uses multiple hubs
export const AnalyticsDashboard = () => {
  const analyticsData = [
    { label: 'Page Views', value: '12,345' },
    { label: 'Unique Visitors', value: '3,456' },
    { label: 'Bounce Rate', value: '45%' },
    { label: 'Session Duration', value: '2m 45s' },
  ];

  const topPages = [
    { label: '/home', value: '5,234 views' },
    { label: '/products', value: '3,456 views' },
    { label: '/about', value: '1,234 views' },
  ];

  return (
    <Container maxW="container.xl">
      <Box mb={6}>
        <Heading size="xl">Analytics Dashboard</Heading>
        <Text color="gray.600">Powered by both Chakra UI and Material UI</Text>
      </Box>
      
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="body1">
          This dashboard uses both UI libraries
        </Typography>
      </Paper>

      <MUIGrid container spacing={3}>
        <MUIGrid item xs={12} md={8}>
          <DataDisplay
            title="Key Metrics"
            data={analyticsData}
            variant="chakra"
            onItemClick={(item) => console.log('View details for:', item)}
          />
        </MUIGrid>

        <MUIGrid item xs={12} md={4}>
          <IntermediatePanel
            title="Quick Actions"
            content="Manage your analytics settings"
            actions={[
              { label: 'Export Data', onClick: () => console.log('Export') },
              { label: 'Configure', onClick: () => console.log('Configure') },
            ]}
            variant="mui"
          />
        </MUIGrid>

        <MUIGrid item xs={12} md={6}>
          <BaseCard title="Top Pages" variant="chakra">
            <Box>
              {topPages.map((page, index) => (
                <Box key={index} py={2} borderBottom="1px solid #eee">
                  <Typography variant="body1">
                    {page.label}: {page.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </BaseCard>
        </MUIGrid>

        <MUIGrid item xs={12} md={6}>
          <BaseCard title="Actions" variant="mui">
            <Box display="flex" gap={2} flexWrap="wrap">
              <BaseButton variant="chakra">
                View Full Report
              </BaseButton>
              <BaseButton variant="mui">
                Schedule Report
              </BaseButton>
              <BaseButton variant="chakra">
                Share Dashboard
              </BaseButton>
            </Box>
          </BaseCard>
        </MUIGrid>
      </MUIGrid>
    </Container>
  );
};

export default AnalyticsDashboard;