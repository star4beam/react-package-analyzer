import React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import * as MUI from '@mui/material';

// Custom styled button extending MUI's Button
const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: theme.shadows[1],
  '&:hover': {
    boxShadow: theme.shadows[2],
  },
}));

export const ButtonComponent = ({ children, variant = 'contained', color = 'primary', startIcon, ...props }) => {
  // Demonstrate namespace usage
  const icon = startIcon && <MUI.Icon>{startIcon}</MUI.Icon>;
  
  return (
    <StyledButton variant={variant} color={color} startIcon={icon} {...props}>
      {children}
    </StyledButton>
  );
};

export default ButtonComponent; 