import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import Card from '../ui/Card';

// Icons (simplified for the example)
const IconWrapper = styled(Box)(({ theme, color = 'primary.main' }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  backgroundColor: `rgba(${theme.palette[color.split('.')[0]].main}, 0.1)`,
  color: theme.palette[color.split('.')[0]].main,
}));

const getIcon = (iconName) => {
  // This would be replaced with actual icons in a real application
  return iconName.charAt(0).toUpperCase();
};

export const StatCard = ({ 
  title, 
  value, 
  trend, 
  trendDirection = 'up',
  icon,
  ...props 
}) => {
  const trendColor = trendDirection === 'up' ? 'green.500' : 'red.500';
  
  return (
    <Card p={4} {...props}>
      <Flex justifyContent="space-between" alignItems="center">
        <Box>
          <Text color="gray.500" fontSize="sm" mb={1}>
            {title}
          </Text>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
          <Text color={trendColor} fontSize="sm" fontWeight="medium">
            {trend} {trendDirection === 'up' ? '↑' : '↓'}
          </Text>
        </Box>
        
        <IconWrapper>
          {getIcon(icon)}
        </IconWrapper>
      </Flex>
    </Card>
  );
};

export default StatCard; 