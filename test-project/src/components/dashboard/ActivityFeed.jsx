import React from 'react';
import { Avatar, Badge, List, ListItem, Typography } from '@mui/material';
import { Box, Stack, Text, VStack } from '@chakra-ui/react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const activities = [
  {
    id: 1,
    user: {
      name: 'John Doe',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    action: 'created a new project',
    subject: 'Website Redesign',
    time: '2 hours ago',
    type: 'project',
  },
  {
    id: 2,
    user: {
      name: 'Jane Smith',
      avatar: 'https://i.pravatar.cc/150?img=2',
    },
    action: 'commented on task',
    subject: 'Fix login page',
    time: '4 hours ago',
    type: 'comment',
  },
  {
    id: 3,
    user: {
      name: 'Mike Johnson',
      avatar: 'https://i.pravatar.cc/150?img=3',
    },
    action: 'completed task',
    subject: 'Update user dashboard',
    time: 'Yesterday',
    type: 'task',
  },
  {
    id: 4,
    user: {
      name: 'Sarah Williams',
      avatar: 'https://i.pravatar.cc/150?img=4',
    },
    action: 'uploaded file',
    subject: 'Design assets.zip',
    time: '2 days ago',
    type: 'file',
  },
];

const ActivityItem = ({ activity }) => {
  return (
    <ListItem sx={{ py: 1.5, px: 0 }}>
      <Stack direction="row" spacing={2} width="100%">
        <Avatar src={activity.user.avatar} alt={activity.user.name} />
        <Box flex={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Text fontWeight="semibold">{activity.user.name}</Text>
            <Text color="gray.600" fontSize="sm">
              {activity.action}
            </Text>
          </Stack>
          <Text fontWeight="medium" mb={0.5}>
            {activity.subject}
          </Text>
          <Text color="gray.500" fontSize="xs">
            {activity.time}
          </Text>
        </Box>
      </Stack>
    </ListItem>
  );
};

export const ActivityFeed = () => {
  return (
    <Card height="100%">
      <Box mb={3}>
        <Typography variant="h6">Recent Activity</Typography>
      </Box>
      
      <List disablePadding>
        <VStack spacing={2} align="stretch" divider={<Box borderBottom="1px" borderColor="gray.100" />}>
          {activities.map(activity => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </VStack>
      </List>
      
      <Box mt={2} textAlign="center">
        <Button variant="text" color="primary" size="small">
          View all activity
        </Button>
      </Box>
    </Card>
  );
};

export default ActivityFeed; 