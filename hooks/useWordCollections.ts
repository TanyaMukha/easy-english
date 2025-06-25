import { useState, useEffect } from 'react';
import { MockDataService } from '../data/MockData';
import { Dictionary, SetWithWords, Unit } from '../data/DataModels';
import { Colors } from '../styles/GlobalStyles';

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
  dictionaries: Dictionary[];
  sets: SetWithWords[];
  units: Unit[];
}

interface WordCollectionsActions {
  loadCollections: () => Promise<void>;
  navigateToDictionary: (id: number) => void;
  navigateToSet: (id: number) => void;
  navigateToUnit: (id: number) => void;
  navigateToAllCollections: () => void;
}

/**
 * Single Responsibility: Manage word collections data and navigation
 * Open/Closed: Can be extended with new collection types
 * Interface Segregation: Separates collections logic from UI
 */
export const useWordCollections = (
  navigation?: any
): WordCollectionsState & WordCollectionsActions => {
  const [loading, setLoading] = useState(true);
  const [dictionaries, setDictionaries] = useState<Dictionary[]>([]);
  const [sets, setSets] = useState<SetWithWords[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const [dictionariesData, setsData, unitsData] = await Promise.all([
        MockDataService.getDictionaries(),
        MockDataService.getSets(),
        MockDataService.getUnits(),
      ]);

      setDictionaries(dictionariesData);
      setSets(setsData);
      setUnits(unitsData);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
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

  // Generate collections array for UI
  const collections: CollectionItem[] = [
    // Dictionaries
    ...dictionaries.slice(0, 2).map(dict => ({
      id: `dict-${dict.id}`,
      title: dict.title,
      subtitle: 'Dictionary',
      icon: 'book',
      color: Colors.primary,
      count: 150, // Mock word count - would come from database
      onPress: () => navigateToDictionary(dict.id),
    })),
    // Word Sets
    ...sets.slice(0, 2).map(set => ({
      id: `set-${set.id}`,
      title: set.title,
      subtitle: `${set.wordCount} words`,
      icon: 'list',
      color: Colors.success,
      count: set.wordCount,
      onPress: () => navigateToSet(set.id),
    })),
    // Units
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