import React from 'react';
import { Stack, Box } from '@chakra-ui/react';
import { Divider } from '@mui/material';
import BaseCard from './BaseCard';
import BaseButton from './BaseButton';

// Intermediate Hub: Uses base hubs and will be used by other components
export const IntermediatePanel = ({ 
  title, 
  content, 
  actions = [], 
  variant = 'chakra',
  ...props 
}) => {
  return (
    <BaseCard variant={variant} title={title} {...props}>
      <Stack spacing={3}>
        {content && <Box>{content}</Box>}
        
        {actions.length > 0 && (
          <>
            <Divider />
            <Stack direction="row" spacing={2}>
              {actions.map((action, index) => (
                <BaseButton
                  key={index}
                  variant={variant}
                  onClick={action.onClick}
                >
                  {action.label}
                </BaseButton>
              ))}
            </Stack>
          </>
        )}
      </Stack>
    </BaseCard>
  );
};

export default IntermediatePanel;