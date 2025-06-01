import React from 'react';
import { Container, Grid, Divider, Paper, Typography } from '@mui/material';
import { Heading, Box, Text, Stack } from '@chakra-ui/react';
import StatsSummary from '../../components/dashboard/StatsSummary';
import UserSummary from '../../components/dashboard/UserSummary';
import ActionCard from '../../components/common/ActionCard';
import LibrarySwitcher from '../../components/common/LibrarySwitcher';
import DataDisplay from '../../components/common/DataDisplay';
import BaseCard from '../../components/ui/BaseCard';
import BaseButton from '../../components/ui/BaseButton';
import IntermediatePanel from '../../components/ui/IntermediatePanel';
import AdvancedPanel from '../../components/ui/AdvancedPanel';

const mockUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  status: 'Active',
  avatar: 'https://via.placeholder.com/150'
};

const mockStats = {
  activeUsers: 120,
  systemStatus: 'Operational',
  transactions: 245,
  performanceScore: '94/100'
};

const EnhancedDashboard = () => {
  const handleViewDetails = (section) => {
    console.log(`View details for ${section}`);
  };
  
  const handleViewProfile = () => {
    console.log('View profile');
  };
  
  const handleEditProfile = () => {
    console.log('Edit profile');
  };
  
  const performanceData = [
    { label: 'Response Time', value: '120ms' },
    { label: 'Uptime', value: '99.9%' },
    { label: 'Error Rate', value: '0.02%' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Heading as="h1" size="xl">Enhanced Dashboard</Heading>
          <Text color="gray.600">Advanced monitoring with multiple UI libraries</Text>
        </Paper>
        
        <LibrarySwitcher />
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Stack spacing={4}>
              <UserSummary 
                user={mockUser}
                onViewProfile={handleViewProfile}
                onEditProfile={handleEditProfile}
              />
              
              <BaseCard title="System Health" variant="mui">
                <DataDisplay
                  data={performanceData}
                  variant="chakra"
                  onItemClick={(item) => console.log('Performance:', item)}
                />
              </BaseCard>
              
              <ActionCard
                title="Quick Actions"
                description="Access your most common tasks"
                actionText="View All Actions"
                onAction={() => handleViewDetails('actions')}
              />
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Stack spacing={4}>
              <Box>
                <StatsSummary 
                  stats={mockStats}
                  onViewDetails={handleViewDetails}
                />
              </Box>
              
              <IntermediatePanel
                title="System Controls"
                content="Manage system operations"
                actions={[
                  { label: 'Restart', onClick: () => console.log('Restart') },
                  { label: 'Backup', onClick: () => console.log('Backup') },
                ]}
                variant="mui"
              />
              
              <Divider sx={{ my: 3 }} />
              
              <ActionCard
                title="Recent Notifications"
                description="You have 5 unread notifications"
                actionText="View All"
                onAction={() => handleViewDetails('notifications')}
              />
              
              <AdvancedPanel
                title="Enhanced Operations"
                subtitle="Advanced monitoring and control center"
                data={[
                  { label: 'CPU Usage', value: '65%' },
                  { label: 'Memory', value: '4.2GB' },
                  { label: 'Network', value: '125 Mbps' },
                ]}
                panelActions={[
                  { label: 'Detailed Report', onClick: () => console.log('Report') },
                  { label: 'System Maintenance', onClick: () => console.log('Maintenance') },
                ]}
              />
              
              <Box display="flex" gap={2} mt={3}>
                <BaseButton variant="chakra">
                  Export Dashboard
                </BaseButton>
                <BaseButton variant="mui">
                  Configure Widgets
                </BaseButton>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
};

export default EnhancedDashboard; 