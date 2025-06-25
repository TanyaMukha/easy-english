import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlobalStyles, Colors, Spacing, DeviceUtils } from '../styles/GlobalStyles';

interface QuickActionButtonProps {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
}

/**
 * Single Responsibility: Display an action button with icon, title and subtitle
 * Open/Closed: Can be extended with new button styles without modification
 * Interface Segregation: Only requires action-related props
 */
const QuickActionButton: React.FC<QuickActionButtonProps> = ({ 
  title, 
  subtitle, 
  icon, 
  color, 
  onPress,
  disabled = false
}) => {
  return (
    <TouchableOpacity 
      style={[GlobalStyles.card, styles.container]} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={28} color={color} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[GlobalStyles.bodyLarge, GlobalStyles.textPrimary, styles.title]}>
            {title}
          </Text>
          <Text style={[GlobalStyles.bodySmall, GlobalStyles.textSecondary]}>
            {subtitle}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = {
  container: {
    marginBottom: Spacing.md,
  },
  content: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  iconContainer: {
    width: DeviceUtils.getValue(48, 56),
    height: DeviceUtils.getValue(48, 56),
    borderRadius: DeviceUtils.getValue(24, 28),
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  textContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  title: {
    fontWeight: '600' as const,
  },
};

export default QuickActionButton;