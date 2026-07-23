import { createTheme } from '@mui/material/styles';

export type AppResolvedThemeMode = 'light' | 'dark';

const lightPalette = {
  primary: '#0b6e6d',
  secondary: '#3b5370',
  success: '#2e7d32',
  warning: '#ed6c02',
  info: '#0288d1',
  error: '#d32f2f',
  background: '#f5f7fb',
  surface: '#ffffff'
};

const darkPalette = {
  primary: '#76d2cf',
  secondary: '#9ab6da',
  success: '#7ed882',
  warning: '#ffb870',
  info: '#6cc8ff',
  error: '#ff9ea3',
  background: '#0f131a',
  surface: '#171d28'
};

export const createAppTheme = (mode: AppResolvedThemeMode) => {
  const token = mode === 'dark' ? darkPalette : lightPalette;

  return createTheme({
    palette: {
      mode,
      primary: { main: token.primary },
      secondary: { main: token.secondary },
      success: { main: token.success },
      warning: { main: token.warning },
      info: { main: token.info },
      error: { main: token.error },
      background: {
        default: token.background,
        paper: token.surface
      }
    },
    shape: {
      borderRadius: 16
    },
    typography: {
      fontFamily: ['Poppins', 'Segoe UI', 'Arial', 'sans-serif'].join(', '),
      h4: { fontWeight: 700, letterSpacing: '-0.01em' },
      h5: { fontWeight: 700, letterSpacing: '-0.01em' },
      h6: { fontWeight: 700, letterSpacing: '-0.01em' },
      body1: { lineHeight: 1.6 },
      body2: { lineHeight: 1.55 }
    },
    components: {
      MuiCard: {
        defaultProps: {
          elevation: 0
        },
        styleOverrides: {
          root: {
            borderRadius: 20,
            border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`,
            boxShadow: mode === 'dark'
              ? '0 8px 24px rgba(0,0,0,0.28)'
              : '0 8px 24px rgba(15,23,42,0.07)'
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 12,
            fontWeight: 600,
            paddingInline: 16
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(12px)'
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 10
          }
        }
      },
      MuiTextField: {
        defaultProps: {
          size: 'small'
        }
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            backgroundColor:
              mode === 'dark' ? 'rgba(118, 210, 207, 0.22)' : 'rgba(11, 110, 109, 0.12)',
            color: mode === 'dark' ? '#e7f6f5' : 'rgba(15, 23, 42, 0.92)',
            fontWeight: 700,
            borderBottom:
              mode === 'dark' ? '1px solid rgba(255,255,255,0.16)' : '1px solid rgba(15,23,42,0.12)',
            '&:first-of-type': {
              paddingLeft: 20
            },
            '&:last-of-type': {
              paddingRight: 20
            }
          }
        }
      },
      MuiTable: {
        defaultProps: {
          size: 'small'
        }
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            overflow: 'hidden'
          }
        }
      }
    }
  });
};
