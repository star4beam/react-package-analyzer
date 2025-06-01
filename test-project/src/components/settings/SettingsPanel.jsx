import React from 'react';
import { Box, SimpleGrid, Heading, VStack, Text } from '@chakra-ui/react';
import { Typography, Switch, FormControlLabel, Paper, Chip } from '@mui/material';
import IntermediateForm from '../ui/IntermediateForm';
import IntermediatePanel from '../ui/IntermediatePanel';
import BaseCard from '../ui/BaseCard';
import BaseButton from '../ui/BaseButton';
import DataDisplay from '../common/DataDisplay';
import ManagementHub from '../composite/ManagementHub';

// Another feature component that uses the same hubs
export const SettingsPanel = () => {
  const [settings, setSettings] = React.useState({
    notifications: true,
    darkMode: false,
    autoSave: true,
  });

  const profileFields = [
    { name: 'name', label: 'Display Name', placeholder: 'Enter your name' },
    { name: 'email', label: 'Email', placeholder: 'your@email.com' },
    { name: 'timezone', label: 'Timezone', placeholder: 'Select timezone' },
  ];

  const systemInfo = [
    { label: 'Version', value: '2.1.0' },
    { label: 'Last Updated', value: '2024-01-15' },
    { label: 'License', value: 'Pro' },
  ];

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <Box p={4}>
      <VStack align="stretch" spacing={4}>
        <Heading size="lg">Settings</Heading>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Configuration Panel</Typography>
          <Chip label="Mixed UI" color="primary" size="small" />
        </Paper>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <IntermediateForm
          title="Profile Settings"
          fields={profileFields}
          onSubmit={() => console.log('Save profile')}
          variant="chakra"
        />

        <BaseCard title="Preferences" variant="mui">
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications}
                  onChange={() => handleToggle('notifications')}
                />
              }
              label="Enable Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.darkMode}
                  onChange={() => handleToggle('darkMode')}
                />
              }
              label="Dark Mode"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoSave}
                  onChange={() => handleToggle('autoSave')}
                />
              }
              label="Auto Save"
            />
          </Box>
        </BaseCard>

        <DataDisplay
          title="System Information"
          data={systemInfo}
          variant="mui"
        />

        <IntermediatePanel
          title="Account Actions"
          content="Manage your account settings and preferences"
          actions={[
            { label: 'Export Data', onClick: () => console.log('Export') },
            { label: 'Delete Account', onClick: () => console.log('Delete') },
          ]}
          variant="chakra"
        />
      </SimpleGrid>

      <Box mt={6}>
        <ManagementHub
          title="User Management"
          formConfig={{
            title: 'User Preferences',
            fields: [
              { name: 'username', label: 'Username', placeholder: 'Enter username' },
              { name: 'language', label: 'Language', placeholder: 'Select language' },
            ],
            onSubmit: (data) => console.log('User prefs:', data)
          }}
          actions={[
            { label: 'Reset Password', onClick: () => console.log('Reset password') },
            { label: 'Export Settings', onClick: () => console.log('Export settings') },
          ]}
          variant="chakra"
        />
      </Box>

      <Box mt={6} display="flex" gap={2}>
        <BaseButton variant="chakra">
          Save All Changes
        </BaseButton>
        <BaseButton variant="mui">
          Reset to Defaults
        </BaseButton>
      </Box>
    </Box>
  );
};

export default SettingsPanel;