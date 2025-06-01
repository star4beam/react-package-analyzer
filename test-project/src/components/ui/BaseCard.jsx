import React from 'react';
import { Card as ChakraCard, CardBody, CardHeader, Heading } from '@chakra-ui/react';
import { Paper, Box as MUIBox } from '@mui/material';

// Base Hub: Uses tracked packages but no other hubs
export const BaseCard = ({ variant = 'chakra', title, children, ...props }) => {
  if (variant === 'mui') {
    return (
      <Paper elevation={3} sx={{ p: 2 }} {...props}>
        {title && (
          <MUIBox sx={{ mb: 2 }}>
            <h3>{title}</h3>
          </MUIBox>
        )}
        {children}
      </Paper>
    );
  }

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

export default BaseCard;