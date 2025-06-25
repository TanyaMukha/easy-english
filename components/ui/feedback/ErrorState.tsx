import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { GlobalStyles, Spacing } from '../../../styles/GlobalStyles';

interface ErrorStateProps {
  title?: string;
  message?: string;
  buttonText?: string;
  onRetry: () => void;
}

/**
 * Single Responsibility: Display error state with retry option
 * Open/Closed: Can be extended with different error display styles
 * Interface Segregation: Only requires error-related props
 */
const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load data',
  message,
  buttonText = 'Try Again',
  onRetry
}) => {
  return (
    <View style={GlobalStyles.screenCentered}>
      <Text style={[GlobalStyles.h3, GlobalStyles.textError]}>
        {title}
      </Text>
      {message && (
        <Text style={[GlobalStyles.bodyMedium, GlobalStyles.textSecondary, styles.message]}>
          {message}
        </Text>
      )}
      <TouchableOpacity 
        style={[GlobalStyles.button, GlobalStyles.buttonPrimary, styles.button]}
        onPress={onRetry}
        activeOpacity={0.8}
      >
        <Text style={GlobalStyles.buttonText}>
          {buttonText}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  message: {
    marginTop: Spacing.md,
    textAlign: 'center' as const,
  },
  button: {
    marginTop: Spacing.lg,
  },
};

export default ErrorState;