import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ElementType, ReactNode } from 'react';

interface BrandHighlightTextProps {
  children: ReactNode;
  component?: ElementType;
  animate?: boolean;
  sx?: SxProps<Theme>;
}

export const BrandHighlightText = ({
  children,
  component = 'span',
  animate = false,
  sx
}: BrandHighlightTextProps) => {
  return (
    <Box
      component={component}
      sx={[
        {
          fontWeight: 800,
          letterSpacing: '-0.01em',
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(120deg, #f8ecff 0%, #cf86ff 45%, #a100ff 100%)'
              : 'linear-gradient(120deg, #6f16df 0%, #a100ff 45%, #4f0fa1 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          ...(animate
            ? {
                backgroundSize: '200% 200%',
                animation: 'brandTitleShift 2200ms ease-in-out infinite alternate',
                '@keyframes brandTitleShift': {
                  '0%': {
                    backgroundPosition: '0% 50%',
                    filter: 'drop-shadow(0 0 0 rgba(161,0,255,0.0))'
                  },
                  '100%': {
                    backgroundPosition: '100% 50%',
                    filter: 'drop-shadow(0 0 10px rgba(161,0,255,0.34))'
                  }
                }
              }
            : null)
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : [])
      ]}
    >
      {children}
    </Box>
  );
};
