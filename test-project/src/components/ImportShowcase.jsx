import React from 'react';

// Demonstrate all import patterns
import * as MUI from '@mui/material';
import * as Chakra from '@chakra-ui/react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import { Typography, Box } from '@mui/material';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

// Chakra UI imports with various patterns
import ChakraButton from '@chakra-ui/react/dist/Button';
import { Badge, Tag } from '@chakra-ui/react';
import useDisclosure from '@chakra-ui/react/dist/useDisclosure';

const ImportShowcase = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Import Patterns Showcase
      </Typography>
      
      {/* Default imports */}
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6">Default Imports</Typography>
          <Button variant="contained">MUI Button (default import)</Button>
          <TextField label="Default import field" sx={{ ml: 2 }} />
          <ChakraButton colorScheme="blue" ml={2}>
            Chakra Button (subpath default)
          </ChakraButton>
        </Box>

        {/* Namespace imports */}
        <MUI.Divider />
        <Box>
          <Typography variant="h6">Namespace Imports</Typography>
          <MUI.Button variant="outlined">MUI.Button</MUI.Button>
          <MUI.IconButton color="primary">
            <MUI.Icon>star</MUI.Icon>
          </MUI.IconButton>
          <MUI.Chip label="MUI.Chip" sx={{ ml: 2 }} />
          <Chakra.Box display="inline-block" ml={2}>
            <Chakra.Badge colorScheme="green">Chakra.Badge</Chakra.Badge>
          </Chakra.Box>
        </Box>

        {/* Mixed imports */}
        <MUI.Divider />
        <Box>
          <Typography variant="h6">Mixed Import Patterns</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Alert severity="info">Named import Alert</Alert>
            </Grid>
            <Grid item xs={6}>
              <Tooltip title="Default import Tooltip">
                <IconButton>
                  <MUI.Icon>info</MUI.Icon>
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Box>

        {/* Chakra UI namespace */}
        <MUI.Divider />
        <Chakra.VStack align="start" spacing={2}>
          <Chakra.Heading size="md">Chakra Namespace</Chakra.Heading>
          <Chakra.HStack>
            <Badge>Named import</Badge>
            <Tag>Named import</Tag>
            <Chakra.Tag colorScheme="red">Namespace</Chakra.Tag>
          </Chakra.HStack>
          
          <Chakra.Modal isOpen={isOpen} onClose={onClose}>
            <Chakra.ModalOverlay />
            <Chakra.ModalContent>
              <Chakra.ModalHeader>Modal Example</Chakra.ModalHeader>
              <Chakra.ModalBody>
                Demonstrating namespace modal components
              </Chakra.ModalBody>
            </Chakra.ModalContent>
          </Chakra.Modal>
          
          <Chakra.Button onClick={onOpen}>Open Modal</Chakra.Button>
        </Chakra.VStack>
      </Stack>
    </Paper>
  );
};

export default ImportShowcase;