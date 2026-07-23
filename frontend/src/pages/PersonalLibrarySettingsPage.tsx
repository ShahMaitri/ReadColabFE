import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Card,
  alpha,
} from '@mui/material';
import { useGetSettings, useUpdateSettings } from '../hooks/usePersonalBooks';
import { SettingsPanel } from '../components/personalBooks';
import type { PersonalBookSettingsData } from '../api/personalBook.api';

export const PersonalLibrarySettingsPage: React.FC = () => {
  const [localSettings, setLocalSettings] = useState<PersonalBookSettingsData | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const theme = useTheme();
  const { data: settings, isLoading } = useGetSettings();
  const { mutate: updateSettings, isPending: isUpdating } = useUpdateSettings();

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleChange = (field: keyof PersonalBookSettingsData, value: any) => {
    if (localSettings) {
      const updated = { ...localSettings, [field]: value };
      setLocalSettings(updated);
      setHasChanges(true);
    }
  };

  const handleSave = () => {
    if (localSettings) {
      updateSettings(localSettings, {
        onSuccess: () => {
          setHasChanges(false);
          alert('Settings saved successfully!');
        },
        onError: (error: any) => {
          alert(error.response?.data?.message || 'Failed to save settings');
        },
      });
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Header */}
      <Card elevation={0} sx={{ p: { xs: 2.5, md: 3 }, mb: 3, borderRadius: '12px', border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`, background: theme.palette.mode === 'dark' ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.3)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)` : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.28)} 0%, ${alpha('#ffffff', 0.96)} 100%)` }}>
        <Box>
          <Typography variant='h4' sx={{ fontWeight: 800, letterSpacing: 0.2 }}>
            Personal Library Settings
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 0.75 }}>
            Configure how your personal library is shared and managed
          </Typography>
        </Box>
      </Card>

      {/* Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        These settings control how your personal library is shared with colleagues and how borrow
        requests are handled.
      </Alert>

      {/* Loading */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : localSettings ? (
        <Stack spacing={3}>
          {/* Main Settings Panel */}
          <SettingsPanel
            settings={localSettings}
            onChange={handleChange}
            onSave={handleSave}
            isLoading={isUpdating}
            hasChanges={hasChanges}
          />

          {/* Additional Info */}
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              How these settings work
            </Typography>
            <Stack component="ul" spacing={0.5} sx={{ mt: 1, pl: 2, mb: 0 }}>
              <Typography component="li" variant="body2">
                <strong>Sharing Enabled:</strong> Controls whether your books are visible to
                colleagues
              </Typography>
              <Typography component="li" variant="body2">
                <strong>Auto-approve Requests:</strong> Automatically approve borrow requests
                instead of manually reviewing them
              </Typography>
              <Typography component="li" variant="body2">
                <strong>Max Concurrent Loans:</strong> Limits how many books you can lend at the
                same time
              </Typography>
              <Typography component="li" variant="body2">
                <strong>Default Borrow Duration:</strong> Sets the initial loan period for new
                requests (borrowers can't extend beyond this)
              </Typography>
            </Stack>
          </Box>
        </Stack>
      ) : (
        <Alert severity="error">Failed to load settings. Please try again.</Alert>
      )}
    </Container>
  );
};
