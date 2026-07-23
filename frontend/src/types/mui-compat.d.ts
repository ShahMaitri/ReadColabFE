import type * as React from 'react';

declare module '@mui/material/Stack' {
  interface StackOwnProps {
    alignItems?: any;
    justifyContent?: any;
    flexWrap?: any;
    textAlign?: any;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyOwnProps {
    textAlign?: React.CSSProperties['textAlign'];
    display?: React.CSSProperties['display'];
  }
}

declare module '@mui/material/Grid' {
  interface GridBaseProps {
    item?: boolean;
    xs?: number | 'auto' | boolean;
    sm?: number | 'auto' | boolean;
    md?: number | 'auto' | boolean;
    lg?: number | 'auto' | boolean;
    xl?: number | 'auto' | boolean;
  }
}

declare module '@mui/material/TextField' {
  interface BaseTextFieldProps {
    InputProps?: any;
    inputProps?: any;
    InputLabelProps?: any;
  }
}
