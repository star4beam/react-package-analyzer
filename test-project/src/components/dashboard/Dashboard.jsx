import React from 'react';
import * as MUI from '@mui/material';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import * as Chakra from '@chakra-ui/react';
import { Box, Flex, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import StatCard from './StatCard';
import ActivityFeed from './ActivityFeed';
import useAuth from '../../hooks/useAuth';

export const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Heading as="h1" size="xl">
            Dashboard
          </Heading>
          <Text color="gray.600">
            Welcome back, {user?.name || 'User'}
          </Text>
        </Box>
        <Button variant="contained" color="primary">
          New Project
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
        <StatCard 
          title="Total Users" 
          value="1,293"
          trend="+12%"
          trendDirection="up"
          icon="users"
        />
        <StatCard 
          title="Revenue" 
          value="$34,543"
          trend="+18%"
          trendDirection="up"
          icon="dollar"
        />
        <StatCard 
          title="Bounce Rate" 
          value="38.2%"
          trend="-4%"
          trendDirection="down"
          icon="chart"
        />
        <StatCard 
          title="Sessions" 
          value="6,381"
          trend="+6%"
          trendDirection="up"
          icon="sessions"
        />
      </SimpleGrid>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Performance Overview
            </Typography>
            <MUI.Box height="300px" display="flex" justifyContent="center" alignItems="center">
              {/* This would be a chart in a real application */}
              <MUI.Typography color="textSecondary">
                Chart placeholder - Performance data visualization
              </MUI.Typography>
            </MUI.Box>
            <MUI.Divider sx={{ my: 2 }} />
            <Chakra.HStack spacing={4}>
              <Chakra.Badge colorScheme="green">Active</Chakra.Badge>
              <Chakra.Badge colorScheme="blue">Updated</Chakra.Badge>
            </Chakra.HStack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <ActivityFeed />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 