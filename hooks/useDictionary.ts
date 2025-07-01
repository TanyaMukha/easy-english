// hooks/useDictionary.ts - Updated to use new database services
import { useEffect, useMemo, useState, useCallback } from "react";

import { dictionaryService, wordService } from '../services/database';
import type { 
  Dictionary, 
  WordWithExamples, 
  WordSearchFilter, 
  PartOfSpeech,
  DatabaseResult 
} from '../services/database';

interface WordFilters {
  partOfSpeech?: PartOfSpeech[];
  level?: string[];
  isIrregular?: boolean;
  searchTerm?: string;
  minRate?: number;
  maxRate?: number;
  sortBy?: 'word' | 'createdAt' | 'rate' | 'reviewCount';
  sortOrder?: 'asc' | 'desc';
}

interface DictionaryState {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  dictionary: Dictionary | null;
  words: WordWithExamples[];
  searchQuery: string;
  filteredWords: WordWithExamples[];
  showFilters: boolean;
  filters: WordFilters;
  pagination: {
    hasMore: boolean;
    page: number;
    limit: number;
  };
  stats: {
    totalWords: number;
    studiedWords: number;
    averageRate: number;
    newWords: number;
    reviewWords: number;
  };
}

interface DictionaryActions {
  setSearchQuery: (query: string) => void;
  setShowFilters: (show: boolean) => void;
  setFilters: (filters: WordFilters) => void;
  onRefresh: () => Promise<void>;
  loadData: () => Promise<void>;
  loadMore: () => Promise<void>;
  searchWords: (filters: WordFilters) => Promise<void>;
  updateDictionary: (updates: { title?: string; description?: string }) => Promise<DatabaseResult>;
  deleteDictionary: () => Promise<DatabaseResult>;
  navigateToWord: (wordId: number) => void;
  navigateToAddWord: () => void;
  navigateToEditDictionary: () => void;
  handleFilterChange: (newFilters: Partial<WordFilters>) => void;
}

/**
 * Enhanced dictionary hook using new database services
 * 
 * This hook provides comprehensive management for individual dictionaries with:
 * - Real database integration via DictionaryService and WordService
 * - Advanced word filtering and search capabilities
 * - Pagination support for large word collections
 * - Dictionary statistics and analytics
 * - CRUD operations for both dictionary and words
 * 
 * Key improvements:
 * - Uses real services instead of mock data
 * - Better performance with optimized queries
 * - Enhanced filtering and search capabilities
 * - Consistent error handling
 * - Statistics tracking
 */
export const useDictionary = (
  dictionaryId: number,
  navigation?: any,
): DictionaryState & DictionaryActions => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);
  const [words, setWords] = useState<WordWithExamples[]>([]);
  const [searchQuery, setSearchQueryState] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFiltersState] = useState<WordFilters>({
    sortBy: "word",
    sortOrder: "asc",
  });
  const [pagination, setPagination] = useState({
    hasMore: true,
    page: 1,
    limit: 50
  });
  const [stats, setStats] = useState({
    totalWords: 0,
    studiedWords: 0,
    averageRate: 0,
    newWords: 0,
    reviewWords: 0
  });

  /**
   * Filter and sort words based on search query and filters
   */
  const filteredWords = useMemo(() => {
    let result = [...words];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (word) =>
          word.word.toLowerCase().includes(query) ||
          word.translation?.toLowerCase().includes(query) ||
          word.definition?.toLowerCase().includes(query) ||
          word.explanation?.toLowerCase().includes(query)
      );
    }

    // Apply part of speech filter
    if (filters.partOfSpeech && filters.partOfSpeech.length > 0) {
      result = result.filter((word) =>
        filters.partOfSpeech!.includes(word.partOfSpeech),
      );
    }

    // Apply level filter
    if (filters.level && filters.level.length > 0) {
      result = result.filter((word) => 
        word.level && filters.level!.includes(word.level)
      );
    }

    // Apply irregular filter
    if (filters.isIrregular !== undefined) {
      result = result.filter(
        (word) => word.isIrregular === filters.isIrregular,
      );
    }

    // Apply rate filter
    if (filters.minRate !== undefined) {
      result = result.filter((word) => word.rate >= filters.minRate!);
    }
    if (filters.maxRate !== undefined) {
      result = result.filter((word) => word.rate <= filters.maxRate!);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case 'word':
          aValue = a.word.toLowerCase();
          bValue = b.word.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'rate':
          aValue = a.rate;
          bValue = b.rate;
          break;
        case 'reviewCount':
          aValue = a.reviewCount;
          bValue = b.reviewCount;
          break;
        default:
          aValue = a.word.toLowerCase();
          bValue = b.word.toLowerCase();
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [words, searchQuery, filters]);

  /**
   * Load dictionary data
   */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load dictionary details
      const dictionaryResult = await dictionaryService.getDictionaryById(dictionaryId);
      
      if (!dictionaryResult.success || !dictionaryResult.data || dictionaryResult.data.length === 0) {
        setError(dictionaryResult.error || 'Dictionary not found');
        return;
      }

      setDictionary(dictionaryResult.data[0] || null);

      // Load words for this dictionary
      const wordsResult = await wordService.searchWords({
        dictionaryId: dictionaryId
      }, pagination.limit);

      if (wordsResult.success && wordsResult.data) {
        setWords(wordsResult.data);
        setPagination(prev => ({
          ...prev,
          page: 1,
          hasMore: wordsResult.data!.length >= prev.limit
        }));

        // Calculate statistics
        const totalWords = wordsResult.data.length;
        const studiedWords = wordsResult.data.filter(word => word.rate > 0).length;
        const averageRate = studiedWords > 0 
          ? wordsResult.data.reduce((sum, word) => sum + word.rate, 0) / studiedWords 
          : 0;
        const newWords = wordsResult.data.filter(word => word.reviewCount === 0).length;
        const reviewWords = wordsResult.data.filter(word => word.reviewCount > 0 && word.rate < 4).length;

        setStats({
          totalWords,
          studiedWords,
          averageRate,
          newWords,
          reviewWords
        });
      } else {
        setWords([]);
        setStats({
          totalWords: 0,
          studiedWords: 0,
          averageRate: 0,
          newWords: 0,
          reviewWords: 0
        });
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load dictionary: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [dictionaryId, pagination.limit]);

  /**
   * Load more words (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!pagination.hasMore || loading || refreshing) {
      return;
    }

    setLoading(true);
    
    try {
      const searchFilter: WordSearchFilter = {
        dictionaryId: dictionaryId,
        ...filters,
        partOfSpeech: filters.partOfSpeech ? filters.partOfSpeech[0] : undefined,
        level: filters.level ? filters.level[0] : undefined,
      };

      const result = await wordService.searchWords(
        searchFilter,
        pagination.limit * (pagination.page + 1)
      );
      
      if (result.success && result.data) {
        const newWords = result.data;
        const uniqueNewWords = newWords.filter(newWord => 
          !words.some(existingWord => existingWord.id === newWord.id)
        );
        
        if (uniqueNewWords.length > 0) {
          setWords(prev => [...prev, ...uniqueNewWords]);
          setPagination(prev => ({
            ...prev,
            page: prev.page + 1,
            hasMore: uniqueNewWords.length >= pagination.limit
          }));
        } else {
          setPagination(prev => ({ ...prev, hasMore: false }));
        }
      }
    } catch (err) {
      console.error('Error loading more words:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination, loading, refreshing, dictionaryId, filters, words]);

  /**
   * Search words with filters
   */
  const searchWords = useCallback(async (searchFilters: WordFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const searchFilter: WordSearchFilter = {
        dictionaryId: dictionaryId,
        searchTerm: searchFilters.searchTerm,
        partOfSpeech: searchFilters.partOfSpeech?.[0], // Service accepts single value
        level: searchFilters.level?.[0], // Service accepts single value
        isIrregular: searchFilters.isIrregular,
        minRate: searchFilters.minRate,
        maxRate: searchFilters.maxRate
      };

      const result = await wordService.searchWords(searchFilter, pagination.limit);
      
      if (result.success && result.data) {
        setWords(result.data);
        setPagination(prev => ({
          ...prev,
          page: 1,
          hasMore: result.data!.length >= prev.limit
        }));
      } else {
        setError(result.error || 'Failed to search words');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [dictionaryId, pagination.limit]);

  /**
   * Refresh data (for pull-to-refresh)
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  /**
   * Update dictionary
   */
  const updateDictionary = useCallback(async (updates: { title?: string; description?: string }): Promise<DatabaseResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await dictionaryService.updateDictionary(dictionaryId, updates);
      
      if (result.success && result.data) {
        setDictionary(result.data[0] || null);
      } else {
        setError(result.error || 'Failed to update dictionary');
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
  }, [dictionaryId]);

  /**
   * Delete dictionary
   */
  const deleteDictionary = useCallback(async (): Promise<DatabaseResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await dictionaryService.deleteDictionary(dictionaryId);
      
      if (!result.success) {
        setError(result.error || 'Failed to delete dictionary');
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
  }, [dictionaryId]);

  /**
   * Set search query and apply filters
   */
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
    
    const newFilters = { ...filters, searchTerm: query };
    if (query.trim()) {
      searchWords(newFilters);
    }
  }, [filters, searchWords]);

  /**
   * Update filters and apply them
   */
  const setFilters = useCallback((newFilters: WordFilters) => {
    setFiltersState(newFilters);
    searchWords(newFilters);
  }, [searchWords]);

  /**
   * Handle filter changes
   */
  const handleFilterChange = useCallback((newFilters: Partial<WordFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
  }, [filters, setFilters]);

  /**
   * Navigation handlers
   */
  const navigateToWord = useCallback((wordId: number) => {
    console.log('Navigate to word:', wordId);
    if (navigation) {
      navigation.navigate('WordDetails', { wordId });
    }
  }, [navigation]);

  const navigateToAddWord = useCallback(() => {
    console.log('Navigate to add word to dictionary:', dictionaryId);
    if (navigation) {
      navigation.navigate('CreateWord', { dictionaryId });
    }
  }, [navigation, dictionaryId]);

  const navigateToEditDictionary = useCallback(() => {
    console.log('Navigate to edit dictionary:', dictionaryId);
    if (navigation) {
      navigation.navigate('EditDictionary', { dictionaryId });
    }
  }, [navigation, dictionaryId]);

  /**
   * Load data on component mount and when dictionaryId changes
   */
  useEffect(() => {
    if (dictionaryId) {
      loadData();
    }
  }, [dictionaryId, loadData]);

  return {
    // State
    loading,
    refreshing,
    error,
    dictionary,
    words,
    searchQuery,
    filteredWords,
    showFilters,
    filters,
    pagination,
    stats,
    
    // Actions
    setSearchQuery,
    setShowFilters,
    setFilters,
    onRefresh,
    loadData,
    loadMore,
    searchWords,
    updateDictionary,
    deleteDictionary,
    navigateToWord,
    navigateToAddWord,
    navigateToEditDictionary,
    handleFilterChange,
  };
};