// services/database/index.ts
/**
 * Database Services Export Index
 * 
 * Central export point for all database services following clean architecture principles.
 * This file provides a single import point for all database-related functionality.
 */

import { dictionaryService } from './DictionaryService';
import { exampleService } from './ExampleService';
import { migrationService } from './MigrationService';
import { queryService } from './QueryService';
import { SQLiteUniversal } from './SQLiteUniversalService';
import { wordService } from './WordService';

// Core database service
export { SQLiteUniversal, SQLiteUniversalService } from './SQLiteUniversalService';
export type { DatabaseResult, TransactionCallback } from './SQLiteUniversalService';

// Domain-specific services
export { DictionaryService, dictionaryService } from './DictionaryService';
export type { 
  Dictionary, 
  DictionaryCreateRequest, 
  DictionaryUpdateRequest, 
  DictionaryStats 
} from './DictionaryService';

export { WordService, wordService } from './WordService';
export type { 
  Word, 
  WordWithExamples, 
  WordCreateRequest, 
  WordUpdateRequest, 
  WordSearchFilter, 
  WordStats, 
  PartOfSpeech 
} from './WordService';

export { ExampleService, exampleService } from './ExampleService';
export type { 
  Example, 
  ExampleCreateRequest, 
  ExampleUpdateRequest, 
  ExampleWithWord 
} from './ExampleService';

// High-level query service
export { QueryService, queryService } from './QueryService';
export type { 
  DashboardData, 
  StudySession, 
  LearningProgress 
} from './QueryService';

// Migration and setup service
export { MigrationService, migrationService } from './MigrationService';
export type { 
  MigrationResult, 
  SeedDataOptions 
} from './MigrationService';

// Testing utilities
export { DatabaseTester, databaseTester } from './DatabaseTester';

// Convenience exports for common operations
export const DatabaseServices = {
  dictionary: dictionaryService,
  word: wordService,
  example: exampleService,
  query: queryService,
  migration: migrationService,
  universal: SQLiteUniversal,
} as const;

// Type exports for external use
export type { Example as ExampleModel } from './ExampleService';
export type { Word as WordModel, WordWithExamples as WordWithExamplesModel } from './WordService';
export type { Dictionary as DictionaryModel } from './DictionaryService';