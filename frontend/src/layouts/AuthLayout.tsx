import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

export const AuthLayout = () => (
  <Box
    sx={{
      '@keyframes loginBgDrift': {
        '0%': { backgroundPosition: '0% 0%, 100% 100%, 0 0' },
        '100%': { backgroundPosition: '8% 5%, 92% 95%, 0 0' }
      },
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      p: 2,
      background: (theme) =>
        theme.palette.mode === 'dark'
          ? 'radial-gradient(900px 420px at 15% 15%, rgba(192,104,255,0.16), transparent 50%), radial-gradient(800px 380px at 80% 80%, rgba(120,162,255,0.16), transparent 48%), #0b0b10'
          : 'radial-gradient(900px 420px at 15% 15%, rgba(161,0,255,0.20), transparent 50%), radial-gradient(800px 380px at 80% 80%, rgba(63,103,234,0.14), transparent 48%), #f6f6f9',
      animation: 'loginBgDrift 6s ease-in-out infinite alternate'
    }}
  >
    <Outlet />
  </Box>
);
