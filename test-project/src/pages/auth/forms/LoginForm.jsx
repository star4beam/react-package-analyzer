import React from 'react';
import { VStack, Heading } from '@chakra-ui/react';
import TextField from '@common/inputs/TextField';
import PrimaryButton from '@common/buttons/PrimaryButton';
import SecondaryButton from '@common/buttons/SecondaryButton';
import useFormValidation from '@hooks/custom/form/useFormValidation';

const LoginForm = () => {
  const { errors, validate } = useFormValidation();

  return (
    <VStack spacing={4} align="stretch">
      <Heading as="h1" size="lg" textAlign="center">
        Login
      </Heading>
      <TextField label="Email" type="email" />
      <TextField label="Password" type="password" />
      <PrimaryButton fullWidth>Log In</PrimaryButton>
      <SecondaryButton width="100%">Sign Up Instead</SecondaryButton>
    </VStack>
  );
};

export default LoginForm; 