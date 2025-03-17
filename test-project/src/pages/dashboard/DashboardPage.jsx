import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Dashboard from '../../components/dashboard/Dashboard';
import { useAuth } from '../../hooks/useAuth';

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

  return (
    <Box minH="100vh" bg="gray.50">
      <Dashboard />
    </Box>
  );
};

export default DashboardPage; 