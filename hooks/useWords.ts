// hooks/useWords.ts
import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import {
  WordFilters,
  WordWithExamples,
} from "../data/DataModels";
import { WordService, CreateWordRequest, UpdateWordRequest } from "../services/WordService";

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
 * Enhanced hook for managing words data and CRUD operations
 * Single Responsibility: Manage words data and operations
 * Open/Closed: Can be extended with additional word operations
 * Interface Segregation: Separates words logic from UI
 */
export const useWords = (
  dictionaryId?: number
): WordsState & WordsActions => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [words, setWords] = useState<WordWithExamples[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWord, setSelectedWord] = useState<WordWithExamples | null>(null);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  });

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
  });

  // Filter words based on search query (client-side filtering for immediate feedback)
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

  const loadData = async (reset: boolean = true) => {
    try {
      setError(null);
      if (reset) setLoading(true);

      const currentPage = reset ? 1 : pagination.page;

      const response = await WordService.getWords(
        {
          ...filters,
          search: searchQuery || filters.search,
        },
        currentPage,
        pagination.limit,
      );

      if (response.success && response.data) {
        if (reset) {
          setWords(response.data.words);
          setPagination({
            page: response.data.page,
            limit: response.data.limit,
            total: response.data.total,
            hasMore: response.data.words.length === response.data.limit,
          });
        } else {
          // Load more - append to existing words
          setWords((prev) => [...prev, ...response.data!.words]);
          setPagination((prev) => ({
            ...prev,
            page: response.data!.page,
            hasMore: response.data!.words.length === response.data!.limit,
          }));
        }
      } else {
        setError(response.error || "Failed to load words");
      }
    } catch (err) {
      setError("Failed to load words. Please try again.");
      console.error("Error loading words:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!pagination.hasMore || loading || refreshing) {
      return;
    }

    setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    await loadData(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPagination((prev) => ({ ...prev, page: 1 }));
    await loadData(true);
    setRefreshing(false);
  };

  const createWord = async (wordData: CreateWordRequest): Promise<boolean> => {
    try {
      const response = await WordService.create(wordData);

      if (response.success && response.data) {
        // Add new word to the beginning of the list
        setWords((prev) => [response.data!, ...prev]);
        setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
        return true;
      } else {
        setError(response.error || "Failed to create word");
        Alert.alert("Error", response.error || "Failed to create word");
        return false;
      }
    } catch (err) {
      const errorMessage = "Failed to create word. Please try again.";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
      return false;
    }
  };

  const updateWord = async (id: number, wordData: UpdateWordRequest): Promise<boolean> => {
    try {
      const response = await WordService.update(id, wordData);

      if (response.success && response.data) {
        // Update word in the list
        setWords((prev) =>
          prev.map((word) => (word.id === id ? response.data! : word)),
        );
        setSelectedWord(response.data);
        return true;
      } else {
        setError(response.error || "Failed to update word");
        Alert.alert("Error", response.error || "Failed to update word");
        return false;
      }
    } catch (err) {
      const errorMessage = "Failed to update word. Please try again.";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
      return false;
    }
  };

  const deleteWord = async (id: number): Promise<boolean> => {
    try {
      const response = await WordService.delete(id);

      if (response.success) {
        // Remove word from the list
        setWords((prev) => prev.filter((word) => word.id !== id));
        setPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));
        setSelectedWord(null);
        setShowActionsModal(false);
        return true;
      } else {
        setError(response.error || "Failed to delete word");
        Alert.alert("Error", response.error || "Failed to delete word");
        return false;
      }
    } catch (err) {
      const errorMessage = "Failed to delete word. Please try again.";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
      return false;
    }
  };

  const updateWordProgress = async (
    id: number,
    correct: boolean,
  ): Promise<boolean> => {
    try {
      const response = await WordService.updateProgress(id, correct);

      if (response.success) {
        // Update word progress in the list
        setWords((prev) =>
          prev.map((word) => {
            if (word.id === id) {
              const newReviewCount = (word.reviewCount || 0) + 1;
              const currentRate = word.rate || 0;
              let newRate = currentRate;
              if (correct) {
                newRate = Math.min(currentRate + 1, 5);
              } else {
                newRate = Math.max(currentRate - 1, 0);
              }

              return {
                ...word,
                lastReviewDate: new Date().toISOString(),
                reviewCount: newReviewCount,
                rate: newRate,
                updatedAt: new Date().toISOString(),
              };
            }
            return word;
          }),
        );
        return true;
      } else {
        setError(response.error || "Failed to update word progress");
        return false;
      }
    } catch (err) {
      setError("Failed to update word progress. Please try again.");
      return false;
    }
  };

  const searchWords = async (query: string) => {
    setSearchQuery(query);
    setFiltersState((prev) => ({ ...prev, search: query }));
    setPagination((prev) => ({ ...prev, page: 1 }));
    setLoading(true);
    await loadData(true);
  };

  const getRandomWords = async (
    count: number = 10,
  ): Promise<WordWithExamples[]> => {
    try {
      const response = await WordService.getRandomWords(
        count,
        dictionaryId,
        filters,
      );

      if (response.success && response.data) {
        return response.data.words;
      } else {
        setError(response.error || "Failed to get random words");
        return [];
      }
    } catch (err) {
      setError("Failed to get random words. Please try again.");
      return [];
    }
  };

  const getWordsForReview = async (limit: number = 20): Promise<WordWithExamples[]> => {
    try {
      const response = await WordService.getWordsForReview(limit);

      if (response.success && response.data) {
        return response.data.words;
      } else {
        setError(response.error || "Failed to get words for review");
        return [];
      }
    } catch (err) {
      setError("Failed to get words for review. Please try again.");
      return [];
    }
  };

  const exportWords = async (dictionaryId?: number): Promise<WordWithExamples[]> => {
    try {
      const response = await WordService.exportWords(dictionaryId);

      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || "Failed to export words");
        return [];
      }
    } catch (err) {
      setError("Failed to export words. Please try again.");
      return [];
    }
  };

  // UI handlers
  const handleWordMenu = (word: WordWithExamples) => {
    setSelectedWord(word);
    setShowActionsModal(true);
  };

  // Update filters and reload data
  const setFilters = (newFilters: WordFilters) => {
    setFiltersState(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setLoading(true);
    loadData(true);
  };

  // Load data when filters or dictionaryId changes
  useEffect(() => {
    if (dictionaryId) {
      setFiltersState((prev) => ({ ...prev, dictionaryId }));
    }
    loadData(true);
  }, [dictionaryId]);

  // Reload data when filters change (except search which is handled separately)
  useEffect(() => {
    if (!loading) {
      loadData(true);
    }
  }, [
    filters.partOfSpeech,
    filters.level,
    filters.language,
    filters.isIrregular,
    filters.tagIds,
    filters.sortBy,
    filters.sortOrder,
  ]);

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