import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

export const Card = ({ title, children, ...props }) => {
  return (
    <Box 
      p={4} 
      borderRadius="lg" 
      boxShadow="md" 
      bg="white" 
      borderWidth="1px" 
      {...props}
    >
      {title && (
        <Heading size="md" mb={2}>
          {title}
        </Heading>
      )}
      <Text>{children}</Text>
    </Box>
  );
};

export default Card; 