import React from 'react';
import { Button } from '@mui/material';

const PrimaryButton = ({ children, ...props }) => {
  return (
    <Button variant="contained" color="primary" {...props}>
      {children}
    </Button>
  );
};

export default PrimaryButton; 