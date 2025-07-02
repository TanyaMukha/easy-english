import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SharedStyles, Colors, Spacing, DeviceUtils } from '../../../services/database/styles/SharedStyles';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: string;
  buttonText?: string;
  onButtonPress?: () => void;
  showButton?: boolean;
}

/**
 * Single Responsibility: Display empty state with optional action
 * Open/Closed: Can be extended with different empty state styles
 * Interface Segregation: Only requires empty state data
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon = 'folder-open-outline',
  buttonText,
  onButtonPress,
  showButton = true,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={DeviceUtils.getValue(48, 56)} color={Colors.textTertiary} />
        </View>

        {/* Title */}
        <Text style={[SharedStyles.h4, SharedStyles.textPrimary, styles.title]}>
          {title}
        </Text>

        {/* Message */}
        <Text style={[SharedStyles.bodyMedium, SharedStyles.textSecondary, styles.message]}>
          {message}
        </Text>

        {/* Action Button */}
        {showButton && buttonText && onButtonPress && (
          <TouchableOpacity
            style={[SharedStyles.button, SharedStyles.buttonPrimary, styles.button]}
            onPress={onButtonPress}
            activeOpacity={0.8}
          >
            <Text style={[SharedStyles.buttonText]}>
              {buttonText}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: Spacing.xl,
  },
  content: {
    alignItems: 'center' as const,
    maxWidth: DeviceUtils.getValue(280, 320),
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  title: {
    textAlign: 'center' as const,
    marginBottom: Spacing.md,
  },
  message: {
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  button: {
    minWidth: DeviceUtils.getValue(140, 160),
  },
};

export default EmptyState;