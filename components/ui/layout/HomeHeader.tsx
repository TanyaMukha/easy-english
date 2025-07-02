// components/ui/navigation/HomeHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import {
  Colors,
  SharedStyles,
  Spacing,
  Typography,
  DeviceUtils,
  isTablet,
} from '../../../services/database/styles/SharedStyles';

interface HomeHeaderProps {
  userName?: string;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
  showNotifications?: boolean;
  notificationCount?: number;
}

/**
 * Home Header Component
 * Single Responsibility: Provide home screen specific header
 * Open/Closed: Can be extended with additional home features
 */
const HomeHeader: React.FC<HomeHeaderProps> = ({
  userName,
  onProfilePress,
  onNotificationPress,
  showNotifications = false,
  notificationCount = 0,
}) => {
  const { t } = useTranslation();

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home.goodMorning', 'Good morning');
    if (hour < 18) return t('home.goodAfternoon', 'Good afternoon');
    return t('home.goodEvening', 'Good evening');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Left Side - Greeting */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>
            {getGreeting()}
          </Text>
          {userName && (
            <Text style={styles.userName}>
              {userName}! 👋
            </Text>
          )}
        </View>

        {/* Right Side - Actions */}
        <View style={styles.actionsContainer}>
          {/* Notifications */}
          {showNotifications && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onNotificationPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessible={true}
              accessibilityLabel={`Notifications${notificationCount > 0 ? `, ${notificationCount} unread` : ''}`}
              accessibilityRole="button"
            >
              <Ionicons
                name={notificationCount > 0 ? "notifications" : "notifications-outline"}
                size={24}
                color={Colors.textPrimary}
              />
              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationCount}>
                    {notificationCount > 99 ? '99+' : notificationCount.toString()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* Profile */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onProfilePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessible={true}
            accessibilityLabel="Profile"
            accessibilityRole="button"
          >
            <Ionicons
              name="person-circle-outline"
              size={28}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    paddingTop: isTablet ? Spacing.xl : Spacing.lg,
    paddingBottom: Spacing.md,
  },
  
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
  },
  
  greetingContainer: {
    flex: 1,
  },
  
  greeting: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  
  userName: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    position: 'relative',
  },
  
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  
  notificationCount: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});

export default HomeHeader;