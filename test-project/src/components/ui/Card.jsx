import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';

export const Card = ({ children, padding = 4, ...props }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      boxShadow="sm"
      p={padding}
      {...props}
    >
      {children}
    </Box>
  );
};

export default Card; 