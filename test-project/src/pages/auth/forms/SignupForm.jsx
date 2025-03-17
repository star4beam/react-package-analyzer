import React from 'react';
import { Stack, Box } from '@mui/material';
import TextField from '../../../components/common/inputs/TextField';
import SecondaryButton from '../../../components/common/buttons/SecondaryButton';
import AlertMessage from '../../../components/ui/feedback/AlertMessage';

const SignupForm = () => {
  return (
    <Box>
      <AlertMessage 
        status="info" 
        title="Welcome!" 
        description="Please fill out the form below to create an account." 
        mb={4}
      />
      <Stack spacing={3}>
        <TextField label="Full Name" />
        <TextField label="Email" type="email" />
        <TextField label="Password" type="password" />
        <TextField label="Confirm Password" type="password" />
        <SecondaryButton>Create Account</SecondaryButton>
      </Stack>
    </Box>
  );
};

export default SignupForm; 