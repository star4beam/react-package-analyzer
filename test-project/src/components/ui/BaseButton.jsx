import React from 'react';
import { Button as ChakraButton } from '@chakra-ui/react';
import { Button as MUIButton } from '@mui/material';

// Base Hub: Uses tracked packages but no other hubs
export const BaseButton = ({ variant = 'chakra', children, ...props }) => {
  if (variant === 'mui') {
    return (
      <MUIButton variant="contained" {...props}>
        {children}
      </MUIButton>
    );
  }

  return (
    <ChakraButton colorScheme="blue" {...props}>
      {children}
    </ChakraButton>
  );
};

export default BaseButton;