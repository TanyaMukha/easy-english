// hooks/useWordForm.ts

import { useEffect, useState } from "react";
import { Alert } from "react-native";

import {
  LanguageCode,
  Level,
  PartOfSpeech,
  WordWithExamples,
} from "../data/DataModels";
import {
  CreateWordRequest,
  UpdateWordRequest,
  WordService,
} from "../services/WordService";
import {
  ExampleFormData,
  ValidationErrors,
  WordFormData,
  WordFormValidator,
} from "../utils/WordFormValidator";

interface UseWordFormParams {
  word?: WordWithExamples;
  dictionaryId: number;
  onSave: (word: WordWithExamples) => void;
  onCancel: () => void;
}

interface UseWordFormReturn {
  // Form data
  formData: WordFormData;
  examples: ExampleFormData[];

  // State
  isSubmitting: boolean;
  errors: ValidationErrors;
  showAdvanced: boolean;
  isFormValid: boolean;
  hasChanges: boolean;

  // Actions
  updateFormData: (field: keyof WordFormData, value: any) => void;
  updateExample: (
    index: number,
    field: "sentence" | "translation",
    value: string,
  ) => void;
  addExample: () => void;
  removeExample: (index: number) => void;
  setShowAdvanced: (show: boolean) => void;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
  clearFieldError: (field: string) => void;
}

/**
 * Single Responsibility: Manage word form state and logic
 * Open/Closed: Can be extended with additional form operations
 * Interface Segregation: Only handles form-related operations
 */
export const useWordForm = ({
  word,
  dictionaryId,
  onSave,
  onCancel,
}: UseWordFormParams): UseWordFormReturn => {
  const isEditMode = !!word;

  // Initialize form data
  const [formData, setFormData] = useState<WordFormData>({
    word: word?.word || "",
    transcription: word?.transcription || "",
    translation: word?.translation || "",
    explanation: word?.explanation || "",
    definition: word?.definition || "",
    partOfSpeech: word?.partOfSpeech || PartOfSpeech.NOUN,
    language: word?.language || LanguageCode.EN_GB,
    level: word?.level || Level.A1,
    isIrregular: word?.isIrregular || false,
  });

  const [examples, setExamples] = useState<ExampleFormData[]>(
    word?.examples?.map((ex) => ({
      sentence: ex.sentence,
      translation: ex.translation || "",
    })) || [{ sentence: "", translation: "" }],
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Reset form when word changes
  useEffect(() => {
    if (word) {
      setFormData({
        word: word.word,
        transcription: word.transcription || "",
        translation: word.translation || "",
        explanation: word.explanation || "",
        definition: word.definition || "",
        partOfSpeech: word.partOfSpeech,
        language: word.language,
        level: word.level,
        isIrregular: word.isIrregular || false,
      });
      setExamples(
        word.examples?.map((ex) => ({
          sentence: ex.sentence,
          translation: ex.translation || "",
        })) || [{ sentence: "", translation: "" }],
      );
    }
    setErrors({});
  }, [word]);

  // Computed values
  const isFormValid =
    WordFormValidator.hasRequiredFields(formData) &&
    Object.keys(errors).length === 0;

  const hasChanges =
    formData.word !== (word?.word || "") ||
    formData.transcription !== (word?.transcription || "") ||
    formData.translation !== (word?.translation || "") ||
    formData.explanation !== (word?.explanation || "") ||
    formData.definition !== (word?.definition || "") ||
    formData.partOfSpeech !== (word?.partOfSpeech || PartOfSpeech.NOUN) ||
    formData.language !== (word?.language || LanguageCode.EN_GB) ||
    formData.level !== (word?.level || Level.A1) ||
    formData.isIrregular !== (word?.isIrregular || false) ||
    JSON.stringify(examples) !==
      JSON.stringify(
        word?.examples?.map((ex) => ({
          sentence: ex.sentence,
          translation: ex.translation || "",
        })) || [{ sentence: "", translation: "" }],
      );

  // Actions
  const updateFormData = (field: keyof WordFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear field error if exists
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Real-time validation for this field
    const fieldError = WordFormValidator.getFieldValidationMessage(
      field,
      value,
    );
    if (fieldError) {
      setErrors((prev) => ({ ...prev, [field]: fieldError }));
    }
  };

  const updateExample = (
    index: number,
    field: "sentence" | "translation",
    value: string,
  ) => {
    setExamples((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)),
    );

    // Clear related errors
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
    setExamples((prev) => [...prev, { sentence: "", translation: "" }]);
  };

  const removeExample = (index: number) => {
    if (examples.length > 1) {
      setExamples((prev) => prev.filter((_, i) => i !== index));

      // Clear errors for this example
      const newErrors = { ...errors };
      delete newErrors[`example_${index}_sentence`];
      delete newErrors[`example_${index}_translation`];
      setErrors(newErrors);
    }
  };

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const validationErrors = WordFormValidator.validateCompleteForm(
      formData,
      examples,
    );
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let response;

      // Clean form data
      const cleanFormData = WordFormValidator.cleanFormData(formData);
      const cleanExamples = WordFormValidator.cleanExamples(examples);

      // Convert to API format
      const validExamples = cleanExamples.map((ex) => ({
        sentence: ex.sentence,
        translation: ex.translation ?? "",
      }));

      if (isEditMode && word) {
        // Update existing word
        const updateRequest: UpdateWordRequest = {
          word: cleanFormData.word,
          transcription: cleanFormData.transcription || undefined,
          translation: cleanFormData.translation,
          explanation: cleanFormData.explanation || undefined,
          definition: cleanFormData.definition || undefined,
          partOfSpeech: cleanFormData.partOfSpeech,
          language: cleanFormData.language,
          level: cleanFormData.level,
          isIrregular: cleanFormData.isIrregular,
          examples: validExamples,
        };
        response = await WordService.update(word.id!, updateRequest);
      } else {
        // Create new word
        const createRequest: CreateWordRequest = {
          word: cleanFormData.word,
          transcription: cleanFormData.transcription || undefined,
          translation: cleanFormData.translation,
          explanation: cleanFormData.explanation || undefined,
          definition: cleanFormData.definition || undefined,
          partOfSpeech: cleanFormData.partOfSpeech,
          language: cleanFormData.language,
          level: cleanFormData.level,
          isIrregular: cleanFormData.isIrregular,
          dictionaryId,
          examples: validExamples,
        };
        response = await WordService.create(createRequest);
      }

      if (response.success && response.data) {
        onSave(response.data);
      } else {
        Alert.alert("Error", response.error || "An unexpected error occurred", [
          { text: "OK" },
        ]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save word. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
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

  return {
    // Form data
    formData,
    examples,

    // State
    isSubmitting,
    errors,
    showAdvanced,
    isFormValid,
    hasChanges,

    // Actions
    updateFormData,
    updateExample,
    addExample,
    removeExample,
    setShowAdvanced,
    handleSave,
    handleCancel,
    clearFieldError,
  };
};

export default useWordForm;
