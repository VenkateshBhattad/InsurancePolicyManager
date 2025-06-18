/**
 * Material Design 3 Theme Configuration
 * Defines light and dark themes for the app
 */

import { MD3LightTheme, MD3DarkTheme, MD3Theme } from 'react-native-paper';

// Custom color palette based on Material Design 3
const lightColors = {
  primary: '#1976d2',
  onPrimary: '#ffffff',
  primaryContainer: '#d3e3fd',
  onPrimaryContainer: '#001c38',
  
  secondary: '#565f71',
  onSecondary: '#ffffff',
  secondaryContainer: '#dae2f9',
  onSecondaryContainer: '#131c2b',
  
  tertiary: '#705575',
  onTertiary: '#ffffff',
  tertiaryContainer: '#fad8fd',
  onTertiaryContainer: '#28132e',
  
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#410002',
  
  background: '#fefbff',
  onBackground: '#1a1c1e',
  
  surface: '#fefbff',
  onSurface: '#1a1c1e',
  surfaceVariant: '#e1e2ec',
  onSurfaceVariant: '#44474f',
  
  outline: '#74777f',
  outlineVariant: '#c4c6d0',
  
  shadow: '#000000',
  scrim: '#000000',
  
  inverseSurface: '#2f3033',
  inverseOnSurface: '#f1f0f4',
  inversePrimary: '#a4c8ff',
  
  // Custom colors for insurance app
  success: '#2e7d32',
  onSuccess: '#ffffff',
  successContainer: '#c8e6c9',
  onSuccessContainer: '#1b5e20',
  
  warning: '#f57c00',
  onWarning: '#ffffff',
  warningContainer: '#ffe0b2',
  onWarningContainer: '#e65100',
  
  info: '#0288d1',
  onInfo: '#ffffff',
  infoContainer: '#b3e5fc',
  onInfoContainer: '#01579b',
};

const darkColors = {
  primary: '#a4c8ff',
  onPrimary: '#003258',
  primaryContainer: '#004881',
  onPrimaryContainer: '#d3e3fd',
  
  secondary: '#bec6dc',
  onSecondary: '#283141',
  secondaryContainer: '#3e4759',
  onSecondaryContainer: '#dae2f9',
  
  tertiary: '#debcdf',
  onTertiary: '#3e2844',
  tertiaryContainer: '#553e5c',
  onTertiaryContainer: '#fad8fd',
  
  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',
  
  background: '#111318',
  onBackground: '#e2e2e6',
  
  surface: '#111318',
  onSurface: '#e2e2e6',
  surfaceVariant: '#44474f',
  onSurfaceVariant: '#c4c6d0',
  
  outline: '#8e9099',
  outlineVariant: '#44474f',
  
  shadow: '#000000',
  scrim: '#000000',
  
  inverseSurface: '#e2e2e6',
  inverseOnSurface: '#2f3033',
  inversePrimary: '#1976d2',
  
  // Custom colors for insurance app
  success: '#81c784',
  onSuccess: '#1b5e20',
  successContainer: '#2e7d32',
  onSuccessContainer: '#c8e6c9',
  
  warning: '#ffb74d',
  onWarning: '#e65100',
  warningContainer: '#f57c00',
  onWarningContainer: '#ffe0b2',
  
  info: '#64b5f6',
  onInfo: '#01579b',
  infoContainer: '#0288d1',
  onInfoContainer: '#b3e5fc',
};

// Light theme
export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...lightColors,
  },
  roundness: 12,
};

// Dark theme
export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkColors,
  },
  roundness: 12,
};

// Common spacing and sizing constants
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const elevation = {
  none: 0,
  sm: 1,
  md: 3,
  lg: 6,
  xl: 12,
  xxl: 24,
};

// Component-specific styles
export const componentStyles = {
  card: {
    elevation: elevation.sm,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  button: {
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  input: {
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  fab: {
    borderRadius: borderRadius.xl,
    elevation: elevation.md,
  },
};

// Status colors for policies
export const statusColors = {
  active: {
    light: lightColors.success,
    dark: darkColors.success,
  },
  expired: {
    light: lightColors.error,
    dark: darkColors.error,
  },
  pending: {
    light: lightColors.warning,
    dark: darkColors.warning,
  },
  cancelled: {
    light: lightColors.outline,
    dark: darkColors.outline,
  },
};

// Policy type colors
export const policyTypeColors = {
  auto: '#2196f3',
  home: '#4caf50',
  life: '#ff9800',
  health: '#e91e63',
  business: '#9c27b0',
  other: '#607d8b',
};

// Default theme (fallback)
export const defaultTheme: MD3Theme = MD3LightTheme;

export default {
  light: lightTheme,
  dark: darkTheme,
  default: defaultTheme,
  spacing,
  borderRadius,
  elevation,
  componentStyles,
  statusColors,
  policyTypeColors,
};
