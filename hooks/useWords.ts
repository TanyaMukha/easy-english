// hooks/useWords.ts - Updated to use new database services
import { useState, useCallback } from 'react';
import { wordService, queryService } from '../services/database';
import type { WordWithExamples, WordSearchFilter, DatabaseResult } from '../services/database';

interface UseWordsState {
  loading: boolean;
  error: string | null;
  words: WordWithExamples[];
}

interface UseWordsActions {
  getRandomWords: (count: number, dictionaryId?: number) => Promise<DatabaseResult<WordWithExamples>>;
  getWordsForReview: (count?: number, dictionaryId?: number) => Promise<DatabaseResult<WordWithExamples>>;
  searchWords: (filter: WordSearchFilter, limit?: number) => Promise<DatabaseResult<WordWithExamples>>;
  updateWordProgress: (wordId: number, isCorrect: boolean, difficulty?: 1 | 2 | 3) => Promise<DatabaseResult>;
  createWord: (wordData: any) => Promise<DatabaseResult<WordWithExamples>>;
  updateWord: (wordId: number, updateData: any) => Promise<DatabaseResult<WordWithExamples>>;
  deleteWord: (wordId: number) => Promise<DatabaseResult>;
}

/**
 * Enhanced words hook using new database services
 * 
 * This hook provides a clean interface for word-related operations
 * using the new service layer architecture. It maintains the same
 * API as the previous version but uses the more robust services.
 */
export const useWords = (): UseWordsState & UseWordsActions => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [words, setWords] = useState<WordWithExamples[]>([]);

  /**
   * Get random words for study
   */
  const getRandomWords = useCallback(async (count: number, dictionaryId?: number): Promise<DatabaseResult<WordWithExamples>> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await wordService.getRandomWords(count, dictionaryId);
      
      if (result.success) {
        setWords(result.data || []);
      } else {
        setError(result.error || 'Failed to get random words');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get words that need review
   */
  const getWordsForReview = useCallback(async (count?: number, dictionaryId?: number): Promise<DatabaseResult<WordWithExamples>> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await wordService.getWordsForReview(count, dictionaryId);
      
      if (result.success) {
        setWords(result.data || []);
      } else {
        setError(result.error || 'Failed to get words for review');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Search words with filters
   */
  const searchWords = useCallback(async (filter: WordSearchFilter, limit?: number): Promise<DatabaseResult<WordWithExamples>> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await wordService.searchWords(filter, limit);
      
      if (result.success) {
        setWords(result.data || []);
      } else {
        setError(result.error || 'Failed to search words');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update word learning progress
   */
  const updateWordProgress = useCallback(async (
    wordId: number, 
    isCorrect: boolean, 
    difficulty: 1 | 2 | 3 = 2
  ): Promise<DatabaseResult> => {
    try {
      // Use QueryService for enhanced progress tracking
      const result = await queryService.updateLearningProgress(wordId, isCorrect, difficulty);
      
      if (!result.success) {
        setError(result.error || 'Failed to update word progress');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  }, []);

  /**
   * Create a new word
   */
  const createWord = useCallback(async (wordData: any): Promise<DatabaseResult<WordWithExamples>> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await wordService.createWord(wordData);
      
      if (!result.success) {
        setError(result.error || 'Failed to create word');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an existing word
   */
  const updateWord = useCallback(async (wordId: number, updateData: any): Promise<DatabaseResult<WordWithExamples>> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await wordService.updateWord(wordId, updateData);
      
      if (!result.success) {
        setError(result.error || 'Failed to update word');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a word
   */
  const deleteWord = useCallback(async (wordId: number): Promise<DatabaseResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await wordService.deleteWord(wordId);
      
      if (!result.success) {
        setError(result.error || 'Failed to delete word');
      } else {
        // Remove the deleted word from local state
        setWords(prev => prev.filter(word => word.id !== wordId));
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    loading,
    error,
    words,
    
    // Actions
    getRandomWords,
    getWordsForReview,
    searchWords,
    updateWordProgress,
    createWord,
    updateWord,
    deleteWord,
  };
};