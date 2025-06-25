import { useEffect, useMemo, useState } from "react";

import {
  Dictionary,
  Level,
  PartOfSpeech,
  WordFilters,
  WordWithExamples,
} from "../data/DataModels";
import { MockDataService } from "../data/MockData";

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
}

interface DictionaryActions {
  setSearchQuery: (query: string) => void;
  setShowFilters: (show: boolean) => void;
  setFilters: (filters: WordFilters) => void;
  onRefresh: () => Promise<void>;
  loadData: () => Promise<void>;
  navigateToWord: (wordId: number) => void;
  navigateToAddWord: () => void;
}

/**
 * Single Responsibility: Manage dictionary data and word filtering
 * Open/Closed: Can be extended with additional word operations
 * Interface Segregation: Separates dictionary logic from UI
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
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<WordFilters>({
    partOfSpeech: undefined,
    level: undefined,
    isIrregular: undefined,
    tagIds: [],
    sortBy: "word",
    sortOrder: "asc",
  });

  // Filter and sort words based on search query and filters
  const filteredWords = useMemo(() => {
    let result = [...words];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (word) =>
          word.word.toLowerCase().includes(query) ||
          word.translation?.toLowerCase().includes(query) ||
          word.definition?.toLowerCase().includes(query),
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
      result = result.filter((word) => filters.level!.includes(word.level));
    }

    // Apply irregular filter
    if (filters.isIrregular !== undefined) {
      result = result.filter(
        (word) => word.isIrregular === filters.isIrregular,
      );
    }

    // Apply tag filter
    if ((filters.tagIds ?? []).length > 0) {
      result = result.filter((word) =>
        word.tags.some((tag) => (filters.tagIds ?? []).includes(tag.id)),
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case "createdAt":
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
        case "reviewCount":
          aValue = a.reviewCount;
          bValue = b.reviewCount;
          break;
        case "rate":
          aValue = a.rate;
          bValue = b.rate;
          break;
        default: // word
          aValue = a.word.toLowerCase();
          bValue = b.word.toLowerCase();
      }

      if (aValue < bValue) {
        return filters.sortOrder === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return filters.sortOrder === "asc" ? 1 : -1;
      }
      return 0;
    });

    return result;
  }, [words, searchQuery, filters]);

  const loadData = async () => {
    try {
      setError(null);
      const [dictionaryData, wordsData] = await Promise.all([
        MockDataService.getDictionary(dictionaryId),
        MockDataService.getWords({ dictionaryId, limit: 100 }),
      ]);

      if (!dictionaryData) {
        setError("Dictionary not found");
        return;
      }

      setDictionary(dictionaryData);
      setWords(wordsData.words);
    } catch (err) {
      setError("Failed to load dictionary. Please try again.");
      console.error("Error loading dictionary:", err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Navigation handlers
  const navigateToWord = (wordId: number) => {
    console.log("Navigate to word:", wordId);
    if (navigation) {
      navigation.navigate("WordDetails", { wordId });
    }
  };

  const navigateToAddWord = () => {
    console.log("Navigate to add word");
    if (navigation) {
      navigation.navigate("AddWord", { dictionaryId });
    }
  };

  useEffect(() => {
    loadData();
  }, [dictionaryId]);

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
    // Actions
    setSearchQuery,
    setShowFilters,
    setFilters,
    onRefresh,
    loadData,
    navigateToWord,
    navigateToAddWord,
  };
};
