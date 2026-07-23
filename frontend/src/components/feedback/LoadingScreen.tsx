import { Box, Typography } from '@mui/material';
import { AnimatedBookLogo } from '../branding/AnimatedBookLogo';

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
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <AnimatedBookLogo badgeSize={52} bookWidth={44} bookHeight={34} durationSeconds={2.35} />
        </Box>
        <Typography variant='body2' sx={{ mt: 2, color: 'text.secondary' }}>
          Loading Smart Office Library...
        </Typography>
      </Box>
    </Box>
  );
};
