// services/database/index.ts - Fixed to avoid require cycles
/**
 * Database Services Export Index - Fixed circular dependencies
 * 
 * Restructured to avoid require cycles between services
 */

// Core database service (no dependencies)
export { SQLiteUniversal, SQLiteUniversalService } from './SQLiteUniversalService';
export type { DatabaseResult, TransactionCallback } from './SQLiteUniversalService';

// Domain-specific services (import each other directly, not through index)
export { DictionaryService } from './DictionaryService';
export type { 
  Dictionary, 
  DictionaryCreateRequest, 
  DictionaryUpdateRequest, 
  DictionaryStats 
} from './DictionaryService';

export { WordService } from './WordService';
export type { 
  Word, 
  WordWithExamples, 
  WordCreateRequest, 
  WordUpdateRequest, 
  WordSearchFilter, 
  WordStats, 
  PartOfSpeech 
} from './WordService';

export { ExampleService } from './ExampleService';
export type { 
  Example, 
  ExampleCreateRequest, 
  ExampleUpdateRequest, 
  ExampleWithWord 
} from './ExampleService';

export { SetService } from './SetService';
export type { 
  Set, 
  SetWithWords, 
  SetCreateRequest, 
  SetUpdateRequest, 
  SetStats, 
  SetSearchFilter 
} from './SetService';

// High-level services (depend on domain services)
export { QueryService } from './QueryService';
export type { 
  DashboardData, 
  StudySession, 
  LearningProgress 
} from './QueryService';

export { MigrationService } from './MigrationService';
export type { 
  MigrationResult, 
  SeedDataOptions 
} from './MigrationService';

// Testing utilities
export { DatabaseTester } from './DatabaseTester';

// Create service instances after all classes are defined
import { DictionaryService } from './DictionaryService';
import { WordService } from './WordService';
import { ExampleService } from './ExampleService';
import { SetService } from './SetService';
import { QueryService } from './QueryService';
import { MigrationService } from './MigrationService';
import { SQLiteUniversal } from './SQLiteUniversalService';

// Export singleton instances
export const dictionaryService = DictionaryService.getInstance();
export const wordService = WordService.getInstance();
export const exampleService = ExampleService.getInstance();
export const setService = SetService.getInstance();
export const queryService = QueryService.getInstance();
export const migrationService = MigrationService.getInstance();

// Convenience exports for common operations
export const DatabaseServices = {
  dictionary: dictionaryService,
  word: wordService,
  example: exampleService,
  set: setService,
  query: queryService,
  migration: migrationService,
  universal: SQLiteUniversal,
} as const;

// Type exports for external use
export type { Example as ExampleModel } from './ExampleService';
export type { Word as WordModel, WordWithExamples as WordWithExamplesModel } from './WordService';
export type { Dictionary as DictionaryModel } from './DictionaryService';
export type { Set as SetModel, SetWithWords as SetWithWordsModel } from './SetService';