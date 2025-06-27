// components/features/dictionary/UpdatedWordForm.tsx
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  Text,
  TextInputSelectionChangeEventData,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// UI Components
import InputField from "../ui/inputs/InputField";
import IrregularFormsForm from "./IrregularFormsForm";
import IrregularToggle from "../ui/inputs/IrregularToggle";
import PartOfSpeechSelector from "../ui/inputs/PartOfSpeechSelector";
import PhoneticKeyboard from "../ui/inputs/PhoneticKeyboard";
import {
  LanguageCode,
  Level,
  PartOfSpeech,
  WordWithExamples,
} from "../../data/DataModels";
import { useWordForm } from "../../hooks/useWordForm";
import {
  Colors,
  SharedStyles,
  Spacing,
  Typography,
} from "../../styles/SharedStyles";

interface IrregularForms {
  base?: string;
  past?: string;
  pastParticiple?: string;
  singular?: string;
  plural?: string;
  positive?: string;
  comparative?: string;
  superlative?: string;
}

interface UpdatedWordFormProps {
  word?: WordWithExamples;
  dictionaryId: number;
  onSave: (word: WordWithExamples) => void;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * Enhanced word form with phonetic keyboard and irregular forms
 * Single Responsibility: Handle word creation and editing with all features
 */
const UpdatedWordForm: React.FC<UpdatedWordFormProps> = ({
  word,
  dictionaryId,
  onSave,
  onCancel,
  loading = false,
}) => {
  const isEditMode = !!word;

  // Form state
  const [wordText, setWordText] = useState(word?.word || "");
  const [transcription, setTranscription] = useState(word?.transcription || "");
  const [translation, setTranslation] = useState(word?.translation || "");
  const [explanation, setExplanation] = useState(word?.explanation || "");
  const [definition, setDefinition] = useState(word?.definition || "");
  const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech>(
    word?.partOfSpeech || PartOfSpeech.NOUN,
  );
  const [language, setLanguage] = useState<LanguageCode>(
    word?.language || LanguageCode.EN_GB,
  );
  const [level, setLevel] = useState<Level>(word?.level || Level.A1);
  const [isIrregular, setIsIrregular] = useState(word?.isIrregular || false);
  const [irregularForms, setIrregularForms] = useState<IrregularForms | null>(
    null,
  );

  // Example state
  const [examples, setExamples] = useState(
    word?.examples?.map((ex) => ({
      sentence: ex.sentence,
      translation: ex.translation || "",
    })) || [{ sentence: "", translation: "" }],
  );

  // UI state
  const [showPhoneticKeyboard, setShowPhoneticKeyboard] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize irregular forms from word data
  useEffect(() => {
    if (word && word.isIrregular) {
      // Convert word irregular forms to our format if they exist
      // This depends on how irregular forms are stored in your database
      setIrregularForms({
        // Map your existing irregular forms structure here
      });
    }
  }, [word]);

  // Clear irregular forms when toggled off
  useEffect(() => {
    if (!isIrregular) {
      setIrregularForms(null);
    }
  }, [isIrregular]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!wordText.trim()) {
      newErrors.word = "Word is required";
    }

    if (!translation.trim()) {
      newErrors.translation = "Translation is required";
    }

    // Validate examples
    examples.forEach((example, index) => {
      if (example.sentence.trim() && !example.translation.trim()) {
        newErrors[`example_${index}_translation`] =
          "Translation is required for this example";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Filter out empty examples
      const validExamples = examples.filter((ex) => ex.sentence.trim());

      // Prepare word data
      const wordData = {
        id: word?.id,
        guid: word?.guid || `word-${Date.now()}`,
        word: wordText.trim(),
        transcription: transcription.trim() || undefined,
        translation: translation.trim(),
        explanation: explanation.trim() || undefined,
        definition: definition.trim() || undefined,
        partOfSpeech,
        language,
        level,
        isIrregular,
        dictionaryId,
        examples: validExamples.map((ex) => ({
          id: 0, // Will be set by database
          guid: `example-${Date.now()}-${Math.random()}`,
          sentence: ex.sentence,
          translation: ex.translation || undefined,
          wordId: word?.id || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        tags: word?.tags || [],
        dictionary: word?.dictionary || ({} as any),
        lastReviewDate: word?.lastReviewDate || null,
        reviewCount: word?.reviewCount || 0,
        rate: word?.rate || 0,
        createdAt: word?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Store irregular forms in a way that matches your database structure
        irregularForms,
      } as WordWithExamples;

      await onSave(wordData);
    } catch (error) {
      Alert.alert("Error", "Failed to save word. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel with unsaved changes check
  const handleCancel = () => {
    const hasChanges =
      wordText !== (word?.word || "") ||
      transcription !== (word?.transcription || "") ||
      translation !== (word?.translation || "") ||
      explanation !== (word?.explanation || "") ||
      definition !== (word?.definition || "") ||
      partOfSpeech !== (word?.partOfSpeech || PartOfSpeech.NOUN) ||
      language !== (word?.language || LanguageCode.EN_GB) ||
      level !== (word?.level || Level.A1) ||
      isIrregular !== (word?.isIrregular || false);

    if (hasChanges) {
      Alert.alert(
        "Discard Changes",
        "Are you sure you want to discard your changes?",
        [
          { text: "Keep Editing", style: "cancel" },
          { text: "Discard", style: "destructive", onPress: onCancel },
        ],
      );
    } else {
      onCancel();
    }
  };

  // Phonetic keyboard handlers
  const handlePhoneticKeyPress = useCallback(
    (key: string, position: number) => {
      if (key === "BACKSPACE") {
        setTranscription((prev) => {
          const newValue = prev.slice(0, position - 1) + prev.slice(position);
          return newValue;
        });
        setCursorPosition(Math.max(0, position - 1));
      } else {
        setTranscription((prev) => {
          const newValue = prev.slice(0, position) + key + prev.slice(position);
          return newValue;
        });
        setCursorPosition(position + key.length);
      }
    },
    [],
  );

  // Example handlers
  const handleExampleChange = (
    index: number,
    field: "sentence" | "translation",
    value: string,
  ) => {
    const newExamples = [...examples];
    newExamples[index] = { ...newExamples[index], [field]: value };
    setExamples(newExamples);

    // Clear related error
    const errorKey = `example_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const addExample = () => {
    setExamples([...examples, { sentence: "", translation: "" }]);
  };

  const removeExample = (index: number) => {
    if (examples.length > 1) {
      const newExamples = examples.filter((_, i) => i !== index);
      setExamples(newExamples);
    }
  };

  return (
    <KeyboardAvoidingView
      style={SharedStyles.flex1}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={SharedStyles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[SharedStyles.h2, SharedStyles.textPrimary]}>
            {isEditMode ? "Edit Word" : "Add New Word"}
          </Text>
          <Text style={[SharedStyles.bodyMedium, SharedStyles.textSecondary]}>
            {isEditMode
              ? "Update word information and examples"
              : "Add a new word to your vocabulary"}
          </Text>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text
            style={[
              SharedStyles.h4,
              SharedStyles.textPrimary,
              styles.sectionTitle,
            ]}
          >
            Basic Information
          </Text>

          <InputField
            label="Word"
            value={wordText}
            onChangeText={setWordText}
            error={errors.word}
            required
            placeholder="Enter the word..."
            disabled={loading || isSubmitting}
          />

          <InputField
            label="Transcription"
            value={transcription}
            onChangeText={setTranscription}
            onSelectionChange={(
              event: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
            ) => {
              setCursorPosition(event.nativeEvent.selection.start);
            }}
            rightElement={
              <TouchableOpacity
                style={styles.phoneticButton}
                onPress={() => setShowPhoneticKeyboard(true)}
                disabled={loading || isSubmitting}
              >
                <Ionicons
                  name="musical-notes"
                  size={20}
                  color={Colors.textPrimary}
                />
              </TouchableOpacity>
            }
            placeholder="[fəˈnetɪk]"
            disabled={loading || isSubmitting}
          />

          <PartOfSpeechSelector
            selected={partOfSpeech}
            onSelect={setPartOfSpeech}
            disabled={loading || isSubmitting}
          />

          <InputField
            label="Translation"
            value={translation}
            onChangeText={setTranslation}
            error={errors.translation}
            required
            multiline
            placeholder="Enter Ukrainian translation..."
            disabled={loading || isSubmitting}
          />

          <InputField
            label="Explanation"
            value={explanation}
            onChangeText={setExplanation}
            multiline
            placeholder="Explain usage, context, or special notes..."
            disabled={loading || isSubmitting}
          />

          <InputField
            label="Definition"
            value={definition}
            onChangeText={setDefinition}
            multiline
            placeholder="English definition of the word..."
            disabled={loading || isSubmitting}
          />

          <IrregularToggle
            label="Irregular Word"
            isIrregular={isIrregular}
            setIsIrregular={setIsIrregular}
            disabled={loading || isSubmitting}
          />
        </View>

        {/* Irregular Forms */}
        <IrregularFormsForm
          partOfSpeech={partOfSpeech}
          irregularForms={irregularForms}
          isIrregular={isIrregular}
          setIrregularForms={setIrregularForms}
        />

        {/* Examples */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text
              style={[
                SharedStyles.h4,
                SharedStyles.textPrimary,
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
                style={[SharedStyles.bodyMedium, { color: Colors.primary }]}
              >
                Add Example
              </Text>
            </TouchableOpacity>
          </View>

          {examples.map((example, index) => (
            <View key={index} style={styles.exampleContainer}>
              <View style={styles.exampleHeader}>
                <Text
                  style={[SharedStyles.bodyMedium, SharedStyles.textSecondary]}
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

              <InputField
                label="Sentence"
                value={example.sentence}
                onChangeText={(text) =>
                  handleExampleChange(index, "sentence", text)
                }
                placeholder="Enter example sentence..."
                disabled={loading || isSubmitting}
              />

              <InputField
                label="Translation"
                value={example.translation}
                onChangeText={(text) =>
                  handleExampleChange(index, "translation", text)
                }
                error={errors[`example_${index}_translation`]}
                placeholder="Ukrainian translation..."
                disabled={loading || isSubmitting}
              />
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              SharedStyles.button,
              SharedStyles.buttonOutline,
              styles.cancelButton,
            ]}
            onPress={handleCancel}
            disabled={loading || isSubmitting}
            activeOpacity={0.7}
          >
            <Text
              style={[SharedStyles.buttonText, { color: Colors.textSecondary }]}
            >
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              SharedStyles.button,
              SharedStyles.buttonPrimary,
              styles.saveButton,
              isSubmitting && SharedStyles.buttonDisabled,
            ]}
            onPress={handleSave}
            disabled={loading || isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.textPrimary} />
                <Text
                  style={[SharedStyles.buttonText, { marginLeft: Spacing.sm }]}
                >
                  {isEditMode ? "Updating..." : "Creating..."}
                </Text>
              </View>
            ) : (
              <Text style={SharedStyles.buttonText}>
                {isEditMode ? "Update Word" : "Add Word"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Phonetic Keyboard Modal */}
      <PhoneticKeyboard
        visible={showPhoneticKeyboard}
        onClose={() => setShowPhoneticKeyboard(false)}
        onKeyPress={handlePhoneticKeyPress}
        cursorPosition={cursorPosition}
      />
    </KeyboardAvoidingView>
  );
};

const styles = {
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
    fontWeight: Typography.weightSemiBold,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: Spacing.lg,
  },
  phoneticButton: {
    backgroundColor: Colors.primary,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 44,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  addButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: Spacing.xs,
  },
  exampleContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
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

export default UpdatedWordForm;
