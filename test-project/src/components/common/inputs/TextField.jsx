import React from 'react';
import { TextField as MuiTextField } from '@mui/material';

const TextField = (props) => {
  return <MuiTextField fullWidth variant="outlined" {...props} />;
};

export default TextField; 