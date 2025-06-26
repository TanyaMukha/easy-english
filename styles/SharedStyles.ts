import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Breakpoints for responsive design
export const Breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
} as const;

// Check if device is tablet sized
export const isTablet = width >= Breakpoints.tablet;
export const isDesktop = width >= Breakpoints.desktop;

// Spacing scale
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Color palette
export const Colors = {
  // Primary colors
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  
  // Secondary colors
  secondary: '#10B981',
  secondaryLight: '#34D399',
  secondaryDark: '#059669',
  
  // Neutral colors
  background: '#0F172A',
  surface: '#1E293B',
  surfaceLight: '#334155',
  
  // Text colors
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  
  // Accent colors
  accent: '#F59E0B',
  accentLight: '#FCD34D',
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Border colors
  border: '#374151',
  borderLight: '#4B5563',
  
  // Card colors by part of speech
  noun: '#6366F1',
  verb: '#10B981',
  adjective: '#F59E0B',
  adverb: '#8B5CF6',
  preposition: '#EC4899',
  phrase: '#06B6D4',
  phrasal_verb: '#84CC16',
  idiom: '#F97316',
  pronoun: '#EF4444',
  conjunction: '#14B8A6',
  interjection: '#A855F7',
  slang: '#F43F5E',
  abbreviation: '#64748B',
  fixed_expression: '#0EA5E9',
  irregular: '#DC2626',
} as const;

// Typography scale
export const Typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  
  lineHeight: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  // Header sizes
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  h6: 16,
} as const;

// Shadow styles
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
} as const;

// Utility functions
export const getResponsiveValue = (mobile: number, tablet?: number, desktop?: number) => {
  if (isDesktop && desktop) return desktop;
  if (isTablet && tablet) return tablet;
  return mobile;
};

export const getResponsiveStyle = <T>(mobile: T, tablet?: T, desktop?: T): T => {
  if (isDesktop && desktop) return desktop;
  if (isTablet && tablet) return tablet;
  return mobile;
};

// Get color for part of speech
export const getCardColor = (partOfSpeech: string): string => {
  const colorMap: Record<string, string> = {
    noun: Colors.noun,
    verb: Colors.verb,
    adjective: Colors.adjective,
    adverb: Colors.adverb,
    preposition: Colors.preposition,
    phrase: Colors.phrase,
    phrasal_verb: Colors.phrasal_verb,
    idiom: Colors.idiom,
    pronoun: Colors.pronoun,
    conjunction: Colors.conjunction,
    interjection: Colors.interjection,
    slang: Colors.slang,
    abbreviation: Colors.abbreviation,
    fixed_expression: Colors.fixed_expression,
    irregular: Colors.irregular,
  };
  
  return colorMap[partOfSpeech] || Colors.primary;
};

// Main shared styles
export const SharedStyles = StyleSheet.create({
  // Layout styles
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: getResponsiveValue(Spacing.md, Spacing.lg, Spacing.xl),
  },
  
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  spaceAround: {
    justifyContent: 'space-around',
  },
  
  spaceEvenly: {
    justifyContent: 'space-evenly',
  },
  
  // Surface styles
  surface: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  
  surfaceLight: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    marginVertical: Spacing.sm,
    ...Shadows.md,
  },
  
  // Header styles
  h1: {
    fontSize: Typography.h1,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    lineHeight: Typography.h1 * Typography.lineHeight.tight,
    marginBottom: Spacing.lg,
  },
  
  h2: {
    fontSize: Typography.h2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    lineHeight: Typography.h2 * Typography.lineHeight.tight,
    marginBottom: Spacing.md,
  },
  
  h3: {
    fontSize: Typography.h3,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    lineHeight: Typography.h3 * Typography.lineHeight.snug,
    marginBottom: Spacing.sm,
  },
  
  h4: {
    fontSize: Typography.h4,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    lineHeight: Typography.h4 * Typography.lineHeight.snug,
    marginBottom: Spacing.sm,
  },
  
  h5: {
    fontSize: Typography.h5,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text,
    lineHeight: Typography.h5 * Typography.lineHeight.normal,
    marginBottom: Spacing.sm,
  },
  
  h6: {
    fontSize: Typography.h6,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text,
    lineHeight: Typography.h6 * Typography.lineHeight.normal,
    marginBottom: Spacing.sm,
  },
  
  // Main typography
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    lineHeight: Typography.fontSize['2xl'] * Typography.lineHeight.tight,
  },
  
  subtitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.lg * Typography.lineHeight.normal,
  },
  
  body: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.normal,
    color: Colors.text,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
  },
  
  bodySecondary: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.normal,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
  },
  
  caption: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.normal,
    color: Colors.textMuted,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
  
  // Button styles
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  
  secondaryButton: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  
  buttonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  
  primaryButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  
  // Input styles
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  
  inputFocused: {
    borderColor: Colors.primary,
  },
  
  inputError: {
    borderColor: Colors.error,
  },
  
  // Spacing utilities
  mt: {
    marginTop: Spacing.md,
  },
  
  mb: {
    marginBottom: Spacing.md,
  },
  
  ml: {
    marginLeft: Spacing.md,
  },
  
  mr: {
    marginRight: Spacing.md,
  },
  
  mx: {
    marginHorizontal: Spacing.md,
  },
  
  my: {
    marginVertical: Spacing.md,
  },
  
  pt: {
    paddingTop: Spacing.md,
  },
  
  pb: {
    paddingBottom: Spacing.md,
  },
  
  pl: {
    paddingLeft: Spacing.md,
  },
  
  pr: {
    paddingRight: Spacing.md,
  },
  
  px: {
    paddingHorizontal: Spacing.md,
  },
  
  py: {
    paddingVertical: Spacing.md,
  },
  
  // Responsive grid
  grid: {
    flexDirection: getResponsiveStyle('column', 'row'),
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  
  gridItem: {
    flex: getResponsiveValue(1, 0.5, 0.33),
    minWidth: getResponsiveValue(280, 320, 300),
  },
  
  // Loading and error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  
  errorText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  
  // Safe area styles
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  // Separator
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  
  // Centered content
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Full width
  fullWidth: {
    width: '100%',
  },
  
  // Flex utilities
  flex1: {
    flex: 1,
  },
  
  flex0: {
    flex: 0,
  },
  
  // Absolute positioning
  absolute: {
    position: 'absolute',
  },
  
  // Rounded corners
  rounded: {
    borderRadius: 8,
  },
  
  roundedLg: {
    borderRadius: 12,
  },
  
  roundedXl: {
    borderRadius: 16,
  },
  
  // Opacity
  opacity50: {
    opacity: 0.5,
  },
  
  opacity75: {
    opacity: 0.75,
  },
});

export default SharedStyles;