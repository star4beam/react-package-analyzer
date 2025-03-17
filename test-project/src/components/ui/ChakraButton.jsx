import React from 'react';
import { Button as ChakraButton } from '@chakra-ui/react';

export const Button = ({ children, variant = 'solid', colorScheme = 'blue', ...props }) => {
  return (
    <ChakraButton 
      variant={variant} 
      colorScheme={colorScheme} 
      fontWeight="semibold"
      borderRadius="md"
      shadow="sm"
      _hover={{ shadow: 'md' }}
      {...props}
    >
      {children}
    </ChakraButton>
  );
};

export default Button; 