import React from 'react';
import { Grid, Box } from '@chakra-ui/react';
import { Typography } from '@mui/material';
import ActionCard from '../common/ActionCard';
import InfoPanel from '../common/InfoPanel';

const StatsSummary = ({ stats, onViewDetails }) => {
  return (
    <Box p={4}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Dashboard Statistics
      </Typography>
      
      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
        <ActionCard 
          title="User Activity"
          description={`Active users: ${stats?.activeUsers || 0}`}
          actionText="View Details"
          onAction={() => onViewDetails('users')}
        />
        
        <InfoPanel 
          title="System Status"
          info={`Status: ${stats?.systemStatus || 'Unknown'}`}
          actionText="Check Status"
          onAction={() => onViewDetails('system')}
        />
        
        <ActionCard 
          title="Recent Transactions"
          description={`Total: ${stats?.transactions || 0}`}
          actionText="View All"
          onAction={() => onViewDetails('transactions')}
        />
        
        <InfoPanel 
          title="Performance"
          info={`Score: ${stats?.performanceScore || 'N/A'}`}
          actionText="Analyze"
          onAction={() => onViewDetails('performance')}
        />
      </Grid>
    </Box>
  );
};

export default StatsSummary; 