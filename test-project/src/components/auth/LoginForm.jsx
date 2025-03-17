import React, { useState } from 'react';
import { Heading, Text, Link as ChakraLink, VStack } from '@chakra-ui/react';
import FormCard from '../common/FormCard';
import TextField from '../ui/TextField';
import { useAuth } from '../../hooks/useAuth';

export const LoginForm = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
    if (onSuccess) onSuccess();
  };

  return (
    <FormCard
      onSubmit={handleSubmit}
      submitLabel="Sign In"
      maxWidth="400px"
      mx="auto"
    >
      <VStack spacing={4} align="stretch">
        <Heading as="h2" size="lg" textAlign="center">
          Welcome Back
        </Heading>
        <Text textAlign="center" color="gray.500">
          Please sign in to continue
        </Text>
        
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <Text fontSize="sm" textAlign="right">
          <ChakraLink color="blue.500" href="/forgot-password">
            Forgot password?
          </ChakraLink>
        </Text>
      </VStack>
    </FormCard>
  );
};

export default LoginForm; 