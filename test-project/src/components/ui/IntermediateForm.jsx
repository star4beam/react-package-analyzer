import React from 'react';
import { VStack, FormControl, FormLabel } from '@chakra-ui/react';
import { TextField as MUITextField } from '@mui/material';
import BaseButton from './BaseButton';
import IntermediatePanel from './IntermediatePanel';

// Another Intermediate Hub: Uses both base hubs and another intermediate hub
export const IntermediateForm = ({ 
  title,
  fields = [],
  onSubmit,
  variant = 'chakra',
  ...props 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.();
  };

  const formContent = (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        {fields.map((field, index) => (
          <FormControl key={index}>
            <FormLabel>{field.label}</FormLabel>
            {variant === 'mui' ? (
              <MUITextField
                fullWidth
                placeholder={field.placeholder}
                name={field.name}
              />
            ) : (
              <input 
                style={{ padding: '8px', width: '100%' }}
                placeholder={field.placeholder}
                name={field.name}
              />
            )}
          </FormControl>
        ))}
        
        <BaseButton type="submit" variant={variant}>
          Submit
        </BaseButton>
      </VStack>
    </form>
  );

  return (
    <IntermediatePanel
      title={title}
      content={formContent}
      variant={variant}
      {...props}
    />
  );
};

export default IntermediateForm;