import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem
} from '@mui/material';
import Panel from '@layouts/containers/Panel';
import useDynamicComponent from '@hooks/custom/useDynamicComponent';

const DynamicComponentDemo = () => {
  const [componentType, setComponentType] = useState('button');
  const [variant, setVariant] = useState('primary');
  
  // Get the dynamic component
  const { Component, isLoading } = useDynamicComponent({
    componentType,
    variant
  });

  // Component type options
  const componentTypes = [
    { value: 'button', label: 'Button' },
    { value: 'input', label: 'Input' },
    { value: 'layout', label: 'Layout' },
    { value: 'feedback', label: 'Feedback' }
  ];

  // Variant options based on selected component type
  const variantOptions = {
    button: [
      { value: 'primary', label: 'Primary Button' },
      { value: 'secondary', label: 'Secondary Button' }
    ],
    input: [
      { value: 'text', label: 'Text Field' },
      { value: 'select', label: 'Select Field' }
    ],
    layout: [
      { value: 'card', label: 'Card' },
      { value: 'panel', label: 'Panel' }
    ],
    feedback: [
      { value: 'alert', label: 'Alert' }
    ]
  };

  // Handle component type change
  const handleTypeChange = (event) => {
    const newType = event.target.value;
    setComponentType(newType);
    
    // Reset variant to first option when type changes
    const firstVariant = variantOptions[newType][0].value;
    setVariant(firstVariant);
  };

  // Handle variant change
  const handleVariantChange = (event) => {
    setVariant(event.target.value);
  };

  // Get the correct props based on component type and variant
  const getDynamicProps = () => {
    switch (componentType) {
      case 'button':
        return { children: `${variant} Button` };
      case 'input':
        return variant === 'text' 
          ? { label: 'Dynamic Text Field' } 
          : { options: [{ value: 'option1', label: 'Option 1' }, { value: 'option2', label: 'Option 2' }] };
      case 'layout':
        return { 
          title: `${variant} Layout`,
          children: <Typography>Dynamic Layout Content</Typography>
        };
      case 'feedback':
        return { 
          status: 'info', 
          title: 'Dynamic Alert', 
          description: 'This alert was dynamically loaded.' 
        };
      default:
        return {};
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dynamic Component Loading
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Panel title="Component Controls">
            <Box p={2}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Component Type</InputLabel>
                <Select
                  value={componentType}
                  onChange={handleTypeChange}
                  label="Component Type"
                >
                  {componentTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Variant</InputLabel>
                <Select
                  value={variant}
                  onChange={handleVariantChange}
                  label="Variant"
                >
                  {variantOptions[componentType].map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Panel>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Panel title="Dynamic Component Preview">
            <Box 
              p={4} 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              minHeight={200} 
              border="1px dashed #ccc"
              borderRadius={1}
            >
              {Component && <Component {...getDynamicProps()} />}
            </Box>
          </Panel>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DynamicComponentDemo; 