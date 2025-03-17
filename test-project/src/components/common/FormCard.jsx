import React from 'react';
import { Stack } from '@chakra-ui/react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import TextField from '../ui/TextField';

export const FormCard = ({ 
  title, 
  onSubmit, 
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onCancel,
  children,
  ...props 
}) => {
  return (
    <Card {...props}>
      <form onSubmit={onSubmit}>
        <Stack spacing={4}>
          {children}
          
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            {onCancel && (
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={onCancel}
              >
                {cancelLabel}
              </Button>
            )}
            <Button type="submit">
              {submitLabel}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Card>
  );
};

export default FormCard; 