import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const Panel = ({ title, children, ...props }) => {
  return (
    <Paper elevation={2} sx={{ p: 3 }} {...props}>
      {title && (
        <Typography variant="h6" component="h2" gutterBottom>
          {title}
        </Typography>
      )}
      <Box>{children}</Box>
    </Paper>
  );
};

export default Panel; 