// components/ui/feedback/EmptyState.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  Colors,
  SharedStyles,
  Spacing,
  Typography,
  BorderRadius,
} from '../../../styles/SharedStyles';

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

/**
 * Empty State Component
 * Single Responsibility: Display empty state with optional actions
 * Open/Closed: Can be extended with different empty state layouts
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon = 'document-outline',
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons
            name={icon}
            size={64}
            color={Colors.textTertiary}
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {title}
        </Text>

        {/* Message */}
        {message && (
          <Text style={styles.message}>
            {message}
          </Text>
        )}

        {/* Actions */}
        {(actionText || secondaryActionText) && (
          <View style={styles.actionsContainer}>
            {actionText && onAction && (
              <TouchableOpacity
                style={[SharedStyles.button, styles.primaryAction]}
                onPress={onAction}
                activeOpacity={0.8}
              >
                <Text style={[SharedStyles.buttonText, styles.primaryActionText]}>
                  {actionText}
                </Text>
              </TouchableOpacity>
            )}

            {secondaryActionText && onSecondaryAction && (
              <TouchableOpacity
                style={[SharedStyles.buttonSecondary, styles.secondaryAction]}
                onPress={onSecondaryAction}
                activeOpacity={0.8}
              >
                <Text style={[SharedStyles.buttonSecondaryText, styles.secondaryActionText]}>
                  {secondaryActionText}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  
  message: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
    marginBottom: Spacing.xl,
  },
  
  actionsContainer: {
    width: '100%',
    gap: Spacing.md,
  },
  
  primaryAction: {
    width: '100%',
  },
  
  primaryActionText: {
    // Uses SharedStyles.buttonText
  },
  
  secondaryAction: {
    width: '100%',
  },
  
  secondaryActionText: {
    // Uses SharedStyles.buttonSecondaryText
  },
});

export default EmptyState;