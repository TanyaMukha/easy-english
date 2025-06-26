// hooks/useSet.ts
import { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { SetService } from '../services/SetService';
import { Set, WordWithExamples } from '../data/DataModels';
import { MockDataService } from '../data/MockData';

interface SetState {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  set: Set | null;
  words: WordWithExamples[];
  searchQuery: string;
  filteredWords: WordWithExamples[];
  showActionsModal: boolean;
  showEditModal: boolean;
}

interface SetActions {
  setSearchQuery: (query: string) => void;
  setShowActionsModal: (show: boolean) => void;
  setShowEditModal: (show: boolean) => void;
  onRefresh: () => Promise<void>;
  loadData: () => Promise<void>;
  updateSet: (title: string, description?: string) => Promise<boolean>;
  deleteSet: () => Promise<boolean>;
  addWordToSet: (wordId: number) => Promise<boolean>;
  removeWordFromSet: (wordId: number) => Promise<boolean>;
  navigateToWord: (wordId: number) => void;
  navigateToAddWords: () => void;
  navigateToPractice: () => void;
  navigateToTest: () => void;
  handleEditSet: () => void;
  handleDeleteSet: () => void;
  handleViewStats: () => void;
  handleManageWords: () => void;
}

/**
 * Single Responsibility: Manage individual set data and operations
 * Open/Closed: Can be extended with additional set operations
 * Interface Segregation: Separates set logic from UI
 */
export const useSets = (
  setId: number,
  navigation?: any
): SetState & SetActions => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [set, setSet] = useState<Set | null>(null);
  const [words, setWords] = useState<WordWithExamples[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Filter words based on search query
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

  const loadData = async () => {
    try {
      setError(null);
      
      // Load set details
      const setResponse = await SetService.getById(setId);
      if (!setResponse.success || !setResponse.data) {
        setError(setResponse.error || 'Set not found');
        return;
      }

      setSet(setResponse.data);

      // Load words for this set - using mock data for now
      // In real implementation, this would fetch words associated with the set
      const wordsData = await MockDataService.getWords({ limit: 100 });
      setWords(wordsData.words.slice(0, 15)); // Mock: take first 15 words
      
    } catch (err) {
      setError('Failed to load set. Please try again.');
      console.error('Error loading set:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const updateSet = async (title: string, description?: string): Promise<boolean> => {
    try {
      const response = await SetService.update(setId, {
        title,
        description,
      });

      if (response.success && response.data) {
        setSet(response.data);
        return true;
      } else {
        setError(response.error || 'Failed to update set');
        return false;
      }
    } catch (err) {
      setError('Failed to update set. Please try again.');
      console.error('Error updating set:', err);
      return false;
    }
  };

  const deleteSet = async (): Promise<boolean> => {
    try {
      const response = await SetService.delete(setId);

      if (response.success) {
        return true;
      } else {
        setError(response.error || 'Failed to delete set');
        return false;
      }
    } catch (err) {
      setError('Failed to delete set. Please try again.');
      console.error('Error deleting set:', err);
      return false;
    }
  };

  const addWordToSet = async (wordId: number): Promise<boolean> => {
    try {
      const response = await SetService.addWordToSet({ setId, wordId });

      if (response.success) {
        // Reload data to get updated words list
        await loadData();
        return true;
      } else {
        setError(response.error || 'Failed to add word to set');
        return false;
      }
    } catch (err) {
      setError('Failed to add word to set. Please try again.');
      console.error('Error adding word to set:', err);
      return false;
    }
  };

  const removeWordFromSet = async (wordId: number): Promise<boolean> => {
    try {
      const response = await SetService.removeWordFromSet({ setId, wordId });

      if (response.success) {
        // Remove word from local state
        setWords(words.filter(w => w.id !== wordId));
        return true;
      } else {
        setError(response.error || 'Failed to remove word from set');
        return false;
      }
    } catch (err) {
      setError('Failed to remove word from set. Please try again.');
      console.error('Error removing word from set:', err);
      return false;
    }
  };

  // Navigation handlers
  const navigateToWord = (wordId: number) => {
    console.log('Navigate to word:', wordId);
    if (navigation) {
      navigation.navigate('WordDetails', { wordId });
    }
  };

  const navigateToAddWords = () => {
    console.log('Navigate to add words to set:', setId);
    if (navigation) {
      navigation.navigate('AddWordsToSet', { setId });
    }
  };

  const navigateToPractice = () => {
    console.log('Navigate to practice with set:', setId);
    if (navigation) {
      navigation.navigate('Practice', { setId, words });
    }
  };

  const navigateToTest = () => {
    console.log('Navigate to test with set:', setId);
    if (navigation) {
      navigation.navigate('Test', { setId, words });
    }
  };

  // Action handlers
  const handleEditSet = () => {
    console.log('Edit set:', setId);
    setShowEditModal(true);
    setShowActionsModal(false);
  };

  const handleDeleteSet = () => {
    console.log('Delete set:', setId);
    if (!set) return;

    Alert.alert(
      'Delete Set',
      `Are you sure you want to delete "${set.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteSet();
            if (success && navigation) {
              navigation.goBack();
            }
          },
        },
      ]
    );
    setShowActionsModal(false);
  };

  const handleViewStats = () => {
    console.log('View stats for set:', setId);
    // TODO: Navigate to set statistics screen
    if (navigation) {
      navigation.navigate('SetStatistics', { setId });
    }
    setShowActionsModal(false);
  };

  const handleManageWords = () => {
    console.log('Manage words for set:', setId);
    // TODO: Navigate to manage words screen
    if (navigation) {
      navigation.navigate('ManageSetWords', { setId });
    }
    setShowActionsModal(false);
  };

  // Load data on mount and when setId changes
  useEffect(() => {
    if (setId) {
      loadData();
    }
  }, [setId]);

  // Clear error when search query changes
  useEffect(() => {
    if (error && searchQuery.trim()) {
      setError(null);
    }
  }, [searchQuery, error]);

  return {
    // State
    loading,
    refreshing,
    error,
    set,
    words,
    searchQuery,
    filteredWords,
    showActionsModal,
    showEditModal,
    // Actions
    setSearchQuery,
    setShowActionsModal,
    setShowEditModal,
    onRefresh,
    loadData,
    updateSet,
    deleteSet,
    addWordToSet,
    removeWordFromSet,
    navigateToWord,
    navigateToAddWords,
    navigateToPractice,
    navigateToTest,
    handleEditSet,
    handleDeleteSet,
    handleViewStats,
    handleManageWords,
  };
};