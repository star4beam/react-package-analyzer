import React from 'react';
import { Button as MuiButton } from '@mui/material';
import { Button as ChakraButton } from '@chakra-ui/react'; 
import { useComponentLibrary } from '../common/ComponentLibraryProvider';

const AdaptiveButton = (props) => {
  const { currentLibrary } = useComponentLibrary();
  
  if (currentLibrary === 'chakra') {
    return (
      <ChakraButton 
        colorScheme={props.color === 'primary' ? 'blue' : 
                    props.color === 'secondary' ? 'pink' : 
                    props.color === 'error' ? 'red' : 'gray'}
        variant={props.variant === 'contained' ? 'solid' : 
               props.variant === 'outlined' ? 'outline' : 'ghost'}
        size={props.size === 'small' ? 'sm' : 
             props.size === 'large' ? 'lg' : 'md'}
        {...props}
      >
        {props.children}
      </ChakraButton>
    );
  }
  
  // Default to MUI
  return (
    <MuiButton 
      variant={props.variant}
      color={props.color}
      size={props.size}
      {...props}
    >
      {props.children}
    </MuiButton>
  );
};

export default AdaptiveButton; 