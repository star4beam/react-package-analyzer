import React from 'react';
import { Paper, Typography } from '@mui/material';
import { VStack, Heading } from '@chakra-ui/react';
import IntermediateForm from '../ui/IntermediateForm';
import BaseButton from '../ui/BaseButton';

// This is a Main hub that uses IntermediateForm and BaseButton
// Making IntermediateForm an intermediate hub (since it uses base hubs AND gets used by this hub)
export const ManagementHub = ({ 
  title = 'Management Hub',
  formConfig = {},
  actions = [],
  variant = 'mui'
}) => {
  const defaultFormConfig = {
    title: 'Settings',
    fields: [
      { name: 'name', label: 'Name', placeholder: 'Enter name' },
      { name: 'email', label: 'Email', placeholder: 'Enter email' },
    ],
    onSubmit: (data) => console.log('Management form submitted:', data),
    ...formConfig
  };

  if (variant === 'chakra') {
    return (
      <VStack spacing={6} align="stretch" p={4}>
        <Heading size="lg">{title}</Heading>
        
        <IntermediateForm
          {...defaultFormConfig}
          variant="chakra"
        />
        
        <VStack spacing={3}>
          {actions.map((action, index) => (
            <BaseButton
              key={index}
              variant="chakra"
              onClick={action.onClick}
            >
              {action.label}
            </BaseButton>
          ))}
        </VStack>
      </VStack>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>{title}</Typography>
      
      <IntermediateForm
        {...defaultFormConfig}
        variant="mui"
      />
      
      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {actions.map((action, index) => (
          <BaseButton
            key={index}
            variant="mui"
            onClick={action.onClick}
          >
            {action.label}
          </BaseButton>
        ))}
      </div>
    </Paper>
  );
};

export default ManagementHub;