import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { Divider } from '@mui/material';
import Card from '../ui/Card';
import Button from '../ui/Button';

const ActionCard = ({ title, description, actionText, onAction }) => {
  return (
    <Card title={title}>
      <Box p={2}>{description}</Box>
      <Divider sx={{ my: 2 }} />
      <Flex justifyContent="flex-end">
        <Button onClick={onAction}>
          {actionText || 'Action'}
        </Button>
      </Flex>
    </Card>
  );
};

export default ActionCard; 