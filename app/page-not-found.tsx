import { View, Text, TouchableOpacity } from 'react-native';
import { Link, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SharedStyles, Colors, Spacing, DeviceUtils } from '../styles/SharedStyles';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Page Not Found',
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.textPrimary,
        }} 
      />
      
      <View style={SharedStyles.container}>
        <View style={styles.content}>
          {/* 404 Icon */}
          <View style={styles.iconContainer}>
            <Ionicons 
              name="search" 
              size={DeviceUtils.getValue(64, 80)} 
              color={Colors.textTertiary} 
            />
          </View>

          {/* Error Message */}
          <Text style={[SharedStyles.h2, SharedStyles.textPrimary, styles.title]}>
            Page Not Found
          </Text>
          
          <Text style={[SharedStyles.bodyMedium, SharedStyles.textSecondary, styles.message]}>
            The page you're looking for doesn't exist or has been moved.
          </Text>

          {/* Navigation Links */}
          <View style={styles.linksContainer as any}>
            <Link href="/" asChild>
              <TouchableOpacity style={[SharedStyles.button, SharedStyles.buttonPrimary, styles.primaryButton]}>
                <Ionicons name="home" size={20} color={Colors.textPrimary} style={styles.buttonIcon} />
                <Text style={SharedStyles.buttonText}>Go to Home</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/dictionaries" asChild>
              <TouchableOpacity style={[SharedStyles.button, SharedStyles.buttonOutline, styles.secondaryButton]}>
                <Ionicons name="book" size={20} color={Colors.primary} style={styles.buttonIcon} />
                <Text style={[SharedStyles.buttonText, { color: Colors.primary }]}>Browse Dictionaries</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/words" asChild>
              <TouchableOpacity style={[SharedStyles.button, SharedStyles.buttonOutline, styles.secondaryButton]}>
                <Ionicons name="library" size={20} color={Colors.primary} style={styles.buttonIcon} />
                <Text style={[SharedStyles.buttonText, { color: Colors.primary }]}>All Words</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={[SharedStyles.bodySmall, SharedStyles.textTertiary, styles.quickActionsTitle]}>
              Quick Actions
            </Text>
            
            <View style={styles.quickActionsList}>
              <Link href="/words/create" asChild>
                <TouchableOpacity style={styles.quickAction}>
                  <Ionicons name="add-circle-outline" size={24} color={Colors.success} />
                  <Text style={[SharedStyles.bodySmall, { color: Colors.success }]}>Add Word</Text>
                </TouchableOpacity>
              </Link>

              <Link href="/dictionaries/create" asChild>
                <TouchableOpacity style={styles.quickAction}>
                  <Ionicons name="create-outline" size={24} color={Colors.accent} />
                  <Text style={[SharedStyles.bodySmall, { color: Colors.accent }]}>New Dictionary</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = {
  content: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    marginBottom: Spacing.xl,
    opacity: 0.7,
  },
  title: {
    textAlign: 'center' as const,
    marginBottom: Spacing.md,
  },
  message: {
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: Spacing.xxxl,
    maxWidth: DeviceUtils.getValue(280, 320),
  },
  linksContainer: {
    width: '100%',
    maxWidth: DeviceUtils.getValue(300, 400),
    gap: Spacing.md,
    marginBottom: Spacing.xxxl,
  },
  primaryButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  secondaryButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  buttonIcon: {
    marginRight: Spacing.sm,
  },
  quickActions: {
    alignItems: 'center' as const,
  },
  quickActionsTitle: {
    marginBottom: Spacing.md,
  },
  quickActionsList: {
    flexDirection: 'row' as const,
    gap: Spacing.xl,
  },
  quickAction: {
    alignItems: 'center' as const,
    gap: Spacing.xs,
  },
};