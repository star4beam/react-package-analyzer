import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import App from './App';
import { AuthProvider } from './hooks/useAuth';
import { ComponentLibraryProvider } from './components/common/ComponentLibraryProvider';

// MUI theme
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

// Chakra theme
const chakraTheme = extendTheme({
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ChakraProvider theme={chakraTheme}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <AuthProvider>
          <ComponentLibraryProvider>
            <App />
          </ComponentLibraryProvider>
        </AuthProvider>
      </ThemeProvider>
    </ChakraProvider>
  </React.StrictMode>
); 