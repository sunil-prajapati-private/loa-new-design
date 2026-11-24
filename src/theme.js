import { createTheme } from '@mui/material/styles';

// You can update these color values as needed
const colors = {
  primary: {
    main: '#0053CC',
    light: '#1F78FF',
    dark: '#00398F',
    contrastText: '#EBF3FF',
  },
  secondary: {
    main: '#00ABCC',
    light: '#1FDAFF',
    dark: '#00778F',
    contrastText: '#EBFCFF',
  },
  error: {
    main: '#AE2E24',
    light: '#D32F2F',
    dark: '#B71C1C',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#B38600',
    light: '#CF9F02',
    dark: '#946F00',
    contrastText: '#FFFFFF',
  },
  info: {
    main: '#0053CC',
    light: '#1F78FF',
    dark: '#00398F',
    contrastText: '#EBF3FF',
  },
  success: {
    main: '#22A06B',
    light: '#2ABB7F',
    dark: '#216E4E',
    contrastText: '#FFFFFF',
  },
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  text: {
    primary: '#313030',
    secondary: '#545563',
    disabled: '#9E9E9E',
  },
  background: {
    default: '#FFFFFF',
    paper: '#FFFFFF',
  },
  divider: '#E0E0E0',
};

export const theme = createTheme({
  palette: colors,
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.57,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.57,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.75,
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.66,
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: 2.66,
      textTransform: 'uppercase',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
});
