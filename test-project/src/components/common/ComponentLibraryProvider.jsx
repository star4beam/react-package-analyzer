import React, { createContext, useContext, useState } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Create a context for component library selection
const ComponentLibraryContext = createContext({
  currentLibrary: 'mui', // default to MUI
  setCurrentLibrary: () => {},
});

// Create a custom hook to access the context
export const useComponentLibrary = () => useContext(ComponentLibraryContext);

// Create a default MUI theme
const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

// Provider component that wraps your app
export const ComponentLibraryProvider = ({ children }) => {
  const [currentLibrary, setCurrentLibrary] = useState('mui');

  return (
    <ComponentLibraryContext.Provider value={{ currentLibrary, setCurrentLibrary }}>
      <ThemeProvider theme={muiTheme}>
        <ChakraProvider>
          {children}
        </ChakraProvider>
      </ThemeProvider>
    </ComponentLibraryContext.Provider>
  );
};

export default ComponentLibraryProvider; 