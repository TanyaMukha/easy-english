// hooks/useHomeData.ts - Updated with real navigation
import { useState, useEffect } from 'react';
import { MockDataService } from '../data/MockData';
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

export const useHomeData = (): HomeDataState & HomeDataActions => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyWords, setDailyWords] = useState<WordWithExamples[]>([]);
  const [userStats, setUserStats] = useState<UserStatistics | null>(null);
  const [todayProgress, setTodayProgress] = useState(0);
  const [quoteOfDay, setQuoteOfDay] = useState<Quote>(getQuoteOfDay());

  const loadData = async () => {
    try {
      setError(null);
      const [words, statistics] = await Promise.all([
        MockDataService.getRandomWords(5),
        MockDataService.getUserStatistics(),
      ]);

      setDailyWords(words);
      setUserStats(statistics);
      
      // Calculate today's progress from statistics
      const today = new Date().toISOString().split('T')[0];
      const todayProgressData = statistics.dailyProgress.find(p => p.date === today);
      setTodayProgress(todayProgressData?.wordsStudied || 0);
      
      setQuoteOfDay(getQuoteOfDay());
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error loading home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

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