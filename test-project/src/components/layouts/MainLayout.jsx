import React from 'react';
import { Box, Flex, Container, Heading, Text } from '@chakra-ui/react';
import { AppBar, Toolbar, Typography, Paper } from '@mui/material';
import IntermediatePanel from '../ui/IntermediatePanel';
import BaseButton from '../ui/BaseButton';

// Another Main Hub: Uses hubs but is not used by other components
export const MainLayout = ({ children }) => {
  const navActions = [
    { label: 'Home', onClick: () => console.log('Home') },
    { label: 'About', onClick: () => console.log('About') },
    { label: 'Contact', onClick: () => console.log('Contact') },
  ];

  return (
    <Box minH="100vh">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My Application
          </Typography>
          <Flex gap={2}>
            {navActions.map((action, index) => (
              <BaseButton
                key={index}
                variant="mui"
                onClick={action.onClick}
                size="small"
              >
                {action.label}
              </BaseButton>
            ))}
          </Flex>
        </Toolbar>
      </AppBar>

      <Container maxW="container.xl" py={4}>
        <IntermediatePanel
          title="Welcome"
          content="This is the main layout of the application"
          actions={[
            { label: 'Get Started', onClick: () => console.log('Start') },
            { label: 'Learn More', onClick: () => console.log('Learn') },
          ]}
          variant="chakra"
        />
        
        <Box mt={6}>
          {children}
        </Box>
      </Container>
    </Box>
  );
};

export default MainLayout;