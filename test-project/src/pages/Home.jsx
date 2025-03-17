import React from 'react';
import { Container, Typography, Grid, Box, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Card from '@layouts/containers/Card';
import PrimaryButton from '@common/buttons/PrimaryButton';
import SecondaryButton from '@common/buttons/SecondaryButton';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Welcome to Test Project
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card title="Getting Started">
            <Typography paragraph>
              This is a sample project using Material UI and Chakra UI together.
            </Typography>
            <Box mt={3}>
              <Stack direction="row" spacing={2}>
                <PrimaryButton onClick={() => navigate('/dashboard')}>
                  Regular Dashboard
                </PrimaryButton>
                <SecondaryButton onClick={() => navigate('/lazy-dashboard')}>
                  Lazy Dashboard
                </SecondaryButton>
              </Stack>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card title="Authentication">
            <Typography paragraph>
              Try out the authentication pages with lazy loading.
            </Typography>
            <Box mt={3}>
              <Stack direction="row" spacing={2}>
                <PrimaryButton onClick={() => navigate('/login')}>
                  Login
                </PrimaryButton>
                <SecondaryButton onClick={() => navigate('/signup')}>
                  Sign Up
                </SecondaryButton>
              </Stack>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} mt={3}>
          <Card title="Advanced React Features">
            <Typography paragraph>
              Explore advanced React features like dynamic component loading.
            </Typography>
            <Box mt={2}>
              <PrimaryButton onClick={() => navigate('/dynamic-components')}>
                Dynamic Components Demo
              </PrimaryButton>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home; 