// components/ui/navigation/ScreenHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import {
  Colors,
  SharedStyles,
  Spacing,
  Typography,
  DeviceUtils,
} from '../../../styles/SharedStyles';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
  backgroundColor?: string;
  centerTitle?: boolean;
}

/**
 * Screen Header Component
 * Single Responsibility: Provide consistent header layout for screens
 * Open/Closed: Can be extended with additional header features
 */
const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  showBack = true,
  onBackPress,
  rightComponent,
  leftComponent,
  backgroundColor = Colors.background,
  centerTitle = false,
}) => {
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        {/* Left Side */}
        <View style={styles.leftContainer}>
          {leftComponent ? (
            leftComponent
          ) : showBack ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessible={true}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={Colors.text}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>

        {/* Center */}
        <View style={[styles.centerContainer, centerTitle && styles.centered]}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Side */}
        <View style={styles.rightContainer}>
          {rightComponent || <View style={styles.placeholder} />}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: DeviceUtils.isTablet ? Spacing.lg : Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  
  leftContainer: {
    width: 48,
    alignItems: 'flex-start',
  },
  
  centerContainer: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
  },
  
  centered: {
    alignItems: 'center',
  },
  
  rightContainer: {
    width: 48,
    alignItems: 'flex-end',
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    textAlign: 'left',
  },
  
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'left',
  },
  
  placeholder: {
    width: 40,
    height: 40,
  },
});

export default ScreenHeader;