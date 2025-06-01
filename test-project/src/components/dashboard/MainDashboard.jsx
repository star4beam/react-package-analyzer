import React from 'react';
import { SimpleGrid, Container, Heading, Text, Stack } from '@chakra-ui/react';
import { Box, Typography, Paper } from '@mui/material';
import IntermediatePanel from '../ui/IntermediatePanel';
import IntermediateForm from '../ui/IntermediateForm';
import BaseCard from '../ui/BaseCard';
import ManagementHub from '../composite/ManagementHub';

// Main Hub: Uses multiple hubs but is not used by any other component
export const MainDashboard = () => {
  const stats = [
    { title: 'Total Users', value: '1,234' },
    { title: 'Active Sessions', value: '567' },
    { title: 'Revenue', value: '$12,345' },
  ];

  const formFields = [
    { name: 'email', label: 'Email', placeholder: 'Enter email' },
    { name: 'message', label: 'Message', placeholder: 'Enter message' },
  ];

  return (
    <Container maxW="container.xl" py={8}>
      <Stack spacing={4} mb={6}>
        <Heading>Main Dashboard</Heading>
        <Text>A comprehensive view using multiple UI libraries</Text>
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="body2">
            This component combines Chakra UI and Material UI
          </Typography>
        </Paper>
      </Stack>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
        {stats.map((stat, index) => (
          <IntermediatePanel
            key={index}
            title={stat.title}
            content={
              <Box sx={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {stat.value}
              </Box>
            }
            variant={index % 2 === 0 ? 'chakra' : 'mui'}
          />
        ))}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <IntermediateForm
          title="Contact Form"
          fields={formFields}
          onSubmit={() => console.log('Form submitted')}
          variant="chakra"
        />
        
        <BaseCard title="Recent Activity" variant="mui">
          <Box>
            <p>User John logged in</p>
            <p>User Jane updated profile</p>
            <p>System backup completed</p>
          </Box>
        </BaseCard>
      </SimpleGrid>
      
      <Box mt={8}>
        <ManagementHub
          title="System Management"
          formConfig={{
            title: 'System Configuration',
            fields: [
              { name: 'serverName', label: 'Server Name', placeholder: 'Enter server name' },
              { name: 'port', label: 'Port', placeholder: 'Enter port number' },
            ],
            onSubmit: (data) => console.log('System config:', data)
          }}
          actions={[
            { label: 'Restart Services', onClick: () => console.log('Restart') },
            { label: 'Update System', onClick: () => console.log('Update') },
          ]}
          variant="mui"
        />
      </Box>
    </Container>
  );
};

export default MainDashboard;