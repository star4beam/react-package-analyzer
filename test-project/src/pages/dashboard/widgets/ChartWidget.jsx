import React from 'react';
import Panel from '@layouts/containers/Panel';
import { Box } from '@mui/material';

const ChartWidget = ({ title, ...props }) => {
  return (
    <Panel title={title} {...props}>
      <Box
        sx={{
          height: 300,
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Chart Placeholder
      </Box>
    </Panel>
  );
};

export default ChartWidget; 