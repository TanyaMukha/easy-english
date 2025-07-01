// hooks/useWords.ts - Enhanced to work with SetService and updated services
import { useState, useCallback } from 'react';
import { wordService, queryService, setService } from '../services/database';
import type { 
  WordWithExamples, 
  WordSearchFilter, 
  WordCreateRequest,
  WordUpdateRequest,
  DatabaseResult 
} from '../services/database';

interface UseWordsState {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  words: WordWithExamples[];
  filteredWords: WordWithExamples[];
  searchQuery: string;
  selectedWord: WordWithExamples | null;
  showActionsModal: boolean;
  filters: WordSearchFilter;
  showFilters: boolean;
  pagination: {
    hasMore: boolean;
    page: number;
    limit: number;
  };
}

interface UseWordsActions {
  // Core word operations
  getRandomWords: (count: number, dictionaryId?: number) => Promise<DatabaseResult<WordWithExamples>>;
  getWordsForReview: (count?: number, dictionaryId?: number) => Promise<DatabaseResult<WordWithExamples>>;
  searchWords: (filter: WordSearchFilter, limit?: number) => Promise<DatabaseResult<WordWithExamples>>;
  createWord: (wordData: WordCreateRequest) => Promise<DatabaseResult<WordWithExamples>>;
  updateWord: (wordId: number, updateData: WordUpdateRequest) => Promise<DatabaseResult<WordWithExamples>>;
  deleteWord: (wordId: number) => Promise<DatabaseResult>;
  updateWordProgress: (wordId: number, isCorrect: boolean, difficulty?: 1 | 2 | 3) => Promise<DatabaseResult>;
  
  // Set-related operations
  addWordToSet: (wordId: number, setId: number) => Promise<DatabaseResult>;
  removeWordFromSet: (wordId: number, setId: number) => Promise<DatabaseResult>;
  getWordsInSet: (setId: number) => Promise<DatabaseResult<WordWithExamples>>;
  getSetsForWord: (wordId: number) => Promise<DatabaseResult>;
  
  // UI state management
  setSearchQuery: (query: string) => void;
  setFilters: (filters: WordSearchFilter) => void;
  setShowFilters: (show: boolean) => void;
  setShowActionsModal: (show: boolean) => void;
  setSelectedWord: (word: WordWithExamples | null) => void;
  
  // Data management
  onRefresh: () => Promise<void>;
  loadData: () => Promise<void>;
  loadMore: () => Promise<void>;
  handleWordMenu: (word: WordWithExamples) => void;
}

/**
 * Enhanced words hook with comprehensive functionality
 * 
 * This hook provides a complete interface for word-related operations
 * including set management, search, filtering, and CRUD operations.
 * It integrates with multiple services for full functionality.
 * 
 * Key features:
 * - Complete CRUD operations for words
 * - Set-word relationship management
 * - Advanced search and filtering
 * - Pagination support
 * - Learning progress tracking
 * - UI state management
 */
export const useWords = (): UseWordsState & UseWordsActions => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [words, setWords] = useState<WordWithExamples[]>([]);
  const [filteredWords, setFilteredWords] = useState<WordWithExamples[]>([]);
  const [searchQuery, setSearchQueryState] = useState('');
  const [selectedWord, setSelectedWord] = useState<WordWithExamples | null>(null);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [filters, setFiltersState] = useState<WordSearchFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    hasMore: true,
    page: 1,
    limit: 20
  });

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
        setFilteredWords(result.data || []);
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
        setFilteredWords(result.data || []);
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
        const newWords = result.data || [];
        setWords(newWords);
        setFilteredWords(newWords);
        
        setPagination(prev => ({
          ...prev,
          hasMore: newWords.length >= (limit || prev.limit)
        }));
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
   * Create a new word
   */
  const createWord = useCallback(async (wordData: WordCreateRequest): Promise<DatabaseResult<WordWithExamples>> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await wordService.createWord(wordData);
      
      if (result.success && result.data) {
        // Add to local state
        const newWord = result.data[0];
        if (newWord) {
          setWords(prev => [newWord, ...prev]);
          setFilteredWords(prev => [newWord, ...prev]);
        }
      } else {
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
   * Update a word
   */
  const updateWord = useCallback(async (wordId: number, updateData: WordUpdateRequest): Promise<DatabaseResult<WordWithExamples>> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await wordService.updateWord(wordId, updateData);
      
        if (result.success && result.data) {
        const updatedWord = result.data[0];
        
        if (updatedWord) {
          // Update local state
          setWords(prev => prev.map(word => 
            word.id === wordId ? updatedWord : word
          ));
          setFilteredWords(prev => prev.map(word => 
            word.id === wordId ? updatedWord : word
          ));
        }
      } else {
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
      
      if (result.success) {
        // Remove from local state
        setWords(prev => prev.filter(word => word.id !== wordId));
        setFilteredWords(prev => prev.filter(word => word.id !== wordId));
      } else {
        setError(result.error || 'Failed to delete word');
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
   * Add word to set
   */
  const addWordToSet = useCallback(async (wordId: number, setId: number): Promise<DatabaseResult> => {
    try {
      const result = await setService.addWordToSet(setId, wordId);
      
      if (!result.success) {
        setError(result.error || 'Failed to add word to set');
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
   * Remove word from set
   */
  const removeWordFromSet = useCallback(async (wordId: number, setId: number): Promise<DatabaseResult> => {
    try {
      const result = await setService.removeWordFromSet(setId, wordId);
      
      if (!result.success) {
        setError(result.error || 'Failed to remove word from set');
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
   * Get words in a set
   */
  const getWordsInSet = useCallback(async (setId: number): Promise<DatabaseResult<WordWithExamples>> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await setService.getSetWords(setId);
      
      if (result.success) {
        setWords(result.data || []);
        setFilteredWords(result.data || []);
      } else {
        setError(result.error || 'Failed to get words in set');
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
   * Get sets for a word
   */
  const getSetsForWord = useCallback(async (wordId: number): Promise<DatabaseResult> => {
    try {
      const result = await setService.getSetsForWord(wordId);
      
      if (!result.success) {
        setError(result.error || 'Failed to get sets for word');
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
   * Set search query and filter words
   */
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
    
    if (!query.trim()) {
      setFilteredWords(words);
      return;
    }
    
    const filtered = words.filter(word =>
      word.word.toLowerCase().includes(query.toLowerCase()) ||
      (word.translation && word.translation.toLowerCase().includes(query.toLowerCase())) ||
      (word.definition && word.definition.toLowerCase().includes(query.toLowerCase()))
    );
    
    setFilteredWords(filtered);
  }, [words]);

  /**
   * Set filters and apply them
   */
  const setFilters = useCallback((newFilters: WordSearchFilter) => {
    setFiltersState(newFilters);
    
    // Apply search with new filters
    searchWords(newFilters, pagination.limit);
  }, [searchWords, pagination.limit]);

  /**
   * Load data with current filters
   */
  const loadData = useCallback(async () => {
    const currentFilters = { ...filters };
    if (searchQuery.trim()) {
      currentFilters.searchTerm = searchQuery.trim();
    }
    
    await searchWords(currentFilters, pagination.limit);
  }, [searchWords, filters, searchQuery, pagination.limit]);

  /**
   * Refresh data (for pull-to-refresh)
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  /**
   * Load more data (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!pagination.hasMore || loading || refreshing) {
      return;
    }

    setLoading(true);
    
    try {
      const currentFilters = { ...filters };
      if (searchQuery.trim()) {
        currentFilters.searchTerm = searchQuery.trim();
      }

      const result = await wordService.searchWords(
        currentFilters, 
        pagination.limit * (pagination.page + 1)
      );
      
      if (result.success) {
        const newWords = result.data || [];
        const uniqueNewWords = newWords.filter(newWord => 
          !words.some(existingWord => existingWord.id === newWord.id)
        );
        
        setWords(prev => [...prev, ...uniqueNewWords]);
        setFilteredWords(prev => [...prev, ...uniqueNewWords]);
        
        setPagination(prev => ({
          ...prev,
          page: prev.page + 1,
          hasMore: uniqueNewWords.length > 0 && newWords.length >= pagination.limit * (pagination.page + 1)
        }));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [pagination, loading, refreshing, filters, searchQuery, words]);

  /**
   * Handle word menu actions
   */
  const handleWordMenu = useCallback((word: WordWithExamples) => {
    setSelectedWord(word);
    setShowActionsModal(true);
  }, []);

  return {
    // State
    loading,
    refreshing,
    error,
    words,
    filteredWords,
    searchQuery,
    selectedWord,
    showActionsModal,
    filters,
    showFilters,
    pagination,
    
    // Core word operations
    getRandomWords,
    getWordsForReview,
    searchWords,
    createWord,
    updateWord,
    deleteWord,
    updateWordProgress,
    
    // Set-related operations
    addWordToSet,
    removeWordFromSet,
    getWordsInSet,
    getSetsForWord,
    
    // UI state management
    setSearchQuery,
    setFilters,
    setShowFilters,
    setShowActionsModal,
    setSelectedWord,
    
    // Data management
    onRefresh,
    loadData,
    loadMore,
    handleWordMenu,
  };
};