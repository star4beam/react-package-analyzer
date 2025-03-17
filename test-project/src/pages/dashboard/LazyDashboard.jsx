import React, { useState, lazy, Suspense } from 'react';
import { Container, Typography, Grid, Button, Box, CircularProgress } from '@mui/material';
import Panel from '@layouts/containers/Panel';

// Lazy load the heavy widgets
const StatWidget = lazy(() => import('./widgets/StatWidget'));
const ChartWidget = lazy(() => import('./widgets/ChartWidget'));

// Advanced chart widget that we'll load on demand
const AdvancedAnalytics = lazy(() => 
  // Simulate a heavier module with artificial delay
  new Promise(resolve => {
    setTimeout(() => resolve(import('./widgets/ChartWidget')), 1500);
  })
);

const WidgetPlaceholder = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    height="200px"
    bgcolor="#f5f5f5"
    borderRadius={1}
  >
    <CircularProgress size={30} />
  </Box>
);

const LazyDashboard = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Lazy-Loaded Dashboard
      </Typography>
      
      <Grid container spacing={3} mb={4}>
        <Suspense fallback={<WidgetPlaceholder />}>
          <Grid item xs={12} md={4}>
            <StatWidget title="Users" value="1,243" icon="users" />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatWidget title="Revenue" value="$12,500" icon="money" />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatWidget title="Orders" value="156" icon="shopping-cart" />
          </Grid>
        </Suspense>
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Suspense fallback={<WidgetPlaceholder />}>
            <ChartWidget title="Weekly Sales" />
          </Suspense>
        </Grid>
        <Grid item xs={12} md={4}>
          <Panel title="Advanced Analytics">
            <Box textAlign="center" mb={2}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? 'Hide Advanced Analytics' : 'Show Advanced Analytics'}
              </Button>
            </Box>
            
            {showAdvanced && (
              <Suspense fallback={<WidgetPlaceholder />}>
                <AdvancedAnalytics title="Advanced Data" />
              </Suspense>
            )}
          </Panel>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LazyDashboard; 