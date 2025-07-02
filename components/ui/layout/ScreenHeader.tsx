import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SharedStyles, Colors, Spacing, DeviceUtils } from '../../../services/database/styles/SharedStyles';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
  onRightPressAccessibilityLabel?: string;
  backgroundColor?: string;
}

/**
 * Single Responsibility: Display screen header with navigation and actions
 * Open/Closed: Can be extended with additional header elements
 * Interface Segregation: Only requires header-specific props
 */
const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  rightIcon,
  onRightPress,
  onRightPressAccessibilityLabel,
  backgroundColor = Colors.background,
}) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        {/* Left Side - Back Button */}
        <View style={styles.leftSection}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBackPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Center - Title and Subtitle */}
        <View style={styles.centerSection}>
          <Text style={[SharedStyles.h3, SharedStyles.textPrimary, styles.title]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[SharedStyles.bodySmall, SharedStyles.textSecondary, styles.subtitle]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Side - Action Button */}
        <View style={styles.rightSection}>
          {rightIcon && onRightPress && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onRightPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel={onRightPressAccessibilityLabel}
            >
              <Ionicons name={rightIcon as any} size={24} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = {
  container: {
    paddingTop: 20,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  content: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: Spacing.lg,
    minHeight: 44,
  },
  leftSection: {
    width: 44,
    justifyContent: 'center' as const,
    alignItems: 'flex-start' as const,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center' as const,
    paddingHorizontal: Spacing.sm,
  },
  rightSection: {
    width: 44,
    justifyContent: 'center' as const,
    alignItems: 'flex-end' as const,
  },
  backButton: {
    padding: Spacing.xs,
  },
  actionButton: {
    padding: Spacing.xs,
  },
  title: {
    textAlign: 'center' as const,
    fontWeight: '600' as const,
  },
  subtitle: {
    textAlign: 'center' as const,
    marginTop: 2,
  },
};

export default ScreenHeader;