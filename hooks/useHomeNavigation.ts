import { WordWithExamples } from '../data/DataModels';

interface HomeNavigationActions {
  handleWordPress: (word: WordWithExamples) => void;
  handleProfilePress: () => void;
  handleSeeAllWords: () => void;
  handleFlashcardsPress: () => void;
  handleTestsPress: () => void;
  handleGrammarPress: () => void;
  handleWordListsPress: () => void;
  handleDictionariesPress: () => void;
  handleSetsPress: () => void;
  handleUnitsPress: () => void;
  handleAllWordsPress: () => void;
}

/**
 * Single Responsibility: Handle all navigation actions from home screen
 * Open/Closed: Can be extended with new navigation actions
 * Interface Segregation: Only contains navigation-related functions
 */
export const useHomeNavigation = (navigation?: any): HomeNavigationActions => {
  const handleWordPress = (word: WordWithExamples) => {
    console.log('Navigate to word details:', word.word);
    if (navigation) {
      navigation.navigate('WordDetails', { wordId: word.id });
    }
  };

  const handleProfilePress = () => {
    console.log('Navigate to profile');
    if (navigation) {
      navigation.navigate('Profile');
    }
  };

  const handleSeeAllWords = () => {
    console.log('Navigate to all words');
    if (navigation) {
      navigation.navigate('AllWords');
    }
  };

  const handleFlashcardsPress = () => {
    console.log('Navigate to flashcards');
    if (navigation) {
      navigation.navigate('Flashcards');
    }
  };

  const handleTestsPress = () => {
    console.log('Navigate to tests');
    if (navigation) {
      navigation.navigate('Tests');
    }
  };

  const handleGrammarPress = () => {
    console.log('Navigate to grammar');
    if (navigation) {
      navigation.navigate('Grammar');
    }
  };

  const handleWordListsPress = () => {
    console.log('Navigate to word lists');
    if (navigation) {
      navigation.navigate('WordSets');
    }
  };

  const handleDictionariesPress = () => {
    console.log('Navigate to dictionaries');
    if (navigation) {
      navigation.navigate('Dictionaries');
    }
  };

  const handleSetsPress = () => {
    console.log('Navigate to word sets');
    if (navigation) {
      navigation.navigate('WordSets');
    }
  };

  const handleUnitsPress = () => {
    console.log('Navigate to units');
    if (navigation) {
      navigation.navigate('Units');
    }
  };

  const handleAllWordsPress = () => {
    console.log('Navigate to all words');
    if (navigation) {
      navigation.navigate('AllWords');
    }
  };

  return {
    handleWordPress,
    handleProfilePress,
    handleSeeAllWords,
    handleFlashcardsPress,
    handleTestsPress,
    handleGrammarPress,
    handleWordListsPress,
    handleDictionariesPress,
    handleSetsPress,
    handleUnitsPress,
    handleAllWordsPress,
  };
};