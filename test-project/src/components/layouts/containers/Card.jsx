import React from 'react';
import { Card as ChakraCard, CardBody, CardHeader, Heading } from '@chakra-ui/react';

const Card = ({ title, children, ...props }) => {
  return (
    <ChakraCard {...props}>
      {title && (
        <CardHeader>
          <Heading size="md">{title}</Heading>
        </CardHeader>
      )}
      <CardBody>{children}</CardBody>
    </ChakraCard>
  );
};

export default Card; 