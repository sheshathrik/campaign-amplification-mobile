export const Colors = {
  light: {
    primary: '#4F46E5', // Indigo-600
    primaryLight: '#EEF2FF',
    primaryDark: '#3730A3',
    primaryGlow: 'rgba(79, 70, 229, 0.15)',
    
    accent: '#06B6D4', // Cyan
    accentLight: '#ECFEFF',
    
    success: '#10B981', // Emerald
    successLight: '#ECFDF5',
    successText: '#065F46',
    
    warning: '#F59E0B', // Amber
    warningLight: '#FFFBEB',
    warningText: '#92400E',
    
    danger: '#EF4444', // Red
    dangerLight: '#FEF2F2',
    dangerText: '#991B1B',
    
    background: '#F8FAFC', // Slate-50
    surface: '#FFFFFF',
    surfaceSubtle: '#F1F5F9',
    surfaceBorder: '#E2E8F0',
    surfaceHover: '#F8FAFC',
    
    text: '#0F172A', // Slate-900
    textMuted: '#475569', // Slate-600
    textSubtle: '#94A3B8', // Slate-400
    textInverse: '#FFFFFF',
    
    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#E2E8F0',
    tabBarActive: '#4F46E5',
    tabBarInactive: '#94A3B8',
    
    cardShadow: 'rgba(15, 23, 42, 0.06)',
  },
  dark: {
    primary: '#6366F1', // Indigo-500
    primaryLight: 'rgba(99, 102, 241, 0.15)',
    primaryDark: '#4338CA',
    primaryGlow: 'rgba(99, 102, 241, 0.25)',
    
    accent: '#22D3EE',
    accentLight: 'rgba(34, 211, 238, 0.15)',
    
    success: '#34D399',
    successLight: 'rgba(52, 211, 153, 0.15)',
    successText: '#A7F3D0',
    
    warning: '#FBBF24',
    warningLight: 'rgba(251, 191, 36, 0.15)',
    warningText: '#FDE68A',
    
    danger: '#F87171',
    dangerLight: 'rgba(248, 113, 113, 0.15)',
    dangerText: '#FECACA',
    
    background: '#0B1120', // Dark navy
    surface: '#141D33',
    surfaceSubtle: '#1E293B',
    surfaceBorder: '#27354F',
    surfaceHover: '#1B263F',
    
    text: '#F8FAFC',
    textMuted: '#94A3B8',
    textSubtle: '#64748B',
    textInverse: '#0F172A',
    
    tabBarBackground: '#111827',
    tabBarBorder: '#1F2937',
    tabBarActive: '#818CF8',
    tabBarInactive: '#6B7280',
    
    cardShadow: 'rgba(0, 0, 0, 0.4)',
  },
};

export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 22,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodyBold: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
  tiny: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

