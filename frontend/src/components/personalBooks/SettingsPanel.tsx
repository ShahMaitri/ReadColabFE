import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Stack,
  FormControlLabel,
  Switch,
  TextField,
  Button,
  Alert,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import type { PersonalBookSettingsData } from '../../api/personalBook.api';

interface SettingsPanelProps {
  settings: PersonalBookSettingsData;
  onChange: (field: keyof PersonalBookSettingsData, value: any) => void;
  onSave: () => void;
  isLoading?: boolean;
  hasChanges?: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onChange,
  onSave,
  isLoading = false,
  hasChanges = false,
}) => {
  return (
    <Card>
      <CardHeader title="Personal Library Settings" />
      <Divider />
      <CardContent>
        <Stack spacing={3}>
          {/* Sharing Enabled */}
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.sharingEnabled}
                  onChange={(e) => onChange('sharingEnabled', e.target.checked)}
                  disabled={isLoading}
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle2">Enable Personal Library Sharing</Typography>
                  <Typography variant="caption" color="textSecondary">
                    Allow others to browse and request your books
                  </Typography>
                </Box>
              }
            />
          </Box>

          {settings.sharingEnabled && (
            <>
              {/* Auto Approve */}
              <Box sx={{ ml: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoApproveRequests}
                      onChange={(e) => onChange('autoApproveRequests', e.target.checked)}
                      disabled={isLoading}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">Auto-approve Requests</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Automatically approve borrow requests from your colleagues
                      </Typography>
                    </Box>
                  }
                />
              </Box>

              {/* Max Lending Loans */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Max Concurrent Loans
                </Typography>
                <TextField
                  type="number"
                  value={settings.maxActiveLendingLoans}
                  onChange={(e) =>
                    onChange('maxActiveLendingLoans', parseInt(e.target.value) || 0)
                  }
                  disabled={isLoading}
                  inputProps={{ min: 1, max: 50 }}
                  helperText="Maximum number of books you can lend at once"
                  fullWidth
                />
              </Box>

              {/* Default Borrow Duration */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Default Borrow Duration (days)
                </Typography>
                <TextField
                  type="number"
                  value={settings.defaultBorrowDuration}
                  onChange={(e) =>
                    onChange('defaultBorrowDuration', parseInt(e.target.value) || 14)
                  }
                  disabled={isLoading}
                  inputProps={{ min: 1, max: 90 }}
                  helperText="Default loan period for new borrow requests"
                  fullWidth
                />
              </Box>

              <Alert severity="info" sx={{ mt: 1 }}>
                These settings will apply to new borrow requests going forward.
              </Alert>
            </>
          )}

          {!settings.sharingEnabled && (
            <Alert severity="warning">
              Your personal library is currently hidden. Enable sharing to allow colleagues to
              request your books.
            </Alert>
          )}

          {/* Save Button */}
          <Box sx={{ pt: 2, display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              onClick={onSave}
              disabled={!hasChanges || isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
            {hasChanges && (
              <Typography variant="caption" color="warning.main" sx={{ alignSelf: 'center' }}>
                You have unsaved changes
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};
