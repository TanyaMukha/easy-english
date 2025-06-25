// components/words/WordListContent.tsx

import React from "react";
import { FlatList, RefreshControl, View } from "react-native";

import EmptyState from "./EmptyState";
import FloatingActionButton from "./FloatingActionButton";
import LoadingState from "./LoadingState";
import SearchBar from "./SearchBar";
import WordCard from "./WordCard";
import { WordWithExamples } from "../data/DataModels";
import { Colors, GlobalStyles, Spacing } from "../styles/GlobalStyles";

interface WordListContentProps {
  words: WordWithExamples[];
  searchQuery: string;
  refreshing: boolean;
  hasMore: boolean;
  loading: boolean;
  onWordPress: (word: WordWithExamples) => void;
  onWordMenu: (word: WordWithExamples) => void;
  onSearchChange: (query: string) => void;
  onFilterPress: () => void;
  onAddPress: () => void;
  onRefresh: () => void;
  onEndReached: () => void;
}

/**
 * Single Responsibility: Render the main word list content
 * Open/Closed: Can be extended with additional list features
 * Interface Segregation: Only requires list-related props
 */
const WordListContent: React.FC<WordListContentProps> = ({
  words,
  searchQuery,
  refreshing,
  hasMore,
  loading,
  onWordPress,
  onWordMenu,
  onSearchChange,
  onFilterPress,
  onAddPress,
  onRefresh,
  onEndReached,
}) => {
  const renderWord = ({ item }: { item: WordWithExamples }) => (
    <WordCard
      word={item}
      onPress={onWordPress}
      onMenuPress={onWordMenu}
      showProgress={true}
      showExamples={true}
      showMenu={true}
    />
  );

  const renderSeparator = () => <View style={{ height: Spacing.md }} />;

  const renderFooter = () => {
    return hasMore && loading ? (
      <View style={styles.footer}>
        <LoadingState message="Loading more words..." />
      </View>
    ) : null;
  };

  return (
    <View style={GlobalStyles.flex1}>
      <View style={[GlobalStyles.paddingHorizontalLg, styles.searchContainer]}>
        <SearchBar
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search words..."
          showFilterButton={true}
          onFilterPress={onFilterPress}
        />
      </View>

      {words.length === 0 && !searchQuery ? (
        <EmptyState
          title="No words yet"
          message="Start building your vocabulary by adding your first word"
          buttonText="Add Word"
          onButtonPress={onAddPress}
          icon="book-outline"
        />
      ) : words.length === 0 && searchQuery ? (
        <EmptyState
          title="No words found"
          message={`No words match "${searchQuery}"`}
          icon="search"
          showButton={false}
        />
      ) : (
        <>
          <FlatList
            data={words}
            renderItem={renderWord}
            keyExtractor={(item) => item.id!.toString()}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={renderSeparator}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.primary}
              />
            }
            showsVerticalScrollIndicator={false}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.3}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
          />

          <FloatingActionButton
            icon="add"
            onPress={onAddPress}
            accessibilityLabel="Add new word"
          />
        </>
      )}
    </View>
  );
};

const styles = {
  searchContainer: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl, // Extra space for FAB
  },
  footer: {
    paddingVertical: Spacing.lg,
  },
};

export default WordListContent;
