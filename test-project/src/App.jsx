import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, CircularProgress, Box } from '@mui/material';

// Home is kept as a regular import since it's the landing page
import Home from '@pages/Home';

// Lazy load other pages to reduce initial bundle size
const DashboardPage = lazy(() => import('@pages/dashboard/DashboardPage'));
const LazyDashboard = lazy(() => import('@pages/dashboard/LazyDashboard'));
const EnhancedDashboard = lazy(() => import('@pages/dashboard/EnhancedDashboard'));
const ProfilePage = lazy(() => import('@pages/profile/ProfilePage'));
const Login = lazy(() => import('@pages/auth/Login'));
const Signup = lazy(() => import('@pages/auth/Signup'));
const DynamicComponentDemo = lazy(() => import('@pages/DynamicComponentDemo'));

// Loading fallback component
const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <Router>
      <CssBaseline />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/lazy-dashboard" element={<LazyDashboard />} />
          <Route path="/enhanced-dashboard" element={<EnhancedDashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dynamic-components" element={<DynamicComponentDemo />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App; 