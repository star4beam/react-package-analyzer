import React from 'react';
import { Container, Grid, Divider } from '@mui/material';
import { Heading, Box } from '@chakra-ui/react';
import StatsSummary from '../../components/dashboard/StatsSummary';
import UserSummary from '../../components/dashboard/UserSummary';
import ActionCard from '../../components/common/ActionCard';
import LibrarySwitcher from '../../components/common/LibrarySwitcher';

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
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Heading as="h1" size="xl" mb={4}>
        Enhanced Dashboard
      </Heading>
      
      <LibrarySwitcher />
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <UserSummary 
            user={mockUser}
            onViewProfile={handleViewProfile}
            onEditProfile={handleEditProfile}
          />
          
          <ActionCard
            title="Quick Actions"
            description="Access your most common tasks"
            actionText="View All Actions"
            onAction={() => handleViewDetails('actions')}
          />
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Box mb={4}>
            <StatsSummary 
              stats={mockStats}
              onViewDetails={handleViewDetails}
            />
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <ActionCard
            title="Recent Notifications"
            description="You have 5 unread notifications"
            actionText="View All"
            onAction={() => handleViewDetails('notifications')}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default EnhancedDashboard; 