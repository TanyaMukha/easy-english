import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Device breakpoints
const isTablet = screenWidth >= 768;
const isLargeTablet = screenWidth >= 1024;
const isDesktop = screenWidth >= 1200;

// Unified Dark Theme Color System
export const Colors = {
  // Primary brand colors
  primary: '#6366F1', // Indigo - main brand color
  primaryLight: '#8B8CF8',
  primaryDark: '#4F46E5',
  primaryBg: '#1E1B4B',

  // Secondary colors  
  secondary: '#EC4899', // Pink - secondary brand
  secondaryLight: '#F472B6',
  secondaryDark: '#DB2777',

  // Accent colors
  accent: '#06B6D4', // Cyan - accent highlights
  accentLight: '#22D3EE',
  accentDark: '#0891B2',

  // Background hierarchy
  background: '#0F0F23', // Main app background (very dark blue)
  backgroundSecondary: '#1A1B3A', // Card backgrounds
  backgroundTertiary: '#252653', // Elevated surfaces
  surface: '#1E1F42', // Interactive surfaces
  surfaceLight: '#2A2B5A', // Hover states
  surfaceSecondary: '#1C1C1E', // Alternative surface
  
  // Text hierarchy
  text: '#F8FAFC', // Primary text (almost white)
  textPrimary: '#F8FAFC', // Alias for main text
  textSecondary: '#CBD5E1', // Secondary text (light gray)
  textTertiary: '#94A3B8', // Tertiary text (medium gray)
  textMuted: '#64748B', // Muted text (dark gray)
  textDisabled: '#475569', // Disabled text
  textOnPrimary: '#FFFFFF', // Text on primary buttons

  // Semantic colors
  success: '#10B981', // Green - success states
  successLight: '#34D399',
  successDark: '#059669',
  successBg: '#064E3B',

  warning: '#F59E0B', // Amber - warning states
  warningLight: '#FBBF24',
  warningDark: '#D97706',
  warningBg: '#451A03',

  error: '#EF4444', // Red - error states
  errorLight: '#F87171',
  errorDark: '#DC2626',
  errorBg: '#450A0A',

  info: '#3B82F6', // Blue - info states
  infoLight: '#60A5FA',
  infoDark: '#2563EB',
  infoBg: '#1E3A8A',

  // Border colors
  border: '#334155', // Default borders
  borderLight: '#475569', // Lighter borders
  borderDark: '#1E293B', // Darker borders
  outline: '#334155', // Outline elements

  // Input-specific colors
  inputBackground: '#1E293B',
  inputBorder: '#475569',
  inputFocus: '#6366F1',
  inputPlaceholder: '#64748B',

  // Progress and interactive elements
  progressBackground: '#1E293B',
  progressFill: '#6366F1',
  shadow: '#000000',

  // Level-specific colors for language learning
  levelA1: '#10B981', // Green - beginner
  levelA2: '#06B6D4', // Cyan - elementary
  levelB1: '#3B82F6', // Blue - intermediate
  levelB2: '#8B5CF6', // Purple - upper intermediate
  levelC1: '#F59E0B', // Orange - advanced
  levelC2: '#EF4444', // Red - proficiency

  // Part of speech colors (optimized for dark theme)
  card: {
    noun: '#EF4444', // Red
    verb: '#10B981', // Green
    adjective: '#3B82F6', // Blue
    adverb: '#8B5CF6', // Purple
    preposition: '#F59E0B', // Orange
    phrase: '#EC4899', // Pink
    phrasal_verb: '#06B6D4', // Cyan
    idiom: '#F59E0B', // Orange
    pronoun: '#8B5CF6', // Purple
    conjunction: '#10B981', // Green
    interjection: '#EF4444', // Red
    slang: '#EC4899', // Pink
    abbreviation: '#06B6D4', // Cyan
    fixed_expression: '#8B5CF6', // Purple
    irregular: '#F59E0B', // Orange
  }
} as const;

// Typography system
export const Typography = {
  // Font families (platform-specific)
  fontRegular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    default: 'System',
  }),
  fontMedium: Platform.select({
    ios: 'System',
    android: 'Roboto_medium',
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    default: 'System',
  }),
  fontBold: Platform.select({
    ios: 'System',
    android: 'Roboto',
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    default: 'System',
  }),
  fontMono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    web: 'ui-monospace, Menlo, Monaco, "Cascadia Code", "Segoe UI Mono", "Roboto Mono", "Oxygen Mono", "Ubuntu Monospace", "Source Code Pro", "Fira Mono", "Droid Sans Mono", "Courier New", monospace',
    default: 'monospace',
  }),

  // Responsive font sizes
  fontSize: {
    xs: isTablet ? 14 : 12,
    sm: isTablet ? 16 : 14,
    base: isTablet ? 18 : 16,
    lg: isTablet ? 20 : 18,
    xl: isTablet ? 22 : 20,
    '2xl': isTablet ? 26 : 24,
    '3xl': isTablet ? 32 : 30,
    '4xl': isTablet ? 38 : 36,
    '5xl': isTablet ? 50 : 48,
  },
  
  // Font weights
  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Semantic typography aliases
  h1: isTablet ? 32 : 28,
  h2: isTablet ? 28 : 24,
  h3: isTablet ? 24 : 20,
  h4: isTablet ? 20 : 18,
  h5: isTablet ? 18 : 16,
  h6: isTablet ? 16 : 14,
  bodyLarge: isTablet ? 18 : 16,
  bodyMedium: isTablet ? 16 : 14,
  bodySmall: isTablet ? 14 : 12,
  caption: isTablet ? 12 : 10,
  overline: isTablet ? 10 : 9,
  
  // Typography styles for headlines
  headlineLarge: isTablet ? 32 : 28,
  headlineMedium: isTablet ? 28 : 24,
  headlineSmall: isTablet ? 24 : 20,
} as const;

// Spacing system (8pt grid)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// Border radius system
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

// Shadow system (platform-specific)
export const Shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: Colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
    },
    android: {
      elevation: 3,
    },
    web: {
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    },
  }),
  
  md: Platform.select({
    ios: {
      shadowColor: Colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    android: {
      elevation: 5,
    },
    web: {
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 10px 20px rgba(0, 0, 0, 0.10)',
    },
  }),
  
  lg: Platform.select({
    ios: {
      shadowColor: Colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
    },
    android: {
      elevation: 8,
    },
    web: {
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15), 0 20px 40px rgba(0, 0, 0, 0.20)',
    },
  }),
  
  xl: Platform.select({
    ios: {
      shadowColor: Colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 6.27,
    },
    android: {
      elevation: 12,
    },
    web: {
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.20), 0 30px 60px rgba(0, 0, 0, 0.25)',
    },
  }),
} as const;

// Main stylesheet with all common styles
export const SharedStyles = StyleSheet.create({
  // === LAYOUT STYLES ===
  
  // Main containers
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  contentContainer: {
    flex: 1,
    paddingHorizontal: isTablet ? Spacing.xl : Spacing.md,
    paddingVertical: Spacing.md,
  },
  
  // Scrollable content
  scrollContainer: {
    flexGrow: 1,
  },
  
  // Centered content
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  
  // === FLEXBOX UTILITIES ===
  
  flexRow: {
    flexDirection: 'row',
  },
  
  flexColumn: {
    flexDirection: 'column',
  },
  
  flexCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  flexBetween: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  flexAround: {
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  
  flex1: {
    flex: 1,
  },
  
  // === CARD STYLES ===
  
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  
  cardSmall: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  
  cardLarge: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.lg,
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  
  // === TYPOGRAPHY STYLES ===
  
  // Headings
  h1: {
    fontSize: Typography.h1,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    lineHeight: Typography.h1 * Typography.lineHeight.tight,
    marginBottom: Spacing.md,
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
  
  bodyLarge: {
    fontSize: Typography.bodyLarge,
    fontWeight: Typography.fontWeight.normal,
    color: Colors.text,
    lineHeight: Typography.bodyLarge * Typography.lineHeight.relaxed,
  },
  
  bodyMedium: {
    fontSize: Typography.bodyMedium,
    fontWeight: Typography.fontWeight.normal,
    color: Colors.text,
    lineHeight: Typography.bodyMedium * Typography.lineHeight.normal,
  },
  
  bodySmall: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.normal,
    color: Colors.text,
    lineHeight: Typography.bodySmall * Typography.lineHeight.normal,
  },
  
  caption: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.normal,
    color: Colors.textTertiary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
  
  overline: {
    fontSize: Typography.caption,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Text color variants
  textPrimary: {
    color: Colors.textPrimary,
  },
  
  textSecondary: {
    color: Colors.textSecondary,
  },
  
  textTertiary: {
    color: Colors.textTertiary,
  },
  
  textMuted: {
    color: Colors.textMuted,
  },
  
  textDisabled: {
    color: Colors.textDisabled,
  },
  
  // === BUTTON STYLES ===
  
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...Shadows.sm,
  },
  
  buttonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textOnPrimary,
  },
  
  buttonSecondary: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  
  buttonSecondaryText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  
  buttonSmall: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 36,
  },
  
  buttonLarge: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    minHeight: 56,
  },
  
  buttonDisabled: {
    backgroundColor: Colors.textDisabled,
    opacity: 0.6,
  },
  
  // === INPUT STYLES ===
  
  input: {
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    minHeight: 48,
  },
  
  inputFocused: {
    borderColor: Colors.inputFocus,
    borderWidth: 2,
  },
  
  inputError: {
    borderColor: Colors.error,
    borderWidth: 2,
  },
  
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  
  // === LIST STYLES ===
  
  listContainer: {
    paddingHorizontal: isTablet ? Spacing.xl : Spacing.md,
    paddingVertical: Spacing.md,
  },
  
  listItem: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  
  listSeparator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  
  // === PROGRESS STYLES ===
  
  progressBarContainer: {
    height: 6,
    backgroundColor: Colors.progressBackground,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.progressFill,
    borderRadius: BorderRadius.sm,
  },
  
  // === FEEDBACK STYLES ===
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  
  errorContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    margin: Spacing.md,
    alignItems: 'center',
    ...Shadows.md,
  },
  
  errorText: {
    fontSize: Typography.fontSize.base,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  
  // === SPACING UTILITIES ===
  
  marginXs: { margin: Spacing.xs },
  marginSm: { margin: Spacing.sm },
  marginMd: { margin: Spacing.md },
  marginLg: { margin: Spacing.lg },
  marginXl: { margin: Spacing.xl },
  
  paddingXs: { padding: Spacing.xs },
  paddingSm: { padding: Spacing.sm },
  paddingMd: { padding: Spacing.md },
  paddingLg: { padding: Spacing.lg },
  paddingXl: { padding: Spacing.xl },
  
  paddingHorizontalXs: { paddingHorizontal: Spacing.xs },
  paddingHorizontalSm: { paddingHorizontal: Spacing.sm },
  paddingHorizontalMd: { paddingHorizontal: Spacing.md },
  paddingHorizontalLg: { paddingHorizontal: Spacing.lg },
  paddingHorizontalXl: { paddingHorizontal: Spacing.xl },
  
  paddingVerticalXs: { paddingVertical: Spacing.xs },
  paddingVerticalSm: { paddingVertical: Spacing.sm },
  paddingVerticalMd: { paddingVertical: Spacing.md },
  paddingVerticalLg: { paddingVertical: Spacing.lg },
  paddingVerticalXl: { paddingVertical: Spacing.xl },
  
  // === RESPONSIVE UTILITIES ===
  
  tabletOnly: {
    display: isTablet ? 'flex' : 'none',
  },
  
  mobileOnly: {
    display: isTablet ? 'none' : 'flex',
  },
  
  desktopOnly: {
    display: isDesktop ? 'flex' : 'none',
  },
  
  // === WEB-SPECIFIC STYLES ===
  
  webContainer: Platform.select({
    web: {
      maxWidth: isDesktop ? 1200 : isTablet ? 768 : '100%',
      alignSelf: 'center',
      width: '100%',
    },
    default: {},
  }),
});

// === UTILITY FUNCTIONS ===

// Device utilities
export const DeviceUtils = {
  isTablet,
  isLargeTablet,
  isDesktop,
  screenWidth,
  screenHeight,
  
  // Get responsive value based on device
  getValue: (mobile: any, tablet?: any, desktop?: any) => {
    if (isDesktop && desktop !== undefined) return desktop;
    if (isTablet && tablet !== undefined) return tablet;
    return mobile;
  },
};

// Platform-specific utilities
export const getResponsiveStyle = (mobile: any, tablet?: any, desktop?: any) => {
  if (isDesktop && desktop !== undefined) return desktop;
  if (isTablet && tablet !== undefined) return tablet;
  return mobile;
};

// Get color for card based on part of speech
export const getCardColor = (partOfSpeech: string): string => {
  return Colors.card[partOfSpeech as keyof typeof Colors.card] || Colors.primary;
};

// Get level-specific color
export const getLevelColor = (level: string): string => {
  const levelColors = {
    A1: Colors.levelA1,
    A2: Colors.levelA2,
    B1: Colors.levelB1,
    B2: Colors.levelB2,
    C1: Colors.levelC1,
    C2: Colors.levelC2,
  };
  return levelColors[level as keyof typeof levelColors] || Colors.primary;
};

// Get responsive font size
export const getResponsiveFontSize = (size: keyof typeof Typography.fontSize) => {
  return Typography.fontSize[size];
};

// Get responsive spacing
export const getResponsiveSpacing = (size: keyof typeof Spacing) => {
  const baseSpacing = Spacing[size];
  return isTablet ? baseSpacing + 4 : baseSpacing;
};

// Create theme variant (for future theming support)
export const createTheme = (overrides: Partial<typeof Colors> = {}) => ({
  ...Colors,
  ...overrides,
});

// Export everything for easy imports
export default {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  SharedStyles,
  DeviceUtils,
  getResponsiveStyle,
  getCardColor,
  getLevelColor,
  getResponsiveFontSize,
  getResponsiveSpacing,
  createTheme,
};