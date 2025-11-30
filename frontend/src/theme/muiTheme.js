import { createTheme } from '@mui/material/styles';

/**
 * FlashMind MUI Theme Configuration
 * Integrates Material-UI with glassmorphism design system
 */

// Light Theme - Fresh Mint (matches index.css)
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#10B981',      // Emerald Green
      light: '#14B8A6',     // Teal
      dark: '#059669',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#14B8A6',      // Teal
      light: '#2DD4BF',
      dark: '#0D9488',
      contrastText: '#ffffff',
    },
    error: {
      main: '#DC2626',
    },
    warning: {
      main: '#FF9800',
    },
    info: {
      main: '#2196F3',
    },
    success: {
      main: '#4CAF50',
    },
    background: {
      default: '#E8F5F1',   // Mint background
      paper: 'rgba(255, 255, 255, 0.85)',  // Glassmorphism
    },
    text: {
      primary: '#1F2937',   // Dark Gray
      secondary: '#4B5563', // Medium Gray
    },
  },
  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    h1: {
      fontSize: '2.75rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 20,  // Matches glassmorphism card radius
  },
  shadows: [
    'none',
    '0 10px 40px rgba(16, 185, 129, 0.1)',  // shadow-sm
    '0 15px 50px rgba(16, 185, 129, 0.15)', // shadow-md
    '0 20px 60px rgba(16, 185, 129, 0.2)',  // shadow-lg
    '0 25px 70px rgba(16, 185, 129, 0.25)', // shadow-xl
    ...Array(20).fill('0 25px 70px rgba(16, 185, 129, 0.25)'),
  ],
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)', // Safari support
          border: '1px solid rgba(16, 185, 129, 0.2)',
          boxShadow: '0 15px 50px rgba(16, 185, 129, 0.15)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        elevation1: {
          boxShadow: '0 10px 40px rgba(16, 185, 129, 0.1)',
        },
        elevation2: {
          boxShadow: '0 15px 50px rgba(16, 185, 129, 0.15)',
        },
        elevation3: {
          boxShadow: '0 20px 60px rgba(16, 185, 129, 0.2)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-5px) scale(1.02)',
            borderColor: 'rgba(16, 185, 129, 0.4)',
            boxShadow: '0 20px 60px rgba(16, 185, 129, 0.2)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        contained: {
          boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
          '&:hover': {
            boxShadow: '0 15px 40px rgba(16, 185, 129, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #059669 0%, #0D9488 100%)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '& fieldset': {
              borderColor: 'rgba(16, 185, 129, 0.2)',
              borderWidth: '2px',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(16, 185, 129, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#10B981',
            },
            '&.Mui-focused': {
              transform: 'translateY(-2px)',
              boxShadow: '0 10px 30px rgba(16, 185, 129, 0.15)',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          boxShadow: '0 10px 40px rgba(16, 185, 129, 0.1)',
          color: '#1F2937',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          borderRight: '1px solid rgba(16, 185, 129, 0.2)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          backgroundColor: 'rgba(16, 185, 129, 0.25)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
  },
});

// Dark Theme - True Dark (matches index.css dark-mode)
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#05BFDB',      // Bright Cyan
      light: '#00D9FF',     // Light Cyan
      dark: '#0891B2',
      contrastText: '#0a0e27',
    },
    secondary: {
      main: '#00D9FF',      // Light Cyan
      light: '#22D3EE',
      dark: '#05BFDB',
      contrastText: '#0a0e27',
    },
    error: {
      main: '#ff6b6b',
    },
    warning: {
      main: '#FF9800',
    },
    info: {
      main: '#2196F3',
    },
    success: {
      main: '#4CAF50',
    },
    background: {
      default: '#0a0e27',   // Very Dark Blue
      paper: 'rgba(255, 255, 255, 0.05)',  // Glassmorphism
    },
    text: {
      primary: 'rgba(255, 255, 255, 0.95)',
      secondary: 'rgba(255, 255, 255, 0.75)',
    },
  },
  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    h1: {
      fontSize: '2.75rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 20,
  },
  shadows: [
    'none',
    '0 10px 40px rgba(5, 191, 219, 0.15)',
    '0 15px 50px rgba(5, 191, 219, 0.2)',
    '0 20px 60px rgba(5, 191, 219, 0.25)',
    '0 25px 70px rgba(5, 191, 219, 0.3)',
    ...Array(20).fill('0 25px 70px rgba(5, 191, 219, 0.3)'),
  ],
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          border: '1px solid rgba(5, 191, 219, 0.2)',
          boxShadow: '0 15px 50px rgba(5, 191, 219, 0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          border: '1px solid rgba(5, 191, 219, 0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-5px) scale(1.02)',
            borderColor: 'rgba(5, 191, 219, 0.4)',
            boxShadow: '0 20px 60px rgba(5, 191, 219, 0.25)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        contained: {
          boxShadow: '0 10px 30px rgba(5, 191, 219, 0.3)',
          '&:hover': {
            boxShadow: '0 15px 40px rgba(5, 191, 219, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #05BFDB 0%, #00D9FF 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0891B2 0%, #05BFDB 100%)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '& fieldset': {
              borderColor: 'rgba(5, 191, 219, 0.2)',
              borderWidth: '2px',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(5, 191, 219, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#05BFDB',
            },
            '&.Mui-focused': {
              transform: 'translateY(-2px)',
              boxShadow: '0 10px 30px rgba(5, 191, 219, 0.15)',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          boxShadow: '0 10px 40px rgba(5, 191, 219, 0.15)',
          color: 'rgba(255, 255, 255, 0.95)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          borderRight: '1px solid rgba(5, 191, 219, 0.2)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          backgroundColor: 'rgba(5, 191, 219, 0.25)',
          border: '1px solid rgba(5, 191, 219, 0.4)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
  },
});
