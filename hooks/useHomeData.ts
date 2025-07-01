// hooks/useHomeData.ts - Updated to use new database services
import { useState, useEffect } from 'react';
import { queryService } from '../services/database';
import type { WordWithExamples, DashboardData } from '../services/database';
import { getQuoteOfDay, Quote } from '../constants/MotivationalQuotes';

interface HomeDataState {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  dailyWords: WordWithExamples[];
  userStats: any | null; // Will be replaced with proper UserStatistics type
  todayProgress: number;
  quoteOfDay: Quote;
  dashboardData: DashboardData | null;
}

interface HomeDataActions {
  loadData: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

/**
 * Enhanced home data hook using new QueryService
 * 
 * This hook leverages the new QueryService to provide comprehensive
 * dashboard data in a single call, improving performance and data consistency.
 * 
 * Key improvements:
 * - Uses QueryService for aggregated data
 * - Better error handling
 * - More efficient data loading
 * - Consistent state management
 */
export const useHomeData = (): HomeDataState & HomeDataActions => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyWords, setDailyWords] = useState<WordWithExamples[]>([]);
  const [userStats, setUserStats] = useState<any | null>(null);
  const [todayProgress, setTodayProgress] = useState(0);
  const [quoteOfDay, setQuoteOfDay] = useState<Quote>(getQuoteOfDay());
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  /**
   * Load all home screen data using QueryService
   */
  const loadData = async () => {
    try {
      setError(null);
      
      // Get comprehensive dashboard data
      const dashboardResult = await queryService.getDashboardData();
      
      if (!dashboardResult.success) {
        throw new Error(dashboardResult.error || 'Failed to load dashboard data');
      }

      const dashboard = dashboardResult.data?.[0];
      if (dashboard) {
        setDashboardData(dashboard);
        setDailyWords(dashboard.recentWords);
        
        // Create user stats from dashboard data
        const stats = {
          totalWords: dashboard.totalWords,
          studiedWords: dashboard.studiedWords,
          averageRate: dashboard.averageRate,
          reviewsDue: dashboard.reviewsDue,
          totalDictionaries: dashboard.totalDictionaries,
          dailyProgress: [] // This would need to be enhanced with actual daily tracking
        };
        setUserStats(stats);
        setTodayProgress(dashboard.studiedWords); // Simplified for now
      }

      // Get daily words for practice (separate from recent words)
      const dailyWordsResult = await queryService.getDailyWords(5);
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
   * Refresh data (for pull-to-refresh)
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  /**
   * Initial data loading
   */
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    };

    initializeData();
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
    
    // Actions
    loadData,
    onRefresh,
  };
};