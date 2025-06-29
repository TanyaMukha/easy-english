// hooks/useWords.ts

import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

import {
  WordWithExamples,
} from "../data/DataModels";
import {
  WordCrudService,
  WordQueryService,
  WordProgressService,
  CreateWordRequest,
  UpdateWordRequest,
  WordFilters,
} from "../services/words";

interface WordsState {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  words: WordWithExamples[];
  searchQuery: string;
  filteredWords: WordWithExamples[];
  selectedWord: WordWithExamples | null;
  showActionsModal: boolean;
  filters: WordFilters;
  showFilters: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

interface WordsActions {
  setSearchQuery: (query: string) => void;
  setSelectedWord: (word: WordWithExamples | null) => void;
  setShowActionsModal: (show: boolean) => void;
  setFilters: (filters: WordFilters) => void;
  setShowFilters: (show: boolean) => void;
  onRefresh: () => Promise<void>;
  loadData: () => Promise<void>;
  loadMore: () => Promise<void>;
  createWord: (wordData: CreateWordRequest) => Promise<boolean>;
  updateWord: (id: number, wordData: UpdateWordRequest) => Promise<boolean>;
  deleteWord: (id: number) => Promise<boolean>;
  updateWordProgress: (id: number, correct: boolean) => Promise<boolean>;
  handleWordMenu: (word: WordWithExamples) => void;
  searchWords: (query: string) => Promise<void>;
  getRandomWords: (count?: number) => Promise<WordWithExamples[]>;
  getWordsForReview: (limit?: number) => Promise<WordWithExamples[]>;
  exportWords: (dictionaryId?: number) => Promise<WordWithExamples[]>;
}

/**
 * Enhanced words management hook using modular services architecture
 * 
 * Single Responsibility: Manage words data and operations with comprehensive CRUD support
 * Open/Closed: Can be extended with additional word operations without modifying existing code
 * Interface Segregation: Separates words logic from UI concerns
 * Dependency Inversion: Depends on service abstractions, not concrete implementations
 * 
 * This hook now uses specialized services:
 * - WordQueryService for search and filtering operations
 * - WordCrudService for create, read, update, delete operations
 * - WordProgressService for learning progress tracking
 * 
 * Key improvements:
 * - Better separation of concerns between different types of operations
 * - More robust error handling with specific error types
 * - Enhanced pagination support with proper state management
 * - Client-side filtering for immediate UI feedback combined with server-side search
 * - Progress tracking integration for learning features
 */
export const useWords = (
  dictionaryId?: number
): WordsState & WordsActions => {
  // Core data state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [words, setWords] = useState<WordWithExamples[]>([]);

  // Search and filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFiltersState] = useState<WordFilters>({
    dictionaryId,
    partOfSpeech: [],
    level: [],
    language: undefined,
    isIrregular: undefined,
    search: "",
    tagIds: [],
    sortBy: "word",
    sortOrder: "asc",
  } as unknown as WordFilters);

  // UI state management
  const [selectedWord, setSelectedWord] = useState<WordWithExamples | null>(null);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  });

  // Client-side filtering for immediate feedback
  // This provides instant search results while the user types,
  // complementing server-side search for comprehensive results
  const filteredWords = useMemo(() => {
    if (!searchQuery.trim()) {
      return words;
    }

    const query = searchQuery.toLowerCase().trim();
    return words.filter(
      (word) =>
        word.word.toLowerCase().includes(query) ||
        word.translation?.toLowerCase().includes(query) ||
        word.definition?.toLowerCase().includes(query) ||
        word.explanation?.toLowerCase().includes(query) ||
        word.examples?.some(
          (ex) =>
            ex.sentence.toLowerCase().includes(query) ||
            ex.translation?.toLowerCase().includes(query),
        ),
    );
  }, [words, searchQuery]);

  // Load data with proper error handling and pagination
  const loadData = async (reset: boolean = true) => {
    try {
      setError(null);
      if (reset) {
        setLoading(true);
        setPagination(prev => ({ ...prev, page: 1 }));
      }

      const currentPage = reset ? 1 : pagination.page;
      
      // Convert local filters to service filters format
      const serviceFilters: WordFilters = {
        ...filters,
        limit: pagination.limit,
        offset: (currentPage - 1) * pagination.limit,
      };

      // Use WordQueryService for data fetching with filters
      const response = await WordQueryService.getAll(serviceFilters);
      
      if (response.success && response.data) {
        if (reset) {
          setWords(response.data);
        } else {
          // Append for pagination
          setWords(prev => [...prev, ...response.data!]);
        }
        
        // Update pagination state
        setPagination(prev => ({
          ...prev,
          total: response.total as number,
          page: currentPage,
          hasMore: true //response.hasMore,
        }));
      } else {
        throw new Error(response.error || "Failed to load words");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("Error loading words:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load more data for pagination
  const loadMore = async () => {
    if (pagination.hasMore && !loading && !refreshing) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
      await loadData(false);
    }
  };

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(true);
  };

  // Create new word with comprehensive error handling
  const createWord = async (wordData: CreateWordRequest): Promise<boolean> => {
    try {
      const response = await WordCrudService.create(wordData);
      
      if (response.success && response.data) {
        // Add new word to local state to provide immediate feedback
        setWords(prev => [response.data!, ...prev]);
        setPagination(prev => ({ ...prev, total: prev.total + 1 }));
        return true;
      } else {
        Alert.alert("Error", response.error || "Failed to create word");
        return false;
      }
    } catch (error) {
      console.error("Error creating word:", error);
      Alert.alert("Error", "Failed to create word. Please try again.");
      return false;
    }
  };

  // Update existing word with optimistic updates
  const updateWord = async (id: number, wordData: UpdateWordRequest): Promise<boolean> => {
    try {
      const response = await WordCrudService.update(id, wordData);
      
      if (response.success && response.data) {
        // Update local state optimistically
        setWords(prev =>
          prev.map(word => (word.id === id ? response.data! : word))
        );
        return true;
      } else {
        Alert.alert("Error", response.error || "Failed to update word");
        return false;
      }
    } catch (error) {
      console.error("Error updating word:", error);
      Alert.alert("Error", "Failed to update word. Please try again.");
      return false;
    }
  };

  // Delete word with confirmation and state cleanup
  const deleteWord = async (id: number): Promise<boolean> => {
    try {
      const response = await WordCrudService.delete(id);
      
      if (response.success) {
        // Remove from local state
        setWords(prev => prev.filter(word => word.id !== id));
        setPagination(prev => ({ ...prev, total: prev.total - 1 }));
        
        // Clear selected word if it was deleted
        if (selectedWord?.id === id) {
          setSelectedWord(null);
          setShowActionsModal(false);
        }
        
        return true;
      } else {
        Alert.alert("Error", response.error || "Failed to delete word");
        return false;
      }
    } catch (error) {
      console.error("Error deleting word:", error);
      Alert.alert("Error", "Failed to delete word. Please try again.");
      return false;
    }
  };

  // Update word learning progress
  const updateWordProgress = async (id: number, correct: boolean): Promise<boolean> => {
    try {
      const response = await WordProgressService.updateProgress(id, correct);
      
      if (response.success) {
        // Update local word data with new progress
        setWords(prev =>
          prev.map(word => (word.id === id ? { ...word } : word))
        );
        return true;
      } else {
        console.error("Failed to update word progress:", response.error);
        return false;
      }
    } catch (error) {
      console.error("Error updating word progress:", error);
      return false;
    }
  };

  // Handle word menu actions
  const handleWordMenu = (word: WordWithExamples) => {
    setSelectedWord(word);
    setShowActionsModal(true);
  };

  // Server-side search with debouncing support
  const searchWords = async (query: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await WordQueryService.search(query, pagination.limit);
      
      if (response.success && response.data) {
        setWords(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.total as number,
          page: 1,
          hasMore: true,
        }));
      } else {
        throw new Error(response.error || "Search failed");
      }
    } catch (error) {
      console.error("Error searching words:", error);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get random words for practice
  const getRandomWords = async (count: number = 10): Promise<WordWithExamples[]> => {
    debugger;
    try {
      const response = await WordQueryService.getRandomWords(count, {
        dictionaryId: filters.dictionaryId,
        level: filters.level?.[0],
        partOfSpeech: filters.partOfSpeech,
      } as WordFilters);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        console.error("Failed to get random words:", response.error);
        return [];
      }
    } catch (error) {
      console.error("Error getting random words:", error);
      return [];
    }
  };

  // Get words that need review for spaced repetition
  const getWordsForReview = async (limit: number = 10): Promise<WordWithExamples[]> => {
    try {
      const response = await WordProgressService.getWordsForReview(limit);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        console.error("Failed to get words for review:", response.error);
        return [];
      }
    } catch (error) {
      console.error("Error getting words for review:", error);
      return [];
    }
  };

  // Export words for backup or sharing
  const exportWords = async (exportDictionaryId?: number): Promise<WordWithExamples[]> => {
    try {
      const response = await WordQueryService.getAll({
        dictionaryId: exportDictionaryId || filters.dictionaryId,
        limit: 1000, // Large limit for export
      } as WordFilters);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        console.error("Failed to export words:", response.error);
        return [];
      }
    } catch (error) {
      console.error("Error exporting words:", error);
      return [];
    }
  };

  // Update filters and reload data
  const setFilters = (newFilters: WordFilters) => {
    setFiltersState(newFilters);
    // Auto-reload when filters change
    loadData(true);
  };

  // Initial data load and filter change effects
  useEffect(() => {
    loadData(true);
  }, [dictionaryId]); // Reload when dictionary changes

  // Reload data when filters change
  useEffect(() => {
    if (filters.search && filters.search !== searchQuery) {
      searchWords(filters.search);
    } else if (!filters.search && searchQuery) {
      loadData(true);
    }
  }, [filters]);

  return {
    // State
    loading,
    refreshing,
    error,
    words,
    searchQuery,
    filteredWords,
    selectedWord,
    showActionsModal,
    filters,
    showFilters,
    pagination,

    // Actions
    setSearchQuery,
    setSelectedWord,
    setShowActionsModal,
    setFilters,
    setShowFilters,
    onRefresh,
    loadData,
    loadMore,
    createWord,
    updateWord,
    deleteWord,
    updateWordProgress,
    handleWordMenu,
    searchWords,
    getRandomWords,
    getWordsForReview,
    exportWords,
  };
};

export default useWords;