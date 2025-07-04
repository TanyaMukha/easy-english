import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SharedStyles, Colors, Spacing, Typography } from '../../styles/SharedStyles';
import { Dictionary } from '../../data/DataModels';
import { DictionaryCreateRequest, dictionaryService, DictionaryUpdateRequest } from '../../services/database';
import { generateGuid } from 'utils/guid';

interface DictionaryFormProps {
  dictionary?: Dictionary; // If provided, form is in edit mode
  onSave: (dictionary: Dictionary) => void;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * Single Responsibility: Handle dictionary creation and editing
 * Open/Closed: Can be extended with additional form fields
 * Interface Segregation: Only requires form-related props
 */
const DictionaryForm: React.FC<DictionaryFormProps> = ({
  dictionary,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [title, setTitle] = useState(dictionary?.title || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});

  const isEditMode = !!dictionary;

  // Reset form when dictionary changes
  useEffect(() => {
    setTitle(dictionary?.title || '');
    setErrors({});
  }, [dictionary]);

  const validateForm = (): boolean => {
    const newErrors: { title?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let response;

      if (isEditMode && dictionary) {
        // Update existing dictionary
        const updateRequest: DictionaryUpdateRequest = {
          title: title.trim(),
        };
        response = await dictionaryService.updateDictionary(dictionary.id, updateRequest);
      } else {
        // Create new dictionary
        const createRequest: DictionaryCreateRequest = {
          title: title.trim(),
          guid: generateGuid(),
        };
        response = await dictionaryService.createDictionary(createRequest);
      }

      if (response.success && response.data) {
        onSave(response.data?.[0] as Dictionary);
      } else {
        Alert.alert(
          'Error',
          response.error || 'An unexpected error occurred',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to save dictionary. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (title !== (dictionary?.title || '')) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: onCancel },
        ]
      );
    } else {
      onCancel();
    }
  };

  const isFormValid = title.trim().length > 0 && Object.keys(errors).length === 0;
  const hasChanges = title !== (dictionary?.title || '');

  return (
    <ScrollView style={SharedStyles.container} contentContainerStyle={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[SharedStyles.h2, SharedStyles.textPrimary]}>
            {isEditMode ? 'Edit Dictionary' : 'Create Dictionary'}
          </Text>
          <Text style={[SharedStyles.bodyMedium, SharedStyles.textSecondary]}>
            {isEditMode 
              ? 'Update your dictionary information'
              : 'Create a new dictionary to organize your vocabulary'
            }
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* Title Field */}
          <View style={styles.fieldContainer}>
            <Text style={[SharedStyles.bodyMedium, SharedStyles.textPrimary, styles.label]}>
              Dictionary Title *
            </Text>
            <TextInput
              style={[
                SharedStyles.input,
                errors.title && styles.inputError
              ]}
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (errors.title) {
                  setErrors(prev => {
                    const { title, ...rest } = prev;
                    return rest;
                  });
                }
              }}
              placeholder="Enter dictionary title..."
              placeholderTextColor={Colors.inputPlaceholder}
              maxLength={100}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!loading && !isSubmitting}
            />
            {errors.title && (
              <Text style={[SharedStyles.bodySmall, styles.errorText]}>
                {errors.title}
              </Text>
            )}
            <Text style={[SharedStyles.caption, SharedStyles.textTertiary, styles.helperText]}>
              {title.length}/100 characters
            </Text>
          </View>

          {/* Future fields can be added here */}
          {/* Description, Language, Icon, etc. */}
        </View>

        {/* Preview Section */}
        {title.trim() && (
          <View style={styles.preview}>
            <Text style={[SharedStyles.bodyMedium, SharedStyles.textPrimary, styles.previewLabel]}>
              Preview
            </Text>
            <View style={[SharedStyles.card, styles.previewCard]}>
              <View style={styles.previewHeader}>
                <View style={styles.previewIcon}>
                  <Ionicons name="book" size={24} color={Colors.primary} />
                </View>
                <View style={styles.previewContent}>
                  <Text style={[SharedStyles.h4, SharedStyles.textPrimary]} numberOfLines={2}>
                    {title.trim()}
                  </Text>
                  <Text style={[SharedStyles.bodySmall, SharedStyles.textTertiary]}>
                    {isEditMode ? 'Updated' : 'Created'} just now
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[SharedStyles.button, SharedStyles.buttonOutline, styles.cancelButton]}
          onPress={handleCancel}
          disabled={loading || isSubmitting}
          activeOpacity={0.7}
        >
          <Text style={[SharedStyles.buttonText, { color: Colors.textSecondary }]}>
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            SharedStyles.button,
            SharedStyles.buttonPrimary,
            styles.saveButton,
            (!isFormValid || !hasChanges || isSubmitting) && SharedStyles.buttonDisabled
          ]}
          onPress={handleSave}
          disabled={!isFormValid || !hasChanges || loading || isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <View style={styles.loadingContainer}>
              <Text style={[SharedStyles.buttonText, { marginRight: Spacing.sm }]}>
                {isEditMode ? 'Updating...' : 'Creating...'}
              </Text>
            </View>
          ) : (
            <Text style={SharedStyles.buttonText}>
              {isEditMode ? 'Update Dictionary' : 'Create Dictionary'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = {
  container: {
    flexGrow: 1,
    padding: Spacing.lg,
  },
  content: {
    flex: 1,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  form: {
    marginBottom: Spacing.xl,
  },
  fieldContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: Typography.weightMedium,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorBg,
  },
  errorText: {
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  helperText: {
    marginTop: Spacing.xs,
    textAlign: 'right' as const,
  },
  preview: {
    marginBottom: Spacing.xl,
  },
  previewLabel: {
    marginBottom: Spacing.md,
    fontWeight: Typography.weightMedium,
  },
  previewCard: {
    padding: Spacing.lg,
  },
  previewHeader: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
  },
  previewIcon: {
    width: 40,
    height: 40,
    backgroundColor: Colors.primary + '20',
    borderRadius: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: Spacing.md,
  },
  previewContent: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row' as const,
    gap: Spacing.md,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
  loadingContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
};

export default DictionaryForm;