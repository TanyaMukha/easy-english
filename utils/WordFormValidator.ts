// utils/WordFormValidator.ts

import { PartOfSpeech, Level, LanguageCode } from '../data/DataModels';

export interface WordFormData {
  word: string;
  transcription: string;
  translation: string;
  explanation: string;
  definition: string;
  partOfSpeech: PartOfSpeech;
  language: LanguageCode;
  level: Level;
  isIrregular: boolean;
}

export interface ExampleFormData {
  sentence: string;
  translation: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Single Responsibility: Validate word form data
 * Open/Closed: Can be extended with additional validation rules
 * Interface Segregation: Only handles validation logic
 */
export class WordFormValidator {
  /**
   * Validate main word form data
   */
  static validateWordForm(formData: WordFormData): ValidationErrors {
    const errors: ValidationErrors = {};

    // Word validation
    if (!formData.word.trim()) {
      errors.word = 'Word is required';
    } else if (formData.word.trim().length > 100) {
      errors.word = 'Word must be less than 100 characters';
    } else if (!/^[a-zA-Z\s\-'\.]+$/.test(formData.word.trim())) {
      errors.word = 'Word can only contain letters, spaces, hyphens, and apostrophes';
    }

    // Translation validation
    if (!formData.translation.trim()) {
      errors.translation = 'Translation is required';
    } else if (formData.translation.trim().length > 200) {
      errors.translation = 'Translation must be less than 200 characters';
    }

    // Transcription validation (optional but with format check)
    if (formData.transcription.trim() && formData.transcription.trim().length > 100) {
      errors.transcription = 'Transcription must be less than 100 characters';
    }

    // Explanation validation (optional)
    if (formData.explanation.trim() && formData.explanation.trim().length > 500) {
      errors.explanation = 'Explanation must be less than 500 characters';
    }

    // Definition validation (optional)
    if (formData.definition.trim() && formData.definition.trim().length > 500) {
      errors.definition = 'Definition must be less than 500 characters';
    }

    // Part of speech validation
    if (!Object.values(PartOfSpeech).includes(formData.partOfSpeech)) {
      errors.partOfSpeech = 'Invalid part of speech';
    }

    // Language validation
    if (!Object.values(LanguageCode).includes(formData.language)) {
      errors.language = 'Invalid language';
    }

    // Level validation
    if (!Object.values(Level).includes(formData.level)) {
      errors.level = 'Invalid level';
    }

    return errors;
  }

  /**
   * Validate examples array
   */
  static validateExamples(examples: ExampleFormData[]): ValidationErrors {
    const errors: ValidationErrors = {};

    examples.forEach((example, index) => {
      // If sentence is provided, check its length
      if (example.sentence.trim()) {
        if (example.sentence.trim().length > 200) {
          errors[`example_${index}_sentence`] = 'Example sentence must be less than 200 characters';
        }

        // If sentence is provided, translation should also be provided
        if (!example.translation.trim()) {
          errors[`example_${index}_translation`] = 'Translation is required for this example';
        }
      }

      // If translation is provided, check its length
      if (example.translation.trim() && example.translation.trim().length > 200) {
        errors[`example_${index}_translation`] = 'Example translation must be less than 200 characters';
      }
    });

    return errors;
  }

  /**
   * Validate complete form (word + examples)
   */
  static validateCompleteForm(
    formData: WordFormData, 
    examples: ExampleFormData[]
  ): ValidationErrors {
    const wordErrors = this.validateWordForm(formData);
    const exampleErrors = this.validateExamples(examples);

    return { ...wordErrors, ...exampleErrors };
  }

  /**
   * Check if form data has required fields
   */
  static hasRequiredFields(formData: WordFormData): boolean {
    return !!(
      formData.word.trim() &&
      formData.translation.trim() &&
      formData.partOfSpeech &&
      formData.language &&
      formData.level
    );
  }

  /**
   * Get validation message for specific field
   */
  static getFieldValidationMessage(
    field: keyof WordFormData,
    value: string | boolean
  ): string | null {
    switch (field) {
      case 'word':
        if (!value || (typeof value === 'string' && !value.trim())) {
          return 'Word is required';
        }
        if (typeof value === 'string' && value.trim().length > 100) {
          return 'Word must be less than 100 characters';
        }
        if (typeof value === 'string' && !/^[a-zA-Z\s\-'\.]+$/.test(value.trim())) {
          return 'Word can only contain letters, spaces, hyphens, and apostrophes';
        }
        break;

      case 'translation':
        if (!value || (typeof value === 'string' && !value.trim())) {
          return 'Translation is required';
        }
        if (typeof value === 'string' && value.trim().length > 200) {
          return 'Translation must be less than 200 characters';
        }
        break;

      case 'transcription':
        if (typeof value === 'string' && value.trim() && value.trim().length > 100) {
          return 'Transcription must be less than 100 characters';
        }
        break;

      case 'explanation':
        if (typeof value === 'string' && value.trim() && value.trim().length > 500) {
          return 'Explanation must be less than 500 characters';
        }
        break;

      case 'definition':
        if (typeof value === 'string' && value.trim() && value.trim().length > 500) {
          return 'Definition must be less than 500 characters';
        }
        break;
    }

    return null;
  }

  /**
   * Clean form data (trim strings, handle empty values)
   */
  static cleanFormData(formData: WordFormData): WordFormData {
    return {
      word: formData.word.trim(),
      transcription: formData.transcription.trim(),
      translation: formData.translation.trim(),
      explanation: formData.explanation.trim(),
      definition: formData.definition.trim(),
      partOfSpeech: formData.partOfSpeech,
      language: formData.language,
      level: formData.level,
      isIrregular: formData.isIrregular,
    };
  }

  /**
   * Clean examples data
   */
  static cleanExamples(examples: ExampleFormData[]): ExampleFormData[] {
    return examples
      .filter(example => example.sentence.trim()) // Remove empty examples
      .map(example => ({
        sentence: example.sentence.trim(),
        translation: example.translation.trim(),
      }));
  }
}

export default WordFormValidator;