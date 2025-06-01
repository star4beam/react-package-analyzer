import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, CircularProgress, Box } from '@mui/material';

// Import the main layout hub
import MainLayout from '@components/layouts/MainLayout';

// Home is kept as a regular import since it's the landing page
import Home from '@pages/Home';

// Import MainDashboard to ensure it's included in the analysis
import MainDashboard from '@components/dashboard/MainDashboard';

// Import feature components
import AnalyticsDashboard from '@components/analytics/AnalyticsDashboard';
import SettingsPanel from '@components/settings/SettingsPanel';

// Import composite components
import DashboardHub from '@components/composite/DashboardHub';
import AdminPanel from '@components/composite/AdminPanel';

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
      <MainLayout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/main-dashboard" element={<MainDashboard />} />
            <Route path="/lazy-dashboard" element={<LazyDashboard />} />
            <Route path="/enhanced-dashboard" element={<EnhancedDashboard />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/settings" element={<SettingsPanel />} />
            <Route path="/dashboard-hub" element={<DashboardHub />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/dynamic-components" element={<DynamicComponentDemo />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </Suspense>
      </MainLayout>
    </Router>
  );
}

export default App; 