import React from 'react';
import { Container, Grid, Paper, Tab, Tabs } from '@mui/material';
import { Box, VStack, Heading } from '@chakra-ui/react';
import UserSummary from '../../components/dashboard/UserSummary';
import InfoPanel from '../../components/common/InfoPanel';
import Button from '../../components/ui/Button';
import ChakraButton from '../../components/ui/ChakraButton';
import LibrarySwitcher from '../../components/common/LibrarySwitcher';
import AdaptiveButton from '../../components/ui/AdaptiveButton';
import IntermediatePanel from '../../components/ui/IntermediatePanel';
import BaseCard from '../../components/ui/BaseCard';

const mockUser = {
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  status: 'Premium',
  avatar: 'https://via.placeholder.com/150'
};

const ProfilePage = () => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewProfile = () => {
    console.log('View detailed profile');
  };
  
  const handleEditProfile = () => {
    console.log('Edit profile details');
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Heading as="h1" size="xl" mb={4}>
        User Profile
      </Heading>
      
      <LibrarySwitcher />
      
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <UserSummary 
            user={mockUser}
            onViewProfile={handleViewProfile}
            onEditProfile={handleEditProfile}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 0, mb: 4 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="fullWidth"
            >
              <Tab label="Account" />
              <Tab label="Preferences" />
              <Tab label="Security" />
            </Tabs>
            
            <Box p={3}>
              {tabValue === 0 && (
                <VStack spacing={4} align="stretch">
                  <InfoPanel
                    title="Account Type"
                    info={`Type: ${mockUser.status}`}
                  />
                  <InfoPanel
                    title="Joined Date"
                    info="January 15, 2023"
                    actionText="Upgrade Account"
                    onAction={() => console.log('Upgrade account')}
                  />
                </VStack>
              )}
              
              {tabValue === 1 && (
                <VStack spacing={4} align="stretch">
                  <IntermediatePanel
                    title="Notification Preferences"
                    content="Email notifications: Enabled"
                    actions={[
                      { label: 'Change Settings', onClick: () => console.log('Change notification settings') },
                      { label: 'Test Notification', onClick: () => console.log('Test notification') }
                    ]}
                    variant="mui"
                  />
                  <BaseCard title="Communication Preferences" variant="chakra">
                    <Box>
                      <p>SMS alerts: Disabled</p>
                      <p>Push notifications: Enabled</p>
                      <p>Newsletter: Weekly</p>
                    </Box>
                  </BaseCard>
                </VStack>
              )}
              
              {tabValue === 2 && (
                <VStack spacing={4} align="stretch">
                  <InfoPanel
                    title="Password"
                    info="Last changed: 30 days ago"
                    actionText="Change Password"
                    onAction={() => console.log('Change password')}
                  />
                  
                  <Box display="flex" justifyContent="space-between" mt={4}>
                    <Button variant="outlined" color="secondary">
                      Enable 2FA
                    </Button>
                    <ChakraButton colorScheme="red" variant="outline">
                      Delete Account
                    </ChakraButton>
                  </Box>
                </VStack>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage; 