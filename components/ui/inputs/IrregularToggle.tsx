// components/features/dictionary/IrregularToggle.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlobalStyles, Colors, Spacing, BorderRadius } from '../../../styles/GlobalStyles';

interface IrregularToggleProps {
  label: string;
  isIrregular: boolean;
  setIsIrregular: (value: boolean) => void;
  disabled?: boolean;
}

/**
 * Toggle component for irregular word setting
 * Single Responsibility: Handle irregular word toggle state
 */
const IrregularToggle: React.FC<IrregularToggleProps> = ({
  label,
  isIrregular,
  setIsIrregular,
  disabled = false,
}) => {
  const handleToggle = () => {
    if (!disabled) {
      setIsIrregular(!isIrregular);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        disabled && styles.containerDisabled
      ]}
      onPress={handleToggle}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={[GlobalStyles.bodyMedium, GlobalStyles.textPrimary]}>
            {label}
          </Text>
          <Text style={[GlobalStyles.bodySmall, GlobalStyles.textSecondary]}>
            Mark if this word has irregular forms
          </Text>
        </View>
        
        <View style={[
          styles.toggle,
          isIrregular && styles.toggleActive,
          disabled && styles.toggleDisabled
        ]}>
          <View style={[
            styles.toggleThumb,
            isIrregular && styles.toggleThumbActive
          ]} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = {
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  containerDisabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  textContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center' as const,
    paddingHorizontal: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  toggleDisabled: {
    backgroundColor: Colors.backgroundSecondary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignSelf: 'flex-start' as const,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end' as const,
  },
};

export default IrregularToggle;