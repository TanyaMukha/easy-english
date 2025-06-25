// components/FilterModal.tsx

import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlobalStyles, Colors, Spacing, Shadows } from '../../styles/GlobalStyles';
import { PartOfSpeech, Level, WordFilters } from '../../data/DataModels';

interface FilterModalProps {
  visible: boolean;
  filters: WordFilters;
  onFiltersChange?: (filters: WordFilters) => void;
  onClose: () => void;
}

/**
 * Single Responsibility: Provide filtering interface for words
 * Open/Closed: Can be extended with additional filter options
 * Interface Segregation: Only requires filter-related props
 */
const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  filters,
  onFiltersChange,
  onClose,
}) => {
  const updateFilters = (updates: Partial<WordFilters>) => {
    onFiltersChange && onFiltersChange({ ...filters, ...updates });
  };

  const resetFilters = () => {
    onFiltersChange && onFiltersChange({
      partOfSpeech: [],
      level: [],
      isIrregular: undefined,
      tagIds: [],
      sortBy: 'word',
      sortOrder: 'asc',
    });
  };

  const partOfSpeechOptions = Object.values(PartOfSpeech);
  const levelOptions = Object.values(Level);
  const sortOptions = [
    { key: 'word', label: 'Alphabetical' },
    { key: 'createdAt', label: 'Date Added' },
    { key: 'reviewCount', label: 'Review Count' },
    { key: 'rate', label: 'Progress' },
  ] as const;

  const renderCheckboxOption = (
    value: string,
    isSelected: boolean,
    onToggle: () => void,
    label?: string
  ) => (
    <TouchableOpacity
      key={value}
      style={styles.checkboxOption}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
        {isSelected && (
          <Ionicons name="checkmark" size={16} color={Colors.textPrimary} />
        )}
      </View>
      <Text style={[GlobalStyles.bodyMedium, GlobalStyles.textPrimary]}>
        {label || value}
      </Text>
    </TouchableOpacity>
  );

  // Safe getters for array filters
  const getPartOfSpeechFilters = (): PartOfSpeech[] => filters.partOfSpeech || [];
  const getLevelFilters = (): Level[] => filters.level || [];
  const getTagFilters = (): number[] => filters.tagIds || [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={GlobalStyles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          
          <Text style={[GlobalStyles.h3, GlobalStyles.textPrimary]}>
            Filters
          </Text>
          
          <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
            <Text style={[GlobalStyles.bodyMedium, { color: Colors.primary }]}>
              Reset
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={GlobalStyles.flex1} contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <Text style={[GlobalStyles.h5, GlobalStyles.textPrimary, styles.sectionTitle]}>
              Part of Speech
            </Text>
            <View style={styles.optionsGrid}>
              {partOfSpeechOptions.map(pos => {
                const currentFilters = getPartOfSpeechFilters();
                return renderCheckboxOption(
                  pos,
                  currentFilters.includes(pos),
                  () => {
                    const newPOS = currentFilters.includes(pos)
                      ? currentFilters.filter(p => p !== pos)
                      : [...currentFilters, pos];
                    updateFilters({ partOfSpeech: newPOS });
                  }
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[GlobalStyles.h5, GlobalStyles.textPrimary, styles.sectionTitle]}>
              Level
            </Text>
            <View style={styles.optionsRow}>
              {levelOptions.map(level => {
                const currentFilters = getLevelFilters();
                return renderCheckboxOption(
                  level,
                  currentFilters.includes(level),
                  () => {
                    const newLevels = currentFilters.includes(level)
                      ? currentFilters.filter(l => l !== level)
                      : [...currentFilters, level];
                    updateFilters({ level: newLevels });
                  }
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[GlobalStyles.h5, GlobalStyles.textPrimary, styles.sectionTitle]}>
              Word Type
            </Text>
            <View style={styles.optionsColumn}>
              {renderCheckboxOption(
                'irregular',
                filters.isIrregular === true,
                () => updateFilters({ 
                  isIrregular: filters.isIrregular === true ? undefined : true 
                }),
                'Irregular words only'
              )}
              {renderCheckboxOption(
                'regular',
                filters.isIrregular === false,
                () => updateFilters({ 
                  isIrregular: filters.isIrregular === false ? undefined : false 
                }),
                'Regular words only'
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[GlobalStyles.h5, GlobalStyles.textPrimary, styles.sectionTitle]}>
              Sort By
            </Text>
            <View style={styles.optionsColumn}>
              {sortOptions.map(option => 
                renderCheckboxOption(
                  option.key,
                  filters.sortBy === option.key,
                  () => updateFilters({ sortBy: option.key }),
                  option.label
                )
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[GlobalStyles.h5, GlobalStyles.textPrimary, styles.sectionTitle]}>
              Sort Order
            </Text>
            <View style={styles.optionsRow}>
              {renderCheckboxOption(
                'asc',
                filters.sortOrder === 'asc',
                () => updateFilters({ sortOrder: 'asc' }),
                'Ascending'
              )}
              {renderCheckboxOption(
                'desc',
                filters.sortOrder === 'desc',
                () => updateFilters({ sortOrder: 'desc' }),
                'Descending'
              )}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[GlobalStyles.button, GlobalStyles.buttonPrimary]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={GlobalStyles.buttonText}>
              Apply Filters
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  closeButton: {
    padding: Spacing.xs,
    minWidth: 44,
  },
  resetButton: {
    padding: Spacing.xs,
    minWidth: 44,
    alignItems: 'flex-end' as const,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  optionsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: Spacing.sm,
  },
  optionsRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: Spacing.md,
  },
  optionsColumn: {
    gap: Spacing.sm,
  },
  checkboxOption: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    minWidth: 120,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadows.medium,
  },
};

export default FilterModal;