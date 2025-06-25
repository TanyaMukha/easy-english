import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlobalStyles, Colors, Spacing, DeviceUtils } from '../styles/GlobalStyles';

interface QuickStatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
}

/**
 * Single Responsibility: Display a quick stat with icon and value
 * Open/Closed: Can be extended with new props without modifying existing code
 * Interface Segregation: Only requires necessary props
 */
const QuickStatsCard: React.FC<QuickStatsCardProps> = ({
  title,
  value,
  icon,
  color = Colors.primary,
}) => {
  return (
    <View style={[GlobalStyles.card, styles.container]}>
      <View style={[GlobalStyles.flexRow, { alignItems: 'center' }]}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        <View style={styles.contentContainer}>
          <Text style={[GlobalStyles.h3, { color }]}>{value}</Text>
          <Text style={[GlobalStyles.bodySmall, GlobalStyles.textSecondary]}>
            {title}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = {
  container: {
    flex: 0.48,
    minHeight: DeviceUtils.getValue(80, 90),
  },
  iconContainer: {
    width: DeviceUtils.getValue(40, 48),
    height: DeviceUtils.getValue(40, 48),
    borderRadius: DeviceUtils.getValue(20, 24),
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  contentContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
};

export default QuickStatsCard;