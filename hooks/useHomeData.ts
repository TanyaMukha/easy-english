// hooks/useHomeData.ts - Enhanced to use SetService and updated QueryService
import { useState, useEffect } from 'react';
import { queryService } from '../services/database';
import type { WordWithExamples, DashboardData, LearningProgress } from '../services/database';
import { getQuoteOfDay, Quote } from '../constants/MotivationalQuotes';

interface HomeDataState {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  dailyWords: WordWithExamples[];
  userStats: LearningProgress | null;
  todayProgress: number;
  quoteOfDay: Quote;
  dashboardData: DashboardData | null;
  studyRecommendations: {
    reviewWords: WordWithExamples[];
    newWords: WordWithExamples[];
    reviewSets: any[];
    dailyGoalProgress: number;
  } | null;
}

interface HomeDataActions {
  loadData: () => Promise<void>;
  onRefresh: () => Promise<void>;
  loadStudyRecommendations: () => Promise<void>;
  markWordAsStudied: (wordId: number, isCorrect: boolean, setId?: number) => Promise<void>;
}

/**
 * Enhanced home data hook using updated database services
 * 
 * This hook leverages the enhanced QueryService to provide comprehensive
 * dashboard data including sets, learning recommendations, and progress tracking.
 * 
 * Key improvements:
 * - Includes set statistics and recommendations
 * - Enhanced learning progress tracking
 * - Study recommendations based on user behavior
 * - Better error handling and loading states
 * - Optimized data loading with fewer service calls
 */
export const useHomeData = (): HomeDataState & HomeDataActions => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyWords, setDailyWords] = useState<WordWithExamples[]>([]);
  const [userStats, setUserStats] = useState<LearningProgress | null>(null);
  const [todayProgress, setTodayProgress] = useState(0);
  const [quoteOfDay, setQuoteOfDay] = useState<Quote>(getQuoteOfDay());
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [studyRecommendations, setStudyRecommendations] = useState<{
    reviewWords: WordWithExamples[];
    newWords: WordWithExamples[];
    reviewSets: any[];
    dailyGoalProgress: number;
  } | null>(null);

  /**
   * Load all home screen data using enhanced QueryService
   */
  const loadData = async () => {
    try {
      setError(null);
      
      // Get comprehensive dashboard data (includes sets now)
      const dashboardResult = await queryService.getDashboardData();
      
      if (!dashboardResult.success) {
        throw new Error(dashboardResult.error || 'Failed to load dashboard data');
      }

      const dashboard = dashboardResult.data?.[0];
      if (dashboard) {
        setDashboardData(dashboard);
        setTodayProgress(dashboard.studiedWords);
      }

      // Get learning statistics
      const statsResult = await queryService.getLearningStats();
      if (statsResult.success && statsResult.data?.[0]) {
        const stats = statsResult.data[0];
        setUserStats(stats);
        setTodayProgress(stats.wordsStudiedToday);
      }

      // Get daily words for practice
      const dailyWordsResult = await queryService.getDailyWords(8);
      if (dailyWordsResult.success && dailyWordsResult.data) {
        setDailyWords(dailyWordsResult.data);
      }
      
      // Update quote of the day
      setQuoteOfDay(getQuoteOfDay());
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to load data: ${errorMessage}`);
      console.error('Home data loading error:', err);
    }
  };

  /**
   * Load study recommendations separately for better performance
   */
  const loadStudyRecommendations = async () => {
    try {
      const recommendationsResult = await queryService.getStudyRecommendations();
      
      if (recommendationsResult.success && recommendationsResult.data?.[0]) {
        setStudyRecommendations(recommendationsResult.data[0]);
      }
    } catch (err) {
      console.warn('Failed to load study recommendations:', err);
      // Don't set error state as this is not critical data
    }
  };

  /**
   * Mark a word as studied and update progress
   */
  const markWordAsStudied = async (wordId: number, isCorrect: boolean, setId?: number) => {
    try {
      // Update learning progress
      const result = await queryService.updateLearningProgress(
        wordId, 
        isCorrect, 
        isCorrect ? 1 : 3, // difficulty based on correctness
        setId
      );

      if (result.success) {
        // Update local state to reflect the change
        setTodayProgress(prev => prev + 1);
        
        // Update user stats if available
        if (userStats) {
          setUserStats(prev => prev ? {
            ...prev,
            wordsStudiedToday: prev.wordsStudiedToday + 1,
            totalWordsLearned: isCorrect ? prev.totalWordsLearned + 1 : prev.totalWordsLearned
          } : null);
        }

        // Remove the word from daily words if it was there
        setDailyWords(prev => prev.filter(word => word.id !== wordId));
      }
    } catch (err) {
      console.error('Failed to mark word as studied:', err);
    }
  };

  /**
   * Refresh data (for pull-to-refresh)
   */
  const onRefresh = async () => {
    setRefreshing(true);
    
    // Load both main data and recommendations in parallel
    await Promise.all([
      loadData(),
      loadStudyRecommendations()
    ]);
    
    setRefreshing(false);
  };

  /**
   * Initial data loading
   */
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      
      // Load main data first
      await loadData();
      
      // Load recommendations in background
      loadStudyRecommendations();
      
      setLoading(false);
    };

    initializeData();
  }, []);

  /**
   * Update quote daily
   */
  useEffect(() => {
    const updateQuote = () => {
      setQuoteOfDay(getQuoteOfDay());
    };

    // Update quote at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timeout = setTimeout(() => {
      updateQuote();
      
      // Set up daily interval
      const interval = setInterval(updateQuote, 24 * 60 * 60 * 1000);
      
      return () => clearInterval(interval);
    }, timeUntilMidnight);

    return () => clearTimeout(timeout);
  }, []);

  return {
    // State
    loading,
    refreshing,
    error,
    dailyWords,
    userStats,
    todayProgress,
    quoteOfDay,
    dashboardData,
    studyRecommendations,
    
    // Actions
    loadData,
    onRefresh,
    loadStudyRecommendations,
    markWordAsStudied,
  };
};