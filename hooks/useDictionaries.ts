import { useState, useEffect, useMemo } from 'react';
import { DictionaryService } from '../services/DictionaryService';
import { Dictionary } from '../data/DataModels';

interface DictionariesState {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  dictionaries: Dictionary[];
  searchQuery: string;
  filteredDictionaries: Dictionary[];
  selectedDictionary: Dictionary | null;
  showEditModal: boolean;
  showActionsModal: boolean;
}

interface DictionariesActions {
  setSearchQuery: (query: string) => void;
  setSelectedDictionary: (dictionary: Dictionary | null) => void;
  setShowEditModal: (show: boolean) => void;
  setShowActionsModal: (show: boolean) => void;
  onRefresh: () => Promise<void>;
  loadData: () => Promise<void>;
  createDictionary: (title: string) => Promise<boolean>;
  updateDictionary: (id: number, title: string) => Promise<boolean>;
  deleteDictionary: (id: number) => Promise<boolean>;
  navigateToDictionary: (dictionaryId: number) => void;
  navigateToCreateDictionary: () => void;
  handleDictionaryMenu: (dictionary: Dictionary) => void;
  handleEditDictionary: (dictionary: Dictionary) => void;
  handleDeleteDictionary: (dictionary: Dictionary) => void;
  handleViewStats: (dictionary: Dictionary) => void;
}

/**
 * Single Responsibility: Manage dictionaries data and CRUD operations
 * Open/Closed: Can be extended with additional dictionary operations
 * Interface Segregation: Separates dictionaries logic from UI
 */
export const useDictionaries = (
  navigation?: any
): DictionariesState & DictionariesActions => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dictionaries, setDictionaries] = useState<Dictionary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDictionary, setSelectedDictionary] = useState<Dictionary | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);

  // Filter dictionaries based on search query
  const filteredDictionaries = useMemo(() => {
    if (!searchQuery.trim()) {
      return dictionaries;
    }

    const query = searchQuery.toLowerCase().trim();
    return dictionaries.filter(dictionary =>
      dictionary.title.toLowerCase().includes(query)
    );
  }, [dictionaries, searchQuery]);

  const loadData = async () => {
    try {
      setError(null);
      const response = await DictionaryService.getAll();
      
      if (response.success && response.data) {
        setDictionaries(response.data);
      } else {
        setError(response.error || 'Failed to load dictionaries');
      }
    } catch (err) {
      setError('Failed to load dictionaries. Please try again.');
      console.error('Error loading dictionaries:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const createDictionary = async (title: string): Promise<boolean> => {
    try {
      const response = await DictionaryService.create({ title });
      
      if (response.success && response.data) {
        // Оновлюємо список словників, додаючи новий на початок
        setDictionaries(prev => [response.data!, ...prev]);
        return true;
      } else {
        setError(response.error || 'Failed to create dictionary');
        return false;
      }
    } catch (err) {
      setError('Failed to create dictionary. Please try again.');
      return false;
    }
  };

  const updateDictionary = async (id: number, title: string): Promise<boolean> => {
    try {
      const response = await DictionaryService.update(id, { title });
      
      if (response.success && response.data) {
        // Оновлюємо конкретний словник у списку
        setDictionaries(prev =>
          prev.map(dict => dict.id === id ? response.data! : dict)
        );
        setSelectedDictionary(response.data);
        return true;
      } else {
        setError(response.error || 'Failed to update dictionary');
        return false;
      }
    } catch (err) {
      setError('Failed to update dictionary. Please try again.');
      return false;
    }
  };

  const deleteDictionary = async (id: number): Promise<boolean> => {
    try {
      const response = await DictionaryService.delete(id);
      
      if (response.success) {
        // Видаляємо словник зі списку
        setDictionaries(prev => prev.filter(dict => dict.id !== id));
        setSelectedDictionary(null);
        setShowActionsModal(false); // Закриваємо модальне вікно
        return true;
      } else {
        setError(response.error || 'Failed to delete dictionary');
        return false;
      }
    } catch (err) {
      setError('Failed to delete dictionary. Please try again.');
      return false;
    }
  };

  // Navigation handlers
  const navigateToDictionary = (dictionaryId: number) => {
    console.log('Navigate to dictionary:', dictionaryId);
    if (navigation) {
      navigation.navigate('Dictionary', { dictionaryId });
    }
  };

  const navigateToCreateDictionary = () => {
    console.log('Navigate to create dictionary');
    if (navigation) {
      navigation.navigate('CreateDictionary');
    }
  };

  // UI handlers
  const handleDictionaryMenu = (dictionary: Dictionary) => {
    setSelectedDictionary(dictionary);
    setShowActionsModal(true);
  };

  const handleEditDictionary = (dictionary: Dictionary) => {
    setSelectedDictionary(dictionary);
    setShowEditModal(true);
  };

  const handleDeleteDictionary = async (dictionary: Dictionary) => {
    const success = await deleteDictionary(dictionary.id);
    if (success) {
      // Optional: Show success message
      console.log('Dictionary deleted successfully');
    }
  };

  const handleViewStats = (dictionary: Dictionary) => {
    console.log('View stats for dictionary:', dictionary.id);
    // TODO: Navigate to statistics screen
    // navigation?.navigate('DictionaryStats', { dictionaryId: dictionary.id });
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    // State
    loading,
    refreshing,
    error,
    dictionaries,
    searchQuery,
    filteredDictionaries,
    selectedDictionary,
    showEditModal,
    showActionsModal,
    // Actions
    setSearchQuery,
    setSelectedDictionary,
    setShowEditModal,
    setShowActionsModal,
    onRefresh,
    loadData,
    createDictionary,
    updateDictionary,
    deleteDictionary,
    navigateToDictionary,
    navigateToCreateDictionary,
    handleDictionaryMenu,
    handleEditDictionary,
    handleDeleteDictionary,
    handleViewStats,
  };
};