import { Box, CircularProgress, Typography } from '@mui/material';

export const LoadingScreen = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'background.default'
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress color='primary' />
        <Typography variant='body2' sx={{ mt: 2, color: 'text.secondary' }}>
          Loading Smart Office Library...
        </Typography>
      </Box>
    </Box>
  );
};
