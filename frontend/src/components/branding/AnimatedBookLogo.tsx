import { Box } from '@mui/material';

interface AnimatedBookLogoProps {
  badgeSize?: number;
  bookWidth?: number;
  bookHeight?: number;
  durationSeconds?: number;
}

export const AnimatedBookLogo = ({
  badgeSize = 52,
  bookWidth = 44,
  bookHeight = 34,
  durationSeconds = 2.35
}: AnimatedBookLogoProps) => {
  const animationDuration = `${durationSeconds}s`;

  return (
    <Box
      sx={{
        '@keyframes turnPageRTL': {
          '0%': { transform: 'perspective(460px) rotateY(0deg)' },
          '18%': { transform: 'perspective(460px) rotateY(-26deg)' },
          '46%': { transform: 'perspective(460px) rotateY(-102deg)' },
          '74%': { transform: 'perspective(460px) rotateY(-148deg)' },
          '88%': { transform: 'perspective(460px) rotateY(-156deg)' },
          '100%': { transform: 'perspective(460px) rotateY(-156deg)' }
        },
        width: badgeSize,
        height: badgeSize,
        borderRadius: 3,
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        boxShadow: (theme) => `0 12px 28px ${theme.palette.primary.main}55`
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: bookWidth,
          height: bookHeight
        }}
      >
        <Box
          component='svg'
          viewBox='0 0 68 52'
          sx={{ width: '100%', height: '100%', display: 'block' }}
        >
          <path d='M6 10c9-4 16-3 26 2v30c-10-5-17-6-26-2V10z' fill='rgba(255,255,255,0.96)' />
          <path d='M62 10c-9-4-16-3-26 2v30c10-5 17-6 26-2V10z' fill='rgba(255,255,255,0.78)' />
          <rect x='32.2' y='10' width='3.6' height='32' rx='1.8' fill='rgba(255,255,255,0.6)' />
          <path d='M10 17h11M10 21h13M10 25h10M10 29h12M10 33h9' stroke='rgba(52,152,219,0.34)' strokeWidth='1.2' strokeLinecap='round' />
          <path d='M36 17h12M36 21h10M36 25h13M36 29h9M36 33h11' stroke='rgba(52,152,219,0.28)' strokeWidth='1.2' strokeLinecap='round' />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            transformOrigin: '50% 50%',
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'visible',
            animation: `turnPageRTL ${animationDuration} ease-in-out infinite`,
            pointerEvents: 'none'
          }}
        >
          <Box
            component='svg'
            viewBox='0 0 68 52'
            sx={{ width: '100%', height: '100%', display: 'block' }}
          >
            <path d='M34 12c7-3 13-3 22 1v27c-9-3-15-3-22 0V12z' fill='rgba(255,255,255,0.98)' />
            <path d='M39 17h11M39 21h9M39 25h12M39 29h8M39 33h10' stroke='rgba(52,152,219,0.3)' strokeWidth='1.2' strokeLinecap='round' />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};