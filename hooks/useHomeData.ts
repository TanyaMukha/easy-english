// hooks/useHomeData.ts - Fixed version with proper service usage
import { useState, useEffect } from 'react';
import { WordQueryService } from '../services/words';
import { MockDataService } from '../services/MockDataService';
import { WordWithExamples, UserStatistics } from '../data/DataModels';
import { getQuoteOfDay, Quote } from '../constants/MotivationalQuotes';

interface HomeDataState {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  dailyWords: WordWithExamples[];
  userStats: UserStatistics | null;
  todayProgress: number;
  quoteOfDay: Quote;
}

interface HomeDataActions {
  loadData: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

/**
 * Enhanced home data hook with proper service layer usage
 * 
 * Single Responsibility: Manage home screen data loading and state
 * Open/Closed: Can be extended with additional home data without modifying existing logic
 * Interface Segregation: Separates home data logic from UI concerns
 * Dependency Inversion: Depends on service abstractions, not concrete implementations
 * 
 * This hook properly uses:
 * - WordQueryService for getting random words (not MockDataService)
 * - MockDataService only for user statistics and delays
 * - Proper error handling with meaningful messages
 * - Loading states for better UX
 */
export const useHomeData = (): HomeDataState & HomeDataActions => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyWords, setDailyWords] = useState<WordWithExamples[]>([]);
  const [userStats, setUserStats] = useState<UserStatistics | null>(null);
  const [todayProgress, setTodayProgress] = useState(0);
  const [quoteOfDay, setQuoteOfDay] = useState<Quote>(getQuoteOfDay());

  /**
   * Load all home screen data
   * Uses proper service layer architecture
   */
  const loadData = async () => {
    try {
      setError(null);
      
      // Get random words using WordQueryService (not MockDataService)
      const wordsResponse = await WordQueryService.getRandomWords(5);
      
      // Get user statistics using MockDataService
      const statistics = await MockDataService.getUserStatistics();
      
      // Handle potential errors from services
      if (!wordsResponse.success) {
        throw new Error(wordsResponse.error || 'Failed to load words');
      }

      setDailyWords(wordsResponse.data || []);
      setUserStats(statistics);
      
      // Calculate today's progress from statistics
      const today = new Date().toISOString().split('T')[0];
      const todayProgressData = statistics.dailyProgress.find(p => p.date === today);
      setTodayProgress(todayProgressData?.wordsStudied || 0);
      
      // Update quote of the day
      setQuoteOfDay(getQuoteOfDay());
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to load data. ${errorMessage}`);
      console.error('Error loading home data:', err);
      
      // Set fallback data for better UX
      setDailyWords([]);
      setUserStats(null);
      setTodayProgress(0);
      
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh data for pull-to-refresh functionality
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  return {
    loading,
    refreshing,
    error,
    dailyWords,
    userStats,
    todayProgress,
    quoteOfDay,
    loadData,
    onRefresh,
  };
};