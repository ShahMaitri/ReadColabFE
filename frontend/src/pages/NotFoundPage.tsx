import SearchOffIcon from '@mui/icons-material/SearchOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import { alpha, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 2,
        background: (theme) =>
          `radial-gradient(circle at 80% 10%, ${alpha(theme.palette.info.light, 0.2)} 0%, ${alpha(theme.palette.background.default, 1)} 62%)`
      }}
    >
      <Card elevation={0} sx={{ maxWidth: 560, width: '100%', borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={2.5} alignItems='center' textAlign='center'>
            <SearchOffIcon sx={{ fontSize: 64, color: 'info.main' }} />
            <Typography variant='h4' sx={{ fontWeight: 800 }}>
              404 - Page Not Found
            </Typography>
            <Typography color='text.secondary'>
              The page you are trying to access does not exist or may have been moved.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ pt: 0.5, width: '100%' }}>
              <Button fullWidth variant='outlined' startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
                Go Back
              </Button>
              <Button fullWidth variant='contained' startIcon={<HomeIcon />} onClick={() => navigate('/')}>
                Go Home
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
