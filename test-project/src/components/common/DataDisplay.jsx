import React from 'react';
import { Stack, Box, Text } from '@chakra-ui/react';
import { Typography, Divider } from '@mui/material';
import BaseCard from '../ui/BaseCard';
import BaseButton from '../ui/BaseButton';

// Component that uses base hubs, making it a potential intermediate hub
export const DataDisplay = ({ 
  data = [], 
  title = 'Data Display',
  variant = 'chakra',
  onItemClick
}) => {
  return (
    <BaseCard title={title} variant={variant}>
      <Stack spacing={3}>
        {data.map((item, index) => (
          <Box key={index} p={2} borderWidth="1px" borderRadius="md">
            <Typography variant="body1" component="div">
              {item.label}: {item.value}
            </Typography>
            {onItemClick && (
              <BaseButton
                variant={variant}
                size="small"
                onClick={() => onItemClick(item)}
                mt={2}
              >
                View Details
              </BaseButton>
            )}
          </Box>
        ))}
      </Stack>
    </BaseCard>
  );
};

export default DataDisplay;