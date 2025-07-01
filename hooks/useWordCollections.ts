// hooks/useWordCollections.ts - Updated to use new database services
import { useState, useEffect } from 'react';
import { 
  dictionaryService, 
  setService, 
  type DictionaryStats, 
  type SetStats,
  type DatabaseResult 
} from '../services/database';
import { Colors } from '../styles/SharedStyles';

interface CollectionItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  count: number;
  onPress: () => void;
}

interface WordCollectionsState {
  loading: boolean;
  collections: CollectionItem[];
  dictionaries: DictionaryStats[];
  sets: SetStats[];
  units: any[];
}

interface WordCollectionsActions {
  loadCollections: () => Promise<void>;
  navigateToDictionary: (id: number) => void;
  navigateToSet: (id: number) => void;
  navigateToUnit: (id: number) => void;
  navigateToAllCollections: () => void;
}

/**
 * Enhanced word collections hook using new database services
 * 
 * This hook provides access to all word collections (dictionaries, sets, units)
 * using the new service layer architecture. It fetches real data from the database
 * and provides a unified interface for the UI components.
 * 
 * Key improvements:
 * - Uses real database services instead of mock data
 * - Better error handling and loading states
 * - Consistent data structure across collection types
 * - Proper separation of concerns
 */
export const useWordCollections = (
  navigation?: any
): WordCollectionsState & WordCollectionsActions => {
  const [loading, setLoading] = useState(true);
  const [dictionaries, setDictionaries] = useState<DictionaryStats[]>([]);
  const [sets, setSets] = useState<SetStats[]>([]);
  const [units, setUnits] = useState<any[]>([]); // Units will be implemented later

  /**
   * Load all collections data from database services
   */
  const loadCollections = async () => {
    try {
      setLoading(true);
      
      // Load dictionaries with statistics
      const dictionariesResult: DatabaseResult<DictionaryStats> = await dictionaryService.getAllDictionariesWithStats();
      if (dictionariesResult.success && dictionariesResult.data) {
        setDictionaries(dictionariesResult.data);
      } else {
        console.warn('Failed to load dictionaries:', dictionariesResult.error);
        setDictionaries([]);
      }

      // Load sets with statistics
      const setsResult: DatabaseResult<SetStats> = await setService.getAllSetsWithStats();
      if (setsResult.success && setsResult.data) {
        setSets(setsResult.data);
      } else {
        console.warn('Failed to load sets:', setsResult.error);
        setSets([]);
      }

      // Units will be implemented later with UnitService
      setUnits([]);
      
    } catch (error) {
      console.error('Error loading collections:', error);
      // Set empty arrays to prevent UI errors
      setDictionaries([]);
      setSets([]);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigation handlers
   */
  const navigateToDictionary = (id: number) => {
    console.log('Navigate to dictionary:', id);
    if (navigation) {
      navigation.navigate('Dictionary', { dictionaryId: id });
    }
  };

  const navigateToSet = (id: number) => {
    console.log('Navigate to set:', id);
    if (navigation) {
      navigation.navigate('WordSet', { setId: id });
    }
  };

  const navigateToUnit = (id: number) => {
    console.log('Navigate to unit:', id);
    if (navigation) {
      navigation.navigate('Unit', { unitId: id });
    }
  };

  const navigateToAllCollections = () => {
    console.log('Navigate to all collections');
    if (navigation) {
      navigation.navigate('Collections');
    }
  };

  /**
   * Generate collections array for UI display
   * Combines dictionaries, sets, and units into a unified format
   */
  const collections: CollectionItem[] = [
    // Dictionaries - show top 2 with most words
    ...dictionaries
      .sort((a, b) => b.totalWords - a.totalWords)
      .slice(0, 2)
      .map(dict => ({
        id: `dict-${dict.id}`,
        title: dict.title,
        subtitle: `${dict.totalWords} words`,
        icon: 'book',
        color: Colors.primary,
        count: dict.totalWords,
        onPress: () => navigateToDictionary(dict.id),
      })),
    
    // Word Sets - show top 2 with most words
    ...sets
      .sort((a, b) => b.wordCount - a.wordCount)
      .slice(0, 2)
      .map(set => ({
        id: `set-${set.id}`,
        title: set.title,
        subtitle: `${set.wordCount} words`,
        icon: 'list',
        color: Colors.success,
        count: set.wordCount,
        onPress: () => navigateToSet(set.id),
      })),
    
    // Units - show top 1 (placeholder for future implementation)
    ...units.slice(0, 1).map(unit => ({
      id: `unit-${unit.id}`,
      title: unit.title,
      subtitle: 'Learning unit',
      icon: 'school',
      color: Colors.accent,
      count: 5, // Mock lesson count
      onPress: () => navigateToUnit(unit.id),
    })),
  ];

  /**
   * Load data on component mount
   */
  useEffect(() => {
    loadCollections();
  }, []);

  return {
    // State
    loading,
    collections,
    dictionaries,
    sets,
    units,
    
    // Actions
    loadCollections,
    navigateToDictionary,
    navigateToSet,
    navigateToUnit,
    navigateToAllCollections,
  };
};