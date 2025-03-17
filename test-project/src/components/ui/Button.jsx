import React from 'react';
import { Button as MuiButton } from '@mui/material';
import { styled } from '@mui/material/styles';

// Custom styled button extending MUI's Button
const StyledButton = styled(MuiButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: theme.shadows[1],
  '&:hover': {
    boxShadow: theme.shadows[2],
  },
}));

export const Button = ({ children, variant = 'contained', color = 'primary', ...props }) => {
  return (
    <StyledButton variant={variant} color={color} {...props}>
      {children}
    </StyledButton>
  );
};

export default Button; 