import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const customColors = {
  primary: '#0284C7',          // Sky blue primary
  primaryContainer: '#E0F2FE',
  secondary: '#0D9488',        // Teal secondary (water / nature)
  secondaryContainer: '#CCFBF1',
  tertiary: '#F59E0B',         // Amber (sun / warnings)
  tertiaryContainer: '#FEF3C7',
  error: '#EF4444',            // Red alert
  errorContainer: '#FEE2E2',
  background: '#0F172A',       // Slate dark background
  surface: '#1E293B',          // Slate dark surface
  surfaceVariant: '#334155',
  text: '#F8FAFC',
  onSurface: '#F8FAFC',
  outline: '#475569',
  
  // Weather condition colors
  sunny: '#F59E0B',
  rainy: '#3B82F6',
  stormy: '#6366F1',
  cloudy: '#64748B',

  // Severity alert badges
  advisory: '#EAB308', // Yellow
  watch: '#F97316',    // Orange
  warning: '#EF4444',  // Red
  emergency: '#A855F7',// Purple
};

export const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...customColors,
  },
  roundness: 16,
};
