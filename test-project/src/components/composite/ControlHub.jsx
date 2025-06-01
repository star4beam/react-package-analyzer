import React from 'react';
import { Box } from '@mui/material';
import { Stack } from '@chakra-ui/react';
import IntermediatePanel from '../ui/IntermediatePanel';
import IntermediateForm from '../ui/IntermediateForm';
import BaseCard from '../ui/BaseCard';
import BaseButton from '../ui/BaseButton';

// This component only uses other hubs, making it a hub itself
// It doesn't import from tracked packages directly
export const ControlHub = ({ 
  title = 'Control Hub', 
  actions = [],
  formFields = [],
  onFormSubmit
}) => {
  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={4}>
        <BaseCard title="Control Center" variant="mui">
          <IntermediatePanel
            title={`${title} - Controls`}
            content="Main control interface"
            actions={actions}
            variant="mui"
          />
        </BaseCard>
        
        {formFields.length > 0 && (
          <BaseCard title="Configuration" variant="chakra">
            <IntermediateForm
              title={`${title} - Configuration`}
              fields={formFields}
              onSubmit={onFormSubmit}
              variant="chakra"
            />
          </BaseCard>
        )}
        
        <Box display="flex" gap={2}>
          <BaseButton variant="mui">Save All</BaseButton>
          <BaseButton variant="chakra">Reset</BaseButton>
        </Box>
      </Stack>
    </Box>
  );
};

export default ControlHub;