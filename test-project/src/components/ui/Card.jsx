import React from 'react';
import * as Chakra from '@chakra-ui/react';
import Box from '@chakra-ui/react/dist/Box';
import { useColorModeValue } from '@chakra-ui/react';

export const Card = ({ children, padding = 4, showDivider = false, ...props }) => {
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
      {showDivider && (
        <Chakra.Divider mt={4} />
      )}
    </Box>
  );
};

export default Card; 