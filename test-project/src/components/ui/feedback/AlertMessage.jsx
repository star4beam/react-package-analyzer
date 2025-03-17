import React from 'react';
import { Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';

const AlertMessage = ({ status, title, description, ...props }) => {
  return (
    <Alert status={status} {...props}>
      <AlertIcon />
      {title && <AlertTitle>{title}</AlertTitle>}
      {description && <AlertDescription>{description}</AlertDescription>}
    </Alert>
  );
};

export default AlertMessage; 