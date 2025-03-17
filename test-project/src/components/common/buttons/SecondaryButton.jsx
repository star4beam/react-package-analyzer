import React from 'react';
import { Button } from '@chakra-ui/react';

const SecondaryButton = ({ children, ...props }) => {
  return (
    <Button colorScheme="teal" variant="outline" {...props}>
      {children}
    </Button>
  );
};

export default SecondaryButton; 