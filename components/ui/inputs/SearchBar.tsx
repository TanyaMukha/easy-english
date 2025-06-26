import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SharedStyles, Colors, Spacing, Typography } from '../../../styles/SharedStyles';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  showFilterButton?: boolean;
  onFilterPress?: () => void;
  showClearButton?: boolean;
  onClear?: () => void;
  autoFocus?: boolean;
  editable?: boolean;
}

/**
 * Single Responsibility: Provide search input functionality
 * Open/Closed: Can be extended with additional search features
 * Interface Segregation: Only requires search-related props
 */
const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  showFilterButton = true,
  onFilterPress,
  showClearButton = true,
  onClear,
  autoFocus = false,
  editable = true,
}) => {
  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  const hasValue = value.length > 0;

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={[styles.inputContainer, !editable && styles.inputDisabled]}>
        <Ionicons name="search" size={20} color={Colors.textTertiary} style={styles.searchIcon} />
        
        <TextInput
          style={[SharedStyles.bodyMedium, styles.input]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.inputPlaceholder}
          autoFocus={autoFocus}
          editable={editable}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Clear Button */}
        {showClearButton && hasValue && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Button */}
      {showFilterButton && onFilterPress && (
        <TouchableOpacity
          style={styles.filterButton}
          onPress={onFilterPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="filter" size={20} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = {
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing.md,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 44,
  },
  inputDisabled: {
    backgroundColor: Colors.backgroundSecondary,
    opacity: 0.6,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.bodyMedium,
    fontFamily: Typography.fontRegular,
    padding: 0, // Remove default padding
    margin: 0, // Remove default margin
  },
  clearButton: {
    marginLeft: Spacing.sm,
    padding: 2,
  },
  filterButton: {
    backgroundColor: Colors.primary + '20',
    borderRadius: 12,
    padding: Spacing.sm,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    minWidth: 44,
    minHeight: 44,
  },
};

export default SearchBar;