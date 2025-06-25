import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlobalStyles, Colors, Spacing, DeviceUtils } from '../styles/GlobalStyles';

interface HomeHeaderProps {
  greeting?: string;
  subtitle?: string;
  onProfilePress: () => void;
  profileIcon?: string;
}

/**
 * Single Responsibility: Display the home screen header with greeting and profile button
 * Open/Closed: Can be extended with additional header elements
 * Interface Segregation: Only requires header-specific props
 */
const HomeHeader: React.FC<HomeHeaderProps> = ({
  greeting = 'Good morning! 👋',
  subtitle = 'Ready to learn some English?',
  onProfilePress,
  profileIcon = 'person-circle'
}) => {
  return (
    <View style={[styles.container, GlobalStyles.paddingHorizontalLg]}>
      <View style={styles.textContainer}>
        <Text style={[GlobalStyles.h2, GlobalStyles.textPrimary]}>
          {greeting}
        </Text>
        <Text style={[GlobalStyles.bodyMedium, GlobalStyles.textSecondary]}>
          {subtitle}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.profileButton}
        onPress={onProfilePress}
        activeOpacity={0.7}
      >
        <Ionicons name={profileIcon as any} size={40} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  container: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingTop: DeviceUtils.isIOS ? 60 : 40,
    paddingBottom: Spacing.lg,
  },
  textContainer: {
    flex: 1,
  },
  profileButton: {
    padding: Spacing.xs,
  },
};

export default HomeHeader;