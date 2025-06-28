// services/words/WordValidationService.ts
/**
 * Word Validation Service - валідація даних слів
 * Single Responsibility: Тільки валідація
 */

import { CreateWordRequest, UpdateWordRequest } from "./WordCrudService";
import { LanguageCode, Level, PartOfSpeech } from "../../data/DataModels";

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class WordValidationService {
  /**
   * Validate create word request
   */
  static validateCreateRequest(request: CreateWordRequest): ValidationResult {
    // Required fields
    if (!request.word || typeof request.word !== "string") {
      return { isValid: false, error: "Word is required and must be a string" };
    }

    if (request.word.trim().length === 0) {
      return { isValid: false, error: "Word cannot be empty" };
    }

    if (request.word.trim().length > 100) {
      return { isValid: false, error: "Word too long (max 100 characters)" };
    }

    if (
      !request.partOfSpeech ||
      !Object.values(PartOfSpeech).includes(request.partOfSpeech)
    ) {
      return { isValid: false, error: "Valid part of speech is required" };
    }

    if (
      !request.dictionaryId ||
      typeof request.dictionaryId !== "number" ||
      request.dictionaryId <= 0
    ) {
      return { isValid: false, error: "Valid dictionary ID is required" };
    }

    // Optional field validation
    if (request.transcription && request.transcription.length > 200) {
      return {
        isValid: false,
        error: "Transcription too long (max 200 characters)",
      };
    }

    if (request.translation && request.translation.length > 500) {
      return {
        isValid: false,
        error: "Translation too long (max 500 characters)",
      };
    }

    if (request.explanation && request.explanation.length > 1000) {
      return {
        isValid: false,
        error: "Explanation too long (max 1000 characters)",
      };
    }

    if (request.definition && request.definition.length > 1000) {
      return {
        isValid: false,
        error: "Definition too long (max 1000 characters)",
      };
    }

    if (
      request.language &&
      !Object.values(LanguageCode).includes(request.language)
    ) {
      return { isValid: false, error: "Invalid language code" };
    }

    if (request.level && !Object.values(Level).includes(request.level)) {
      return { isValid: false, error: "Invalid level" };
    }

    return { isValid: true };
  }

  /**
   * Validate update word request
   */
  static validateUpdateRequest(request: UpdateWordRequest): ValidationResult {
    if (request.word !== undefined) {
      if (typeof request.word !== "string") {
        return { isValid: false, error: "Word must be a string" };
      }

      if (request.word.trim().length === 0) {
        return { isValid: false, error: "Word cannot be empty" };
      }

      if (request.word.trim().length > 100) {
        return { isValid: false, error: "Word too long (max 100 characters)" };
      }
    }

    if (
      request.partOfSpeech &&
      !Object.values(PartOfSpeech).includes(request.partOfSpeech)
    ) {
      return { isValid: false, error: "Invalid part of speech" };
    }

    if (
      request.dictionaryId !== undefined &&
      (typeof request.dictionaryId !== "number" || request.dictionaryId <= 0)
    ) {
      return { isValid: false, error: "Invalid dictionary ID" };
    }

    if (
      request.transcription !== undefined &&
      request.transcription &&
      request.transcription.length > 200
    ) {
      return {
        isValid: false,
        error: "Transcription too long (max 200 characters)",
      };
    }

    if (
      request.translation !== undefined &&
      request.translation &&
      request.translation.length > 500
    ) {
      return {
        isValid: false,
        error: "Translation too long (max 500 characters)",
      };
    }

    if (
      request.explanation !== undefined &&
      request.explanation &&
      request.explanation.length > 1000
    ) {
      return {
        isValid: false,
        error: "Explanation too long (max 1000 characters)",
      };
    }

    if (
      request.definition !== undefined &&
      request.definition &&
      request.definition.length > 1000
    ) {
      return {
        isValid: false,
        error: "Definition too long (max 1000 characters)",
      };
    }

    if (
      request.language &&
      !Object.values(LanguageCode).includes(request.language)
    ) {
      return { isValid: false, error: "Invalid language code" };
    }

    if (request.level && !Object.values(Level).includes(request.level)) {
      return { isValid: false, error: "Invalid level" };
    }

    return { isValid: true };
  }

  /**
   * Validate example data
   */
  static validateExample(
    sentence: string,
    translation?: string,
  ): ValidationResult {
    if (!sentence || typeof sentence !== "string") {
      return { isValid: false, error: "Example sentence is required" };
    }

    if (sentence.trim().length === 0) {
      return { isValid: false, error: "Example sentence cannot be empty" };
    }

    if (sentence.length > 500) {
      return {
        isValid: false,
        error: "Example sentence too long (max 500 characters)",
      };
    }

    if (translation && translation.length > 500) {
      return {
        isValid: false,
        error: "Example translation too long (max 500 characters)",
      };
    }

    return { isValid: true };
  }

  /**
   * Validate examples array
   */
  static validateExamples(
    examples: Array<{ sentence: string; translation?: string }>,
  ): ValidationResult {
    if (!Array.isArray(examples)) {
      return { isValid: false, error: "Examples must be an array" };
    }

    if (examples.length > 10) {
      return { isValid: false, error: "Too many examples (max 10)" };
    }

    for (let i = 0; i < examples.length; i++) {
      const example = examples[i];
      const validation = this.validateExample(
        example?.sentence!,
        example?.translation,
      );

      if (!validation.isValid) {
        return {
          isValid: false,
          error: `Example ${i + 1}: ${validation.error}`,
        };
      }
    }

    return { isValid: true };
  }
}
