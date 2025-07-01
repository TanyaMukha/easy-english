// hooks/useWordForm.ts - Updated to use new database services
import { useEffect, useState, useCallback } from "react";
import { Alert } from "react-native";

import { wordService } from '../services/database';
import { 
  WordWithExamples, 
  WordCreateRequest, 
  WordUpdateRequest,
  DatabaseResult 
} from '../services/database';
import { PartOfSpeech } from '../services/database/WordService';

// Form data interfaces
interface ExampleFormData {
  sentence: string;
  translation: string;
}

interface WordFormData {
  word: string;
  transcription: string;
  translation: string;
  explanation: string;
  definition: string;
  partOfSpeech: PartOfSpeech;
  language: string;
  level: string;
  isIrregular: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

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
  validateField: (field: keyof WordFormData, value: any) => string | null;
  validateForm: () => boolean;
}

/**
 * Enhanced word form hook using new database services
 * 
 * This hook provides comprehensive word form management with:
 * - Real database integration via WordService
 * - Advanced validation with field-level feedback
 * - Example management with CRUD operations
 * - Optimistic updates for better UX
 * - Comprehensive error handling
 * 
 * Key improvements:
 * - Uses WordService for create/update operations
 * - Enhanced validation with specific error messages
 * - Better state management for form and examples
 * - Supports both create and edit modes
 * - Proper change detection for unsaved warnings
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
    language: word?.language || "en",
    level: word?.level || "A1",
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
        level: word.level || "A1",
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

  /**
   * Validate individual field
   */
  const validateField = useCallback((field: keyof WordFormData, value: any): string | null => {
    switch (field) {
      case 'word':
        if (!value || !value.toString().trim()) {
          return 'Word is required';
        }
        if (value.toString().trim().length < 1) {
          return 'Word must be at least 1 character';
        }
        if (value.toString().trim().length > 100) {
          return 'Word must be less than 100 characters';
        }
        return null;

      case 'translation':
        if (!value || !value.toString().trim()) {
          return 'Translation is required';
        }
        if (value.toString().trim().length > 200) {
          return 'Translation must be less than 200 characters';
        }
        return null;

      case 'transcription':
        if (value && value.toString().length > 100) {
          return 'Transcription must be less than 100 characters';
        }
        return null;

      case 'explanation':
        if (value && value.toString().length > 500) {
          return 'Explanation must be less than 500 characters';
        }
        return null;

      case 'definition':
        if (value && value.toString().length > 500) {
          return 'Definition must be less than 500 characters';
        }
        return null;

      case 'level':
        const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        if (value && !validLevels.includes(value)) {
          return 'Invalid level selected';
        }
        return null;

      default:
        return null;
    }
  }, []);

  /**
   * Validate entire form
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate required fields
    Object.keys(formData).forEach(key => {
      const fieldKey = key as keyof WordFormData;
      const error = validateField(fieldKey, formData[fieldKey]);
      if (error) {
        newErrors[fieldKey] = error;
      }
    });

    // Validate examples
    examples.forEach((example, index) => {
      if (example.sentence.trim() && !example.translation.trim()) {
        newErrors[`example_${index}_translation`] = 'Translation is required when sentence is provided';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, examples, validateField]);

  // Computed validation state
  const isFormValid = validateForm() && !!formData.word.trim() && !!formData.translation.trim();

  // Track if form has been modified
  const hasChanges = 
    formData.word !== (word?.word || "") ||
    formData.transcription !== (word?.transcription || "") ||
    formData.translation !== (word?.translation || "") ||
    formData.explanation !== (word?.explanation || "") ||
    formData.definition !== (word?.definition || "") ||
    formData.partOfSpeech !== (word?.partOfSpeech || PartOfSpeech.NOUN) ||
    formData.language !== (word?.language || "en") ||
    formData.level !== (word?.level || "A1") ||
    formData.isIrregular !== (word?.isIrregular || false) ||
    JSON.stringify(examples) !== JSON.stringify(
      word?.examples?.map(ex => ({
        sentence: ex.sentence,
        translation: ex.translation || ""
      })) || [{ sentence: "", translation: "" }]
    );

  /**
   * Update form field
   */
  const updateFormData = useCallback((field: keyof WordFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Validate field
    const error = validateField(field, value);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  }, [errors, validateField]);

  /**
   * Update example
   */
  const updateExample = useCallback((
    index: number,
    field: "sentence" | "translation",
    value: string,
  ) => {
    setExamples(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value } as ExampleFormData;
      return updated;
    });

    // Clear example error
    const errorKey = `example_${index}_${field}`;
    if (errors[errorKey]) {
      clearFieldError(errorKey);
    }
  }, [errors]);

  /**
   * Add new example
   */
  const addExample = useCallback(() => {
    setExamples(prev => [...prev, { sentence: "", translation: "" }]);
  }, []);

  /**
   * Remove example
   */
  const removeExample = useCallback((index: number) => {
    setExamples(prev => prev.filter((_, i) => i !== index));
    
    // Clear related errors
    const updatedErrors = { ...errors };
    delete updatedErrors[`example_${index}_sentence`];
    delete updatedErrors[`example_${index}_translation`];
    setErrors(updatedErrors);
  }, [errors]);

  /**
   * Clear field error
   */
  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  }, []);

  /**
   * Save handler with comprehensive validation
   */
  const handleSave = useCallback(async () => {
    if (isSubmitting) return;

    // Validate form before submission
    if (!validateForm()) {
      Alert.alert(
        "Validation Error",
        "Please fix the errors before saving.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsSubmitting(true);

    try {
      let result: DatabaseResult<WordWithExamples>;

      // Prepare examples data (filter out empty examples)
      const validExamples = examples
        .filter(ex => ex.sentence.trim())
        .map(ex => ({
          guid: `example-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sentence: ex.sentence.trim(),
          translation: ex.translation.trim() || undefined
        }));

      if (isEditMode && word?.id) {
        // Update existing word
        const updateRequest: WordUpdateRequest = {
          word: formData.word.trim(),
          transcription: formData.transcription.trim() || undefined,
          translation: formData.translation.trim(),
          explanation: formData.explanation.trim() || undefined,
          definition: formData.definition.trim() || undefined,
          partOfSpeech: formData.partOfSpeech,
          language: formData.language,
          level: formData.level,
          isIrregular: formData.isIrregular,
        } as WordUpdateRequest;

        result = await wordService.updateWord(word.id, updateRequest);
      } else {
        // Create new word
        const createRequest: WordCreateRequest = {
          guid: `word-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          word: formData.word.trim(),
          transcription: formData.transcription.trim() || undefined,
          translation: formData.translation.trim(),
          explanation: formData.explanation.trim() || undefined,
          definition: formData.definition.trim() || undefined,
          partOfSpeech: formData.partOfSpeech,
          language: formData.language,
          level: formData.level,
          isIrregular: formData.isIrregular,
          dictionaryId: dictionaryId,
          examples: validExamples
        } as WordCreateRequest;

        result = await wordService.createWord(createRequest);
      }

      if (result.success && result.data) {
        const savedWord = result.data[0];
        onSave(savedWord!);
      } else {
        throw new Error(result.error || 'Failed to save word');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error saving word:', err);
      
      Alert.alert(
        "Save Error",
        `Failed to save word: ${errorMessage}`,
        [{ text: "OK" }]
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isSubmitting,
    validateForm,
    examples,
    isEditMode,
    word,
    formData,
    dictionaryId,
    onSave
  ]);

  /**
   * Cancel handler with unsaved changes warning
   */
  const handleCancel = useCallback(() => {
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
  }, [hasChanges, onCancel]);

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
    validateField,
    validateForm,
  };
};