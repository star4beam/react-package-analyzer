import React from 'react';
import { Container, Paper, Box } from '@mui/material';
import SignupForm from './forms/SignupForm';

const Signup = () => {
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3}>
        <Box p={4}>
          <SignupForm />
        </Box>
      </Paper>
    </Container>
  );
};

export default Signup; 