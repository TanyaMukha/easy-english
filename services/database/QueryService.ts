// services/database/QueryService.ts
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

import { dictionaryService, wordService, exampleService } from './index';
import type { 
  DatabaseResult, 
  WordWithExamples, 
  WordSearchFilter, 
  DictionaryStats,
  WordStats 
} from './index';

export interface DashboardData {
  totalDictionaries: number;
  totalWords: number;
  totalExamples: number;
  studiedWords: number;
  averageRate: number;
  reviewsDue: number;
  recentWords: WordWithExamples[];
  topDictionaries: DictionaryStats[];
}

export interface StudySession {
  words: WordWithExamples[];
  sessionType: 'new' | 'review' | 'mixed';
  totalWords: number;
  dictionaryId?: number;
}

export interface LearningProgress {
  dailyGoal: number;
  wordsStudiedToday: number;
  currentStreak: number;
  longestStreak: number;
  totalWordsLearned: number;
  averageAccuracy: number;
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
   * Get comprehensive dashboard data
   */
  async getDashboardData(): Promise<DatabaseResult<DashboardData>> {
    try {
      // Get all dictionaries with stats
      const dictionariesResult = await dictionaryService.getAllDictionariesWithStats();
      if (!dictionariesResult.success) {
        return { success: false, error: dictionariesResult.error! };
      }

      const dictionaries = dictionariesResult.data || [];

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
      const totalExamples = exampleStatsResult.success ? 
        (exampleStatsResult.data?.[0] as any)?.totalExamples || 0 : 0;

      const dashboardData: DashboardData = {
        totalDictionaries: dictionaries.length,
        totalWords: wordStats?.totalWords || 0,
        totalExamples,
        studiedWords: wordStats?.studiedWords || 0,
        averageRate: wordStats?.averageRate || 0,
        reviewsDue: wordStats?.reviewsDue || 0,
        recentWords: recentWordsResult.data || [],
        topDictionaries: dictionaries.slice(0, 5) // Top 5 dictionaries
      };

      return {
        success: true,
        data: [dashboardData]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load dashboard data'
      };
    }
  }

  /**
   * Create a study session with specified parameters
   */
  async createStudySession(
    sessionType: 'new' | 'review' | 'mixed',
    wordCount: number,
    dictionaryId?: number
  ): Promise<DatabaseResult<StudySession>> {
    try {
      let words: WordWithExamples[] = [];

      switch (sessionType) {
        case 'new':
          // Get words that haven't been reviewed yet
          const newWordsResult = await wordService.searchWords({
            dictionaryId,
            needsReview: false
          }, wordCount);
          
          if (!newWordsResult.success) {
            return { success: false, error: newWordsResult.error! };
          }
          
          // Filter to only include words with reviewCount = 0
          words = (newWordsResult.data || []).filter(word => word.reviewCount === 0);
          break;

        case 'review':
          // Get words that need review
          const reviewWordsResult = await wordService.getWordsForReview(wordCount, dictionaryId);
          if (!reviewWordsResult.success) {
            return { success: false, error: reviewWordsResult.error! };
          }
          words = reviewWordsResult.data || [];
          break;

        case 'mixed':
          // Get half new words, half review words
          const halfCount = Math.ceil(wordCount / 2);
          
          const mixedNewResult = await wordService.searchWords({
            dictionaryId,
            needsReview: false
          }, halfCount);
          
          const mixedReviewResult = await wordService.getWordsForReview(halfCount, dictionaryId);
          
          if (!mixedNewResult.success || !mixedReviewResult.success) {
            return { 
              success: false, 
              error: mixedNewResult.error || mixedReviewResult.error! 
            };
          }
          
          const newWords = (mixedNewResult.data || []).filter(word => word.reviewCount === 0);
          const reviewWords = mixedReviewResult.data || [];
          
          words = [...newWords, ...reviewWords].slice(0, wordCount);
          break;
      }

      const studySession: StudySession = {
        words: words.slice(0, wordCount),
        sessionType,
        totalWords: words.length,
        dictionaryId: dictionaryId ?? 0
      };

      return {
        success: true,
        data: [studySession]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create study session'
      };
    }
  }

  /**
   * Get learning progress analytics
   */
  async getLearningProgress(): Promise<DatabaseResult<LearningProgress>> {
    try {
      // Get overall word statistics
      const wordStatsResult = await wordService.getWordsStats();
      if (!wordStatsResult.success) {
        return { success: false, error: wordStatsResult.error! };
      }

      const wordStats = wordStatsResult.data?.[0];

      // For now, return basic progress data
      // In the future, this could be enhanced with actual user progress tracking
      const progress: LearningProgress = {
        dailyGoal: 10, // Could be stored in user settings
        wordsStudiedToday: 0, // Would need daily tracking
        currentStreak: 0, // Would need streak tracking
        longestStreak: 0, // Would need historical data
        totalWordsLearned: wordStats?.studiedWords || 0,
        averageAccuracy: wordStats?.averageRate || 0
      };

      return {
        success: true,
        data: [progress]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load learning progress'
      };
    }
  }

  /**
   * Search across all content (words, examples, dictionaries)
   */
  async globalSearch(
    searchTerm: string, 
    limit: number = 20
  ): Promise<DatabaseResult<{
    words: WordWithExamples[];
    examples: any[];
    dictionaries: any[];
  }>> {
    try {
      // Search words
      const wordsResult = await wordService.searchWords({ searchTerm }, limit);
      
      // Search examples
      const examplesResult = await exampleService.searchExamples(searchTerm, undefined, limit);
      
      // Search dictionaries
      const dictionariesResult = await dictionaryService.searchDictionaries(searchTerm);

      const searchResults = {
        words: wordsResult.success ? (wordsResult.data || []) : [],
        examples: examplesResult.success ? (examplesResult.data || []) : [],
        dictionaries: dictionariesResult.success ? (dictionariesResult.data || []) : []
      };

      return {
        success: true,
        data: [searchResults]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Global search failed'
      };
    }
  }

  /**
   * Get random words for daily practice
   */
  async getDailyWords(count: number = 5, dictionaryId?: number): Promise<DatabaseResult<WordWithExamples>> {
    try {
      // Prioritize words that need review, then random words
      const reviewWordsResult = await wordService.getWordsForReview(Math.ceil(count / 2), dictionaryId);
      const reviewWords = reviewWordsResult.success ? (reviewWordsResult.data || []) : [];

      const remainingCount = count - reviewWords.length;
      
      if (remainingCount > 0) {
        const randomWordsResult = await wordService.getRandomWords(remainingCount, dictionaryId);
        const randomWords = randomWordsResult.success ? (randomWordsResult.data || []) : [];
        
        return {
          success: true,
          data: [...reviewWords, ...randomWords].slice(0, count)
        };
      }

      return {
        success: true,
        data: reviewWords.slice(0, count)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get daily words'
      };
    }
  }

  /**
   * Update word learning progress and schedule next review
   */
  async updateLearningProgress(
    wordId: number, 
    isCorrect: boolean, 
    difficulty: 1 | 2 | 3 = 2
  ): Promise<DatabaseResult> {
    try {
      // Calculate new rate based on performance
      // This is a simple algorithm - could be enhanced with spaced repetition
      let newRate: number;
      
      if (isCorrect) {
        newRate = Math.min(5, difficulty + 1);
      } else {
        newRate = Math.max(1, difficulty - 1);
      }

      return wordService.updateWordProgress(wordId, newRate);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update learning progress'
      };
    }
  }

  /**
   * Get statistics for a specific dictionary including word and example counts
   */
  async getDetailedDictionaryStats(dictionaryId: number): Promise<DatabaseResult<{
    dictionary: any;
    wordStats: WordStats;
    exampleStats: any;
    recentWords: WordWithExamples[];
  }>> {
    try {
      // Get dictionary info
      const dictionaryResult = await dictionaryService.getDictionaryById(dictionaryId);
      if (!dictionaryResult.success) {
        return { success: false, error: dictionaryResult.error! };
      }

      // Get word statistics for this dictionary
      const wordStatsResult = await wordService.getWordsStats(dictionaryId);
      if (!wordStatsResult.success) {
        return { success: false, error: wordStatsResult.error! };
      }

      // Get example statistics for this dictionary
      const exampleStatsResult = await exampleService.getExamplesStats(dictionaryId);

      // Get recent words from this dictionary
      const recentWordsResult = await wordService.searchWords({ dictionaryId }, 10);

      const detailedStats = {
        dictionary: dictionaryResult.data?.[0],
        wordStats: wordStatsResult.data?.[0],
        exampleStats: exampleStatsResult.success ? exampleStatsResult.data?.[0] : null,
        recentWords: recentWordsResult.success ? (recentWordsResult.data || []) : []
      };

      return {
        success: true,
        data: [detailedStats as any] // Cast to any to match expected type  
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get detailed dictionary stats'
      };
    }
  }
}

// Export singleton instance
export const queryService = QueryService.getInstance();