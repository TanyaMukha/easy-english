// styles/GlobalStyles.ts
import { StyleSheet, Dimensions, Platform } from 'react-native';

// Device dimensions and breakpoints
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth >= 768;
const isLargeTablet = screenWidth >= 1024;

// Color palette for dark theme
export const Colors = {
  // Primary colors
  primary: '#6366F1', // Indigo
  primaryLight: '#8B8CF8',
  primaryDark: '#4F46E5',
  primaryBg: '#1E1B4B',

  // Secondary colors  
  secondary: '#EC4899', // Pink
  secondaryLight: '#F472B6',
  secondaryDark: '#DB2777',

  // Accent colors
  accent: '#06B6D4', // Cyan
  accentLight: '#22D3EE',
  accentDark: '#0891B2',

  // Background colors
  background: '#0F0F23', // Very dark blue
  backgroundSecondary: '#1A1B3A',
  backgroundTertiary: '#252653',
  surface: '#1E1F42',
  surfaceLight: '#2A2B5A',

  // Text colors
  textPrimary: '#F8FAFC', // Almost white
  textSecondary: '#CBD5E1', // Light gray
  textTertiary: '#94A3B8', // Medium gray
  textMuted: '#64748B', // Dark gray
  textDisabled: '#475569',

  // Semantic colors
  success: '#10B981', // Green
  successLight: '#34D399',
  successDark: '#059669',
  successBg: '#064E3B',

  warning: '#F59E0B', // Amber
  warningLight: '#FBBF24',
  warningDark: '#D97706',
  warningBg: '#451A03',

  error: '#EF4444', // Red
  errorLight: '#F87171',
  errorDark: '#DC2626',
  errorBg: '#450A0A',

  info: '#3B82F6', // Blue
  infoLight: '#60A5FA',
  infoDark: '#2563EB',
  infoBg: '#1E3A8A',

  // Border colors
  border: '#334155',
  borderLight: '#475569',
  borderDark: '#1E293B',

  // Input colors
  inputBackground: '#1E293B',
  inputBorder: '#475569',
  inputFocus: '#6366F1',
  inputPlaceholder: '#64748B',

  // Progress colors
  progressBackground: '#1E293B',
  progressFill: '#6366F1',

  // Shadow color
  shadow: '#000000',

  // Level colors for language learning
  levelA1: '#10B981', // Green
  levelA2: '#06B6D4', // Cyan  
  levelB1: '#3B82F6', // Blue
  levelB2: '#8B5CF6', // Purple
  levelC1: '#F59E0B', // Orange
  levelC2: '#EF4444', // Red
};

// Typography scale
export const Typography = {
  // Font families
  fontRegular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  fontMedium: Platform.select({
    ios: 'System',
    android: 'Roboto_medium',
    default: 'System',
  }),
  fontBold: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  fontMono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),

  // Font sizes
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
  overline: isTablet ? 11 : 9,

  // Line heights
  lineHeightTight: 1.2,
  lineHeightNormal: 1.4,
  lineHeightRelaxed: 1.6,
  lineHeightLoose: 1.8,

  // Font weights
  weightLight: '300' as const,
  weightRegular: '400' as const,
  weightMedium: '500' as const,
  weightSemiBold: '600' as const,
  weightBold: '700' as const,
  weightExtraBold: '800' as const,
};

// Spacing scale (8pt grid system)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,

  // Component specific spacing
  cardPadding: isTablet ? 20 : 16,
  screenPadding: isTablet ? 24 : 16,
  sectionSpacing: isTablet ? 32 : 24,
  itemSpacing: isTablet ? 16 : 12,
};

// Border radius
export const BorderRadius = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 999,
};

// Shadows
export const Shadows = {
  small: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  medium: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  large: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  xl: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 10.32,
    elevation: 16,
  },
};

// Global styles
export const GlobalStyles = StyleSheet.create({
  // Layout
  flex1: {
    flex: 1,
  },
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
  flexSpaceBetween: {
    justifyContent: 'space-between',
  },
  flexSpaceAround: {
    justifyContent: 'space-around',
  },
  flexSpaceEvenly: {
    justifyContent: 'space-evenly',
  },
  flexWrap: {
    flexWrap: 'wrap',
  },

  // Container styles
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  containerPadded: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.screenPadding,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Screen styles
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.screenPadding,
  },
  screenCentered: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
  },

  // Card styles
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.cardPadding,
    ...Shadows.medium,
  },
  cardSmall: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Shadows.small,
  },
  cardLarge: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.large,
  },

  // Typography styles
  h1: {
    fontSize: Typography.h1,
    fontWeight: Typography.weightBold,
    color: Colors.textPrimary,
    lineHeight: Typography.h1 * Typography.lineHeightTight,
    fontFamily: Typography.fontBold,
  },
  h2: {
    fontSize: Typography.h2,
    fontWeight: Typography.weightBold,
    color: Colors.textPrimary,
    lineHeight: Typography.h2 * Typography.lineHeightTight,
    fontFamily: Typography.fontBold,
  },
  h3: {
    fontSize: Typography.h3,
    fontWeight: Typography.weightSemiBold,
    color: Colors.textPrimary,
    lineHeight: Typography.h3 * Typography.lineHeightTight,
    fontFamily: Typography.fontMedium,
  },
  h4: {
    fontSize: Typography.h4,
    fontWeight: Typography.weightSemiBold,
    color: Colors.textPrimary,
    lineHeight: Typography.h4 * Typography.lineHeightNormal,
    fontFamily: Typography.fontMedium,
  },
  h5: {
    fontSize: Typography.h5,
    fontWeight: Typography.weightMedium,
    color: Colors.textPrimary,
    lineHeight: Typography.h5 * Typography.lineHeightNormal,
    fontFamily: Typography.fontMedium,
  },
  h6: {
    fontSize: Typography.h6,
    fontWeight: Typography.weightMedium,
    color: Colors.textPrimary,
    lineHeight: Typography.h6 * Typography.lineHeightNormal,
    fontFamily: Typography.fontMedium,
  },

  bodyLarge: {
    fontSize: Typography.bodyLarge,
    fontWeight: Typography.weightRegular,
    color: Colors.textPrimary,
    lineHeight: Typography.bodyLarge * Typography.lineHeightNormal,
    fontFamily: Typography.fontRegular,
  },
  bodyMedium: {
    fontSize: Typography.bodyMedium,
    fontWeight: Typography.weightRegular,
    color: Colors.textPrimary,
    lineHeight: Typography.bodyMedium * Typography.lineHeightNormal,
    fontFamily: Typography.fontRegular,
  },
  bodySmall: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.weightRegular,
    color: Colors.textSecondary,
    lineHeight: Typography.bodySmall * Typography.lineHeightNormal,
    fontFamily: Typography.fontRegular,
  },

  caption: {
    fontSize: Typography.caption,
    fontWeight: Typography.weightRegular,
    color: Colors.textTertiary,
    lineHeight: Typography.caption * Typography.lineHeightNormal,
    fontFamily: Typography.fontRegular,
  },

  // Text color variations
  textPrimary: { color: Colors.textPrimary },
  textSecondary: { color: Colors.textSecondary },
  textTertiary: { color: Colors.textTertiary },
  textMuted: { color: Colors.textMuted },
  textDisabled: { color: Colors.textDisabled },
  textSuccess: { color: Colors.success },
  textWarning: { color: Colors.warning },
  textError: { color: Colors.error },
  textInfo: { color: Colors.info },
  textAccent: { color: Colors.accent },

  // Text alignment
  textCenter: { textAlign: 'center' },
  textLeft: { textAlign: 'left' },
  textRight: { textAlign: 'right' },

  // Button styles
  button: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: isTablet ? 52 : 44,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  buttonSecondary: {
    backgroundColor: Colors.secondary,
  },
  buttonAccent: {
    backgroundColor: Colors.accent,
  },
  buttonSuccess: {
    backgroundColor: Colors.success,
  },
  buttonWarning: {
    backgroundColor: Colors.warning,
  },
  buttonError: {
    backgroundColor: Colors.error,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    backgroundColor: Colors.backgroundTertiary,
    opacity: 0.6,
  },

  buttonText: {
    fontSize: Typography.bodyMedium,
    fontWeight: Typography.weightSemiBold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontMedium,
  },

  // Enhanced input styles with multiline support
  input: {
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.bodyMedium,
    color: Colors.textPrimary,
    fontFamily: Typography.fontRegular,
    minHeight: isTablet ? 52 : 44,
    // Enhanced for multiline support
    textAlignVertical: 'top', // Align text to top for multiline
    lineHeight: Typography.bodyMedium * Typography.lineHeightNormal,
  },
  
  // Single line input (for fields that should stay single line)
  inputSingleLine: {
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.bodyMedium,
    color: Colors.textPrimary,
    fontFamily: Typography.fontRegular,
    minHeight: isTablet ? 52 : 44,
    maxHeight: isTablet ? 52 : 44, // Prevent expansion
  },

  // Multiline input for longer text
  inputMultiline: {
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.bodyMedium,
    color: Colors.textPrimary,
    fontFamily: Typography.fontRegular,
    minHeight: isTablet ? 52 : 44,
    maxHeight: isTablet ? 150 : 120, // Allow expansion but limit max height
    textAlignVertical: 'top',
    lineHeight: Typography.bodyMedium * Typography.lineHeightNormal,
  },

  // Text area for longer content
  textArea: {
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.bodyMedium,
    color: Colors.textPrimary,
    fontFamily: Typography.fontRegular,
    minHeight: isTablet ? 100 : 80,
    maxHeight: isTablet ? 200 : 160,
    textAlignVertical: 'top',
    lineHeight: Typography.bodyMedium * Typography.lineHeightNormal,
  },

  inputFocused: {
    borderColor: Colors.inputFocus,
    backgroundColor: Colors.backgroundTertiary,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorBg,
  },
  inputDisabled: {
    backgroundColor: Colors.backgroundSecondary,
    color: Colors.textDisabled,
  },

  // List styles
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingVertical: Spacing.md,
  },
  listItem: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  listItemLast: {
    marginBottom: 0,
  },

  // Separator
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  separatorVertical: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },

  // Progress bar
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.progressBackground,
    borderRadius: BorderRadius.xs,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.progressFill,
    borderRadius: BorderRadius.xs,
  },

  // Badge
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    minWidth: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: Typography.caption,
    fontWeight: Typography.weightSemiBold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontMedium,
  },

  // Level-specific styles
  levelA1: { color: Colors.levelA1 },
  levelA2: { color: Colors.levelA2 },
  levelB1: { color: Colors.levelB1 },
  levelB2: { color: Colors.levelB2 },
  levelC1: { color: Colors.levelC1 },
  levelC2: { color: Colors.levelC2 },

  levelBadgeA1: { backgroundColor: Colors.levelA1 },
  levelBadgeA2: { backgroundColor: Colors.levelA2 },
  levelBadgeB1: { backgroundColor: Colors.levelB1 },
  levelBadgeB2: { backgroundColor: Colors.levelB2 },
  levelBadgeC1: { backgroundColor: Colors.levelC1 },
  levelBadgeC2: { backgroundColor: Colors.levelC2 },

  // Animation helpers
  fadeIn: {
    opacity: 1,
  },
  fadeOut: {
    opacity: 0,
  },

  // Utility classes
  hidden: {
    display: 'none',
  },
  absolute: {
    position: 'absolute',
  },
  relative: {
    position: 'relative',
  },
  fullWidth: {
    width: '100%',
  },
  fullHeight: {
    height: '100%',
  },

  // Margins
  marginXs: { margin: Spacing.xs },
  marginSm: { margin: Spacing.sm },
  marginMd: { margin: Spacing.md },
  marginLg: { margin: Spacing.lg },
  marginXl: { margin: Spacing.xl },

  marginTopXs: { marginTop: Spacing.xs },
  marginTopSm: { marginTop: Spacing.sm },
  marginTopMd: { marginTop: Spacing.md },
  marginTopLg: { marginTop: Spacing.lg },
  marginTopXl: { marginTop: Spacing.xl },

  marginBottomXs: { marginBottom: Spacing.xs },
  marginBottomSm: { marginBottom: Spacing.sm },
  marginBottomMd: { marginBottom: Spacing.md },
  marginBottomLg: { marginBottom: Spacing.lg },
  marginBottomXl: { marginBottom: Spacing.xl },

  marginHorizontalXs: { marginHorizontal: Spacing.xs },
  marginHorizontalSm: { marginHorizontal: Spacing.sm },
  marginHorizontalMd: { marginHorizontal: Spacing.md },
  marginHorizontalLg: { marginHorizontal: Spacing.lg },
  marginHorizontalXl: { marginHorizontal: Spacing.xl },

  marginVerticalXs: { marginVertical: Spacing.xs },
  marginVerticalSm: { marginVertical: Spacing.sm },
  marginVerticalMd: { marginVertical: Spacing.md },
  marginVerticalLg: { marginVertical: Spacing.lg },
  marginVerticalXl: { marginVertical: Spacing.xl },

  // Paddings
  paddingXs: { padding: Spacing.xs },
  paddingSm: { padding: Spacing.sm },
  paddingMd: { padding: Spacing.md },
  paddingLg: { padding: Spacing.lg },
  paddingXl: { padding: Spacing.xl },

  paddingTopXs: { paddingTop: Spacing.xs },
  paddingTopSm: { paddingTop: Spacing.sm },
  paddingTopMd: { paddingTop: Spacing.md },
  paddingTopLg: { paddingTop: Spacing.lg },
  paddingTopXl: { paddingTop: Spacing.xl },

  paddingBottomXs: { paddingBottom: Spacing.xs },
  paddingBottomSm: { paddingBottom: Spacing.sm },
  paddingBottomMd: { paddingBottom: Spacing.md },
  paddingBottomLg: { paddingBottom: Spacing.lg },
  paddingBottomXl: { paddingBottom: Spacing.xl },

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
});

// Device-specific utilities
export const DeviceUtils = {
  isTablet,
  isLargeTablet,
  screenWidth,
  screenHeight,
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  
  // Responsive values
  getValue: (mobile: number, tablet: number, largeTablet?: number) => {
    if (isLargeTablet && largeTablet !== undefined) {
      return largeTablet;
    }
    return isTablet ? tablet : mobile;
  },
};

// Helper function to get level color
export const getLevelColor = (level: string): string => {
  switch (level.toUpperCase()) {
    case 'A1': return Colors.levelA1;
    case 'A2': return Colors.levelA2;
    case 'B1': return Colors.levelB1;
    case 'B2': return Colors.levelB2;
    case 'C1': return Colors.levelC1;
    case 'C2': return Colors.levelC2;
    default: return Colors.textSecondary;
  }
};

// Helper function to get level badge style
export const getLevelBadgeStyle = (level: string) => {
  const baseStyle = GlobalStyles.badge;
  const colorStyle = {
    backgroundColor: getLevelColor(level),
  };
  return [baseStyle, colorStyle];
};

export default GlobalStyles;