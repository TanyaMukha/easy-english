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
import { WordService } from './WordService';

// Core database services
export { DatabaseService } from './DatabaseService';
export { MockDataService } from './MockDataService';

// Entity services
export { DictionaryService } from './DictionaryService';
export { WordService } from './WordService';
export { SetService } from './SetService';

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
  WordFilters,
  WordResponse,
  WordsListResponse,
} from './WordService';

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
export const initializeDatabase = async () => {
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

  } catch (error) {
    console.error('Service health check failed:', error);
  }

  return results;
};

// Get service statistics
export const getServiceStatistics = async () => {
  try {
    if (DatabaseService.isWeb()) {
      return MockDataService.getStatistics();
    } else {
      // For SQLite, we would query actual database statistics
      const db = await DatabaseService.getDatabase();
      
      const dictCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM dictionaries');
      const wordCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM words');
      const exampleCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM examples');
      const setCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM sets');
      const tagCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM tags');
      const setWordCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM set_words');

      return {
        dictionaries: dictCount?.count || 0,
        words: wordCount?.count || 0,
        examples: exampleCount?.count || 0,
        sets: setCount?.count || 0,
        tags: tagCount?.count || 0,
        setWords: setWordCount?.count || 0,
      };
    }
  } catch (error) {
    console.error('Failed to get service statistics:', error);
    return {
      dictionaries: 0,
      words: 0,
      examples: 0,
      sets: 0,
      tags: 0,
      setWords: 0,
    };
  }
};