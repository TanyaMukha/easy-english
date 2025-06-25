import React from "react";
import { FlatList, RefreshControl, View } from "react-native";

import ErrorState from "./ErrorState";
import FloatingActionButton from "./FloatingActionButton";
import LoadingState from "./LoadingState";
import WordCard from "./WordCard";
import EmptyState from "../components/EmptyState";
import FilterModal from "../components/FilterModal";
// Components
import ScreenHeader from "../components/ScreenHeader";
import SearchBar from "../components/SearchBar";
import { WordWithExamples } from "../data/DataModels";
// Custom hooks
import { useDictionary } from "../hooks/useDictionary";
import { Colors, GlobalStyles, Spacing } from "../styles/GlobalStyles";

interface DictionaryScreenProps {
  navigation?: any;
  route?: {
    params: {
      dictionaryId: number;
    };
  };
}

/**
 * Single Responsibility: Display and manage words in a dictionary
 * Open/Closed: Can be extended with new word management features
 * Dependency Inversion: Depends on dictionary and word abstractions
 */
const DictionaryScreen: React.FC<DictionaryScreenProps> = ({
  navigation,
  route,
}) => {
  const dictionaryId = route?.params?.dictionaryId || 1;

  const {
    loading,
    refreshing,
    error,
    dictionary,
    words,
    searchQuery,
    filteredWords,
    showFilters,
    filters,
    setSearchQuery,
    setShowFilters,
    setFilters,
    onRefresh,
    loadData,
    navigateToWord,
    navigateToAddWord,
  } = useDictionary(dictionaryId, navigation);

  const handleWordPress = (word: WordWithExamples) => {
    navigateToWord(word.id);
  };

  const handleAddWordPress = () => {
    navigateToAddWord();
  };

  const handleFilterPress = () => {
    setShowFilters(true);
  };

  const renderWord = ({ item }: { item: WordWithExamples }) => (
    <WordCard word={item} onPress={handleWordPress} showProgress={true} />
  );

  const renderSeparator = () => <View style={{ height: Spacing.md }} />;

  return (
    <View style={GlobalStyles.container}>
      {/* Header */}
      <ScreenHeader
        title={dictionary?.title || "Dictionary"}
        subtitle={`${words.length} words`}
        showBackButton={true}
        onBackPress={() => navigation?.goBack()}
        rightIcon="ellipsis-horizontal"
        onRightPress={() => console.log("Show dictionary menu")}
        onRightPressAccessibilityLabel="Dictionary options"
      />

      {/* Loading State */}
      {loading && <LoadingState message="Loading dictionary..." />}

      {/* Error State */}
      {!loading && error && (
        <ErrorState
          title="Failed to load dictionary"
          message={error}
          onRetry={loadData}
        />
      )}

      {/* Main Content */}
      {!loading && !error && dictionary && (
        <View style={GlobalStyles.flex1}>
          {/* Search Bar */}
          <View
            style={[GlobalStyles.paddingHorizontalLg, styles.searchContainer]}
          >
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search words..."
              showFilterButton={true}
              onFilterPress={handleFilterPress}
            />
          </View>

          {/* Empty State */}
          {filteredWords.length === 0 && !searchQuery && (
            <EmptyState
              title="No words yet"
              message="Start building your vocabulary by adding your first word"
              buttonText="Add Word"
              onButtonPress={handleAddWordPress}
              icon="book-outline"
            />
          )}

          {/* Search Empty State */}
          {filteredWords.length === 0 && searchQuery && (
            <EmptyState
              title="No words found"
              message={`No words match "${searchQuery}"`}
              icon="search"
              showButton={false}
            />
          )}

          {/* Words List */}
          {filteredWords.length > 0 && (
            <FlatList
              data={filteredWords}
              renderItem={renderWord}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={renderSeparator}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={Colors.primary}
                />
              }
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Floating Action Button */}
          <FloatingActionButton
            icon="add"
            onPress={handleAddWordPress}
            accessibilityLabel="Add new word"
          />

          {/* Filter Modal */}
          <FilterModal
            visible={showFilters}
            filters={filters}
            onFiltersChange={setFilters}
            onClose={() => setShowFilters(false)}
          />
        </View>
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
};

export default DictionaryScreen;
