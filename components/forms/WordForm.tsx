// components/words/WordForm.tsx

import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

import {
  LanguageCode,
  Level,
  PartOfSpeech,
  WordWithExamples,
} from "../../data/DataModels";
import { useWordForm } from "../../hooks/useWordForm";
import {
  Colors,
  GlobalStyles,
  Spacing,
  Typography,
} from "../../styles/GlobalStyles";

interface WordFormProps {
  word?: WordWithExamples;
  dictionaryId: number;
  onSave: (word: WordWithExamples) => void;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * Single Responsibility: Render word creation and editing form
 * Open/Closed: Can be extended with additional form fields
 * Interface Segregation: Only requires word form-related props
 */
const WordForm: React.FC<WordFormProps> = ({
  word,
  dictionaryId,
  onSave,
  onCancel,
  loading = false,
}) => {
  const {
    formData,
    examples,
    isSubmitting,
    errors,
    showAdvanced,
    isFormValid,
    hasChanges,
    updateFormData,
    updateExample,
    addExample,
    removeExample,
    setShowAdvanced,
    handleSave,
    handleCancel,
  } = useWordForm(
    word
      ? { word, dictionaryId, onSave, onCancel }
      : { dictionaryId, onSave, onCancel }
  );

  const isEditMode = !!word;

  const partOfSpeechOptions = Object.values(PartOfSpeech).map((pos) => ({
    label: pos.charAt(0).toUpperCase() + pos.slice(1).replace("_", " "),
    value: pos,
  }));

  const levelOptions = Object.values(Level);
  const languageOptions = [
    { label: "British English", value: LanguageCode.EN_GB },
    { label: "American English", value: LanguageCode.EN_US },
    { label: "Ukrainian", value: LanguageCode.UK_UA },
  ];

  return (
    <KeyboardAvoidingView
      style={GlobalStyles.flex1}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={GlobalStyles.container}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[GlobalStyles.h2, GlobalStyles.textPrimary]}>
              {isEditMode ? "Edit Word" : "Add New Word"}
            </Text>
            <Text style={[GlobalStyles.bodyMedium, GlobalStyles.textSecondary]}>
              {isEditMode
                ? "Update word information and examples"
                : "Add a new word to your vocabulary"}
            </Text>
          </View>

          <View style={styles.section}>
            <Text
              style={[
                GlobalStyles.h4,
                GlobalStyles.textPrimary,
                styles.sectionTitle,
              ]}
            >
              Basic Information
            </Text>

            <View style={styles.fieldContainer}>
              <Text
                style={[
                  GlobalStyles.bodyMedium,
                  GlobalStyles.textPrimary,
                  styles.label,
                ]}
              >
                Word *
              </Text>
              <TextInput
                style={[GlobalStyles.input, errors.word && styles.inputError]}
                value={formData.word}
                onChangeText={(text) => updateFormData("word", text)}
                placeholder="Enter the word..."
                placeholderTextColor={Colors.inputPlaceholder}
                maxLength={100}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading && !isSubmitting}
              />
              {errors.word && (
                <Text style={[GlobalStyles.bodySmall, styles.errorText]}>
                  {errors.word}
                </Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text
                style={[
                  GlobalStyles.bodyMedium,
                  GlobalStyles.textPrimary,
                  styles.label,
                ]}
              >
                Translation *
              </Text>
              <TextInput
                style={[
                  GlobalStyles.input,
                  errors.translation && styles.inputError,
                ]}
                value={formData.translation}
                onChangeText={(text) => updateFormData("translation", text)}
                placeholder="Enter Ukrainian translation..."
                placeholderTextColor={Colors.inputPlaceholder}
                maxLength={200}
                editable={!loading && !isSubmitting}
              />
              {errors.translation && (
                <Text style={[GlobalStyles.bodySmall, styles.errorText]}>
                  {errors.translation}
                </Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text
                style={[
                  GlobalStyles.bodyMedium,
                  GlobalStyles.textPrimary,
                  styles.label,
                ]}
              >
                Transcription
              </Text>
              <TextInput
                style={[
                  GlobalStyles.input,
                  errors.transcription && styles.inputError,
                ]}
                value={formData.transcription}
                onChangeText={(text) => updateFormData("transcription", text)}
                placeholder="[trænskrɪpʃən]"
                placeholderTextColor={Colors.inputPlaceholder}
                maxLength={100}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading && !isSubmitting}
              />
              {errors.transcription && (
                <Text style={[GlobalStyles.bodySmall, styles.errorText]}>
                  {errors.transcription}
                </Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text
                style={[
                  GlobalStyles.bodyMedium,
                  GlobalStyles.textPrimary,
                  styles.label,
                ]}
              >
                Part of Speech *
              </Text>
              <View style={[GlobalStyles.input, styles.pickerContainer]}>
                <Picker
                  selectedValue={formData.partOfSpeech}
                  onValueChange={(value) =>
                    updateFormData("partOfSpeech", value)
                  }
                  style={styles.picker}
                  enabled={!loading && !isSubmitting}
                >
                  {partOfSpeechOptions.map((option) => (
                    <Picker.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                      color={Colors.textPrimary}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.rowContainer}>
              <View style={[styles.fieldContainer, { flex: 1 }]}>
                <Text
                  style={[
                    GlobalStyles.bodyMedium,
                    GlobalStyles.textPrimary,
                    styles.label,
                  ]}
                >
                  Level
                </Text>
                <View style={[GlobalStyles.input, styles.pickerContainer]}>
                  <Picker
                    selectedValue={formData.level}
                    onValueChange={(value) => updateFormData("level", value)}
                    style={styles.picker}
                    enabled={!loading && !isSubmitting}
                  >
                    {levelOptions.map((level) => (
                      <Picker.Item
                        key={level}
                        label={level}
                        value={level}
                        color={Colors.textPrimary}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={{ width: Spacing.md }} />

              <View style={[styles.fieldContainer, { flex: 1 }]}>
                <Text
                  style={[
                    GlobalStyles.bodyMedium,
                    GlobalStyles.textPrimary,
                    styles.label,
                  ]}
                >
                  Language
                </Text>
                <View style={[GlobalStyles.input, styles.pickerContainer]}>
                  <Picker
                    selectedValue={formData.language}
                    onValueChange={(value) => updateFormData("language", value)}
                    style={styles.picker}
                    enabled={!loading && !isSubmitting}
                  >
                    {languageOptions.map((option) => (
                      <Picker.Item
                        key={option.value}
                        label={option.label}
                        value={option.value}
                        color={Colors.textPrimary}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.toggleContainer}
              onPress={() =>
                updateFormData("isIrregular", !formData.isIrregular)
              }
              disabled={loading || isSubmitting}
              activeOpacity={0.7}
            >
              <View style={styles.toggleContent}>
                <View>
                  <Text
                    style={[GlobalStyles.bodyMedium, GlobalStyles.textPrimary]}
                  >
                    Irregular Word
                  </Text>
                  <Text
                    style={[GlobalStyles.bodySmall, GlobalStyles.textSecondary]}
                  >
                    Mark if this word has irregular forms
                  </Text>
                </View>
                <View
                  style={[
                    styles.toggle,
                    formData.isIrregular && styles.toggleActive,
                  ]}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      formData.isIrregular && styles.toggleThumbActive,
                    ]}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.advancedToggle}
            onPress={() => setShowAdvanced(!showAdvanced)}
            activeOpacity={0.7}
          >
            <Text style={[GlobalStyles.bodyMedium, { color: Colors.primary }]}>
              {showAdvanced ? "Hide" : "Show"} Advanced Fields
            </Text>
            <Ionicons
              name={showAdvanced ? "chevron-up" : "chevron-down"}
              size={20}
              color={Colors.primary}
            />
          </TouchableOpacity>

          {showAdvanced && (
            <View style={styles.section}>
              <Text
                style={[
                  GlobalStyles.h4,
                  GlobalStyles.textPrimary,
                  styles.sectionTitle,
                ]}
              >
                Additional Information
              </Text>

              <View style={styles.fieldContainer}>
                <Text
                  style={[
                    GlobalStyles.bodyMedium,
                    GlobalStyles.textPrimary,
                    styles.label,
                  ]}
                >
                  Explanation
                </Text>
                <TextInput
                  style={[GlobalStyles.input, styles.textArea]}
                  value={formData.explanation}
                  onChangeText={(text) => updateFormData("explanation", text)}
                  placeholder="Explain usage, context, or special notes..."
                  placeholderTextColor={Colors.inputPlaceholder}
                  maxLength={500}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  editable={!loading && !isSubmitting}
                />
                {errors.explanation && (
                  <Text style={[GlobalStyles.bodySmall, styles.errorText]}>
                    {errors.explanation}
                  </Text>
                )}
              </View>

              <View style={styles.fieldContainer}>
                <Text
                  style={[
                    GlobalStyles.bodyMedium,
                    GlobalStyles.textPrimary,
                    styles.label,
                  ]}
                >
                  Definition
                </Text>
                <TextInput
                  style={[GlobalStyles.input, styles.textArea]}
                  value={formData.definition}
                  onChangeText={(text) => updateFormData("definition", text)}
                  placeholder="English definition of the word..."
                  placeholderTextColor={Colors.inputPlaceholder}
                  maxLength={500}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  editable={!loading && !isSubmitting}
                />
                {errors.definition && (
                  <Text style={[GlobalStyles.bodySmall, styles.errorText]}>
                    {errors.definition}
                  </Text>
                )}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  GlobalStyles.h4,
                  GlobalStyles.textPrimary,
                  styles.sectionTitle,
                ]}
              >
                Examples
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={addExample}
                disabled={loading || isSubmitting}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={20} color={Colors.primary} />
                <Text
                  style={[GlobalStyles.bodyMedium, { color: Colors.primary }]}
                >
                  Add Example
                </Text>
              </TouchableOpacity>
            </View>

            {examples.map((example, index) => (
              <View key={index} style={styles.exampleContainer}>
                <View style={styles.exampleHeader}>
                  <Text
                    style={[
                      GlobalStyles.bodyMedium,
                      GlobalStyles.textSecondary,
                    ]}
                  >
                    Example {index + 1}
                  </Text>
                  {examples.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeExample(index)}
                      disabled={loading || isSubmitting}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash" size={16} color={Colors.error} />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.fieldContainer}>
                  <Text
                    style={[
                      GlobalStyles.bodySmall,
                      GlobalStyles.textSecondary,
                      styles.label,
                    ]}
                  >
                    Sentence
                  </Text>
                  <TextInput
                    style={[
                      GlobalStyles.input,
                      errors[`example_${index}_sentence`] && styles.inputError,
                    ]}
                    value={example.sentence}
                    onChangeText={(text) =>
                      updateExample(index, "sentence", text)
                    }
                    placeholder="Enter example sentence..."
                    placeholderTextColor={Colors.inputPlaceholder}
                    maxLength={200}
                    editable={!loading && !isSubmitting}
                  />
                  {errors[`example_${index}_sentence`] && (
                    <Text style={[GlobalStyles.bodySmall, styles.errorText]}>
                      {errors[`example_${index}_sentence`]}
                    </Text>
                  )}
                </View>

                <View style={styles.fieldContainer}>
                  <Text
                    style={[
                      GlobalStyles.bodySmall,
                      GlobalStyles.textSecondary,
                      styles.label,
                    ]}
                  >
                    Translation
                  </Text>
                  <TextInput
                    style={[
                      GlobalStyles.input,
                      errors[`example_${index}_translation`] &&
                        styles.inputError,
                    ]}
                    value={example.translation}
                    onChangeText={(text) =>
                      updateExample(index, "translation", text)
                    }
                    placeholder="Ukrainian translation..."
                    placeholderTextColor={Colors.inputPlaceholder}
                    maxLength={200}
                    editable={!loading && !isSubmitting}
                  />
                  {errors[`example_${index}_translation`] && (
                    <Text style={[GlobalStyles.bodySmall, styles.errorText]}>
                      {errors[`example_${index}_translation`]}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              GlobalStyles.button,
              GlobalStyles.buttonOutline,
              styles.cancelButton,
            ]}
            onPress={handleCancel}
            disabled={loading || isSubmitting}
            activeOpacity={0.7}
          >
            <Text
              style={[GlobalStyles.buttonText, { color: Colors.textSecondary }]}
            >
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              GlobalStyles.button,
              GlobalStyles.buttonPrimary,
              styles.saveButton,
              (!isFormValid || !hasChanges || isSubmitting) &&
                GlobalStyles.buttonDisabled,
            ]}
            onPress={handleSave}
            disabled={!isFormValid || !hasChanges || loading || isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <View style={styles.loadingContainer}>
                <Text
                  style={[GlobalStyles.buttonText, { marginRight: Spacing.sm }]}
                >
                  {isEditMode ? "Updating..." : "Creating..."}
                </Text>
              </View>
            ) : (
              <Text style={GlobalStyles.buttonText}>
                {isEditMode ? "Update Word" : "Add Word"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: Spacing.lg,
  },
  fieldContainer: {
    marginBottom: Spacing.lg,
  },
  rowContainer: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
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
  textArea: {
    minHeight: 80,
    paddingTop: Spacing.md,
  },
  pickerContainer: {
    justifyContent: "center" as const,
    paddingHorizontal: 0,
  },
  picker: {
    color: Colors.textPrimary,
    backgroundColor: "transparent",
  },
  toggleContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  toggleContent: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: "center" as const,
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignSelf: "flex-start" as const,
  },
  toggleThumbActive: {
    alignSelf: "flex-end" as const,
  },
  advancedToggle: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  addButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: Spacing.xs,
  },
  exampleContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  exampleHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: Spacing.md,
  },
  removeButton: {
    padding: Spacing.xs,
  },
  actions: {
    flexDirection: "row" as const,
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
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
};

export default WordForm; // components/words/WordForm.tsx
