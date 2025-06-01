import React from 'react';
import { Container, Typography, Grid, Box, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Card from '@layouts/containers/Card';
import PrimaryButton from '@common/buttons/PrimaryButton';
import SecondaryButton from '@common/buttons/SecondaryButton';
import IntermediatePanel from '@components/ui/IntermediatePanel';
import IntermediateForm from '@components/ui/IntermediateForm';
import DataDisplay from '@components/common/DataDisplay';
import AdvancedPanel from '@components/ui/AdvancedPanel';

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
        <Grid item xs={12} md={6}>
          <IntermediatePanel
            title="Quick Actions"
            content="Access frequently used features"
            actions={[
              { label: 'Main Dashboard', onClick: () => navigate('/main-dashboard') },
              { label: 'Profile', onClick: () => navigate('/profile') },
            ]}
            variant="chakra"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <IntermediateForm
            title="Subscribe"
            fields={[
              { name: 'email', label: 'Email', placeholder: 'your@email.com' },
            ]}
            onSubmit={() => console.log('Subscribed!')}
            variant="mui"
          />
        </Grid>
        <Grid item xs={12}>
          <Card title="Latest Updates">
            <DataDisplay
              title="Recent Activity"
              data={[
                { label: 'New Features', value: '5 added' },
                { label: 'Bug Fixes', value: '12 resolved' },
                { label: 'Performance', value: '+15% faster' },
              ]}
              variant="chakra"
            />
          </Card>
        </Grid>
        <Grid item xs={12}>
          <AdvancedPanel
            title="Advanced Management"
            subtitle="Comprehensive control panel with multiple features"
            data={[
              { label: 'Active Users', value: '1,234' },
              { label: 'System Health', value: '98%' },
              { label: 'Cache Hit Rate', value: '85%' },
            ]}
            panelActions={[
              { label: 'System Settings', onClick: () => navigate('/settings') },
              { label: 'Analytics', onClick: () => navigate('/analytics') },
              { label: 'Admin Panel', onClick: () => navigate('/admin') },
            ]}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home; 