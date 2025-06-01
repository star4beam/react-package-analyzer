import React from 'react';
import { Box, VStack, Heading } from '@chakra-ui/react';
import { Paper, Typography, Chip } from '@mui/material';
import IntermediatePanel from './IntermediatePanel';
import DataDisplay from '../common/DataDisplay';

// This component uses IntermediatePanel, making IntermediatePanel an intermediate hub
export const AdvancedPanel = ({ title, subtitle, data = [], panelActions = [] }) => {
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <VStack spacing={4} align="stretch">
        <Box>
          <Heading size="md">{title}</Heading>
          {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
        </Box>
        
        {data.length > 0 && (
          <DataDisplay
            title="Panel Data"
            data={data}
            variant="chakra"
          />
        )}
        
        <IntermediatePanel
          title="Actions"
          content="Available operations"
          actions={panelActions}
          variant="mui"
        />
        
        <Box display="flex" gap={1}>
          <Chip label="Advanced" color="primary" size="small" />
          <Chip label="Multi-Component" color="secondary" size="small" />
        </Box>
      </VStack>
    </Paper>
  );
};

export default AdvancedPanel;