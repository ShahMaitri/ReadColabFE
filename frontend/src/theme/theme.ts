import { createTheme } from '@mui/material/styles';

export type AppResolvedThemeMode = 'light' | 'dark';

const lightPalette = {
  primary: '#a100ff',
  secondary: '#2d2b38',
  success: '#1e915f',
  warning: '#f28a1d',
  info: '#3f67ea',
  error: '#d9382b',
  background: '#f6f6f9',
  surface: '#ffffff',
  textPrimary: '#101014',
  textSecondary: '#4c4c5c'
};

const darkPalette = {
  primary: '#c068ff',
  secondary: '#d7d3e8',
  success: '#59c78a',
  warning: '#ffb347',
  info: '#78a2ff',
  error: '#ff8c80',
  background: '#0b0b10',
  surface: '#15151d',
  textPrimary: '#f7f6fb',
  textSecondary: '#b9b4cd'
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
      text: {
        primary: token.textPrimary,
        secondary: token.textSecondary
      },
      background: {
        default: token.background,
        paper: token.surface
      }
    },
    shape: {
      borderRadius: 14
    },
    typography: {
      fontFamily: ['Source Sans 3', 'Segoe UI', 'Arial', 'sans-serif'].join(', '),
      h4: { fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', fontWeight: 700, letterSpacing: '-0.01em' },
      h5: { fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', fontWeight: 700, letterSpacing: '-0.01em' },
      h6: { fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', fontWeight: 700, letterSpacing: '-0.01em' },
      body1: { lineHeight: 1.6 },
      body2: { lineHeight: 1.55 }
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage:
              mode === 'dark'
                ? 'radial-gradient(1200px 600px at -10% -10%, rgba(192,104,255,0.12), transparent 45%), radial-gradient(1000px 500px at 110% 110%, rgba(120,162,255,0.08), transparent 45%)'
                : 'radial-gradient(1200px 600px at -10% -10%, rgba(161,0,255,0.10), transparent 45%), radial-gradient(1000px 500px at 110% 110%, rgba(63,103,234,0.08), transparent 45%)'
          }
        }
      },
      MuiCard: {
        defaultProps: {
          elevation: 0
        },
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(16,16,20,0.08)'}`,
            boxShadow: mode === 'dark'
              ? '0 10px 28px rgba(0,0,0,0.35)'
              : '0 10px 28px rgba(16,16,20,0.08)'
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none'
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 10,
            fontWeight: 600,
            paddingInline: 16
          },
          contained: {
            background: mode === 'dark'
              ? 'linear-gradient(120deg, #c068ff 0%, #9f39ff 100%)'
              : 'linear-gradient(120deg, #a100ff 0%, #7f1dff 100%)',
            boxShadow: mode === 'dark'
              ? '0 8px 20px rgba(160, 64, 255, 0.42)'
              : '0 8px 20px rgba(161, 0, 255, 0.28)',
            '&:hover': {
              filter: 'brightness(1.04)'
            }
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
            borderRadius: 8
          }
        }
      },
      MuiTextField: {
        defaultProps: {
          size: 'small'
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.88)'
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            backgroundColor:
              mode === 'dark' ? 'rgba(192,104,255,0.26)' : 'rgba(161,0,255,0.12)',
            color: mode === 'dark' ? '#f7f1ff' : 'rgba(16,16,20,0.92)',
            fontWeight: 700,
            borderBottom:
              mode === 'dark' ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(16,16,20,0.12)',
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
        },
        styleOverrides: {
          root: {
            width: 'max-content',
            minWidth: '100%'
          }
        }
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            overflowX: 'auto',
            overflowY: 'hidden',
            WebkitOverflowScrolling: 'touch',
            '@media (max-width:900px)': {
              '& .MuiTableCell-root': {
                whiteSpace: 'nowrap'
              }
            }
          }
        }
      }
    }
  });
};
