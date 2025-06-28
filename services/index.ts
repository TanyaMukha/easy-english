// services/index.ts
/**
 * Services Index - Central export point for all database services
 * Single Responsibility: Provide unified access to all services
 * Open/Closed: Easy to add new services by adding exports here
 */

import { DatabaseService } from './DatabaseService';
import { DictionaryService } from './DictionaryService';
import { MockDataService } from './MockDataService';
import { SetService } from './SetService';

// Import word services
import { 
  WordService,
  WordCrudService,
  WordQueryService, 
  WordProgressService,
  ExampleService,
  WordValidationService
} from './words';

// Core database services
export { DatabaseService } from './DatabaseService';
export { MockDataService } from './MockDataService';

// Entity services
export { DictionaryService } from './DictionaryService';
export { SetService } from './SetService';

// Word services (modular)
export { 
  WordService,           // Combined service for backward compatibility
  WordCrudService,       // CRUD operations only
  WordQueryService,      // Search and filtering only
  WordProgressService,   // Progress tracking only
  ExampleService,        // Examples management only
  WordValidationService  // Validation only
} from './words';

// Type exports for convenience
export type {
  // Dictionary types
  CreateDictionaryRequest,
  UpdateDictionaryRequest,
  DictionaryResponse,
  DictionariesListResponse,
} from './DictionaryService';

export type {
  // Word types
  CreateWordRequest,
  UpdateWordRequest,
  WordResponse,
  WordFilters,
  WordsListResponse,
} from './words';

export type {
  // Example types
  CreateExampleRequest,
  UpdateExampleRequest,
  ExampleResponse,
  ExamplesListResponse,
} from './words';

export type {
  // Set types
  CreateSetRequest,
  UpdateSetRequest,
  AddWordToSetRequest,
  RemoveWordFromSetRequest,
  SetResponse,
  SetsListResponse,
  SetWithWordsResponse,
} from './SetService';

// Platform detection helper
export const isPlatformWeb = (): boolean => {
  return DatabaseService.isWeb();
};

// Database initialization helper
export const initializeDatabase = async (): Promise<boolean> => {
  try {
    await DatabaseService.initialize();
    console.log('Database services initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize database services:', error);
    return false;
  }
};

// Service health check
export const checkServicesHealth = async () => {
  const results = {
    database: false,
    dictionary: false,
    word: false,
    set: false,
    examples: false,
  };

  try {
    // Test database connection
    await DatabaseService.getDatabase();
    results.database = true;

    // Test dictionary service
    const dictResult = await DictionaryService.getAll();
    results.dictionary = dictResult.success;

    // Test word service
    const wordResult = await WordService.getAll({ limit: 1 });
    results.word = wordResult.success;

    // Test set service
    const setResult = await SetService.getAll();
    results.set = setResult.success;

    // Test example service
    const exampleResult = await ExampleService.getByWordId(1);
    results.examples = exampleResult.success;

  } catch (error) {
    console.error('Service health check failed:', error);
  }

  return results;
};

// Get service statistics
export const getServiceStatistics = async () => {
  const stats = {
    words: 0,
    dictionaries: 0,
    sets: 0,
    examples: 0,
  };

  try {
    if (DatabaseService.isWeb()) {
      const mockStats = MockDataService.getStatistics();
      stats.words = mockStats.words;
      stats.dictionaries = mockStats.dictionaries;
      stats.sets = mockStats.sets;
      stats.examples = mockStats.examples;
    } else {
      const db = await DatabaseService.getDatabase();
      
      const wordsCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM words');
      stats.words = (wordsCount as any)?.count || 0;

      const dictsCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM dictionaries');
      stats.dictionaries = (dictsCount as any)?.count || 0;

      const setsCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM sets');
      stats.sets = (setsCount as any)?.count || 0;

      const examplesCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM examples');
      stats.examples = (examplesCount as any)?.count || 0;
    }
  } catch (error) {
    console.error('Error getting service statistics:', error);
  }

  return stats;
};

// Utility functions for common operations
export const WordUtils = {
  // Create word with examples in one transaction
  createWordWithExamples: async (
    wordData: import('./words').CreateWordRequest,
    examples: Array<{ sentence: string; translation?: string }>
  ) => {
    try {
      // Create word first
      const wordResult = await WordService.create(wordData);
      
      if (!wordResult.success || !wordResult.data) {
        return wordResult;
      }

      // Add examples if provided
      if (examples.length > 0) {
        const examplesResult = await ExampleService.createBulk(wordResult.data.id!, examples);
        
        if (examplesResult.success && examplesResult.data) {
          // Update word with examples
          wordResult.data.examples = examplesResult.data;
        }
      }

      return wordResult;
    } catch (error) {
      console.error('Error creating word with examples:', error);
      return { success: false, error: "Failed to create word with examples" };
    }
  },

  // Update word with examples in one transaction
  updateWordWithExamples: async (
    wordId: number,
    wordData: import('./words').UpdateWordRequest,
    examples?: Array<{ sentence: string; translation?: string }>
  ) => {
    try {
      // Update word first
      const wordResult = await WordService.update(wordId, wordData);
      
      if (!wordResult.success || !wordResult.data) {
        return wordResult;
      }

      // Replace examples if provided
      if (examples !== undefined) {
        const examplesResult = await ExampleService.replaceForWord(wordId, examples);
        
        if (examplesResult.success && examplesResult.data) {
          // Update word with new examples
          wordResult.data.examples = examplesResult.data;
        }
      }

      return wordResult;
    } catch (error) {
      console.error('Error updating word with examples:', error);
      return { success: false, error: "Failed to update word with examples" };
    }
  },
};

// Cleanup function for tests or app shutdown
export const cleanupServices = async (): Promise<void> => {
  try {
    await DatabaseService.close();
    console.log('Services cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up services:', error);
  }
};