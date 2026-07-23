import { Box, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { AnimatedBookLogo } from '../branding/AnimatedBookLogo';
import { BrandHighlightText } from '../branding/BrandHighlightText';

export const SplashScreen = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: (theme) => theme.palette.mode === 'dark'
          ? 'radial-gradient(1200px 600px at 10% 10%, rgba(192,104,255,0.18), transparent 45%), radial-gradient(1000px 500px at 90% 90%, rgba(120,162,255,0.16), transparent 45%), #0b0b10'
          : 'radial-gradient(1200px 600px at 10% 10%, rgba(161,0,255,0.18), transparent 45%), radial-gradient(1000px 500px at 90% 90%, rgba(63,103,234,0.12), transparent 45%), #f6f6f9'
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: 'min(92vw, 460px)',
          mx: 'auto',
          borderRadius: 5,
          p: 4,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          backgroundColor: 'background.paper',
          animation: 'splashFade 550ms ease-out'
        }}
      >
        <Stack spacing={2.5} sx={{ alignItems: 'center' }}>
          <Box sx={{ animation: 'splashScale 650ms ease-out', transformOrigin: 'center center' }}>
            <AnimatedBookLogo badgeSize={52} bookWidth={44} bookHeight={34} durationSeconds={2.35} />
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant='h5'>
              <BrandHighlightText animate>Read Colab</BrandHighlightText>
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Enterprise reading workspace - Smart Office Library
            </Typography>
          </Box>

          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};
