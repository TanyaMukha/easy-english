import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { GlobalStyles, Colors, Spacing } from '../styles/GlobalStyles';
import { WordWithExamples } from '../data/DataModels';
import DailyWordCard from './DailyWordCard';

interface DailyWordsSectionProps {
  words: WordWithExamples[];
  title?: string;
  onWordPress: (word: WordWithExamples) => void;
  onSeeAllPress: () => void;
  seeAllText?: string;
}

/**
 * Single Responsibility: Display a horizontal list of daily words
 * Open/Closed: Can be extended with different word display options
 * Dependency Inversion: Depends on WordWithExamples abstraction
 */
const DailyWordsSection: React.FC<DailyWordsSectionProps> = ({
  words,
  title = "Today's Words",
  onWordPress,
  onSeeAllPress,
  seeAllText = 'See all'
}) => {
  const renderWord = ({ item }: { item: WordWithExamples }) => (
    <DailyWordCard word={item} onPress={onWordPress} />
  );

  const renderSeparator = () => <View style={{ width: Spacing.md }} />;

  return (
    <View style={styles.container}>
      <View style={[GlobalStyles.flexRow, GlobalStyles.paddingHorizontalLg, styles.header]}>
        <Text style={[GlobalStyles.h3, GlobalStyles.textPrimary]}>
          {title}
        </Text>
        <TouchableOpacity onPress={onSeeAllPress} activeOpacity={0.7}>
          <Text style={[GlobalStyles.bodyMedium, styles.seeAllText]}>
            {seeAllText}
          </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={words}
        renderItem={renderWord}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={renderSeparator}
      />
    </View>
  );
};

const styles = {
  container: {
    marginTop: Spacing.lg,
  },
  header: {
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: Spacing.md,
  },
  seeAllText: {
    color: Colors.primary,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
};

export default DailyWordsSection;