import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0F766E'
    },
    secondary: {
      main: '#334155'
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF'
    }
  },
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily: ['Poppins', 'Segoe UI', 'Arial', 'sans-serif'].join(', '),
    h5: {
      fontWeight: 700
    },
    h6: {
      fontWeight: 700
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
          fontWeight: 600
        }
      }
    }
  }
});
