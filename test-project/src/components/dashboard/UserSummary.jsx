import React from 'react';
import { Stack } from '@chakra-ui/react';
import { Paper, Avatar, Typography } from '@mui/material';
import ActionCard from '../common/ActionCard';
import InfoPanel from '../common/InfoPanel';

const UserSummary = ({ user, onViewProfile, onEditProfile }) => {
  return (
    <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
      <Stack direction="row" spacing={3} alignItems="center" mb={4}>
        <Avatar 
          src={user?.avatar} 
          alt={user?.name || 'User'}
          sx={{ width: 64, height: 64 }}
        />
        <Typography variant="h6">{user?.name || 'Anonymous User'}</Typography>
      </Stack>
      
      <Stack spacing={3}>
        <ActionCard
          title="User Profile"
          description={`Email: ${user?.email || 'Not provided'}`}
          actionText="View Profile"
          onAction={onViewProfile}
        />
        
        <InfoPanel 
          title="Account Status"
          info={`Status: ${user?.status || 'Unknown'}`}
          actionText="Edit Profile"
          onAction={onEditProfile}
        />
      </Stack>
    </Paper>
  );
};

export default UserSummary; 