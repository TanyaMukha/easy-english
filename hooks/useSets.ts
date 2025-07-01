// hooks/useSets.ts - Corrected to work with actual SetService methods
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { setService } from '../services/database';
import type { 
  SetWithWords, 
  SetStats, 
  SetCreateRequest, 
  SetUpdateRequest,
  WordWithExamples,
  DatabaseResult 
} from '../services/database';

interface SetsState {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  sets: SetStats[];
  searchQuery: string;
  filteredSets: SetStats[];
  selectedSet: SetStats | null;
  showEditModal: boolean;
  showActionsModal: boolean;
  pagination: {
    hasMore: boolean;
    page: number;
    limit: number;
  };
}

interface SetsActions {
  setSearchQuery: (query: string) => void;
  setSelectedSet: (set: SetStats | null) => void;
  setShowEditModal: (show: boolean) => void;
  setShowActionsModal: (show: boolean) => void;
  onRefresh: () => Promise<void>;
  loadData: () => Promise<void>;
  loadMore: () => Promise<void>;
  createSet: (request: SetCreateRequest) => Promise<DatabaseResult<SetWithWords>>;
  updateSet: (setId: number, request: SetUpdateRequest) => Promise<DatabaseResult<SetWithWords>>;
  deleteSet: (setId: number) => Promise<DatabaseResult>;
  addWordToSet: (setId: number, wordId: number) => Promise<DatabaseResult>;
  removeWordFromSet: (setId: number, wordId: number) => Promise<DatabaseResult>;
  getSetWithWords: (setId: number) => Promise<DatabaseResult<SetWithWords>>;
  handleSetMenu: (set: SetStats) => void;
  handleEditSet: (set: SetStats) => void;
  handleDeleteSet: (set: SetStats) => void;
  handleViewStats: (set: SetStats) => void;
  handleManageWords: (set: SetStats) => void;
}

/**
 * Enhanced sets hook using corrected SetService integration
 * 
 * This hook provides comprehensive set management for the sets listing screen
 * with proper integration to the actual SetService methods.
 * 
 * Key features:
 * - Complete CRUD operations for sets
 * - Set-word relationship management
 * - Search and filtering with local and server-side support
 * - Pagination for large datasets
 * - Statistics and analytics
 * - UI state management for modals and selections
 */
export const useSets = (
  navigation?: any
): SetsState & SetsActions => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sets, setSets] = useState<SetStats[]>([]);
  const [searchQuery, setSearchQueryState] = useState('');
  const [selectedSet, setSelectedSet] = useState<SetStats | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [pagination, setPagination] = useState({
    hasMore: true,
    page: 1,
    limit: 20
  });

  /**
   * Filter sets based on search query (client-side)
   */
  const filteredSets = useMemo(() => {
    if (!searchQuery.trim()) {
      return sets;
    }

    const query = searchQuery.toLowerCase().trim();
    return sets.filter(set =>
      set.title.toLowerCase().includes(query)
    );
  }, [sets, searchQuery]);

  /**
   * Load all sets with statistics
   */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await setService.getAllSetsWithStats();
      
      if (result.success && result.data) {
        setSets(result.data);
        setPagination(prev => ({
          ...prev,
          page: 1,
          hasMore: result.data!.length >= prev.limit
        }));
      } else {
        setError(result.error || 'Failed to load sets');
        setSets([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load sets: ${errorMessage}`);
      setSets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load more sets (pagination) - Currently not implemented in SetService
   * This is a placeholder for future pagination support
   */
  const loadMore = useCallback(async () => {
    if (!pagination.hasMore || loading || refreshing) {
      return;
    }

    // For now, we don't have pagination in SetService
    // This would be implemented when SetService supports offset/limit
    console.log('Load more sets - not yet implemented');
  }, [pagination, loading, refreshing]);

  /**
   * Refresh data (for pull-to-refresh)
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  /**
   * Create a new set
   */
  const createSet = useCallback(async (request: SetCreateRequest): Promise<DatabaseResult<SetWithWords>> => {
    setLoading(true);
    setError(null);
    
    try {
      // Create the set
      const createResult = await setService.createSet(request);
      
      if (!createResult.success || !createResult.data) {
        setError(createResult.error || 'Failed to create set');
        return createResult as DatabaseResult<SetWithWords>;
      }

      const newSet = createResult.data[0];
      
      // Get the set with words (empty initially)
      const setWithWordsResult = await setService.getSetWithWords(newSet?.id!);
      
      if (setWithWordsResult.success) {
        // Refresh the sets list
        await loadData();
      }
      
      return setWithWordsResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  /**
   * Update a set
   */
  const updateSet = useCallback(async (setId: number, request: SetUpdateRequest): Promise<DatabaseResult<SetWithWords>> => {
    setLoading(true);
    setError(null);
    
    try {
      const updateResult = await setService.updateSet(setId, request);
      
      if (!updateResult.success) {
        setError(updateResult.error || 'Failed to update set');
        return updateResult as DatabaseResult<SetWithWords>;
      }

      // Get the updated set with words
      const setWithWordsResult = await setService.getSetWithWords(setId);
      
      if (setWithWordsResult.success) {
        // Update local state
        setSets(prev => prev.map(set => 
          set.id === setId 
            ? { ...set, title: request.title || set.title }
            : set
        ));
      }
      
      return setWithWordsResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a set
   */
  const deleteSet = useCallback(async (setId: number): Promise<DatabaseResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await setService.deleteSet(setId);
      
      if (result.success) {
        // Remove from local state
        setSets(prev => prev.filter(set => set.id !== setId));
      } else {
        setError(result.error || 'Failed to delete set');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add word to set
   */
  const addWordToSet = useCallback(async (setId: number, wordId: number): Promise<DatabaseResult> => {
    try {
      const result = await setService.addWordToSet(setId, wordId);
      
      if (result.success) {
        // Update local statistics
        setSets(prev => prev.map(set => 
          set.id === setId 
            ? { ...set, wordCount: set.wordCount + 1 }
            : set
        ));
      } else {
        setError(result.error || 'Failed to add word to set');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  }, []);

  /**
   * Remove word from set
   */
  const removeWordFromSet = useCallback(async (setId: number, wordId: number): Promise<DatabaseResult> => {
    try {
      const result = await setService.removeWordFromSet(setId, wordId);
      
      if (result.success) {
        // Update local statistics
        setSets(prev => prev.map(set => 
          set.id === setId 
            ? { ...set, wordCount: Math.max(0, set.wordCount - 1) }
            : set
        ));
      } else {
        setError(result.error || 'Failed to remove word from set');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  }, []);

  /**
   * Get set with words
   */
  const getSetWithWords = useCallback(async (setId: number): Promise<DatabaseResult<SetWithWords>> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await setService.getSetWithWords(setId);
      
      if (!result.success) {
        setError(result.error || 'Failed to get set with words');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Set search query
   */
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
  }, []);

  /**
   * Handle set menu actions
   */
  const handleSetMenu = useCallback((set: SetStats) => {
    setSelectedSet(set);
    setShowActionsModal(true);
  }, []);

  /**
   * Handle edit set
   */
  const handleEditSet = useCallback((set: SetStats) => {
    setSelectedSet(set);
    setShowEditModal(true);
    setShowActionsModal(false);
  }, []);

  /**
   * Handle delete set with confirmation
   */
  const handleDeleteSet = useCallback((set: SetStats) => {
    Alert.alert(
      'Delete Set',
      `Are you sure you want to delete "${set.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteSet(set.id);
            if (result.success) {
              console.log('Set deleted successfully');
            }
            setShowActionsModal(false);
          },
        },
      ]
    );
  }, [deleteSet]);

  /**
   * Handle view stats
   */
  const handleViewStats = useCallback((set: SetStats) => {
    console.log('View stats for set:', set.id);
    if (navigation) {
      navigation.navigate('SetStatistics', { setId: set.id });
    }
    setShowActionsModal(false);
  }, [navigation]);

  /**
   * Handle manage words
   */
  const handleManageWords = useCallback((set: SetStats) => {
    console.log('Manage words for set:', set.id);
    if (navigation) {
      navigation.navigate('ManageSetWords', { setId: set.id });
    }
    setShowActionsModal(false);
  }, [navigation]);

  /**
   * Load data on component mount
   */
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    // State
    loading,
    refreshing,
    error,
    sets,
    searchQuery,
    filteredSets,
    selectedSet,
    showEditModal,
    showActionsModal,
    pagination,
    
    // Actions
    setSearchQuery,
    setSelectedSet,
    setShowEditModal,
    setShowActionsModal,
    onRefresh,
    loadData,
    loadMore,
    createSet,
    updateSet,
    deleteSet,
    addWordToSet,
    removeWordFromSet,
    getSetWithWords,
    handleSetMenu,
    handleEditSet,
    handleDeleteSet,
    handleViewStats,
    handleManageWords,
  };
};