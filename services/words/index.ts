// services/words/index.ts
/**
 * Words Services Index - централізований експорт всіх word сервісів
 * Single Responsibility: Єдина точка доступу до всіх word сервісів
 */

import { ExampleService } from "./ExampleService";
import { WordCrudService } from "./WordCrudService";
import { WordProgressService } from "./WordProgressService";
import { WordQueryService } from "./WordQueryService";
import { WordValidationService } from "./WordValidationService";

// Core services
export { WordCrudService } from "./WordCrudService";
export { WordQueryService } from "./WordQueryService";
export { WordProgressService } from "./WordProgressService";
export { ExampleService } from "./ExampleService";
export { WordValidationService } from "./WordValidationService";

// Re-export types for convenience
export type {
  CreateWordRequest,
  UpdateWordRequest,
  WordResponse,
} from "./WordCrudService";

export type { WordFilters, WordsListResponse } from "./WordQueryService";

export type {
  CreateExampleRequest,
  UpdateExampleRequest,
  ExampleResponse,
  ExamplesListResponse,
} from "./ExampleService";

// Combined Word Service for backward compatibility
export class WordService {
  // CRUD operations
  static getById = WordCrudService.getById;
  static create = WordCrudService.create;
  static update = WordCrudService.update;
  static delete = WordCrudService.delete;

  // Query operations
  static getAll = WordQueryService.getAll;
  static search = WordQueryService.search;
  static getByDictionaryId = WordQueryService.getByDictionaryId;
  static getRandomWords = WordQueryService.getRandomWords;

  // Progress operations
  static updateProgress = WordProgressService.updateProgress;
  static updateReviewStats = WordProgressService.updateReviewStats;
  static resetProgress = WordProgressService.resetProgress;
  static getWordsForReview = WordProgressService.getWordsForReview;

  // Example operations
  static getExamples = ExampleService.getByWordId;
  static createExample = ExampleService.create;
  static updateExample = ExampleService.update;
  static deleteExample = ExampleService.delete;
  static createBulkExamples = ExampleService.createBulk;
  static replaceExamplesForWord = ExampleService.replaceForWord;

  // Validation
  static validateCreateRequest = WordValidationService.validateCreateRequest;
  static validateUpdateRequest = WordValidationService.validateUpdateRequest;
  static validateExample = WordValidationService.validateExample;
  static validateExamples = WordValidationService.validateExamples;
}
