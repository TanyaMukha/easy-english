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
  WordCrudService,
  WordValidationService,
  CreateWordRequest,
  UpdateWordRequest,
} from "../services/words";
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
 * Enhanced word form hook using modular services architecture
 * 
 * Single Responsibility: Manage word form state and logic
 * Open/Closed: Can be extended with additional form operations
 * Interface Segregation: Only handles form-related operations
 * 
 * This hook now uses the modular services:
 * - WordCrudService for create/update operations
 * - WordValidationService for validation logic
 * - Maintains the same interface for backward compatibility
 */
export const useWordForm = ({
  word,
  dictionaryId,
  onSave,
  onCancel,
}: UseWordFormParams): UseWordFormReturn => {
  const isEditMode = !!word;

  // Initialize form data with proper defaults
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

  // Initialize examples data
  const [examples, setExamples] = useState<ExampleFormData[]>(
    word?.examples?.map((ex) => ({
      sentence: ex.sentence,
      translation: ex.translation || "",
    })) || [{ sentence: "", translation: "" }],
  );

  // UI and validation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Reset form when word changes (edit mode)
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
    
    // Clear errors when word changes
    setErrors({});
  }, [word]);

  // Computed validation state
  const isFormValid =
    WordFormValidator.hasRequiredFields(formData) &&
    Object.keys(errors).length === 0;

  // Track if form has been modified
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

  // Form data update handler with real-time validation
  const updateFormData = (field: keyof WordFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear existing field error
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Perform real-time validation for the field
    const fieldError = WordFormValidator.getFieldValidationMessage(field, value);
    if (fieldError) {
      setErrors((prev) => ({ ...prev, [field]: fieldError }));
    }
  };

  // Example update handler
  const updateExample = (
    index: number,
    field: "sentence" | "translation",
    value: string,
  ) => {
    setExamples((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)),
    );
  };

  // Add new example entry
  const addExample = () => {
    setExamples((prev) => [...prev, { sentence: "", translation: "" }]);
  };

  // Remove example entry
  const removeExample = (index: number) => {
    if (examples.length > 1) {
      setExamples((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Clear specific field error
  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // Save handler with proper validation and service calls
  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate form data using validation service
      const validationResult = isEditMode
        ? WordValidationService.validateUpdateRequest(formData)
        : WordValidationService.validateCreateRequest(formData as CreateWordRequest);

      if (!validationResult.isValid) {
        setErrors(validationResult.error as unknown as ValidationErrors);
        Alert.alert("Validation Error", "Please fix the errors before saving.", [
          { text: "OK" },
        ]);
        return;
      }

      // Clean and prepare form data
      const cleanFormData = {
        ...formData,
        word: formData.word.trim(),
        translation: formData.translation.trim(),
        transcription: formData.transcription?.trim() || undefined,
        explanation: formData.explanation?.trim() || undefined,
        definition: formData.definition?.trim() || undefined,
      };

      // Validate and prepare examples
      const validExamples = examples
        .filter((ex) => ex.sentence.trim())
        .map((ex) => ({
          sentence: ex.sentence.trim(),
          translation: ex.translation?.trim() || "",
        }));

      // Validate examples using validation service
      const examplesValidation = WordValidationService.validateExamples(validExamples);
      if (!examplesValidation.isValid) {
        Alert.alert("Examples Error", examplesValidation.error || "Invalid examples", [
          { text: "OK" },
        ]);
        return;
      }

      let response;

      if (isEditMode && word) {
        // Update existing word using WordCrudService
        const updateRequest: UpdateWordRequest = {
          word: cleanFormData.word,
          transcription: cleanFormData.transcription,
          translation: cleanFormData.translation,
          explanation: cleanFormData.explanation,
          definition: cleanFormData.definition,
          partOfSpeech: cleanFormData.partOfSpeech,
          language: cleanFormData.language,
          level: cleanFormData.level,
          isIrregular: cleanFormData.isIrregular,
          examples: validExamples,
        } as UpdateWordRequest;
        
        response = await WordCrudService.update(word.id!, updateRequest);
      } else {
        // Create new word using WordCrudService
        const createRequest: CreateWordRequest = {
          word: cleanFormData.word,
          transcription: cleanFormData.transcription,
          translation: cleanFormData.translation,
          explanation: cleanFormData.explanation,
          definition: cleanFormData.definition,
          partOfSpeech: cleanFormData.partOfSpeech,
          language: cleanFormData.language,
          level: cleanFormData.level,
          isIrregular: cleanFormData.isIrregular,
          dictionaryId,
          examples: validExamples,
        } as CreateWordRequest;
        
        response = await WordCrudService.create(createRequest);
      }

      // Handle response
      if (response.success && response.data) {
        onSave(response.data);
      } else {
        Alert.alert("Error", response.error || "An unexpected error occurred", [
          { text: "OK" },
        ]);
      }
    } catch (error) {
      console.error("Error saving word:", error);
      Alert.alert("Error", "Failed to save word. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel handler with unsaved changes warning
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