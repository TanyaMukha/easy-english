// services/database/QueryService.ts - Enhanced with SetService integration
/**
 * Query Service - High-level API for common database operations
 *
 * This service provides simplified, high-level methods for common operations
 * that combine multiple database services. It acts as a facade pattern,
 * making it easier for components to perform complex operations.
 *
 * Key responsibilities:
 * - Aggregate data from multiple services
 * - Provide commonly used query combinations
 * - Handle complex business logic scenarios
 * - Offer convenience methods for UI components
 */

// Import services directly instead of through index
import { DictionaryService } from './DictionaryService';
import { WordService } from './WordService';
import { ExampleService } from './ExampleService';
import { SetService } from './SetService';

// Import types directly
import type { DatabaseResult } from './SQLiteUniversalService';
import type { WordWithExamples, WordSearchFilter, WordStats } from './WordService';
import type { DictionaryStats } from './DictionaryService';
import type { SetStats, SetWithWords } from './SetService';

// Get service instances
const dictionaryService = DictionaryService.getInstance();
const wordService = WordService.getInstance();
const exampleService = ExampleService.getInstance();
const setService = SetService.getInstance();

export interface DashboardData {
  totalDictionaries: number;
  totalWords: number;
  totalExamples: number;
  totalSets: number;
  studiedWords: number;
  averageRate: number;
  reviewsDue: number;
  setsNeedingReview: number;
  recentWords: WordWithExamples[];
  topDictionaries: DictionaryStats[];
  topSets: SetStats[];
}

export interface StudySession {
  words: WordWithExamples[];
  sessionType: "new" | "review" | "mixed" | "set";
  totalWords: number;
  dictionaryId?: number;
  setId?: number;
  sessionId: string;
}

export interface LearningProgress {
  dailyGoal: number;
  wordsStudiedToday: number;
  currentStreak: number;
  longestStreak: number;
  totalWordsLearned: number;
  averageAccuracy: number;
  setsCompleted: number;
}

export interface GlobalSearchResults {
  words: WordWithExamples[];
  dictionaries: DictionaryStats[];
  sets: SetStats[];
  totalResults: number;
}

export class QueryService {
  private static instance: QueryService;

  private constructor() {}

  public static getInstance(): QueryService {
    if (!QueryService.instance) {
      QueryService.instance = new QueryService();
    }
    return QueryService.instance;
  }

  /**
   * Get comprehensive dashboard data including sets
   */
  async getDashboardData(): Promise<DatabaseResult<DashboardData>> {
    try {
      // Get all dictionaries with stats
      const dictionariesResult =
        await dictionaryService.getAllDictionariesWithStats();
      if (!dictionariesResult.success) {
        return { success: false, error: dictionariesResult.error! };
      }

      const dictionaries = dictionariesResult.data || [];

      // Get all sets with stats
      const setsResult = await setService.getAllSetsWithStats();
      if (!setsResult.success) {
        return { success: false, error: setsResult.error! };
      }

      const sets = setsResult.data || [];

      // Get overall word statistics
      const wordStatsResult = await wordService.getWordsStats();
      if (!wordStatsResult.success) {
        return { success: false, error: wordStatsResult.error! };
      }

      const wordStats = wordStatsResult.data?.[0];

      // Get recent words (last 10 added)
      const recentWordsResult = await wordService.searchWords({}, 10);
      if (!recentWordsResult.success) {
        return { success: false, error: recentWordsResult.error! };
      }

      // Get examples statistics
      const exampleStatsResult = await exampleService.getExamplesStats();
      const totalExamples = exampleStatsResult.success
        ? exampleStatsResult.data?.[0]?.totalExamples || 0
        : 0;

      // Get sets needing review
      const setsForReviewResult = await setService.getSetsForReview(7);
      const setsNeedingReview = setsForReviewResult.success
        ? setsForReviewResult.data?.length || 0
        : 0;

      // Calculate words needing review
      const reviewWordsResult = await wordService.getWordsForReview(100);
      const reviewsDue = reviewWordsResult.success
        ? reviewWordsResult.data?.length || 0
        : 0;

      const dashboardData: DashboardData = {
        totalDictionaries: dictionaries.length,
        totalWords: wordStats?.totalWords || 0,
        totalExamples,
        totalSets: sets.length,
        studiedWords: wordStats?.studiedWords || 0,
        averageRate: wordStats?.averageRate || 0,
        reviewsDue,
        setsNeedingReview,
        recentWords: recentWordsResult.data || [],
        topDictionaries: dictionaries.slice(0, 5),
        topSets: sets.slice(0, 5),
      };

      return { success: true, data: [dashboardData] };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: `Failed to get dashboard data: ${errorMessage}`,
      };
    }
  }

  /**
   * Create a study session with words from various sources
   */
  async createStudySession(
    type: "new" | "review" | "mixed" | "set",
    wordCount: number,
    options?: {
      dictionaryId?: number;
      setId?: number;
      level?: string;
    },
  ): Promise<DatabaseResult<StudySession>> {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      let words: WordWithExamples[] = [];

      switch (type) {
        case "new":
          // Get new words (low review count)
          const newWordsResult = await wordService.searchWords(
            {
              dictionaryId: options?.dictionaryId,
              level: options?.level,
              maxReviewCount: 2,
            },
            wordCount,
          );

          if (newWordsResult.success) {
            words = newWordsResult.data || [];
          }
          break;

        case "review":
          // Get words that need review
          const reviewWordsResult = await wordService.getWordsForReview(
            wordCount,
            options?.dictionaryId,
          );

          if (reviewWordsResult.success) {
            words = reviewWordsResult.data || [];
          }
          break;

        case "set":
          // Get random words from a specific set
          if (options?.setId) {
            const setWordsResult = await setService.getRandomWordsFromSet(
              options.setId,
              wordCount,
            );

            if (setWordsResult.success) {
              words = setWordsResult.data || [];
            }
          }
          break;

        case "mixed":
          // Get a mix of new and review words
          const halfCount = Math.ceil(wordCount / 2);

          const [mixedNewResult, mixedReviewResult] = await Promise.all([
            wordService.searchWords(
              {
                dictionaryId: options?.dictionaryId,
                level: options?.level,
                maxReviewCount: 2,
              },
              halfCount,
            ),
            wordService.getWordsForReview(halfCount, options?.dictionaryId),
          ]);

          const newWords = mixedNewResult.success
            ? mixedNewResult.data || []
            : [];
          const reviewWords = mixedReviewResult.success
            ? mixedReviewResult.data || []
            : [];

          words = [...newWords, ...reviewWords].slice(0, wordCount);
          break;
      }

      const session: StudySession = {
        words,
        sessionType: type,
        totalWords: words.length,
        dictionaryId: options?.dictionaryId ?? 0,
        setId: options?.setId ?? 0,
        sessionId,
      };

      return { success: true, data: [session] };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: `Failed to create study session: ${errorMessage}`,
      };
    }
  }

  /**
   * Global search across all content types
   */
  async globalSearch(
    searchTerm: string,
    limit: number = 20,
  ): Promise<DatabaseResult<GlobalSearchResults>> {
    try {
      const [wordsResult, dictionariesResult, setsResult] = await Promise.all([
        // Search words
        wordService.searchWords({ searchTerm }, Math.ceil(limit * 0.6)),

        // Search dictionaries
        dictionaryService.searchDictionaries(searchTerm),

        // Search sets
        setService.searchSets({ searchTerm }, Math.ceil(limit * 0.2)),
      ]);

      const results: GlobalSearchResults = {
        words: wordsResult.success ? wordsResult.data || [] : [],
        dictionaries: dictionariesResult.success
          ? (dictionariesResult.data as unknown as DictionaryStats[]) || []
          : [],
        sets: setsResult.success ? setsResult.data || [] : [],
        totalResults: 0,
      };

      results.totalResults =
        results.words.length +
        results.dictionaries.length +
        results.sets.length;

      return { success: true, data: [results] };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: `Failed to perform global search: ${errorMessage}`,
      };
    }
  }

  /**
   * Get daily words for practice (mix from different sources)
   */
  async getDailyWords(
    count: number,
  ): Promise<DatabaseResult<WordWithExamples>> {
    try {
      // Get words from different sources
      const sources = [
        // Words needing review (40%)
        {
          weight: 0.4,
          getter: () => wordService.getWordsForReview(Math.ceil(count * 0.4)),
        },

        // Random words (30%)
        {
          weight: 0.3,
          getter: () => wordService.getRandomWords(Math.ceil(count * 0.3)),
        },

        // New words (30%)
        {
          weight: 0.3,
          getter: () =>
            wordService.searchWords(
              { maxReviewCount: 1 },
              Math.ceil(count * 0.3),
            ),
        },
      ];

      const results = await Promise.all(
        sources.map((source) => source.getter()),
      );
      const allWords: WordWithExamples[] = [];

      results.forEach((result) => {
        if (result.success && result.data) {
          allWords.push(...result.data);
        }
      });

      // Remove duplicates and limit to requested count
      const uniqueWords = allWords.filter(
        (word, index, self) =>
          index === self.findIndex((w) => w.id === word.id),
      );

      // Shuffle and limit
      const shuffledWords = uniqueWords
        .sort(() => Math.random() - 0.5)
        .slice(0, count);

      return { success: true, data: shuffledWords };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: `Failed to get daily words: ${errorMessage}`,
      };
    }
  }

  /**
   * Update learning progress with enhanced tracking
   */
  async updateLearningProgress(
    wordId: number,
    isCorrect: boolean,
    difficulty: 1 | 2 | 3 = 2,
    setId?: number,
  ): Promise<DatabaseResult> {
    try {
      // Update word progress
      const wordResult = await wordService.updateWordProgress(
        wordId,
        isCorrect ? 5 : Math.max(1, 3 - difficulty),
      );

      if (!wordResult.success) {
        return wordResult;
      }

      // If this word is part of a set study session, update set review
      if (setId) {
        await setService.updateSetReview(setId);
      }

      return { success: true, data: ["Progress updated successfully"] };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: `Failed to update learning progress: ${errorMessage}`,
      };
    }
  }

  /**
   * Get learning statistics
   */
  async getLearningStats(): Promise<DatabaseResult<LearningProgress>> {
    try {
      // Get word statistics
      const wordStatsResult = await wordService.getWordsStats();
      const wordStats = wordStatsResult.success
        ? wordStatsResult.data?.[0]
        : null;

      // Get sets with reviews
      const setsResult = await setService.getAllSetsWithStats();
      const sets = setsResult.success ? setsResult.data || [] : [];

      const setsCompleted = sets.filter(
        (set) => set.wordCount > 0 && set.reviewCount > 0,
      ).length;

      // Calculate today's progress (simplified - could be enhanced with daily tracking)
      const today = new Date().toISOString().split("T")[0];
      const todayWordsResult = await wordService.searchWords({
        lastReviewAfter: `${today}T00:00:00.000Z`,
      });

      const wordsStudiedToday = todayWordsResult.success
        ? todayWordsResult.data?.length || 0
        : 0;

      const progress: LearningProgress = {
        dailyGoal: 20, // Could be user-configurable
        wordsStudiedToday,
        currentStreak: 1, // Simplified - needs daily tracking implementation
        longestStreak: 1, // Simplified - needs historical data
        totalWordsLearned: wordStats?.studiedWords || 0,
        averageAccuracy: wordStats?.averageRate
          ? (wordStats.averageRate / 5) * 100
          : 0,
        setsCompleted,
      };

      return { success: true, data: [progress] };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: `Failed to get learning stats: ${errorMessage}`,
      };
    }
  }

  /**
   * Get comprehensive set data with related information
   */
  async getSetDetails(
    setId: number,
  ): Promise<DatabaseResult<SetWithWords & { relatedSets: SetStats[] }>> {
    try {
      // Get set with words
      const setResult = await setService.getSetWithWords(setId);

      if (!setResult.success || !setResult.data) {
        return setResult as DatabaseResult<
          SetWithWords & { relatedSets: SetStats[] }
        >;
      }

      const setWithWords = setResult.data[0];

      // Get related sets (sets that share words with this set)
      // This is a simplified version - could be enhanced with more sophisticated similarity
      const allSetsResult = await setService.getAllSetsWithStats();
      const allSets = allSetsResult.success ? allSetsResult.data || [] : [];
      const relatedSets = allSets
        .filter((set) => set.id !== setId && set.wordCount > 0)
        .slice(0, 5); // Simple implementation - could be enhanced

      const detailedSet: SetWithWords & { relatedSets: SetStats[] } = {
        ...setWithWords,
        words: setWithWords?.words ?? [],
        wordCount: setWithWords?.wordCount ?? 0,
        id: setWithWords?.id ?? undefined,
        guid: setWithWords?.guid ?? "",
        title: setWithWords?.title ?? "",
        description: setWithWords?.description ?? undefined,
        lastReviewDate: setWithWords?.lastReviewDate ?? undefined,
        reviewCount: setWithWords?.reviewCount ?? 0,
        createdAt: setWithWords?.createdAt ?? "",
        updatedAt: setWithWords?.updatedAt ?? "",
        relatedSets,
      };

      return { success: true, data: [detailedSet] };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: `Failed to get set details: ${errorMessage}`,
      };
    }
  }

  /**
   * Bulk operations for managing sets and words
   */
  async bulkAddWordsToSet(
    setId: number,
    wordIds: number[],
  ): Promise<DatabaseResult> {
    try {
      return setService.addWordsToSet(setId, wordIds);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: `Failed to bulk add words to set: ${errorMessage}`,
      };
    }
  }

  /**
   * Get study recommendations based on user progress
   */
  async getStudyRecommendations(): Promise<
    DatabaseResult<{
      reviewWords: WordWithExamples[];
      newWords: WordWithExamples[];
      reviewSets: SetStats[];
      dailyGoalProgress: number;
    }>
  > {
    try {
      const [reviewWordsResult, newWordsResult, reviewSetsResult, statsResult] =
        await Promise.all([
          // Words needing review
          wordService.getWordsForReview(10),

          // New words to learn
          wordService.searchWords({ maxReviewCount: 1 }, 10),

          // Sets needing review
          setService.getSetsForReview(7, 5),

          // Current learning stats
          this.getLearningStats(),
        ]);

      const recommendations = {
        reviewWords: reviewWordsResult.success
          ? reviewWordsResult.data || []
          : [],
        newWords: newWordsResult.success ? newWordsResult.data || [] : [],
        reviewSets: reviewSetsResult.success ? reviewSetsResult.data || [] : [],
        dailyGoalProgress: statsResult.success
          ? ((statsResult.data?.[0]?.wordsStudiedToday || 0) /
              (statsResult.data?.[0]?.dailyGoal || 20)) *
            100
          : 0,
      };

      return { success: true, data: [recommendations] };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: `Failed to get study recommendations: ${errorMessage}`,
      };
    }
  }

  /**
   * Advanced search with filters across multiple content types
   */
  async advancedSearch(filters: {
    searchTerm?: string;
    contentTypes?: ("words" | "dictionaries" | "sets")[];
    wordFilters?: WordSearchFilter;
    limit?: number;
  }): Promise<DatabaseResult<GlobalSearchResults>> {
    try {
      const {
        searchTerm,
        contentTypes = ["words", "dictionaries", "sets"],
        wordFilters,
        limit = 50,
      } = filters;

      const results: GlobalSearchResults = {
        words: [],
        dictionaries: [],
        sets: [],
        totalResults: 0,
      };

      const searchPromises: Promise<any>[] = [];

      // Search words
      if (contentTypes.includes("words")) {
        const wordSearchFilter = {
          ...wordFilters,
          searchTerm: searchTerm || wordFilters?.searchTerm,
        };
        searchPromises.push(
          wordService
            .searchWords(wordSearchFilter, Math.ceil(limit * 0.6))
            .then((result) => ({ type: "words", result })),
        );
      }

      // Search dictionaries
      if (contentTypes.includes("dictionaries") && searchTerm) {
        searchPromises.push(
          dictionaryService
            .searchDictionaries(searchTerm)
            .then((result) => ({ type: "dictionaries", result })),
        );
      }

      // Search sets
      if (contentTypes.includes("sets")) {
        searchPromises.push(
          setService
            .searchSets({ searchTerm }, Math.ceil(limit * 0.2))
            .then((result) => ({ type: "sets", result })),
        );
      }

      const searchResults = await Promise.all(searchPromises);

      // Process results
      searchResults.forEach(({ type, result }) => {
        if (result.success && result.data) {
          switch (type) {
            case "words":
              results.words = result.data;
              break;
            case "dictionaries":
              results.dictionaries = result.data;
              break;
            case "sets":
              results.sets = result.data;
              break;
          }
        }
      });

      results.totalResults =
        results.words.length +
        results.dictionaries.length +
        results.sets.length;

      return { success: true, data: [results] };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: `Failed to perform advanced search: ${errorMessage}`,
      };
    }
  }

  /**
   * Export user data for backup or migration
   */
  async exportUserData(): Promise<
    DatabaseResult<{
      dictionaries: any[];
      words: any[];
      examples: any[];
      sets: any[];
      exportDate: string;
      version: string;
    }>
  > {
    try {
      const [dictionariesResult, wordsResult, examplesResult, setsResult] =
        await Promise.all([
          dictionaryService.getAllDictionaries(),
          wordService.searchWords({}), // Get all words
          exampleService.getAllExamples(), // Use the correct method
          setService.getAllSets(),
        ]);

      const exportData = {
        dictionaries: dictionariesResult.success
          ? dictionariesResult.data || []
          : [],
        words: wordsResult.success ? wordsResult.data || [] : [],
        examples: examplesResult.success ? examplesResult.data || [] : [],
        sets: setsResult.success ? setsResult.data || [] : [],
        exportDate: new Date().toISOString(),
        version: "1.0.0",
      };

      return { success: true, data: [exportData] };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: `Failed to export user data: ${errorMessage}`,
      };
    }
  }
}

// Export singleton instance
export const queryService = QueryService.getInstance();
