import { useState, useEffect, lazy, Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

// Fallback loading component
const DefaultLoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" p={2}>
    <CircularProgress size={24} />
  </Box>
);

/**
 * A hook that enables dynamic component loading at runtime
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.componentType - The component type to load
 * @param {string} options.variant - The variant of the component
 * @param {Object} options.props - Props to pass to the component
 * @param {React.ReactNode} options.fallback - Custom fallback UI (optional)
 * @returns {Object} - Object containing the dynamic component and loading state
 */
const useDynamicComponent = ({
  componentType = 'default',
  variant = 'basic',
  props = {},
  fallback = <DefaultLoadingFallback />
}) => {
  const [DynamicComponent, setDynamicComponent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Map of component paths based on type and variant
  const componentMap = {
    button: {
      primary: () => import('@common/buttons/PrimaryButton'),
      secondary: () => import('@common/buttons/SecondaryButton')
    },
    input: {
      text: () => import('@common/inputs/TextField'),
      select: () => import('@common/inputs/SelectField')
    },
    layout: {
      card: () => import('@layouts/containers/Card'),
      panel: () => import('@layouts/containers/Panel')
    },
    feedback: {
      alert: () => import('@ui/feedback/AlertMessage')
    },
    default: {
      basic: () => import('@common/buttons/PrimaryButton')
    }
  };

  useEffect(() => {
    setIsLoading(true);
    
    // Get component loader function or use default
    const componentLoader = 
      componentMap[componentType]?.[variant] || 
      componentMap.default.basic;
      
    // Create lazy component
    const LazyComponent = lazy(componentLoader);
    
    // Set the dynamic component
    setDynamicComponent(() => (props) => (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    ));
    
    setIsLoading(false);
  }, [componentType, variant]);

  return {
    Component: DynamicComponent,
    isLoading,
    error
  };
};

export default useDynamicComponent; 