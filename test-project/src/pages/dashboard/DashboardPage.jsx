import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Container, SimpleGrid } from '@chakra-ui/react';
import Dashboard from '../../components/dashboard/Dashboard';
import { useAuth } from '../../hooks/useAuth';
import DataDisplay from '../../components/common/DataDisplay';
import IntermediatePanel from '../../components/ui/IntermediatePanel';
import ControlHub from '../../components/composite/ControlHub';

const DashboardPage = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show nothing while checking authentication
  if (loading) {
    return null;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const performanceData = [
    { label: 'CPU Usage', value: '45%' },
    { label: 'Memory', value: '2.3 GB' },
    { label: 'Disk Space', value: '120 GB' },
  ];

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="container.xl" py={4}>
        <Dashboard />
        
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mt={6}>
          <DataDisplay
            title="System Performance"
            data={performanceData}
            variant="chakra"
            onItemClick={(item) => console.log('Clicked:', item)}
          />
          
          <IntermediatePanel
            title="Quick Stats"
            content="View your dashboard metrics at a glance"
            actions={[
              { label: 'Refresh', onClick: () => console.log('Refresh') },
              { label: 'Export', onClick: () => console.log('Export') },
            ]}
            variant="mui"
          />
          
          <ControlHub
            title="System Control"
            actions={[
              { label: 'Restart Service', onClick: () => console.log('Restart') },
              { label: 'Update Config', onClick: () => console.log('Update') },
            ]}
            formFields={[
              { name: 'interval', label: 'Refresh Interval', placeholder: '30' },
            ]}
            onFormSubmit={(data) => console.log('Control data:', data)}
          />
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default DashboardPage; 