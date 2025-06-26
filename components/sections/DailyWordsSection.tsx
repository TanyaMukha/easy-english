// components/sections/DailyWordsSection.tsx
import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { WordWithExamples } from '../../data/DataModels';
import DailyWordCard from '../cards/DailyWordCard';
import {
  Colors,
  SharedStyles,
  Spacing,
  Typography,
} from '../../styles/SharedStyles';

interface DailyWordsSectionProps {
  words: WordWithExamples[];
  title?: string;
  onWordPress: (word: WordWithExamples) => void;
  onSeeAll: () => void;
  seeAllText?: string;
}

/**
 * Daily Words Section Component
 * Single Responsibility: Display a horizontal list of daily words
 * Open/Closed: Can be extended with different word display options
 * Dependency Inversion: Depends on WordWithExamples abstraction
 */
const DailyWordsSection: React.FC<DailyWordsSectionProps> = ({
  words,
  title,
  onWordPress,
  onSeeAll,
  seeAllText,
}) => {
  const { t } = useTranslation();

  const sectionTitle = title || t('home.todaysWords', "Today's Words");
  const seeAllLabel = seeAllText || t('common.seeAll', 'See all');

  const renderWord = ({ item }: { item: WordWithExamples }) => (
    <DailyWordCard word={item} onPress={onWordPress} />
  );

  const renderSeparator = () => <View style={{ width: Spacing.md }} />;

  const keyExtractor = (item: WordWithExamples) => 
    item.id?.toString() || item.guid || `word-${item.word}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>
          {sectionTitle}
        </Text>
        
        <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
          <Text style={styles.seeAllText}>
            {seeAllLabel}
          </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={words}
        renderItem={renderWord}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={renderSeparator}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={3}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.lg,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  
  seeAllText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.primary,
  },
  
  listContent: {
    paddingHorizontal: Spacing.md,
  },
});

export default DailyWordsSection;