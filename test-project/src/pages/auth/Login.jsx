import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Container, Box, Text, Link, Center } from '@chakra-ui/react';
import LoginForm from '../../components/auth/LoginForm';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <Container maxW="container.md" py={10}>
      <Box mb={8}>
        <Center mb={6}>
          <Text fontSize="3xl" fontWeight="bold">
            Your App Name
          </Text>
        </Center>
      </Box>

      <LoginForm onSuccess={handleLoginSuccess} />
      
      <Box mt={8} textAlign="center">
        <Text>
          Don't have an account?{' '}
          <Link color="blue.500" href="/signup">
            Sign up
          </Link>
        </Text>
      </Box>
    </Container>
  );
};

export default Login; 