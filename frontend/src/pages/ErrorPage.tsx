import HomeIcon from '@mui/icons-material/Home';
import RefreshIcon from '@mui/icons-material/Refresh';
import { alpha, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';

export const ErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'An unexpected error occurred.';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 2,
        background: (theme) =>
          `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.error.light, 0.18)} 0%, ${alpha(theme.palette.background.default, 1)} 60%)`
      }}
    >
      <Card elevation={0} sx={{ maxWidth: 540, width: '100%', borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={2.5} alignItems='center' textAlign='center'>
            <Typography variant='overline' sx={{ color: 'error.main', fontWeight: 700, letterSpacing: 1.2 }}>
              System Message
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 800 }}>
              Something went wrong
            </Typography>
            <Typography color='text.secondary'>{message}</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ pt: 0.5, width: '100%' }}>
              <Button fullWidth variant='outlined' startIcon={<RefreshIcon />} onClick={() => window.location.reload()}>
                Reload Page
              </Button>
              <Button fullWidth variant='contained' startIcon={<HomeIcon />} onClick={() => navigate('/')}>
                Back to Dashboard
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
