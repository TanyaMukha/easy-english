import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SharedStyles, Colors, Spacing } from '../../../services/database/styles/SharedStyles';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

/**
 * Single Responsibility: Display loading state with spinner and message
 * Open/Closed: Can be extended with different loading styles
 * Interface Segregation: Only requires loading-related props
 */
const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading your learning data...',
  size = 'large',
  color = Colors.primary
}) => {
  return (
    <View style={SharedStyles.loadingContainer}>
      <ActivityIndicator size={size} color={color} />
      <Text style={[SharedStyles.bodyMedium, SharedStyles.textSecondary, styles.message]}>
        {message}
      </Text>
    </View>
  );
};

const styles = {
  message: {
    marginTop: Spacing.md,
    textAlign: 'center' as const,
  },
};

export default LoadingState;