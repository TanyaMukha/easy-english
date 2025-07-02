import { FlatList, RefreshControl, View } from "react-native";
import { router } from "expo-router";

import WordCard from "../../components/cards/WordCard";
import { FilterModal, WordActionsModal } from "../../components/modals";
// Components
import {
  EmptyState,
  ErrorState,
  FloatingActionButton,
  LoadingState,
  ScreenHeader,
  SearchBar,
} from "../../components/ui";
import { WordWithExamples } from "../../data/DataModels";
// Custom hooks
import { useWords } from "../../hooks/useWords";
import { Colors, SharedStyles, Spacing } from "../../services/database/styles/SharedStyles";

/**
 * All Words Screen with full CRUD support
 * Single Responsibility: Display and manage all words across dictionaries
 */
export default function WordsScreen() {
  const {
    loading,
    refreshing,
    error,
    filteredWords,
    searchQuery,
    selectedWord,
    showActionsModal,
    filters,
    showFilters,
    pagination,
    setSearchQuery,
    setShowFilters,
    setFilters,
    setShowActionsModal,
    onRefresh,
    loadData,
    loadMore,
    deleteWord,
    handleWordMenu,
    updateWordProgress,
  } = useWords();

  const handleWordPress = (word: WordWithExamples) => {
    console.log("Navigate to word details:", word.id);
    router.replace(`/words/${word.id}`);
  };

  const handleCreatePress = () => {
    console.log("Navigate to create word");
    router.replace("/words/create");
  };

  const handleEditWord = (word: WordWithExamples) => {
    console.log("Navigate to edit word:", word.id);
    router.replace(`/words/edit/${word.id}`);
  };

  const handleDeleteWord = async (word: WordWithExamples) => {
    const success = await deleteWord(word.id!);
    if (success) {
      console.log("Word deleted successfully");
    }
  };

  const handleViewStats = (word: WordWithExamples) => {
    console.log("View stats for word:", word.id);
    // TODO: Navigate to word statistics screen
  };

  const handlePractice = (word: WordWithExamples) => {
    console.log("Practice word:", word.id);
    // TODO: Navigate to practice screen with this word
  };

  const handleFilterPress = () => {
    setShowFilters(true);
  };

  const handleEndReached = () => {
    if (pagination.hasMore && !loading && !refreshing) {
      loadMore();
    }
  };

  const renderWord = ({ item }: { item: WordWithExamples }) => (
    <WordCard
      word={item}
      onPress={handleWordPress}
      onMenuPress={handleWordMenu}
      showProgress={true}
      showExamples={true}
      showMenu={true}
    />
  );

  const renderSeparator = () => <View style={{ height: Spacing.md }} />;

  const renderFooter = () => {
    return pagination.hasMore && loading ? (
      <View style={styles.footer}>
        <LoadingState message="Loading more words..." />
      </View>
    ) : null;
  };

  return (
    <View style={SharedStyles.container}>
      {/* Header */}
      <ScreenHeader
        title="All Words"
        subtitle={`${pagination.total} words total`}
        showBackButton={true}
        onBackPress={() => router.back()}
        rightIcon="add"
        onRightPress={handleCreatePress}
        onRightPressAccessibilityLabel="Add new word"
      />

      {loading && filteredWords.length === 0 ? (
        <LoadingState message="Loading words..." />
      ) : !loading && error && filteredWords.length === 0 ? (
        <ErrorState
          title="Failed to load words"
          message={error}
          onRetry={loadData}
        />
      ) : (
        <View style={SharedStyles.flex1}>
          {/* Search Bar */}
          <View
            style={[SharedStyles.paddingHorizontalLg, styles.searchContainer]}
          >
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search words..."
              showFilterButton={true}
              onFilterPress={handleFilterPress}
            />
          </View>

          {filteredWords.length === 0 && !searchQuery ? (
            <EmptyState
              title="No words yet"
              message="Start building your vocabulary by adding your first word"
              // buttonText="Add Word"
              // onButtonPress={handleCreatePress}
              icon="book-outline"
            />
          ) : filteredWords.length === 0 && searchQuery ? (
            <EmptyState
              title="No words found"
              message={`No words match "${searchQuery}"`}
              icon="search"
              // showButton={false}
            />
          ) : (
            <>
              <FlatList
                data={filteredWords}
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
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.3}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={10}
              />

              <FloatingActionButton
                icon="add"
                onPress={handleCreatePress}
                accessibilityLabel="Add new word"
              />
            </>
          )}
        </View>
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        filters={filters}
        onFiltersChange={setFilters}
        onClose={() => setShowFilters(false)}
      />

      {/* Word Actions Modal */}
      <WordActionsModal
        visible={showActionsModal}
        word={selectedWord}
        onClose={() => setShowActionsModal(false)}
        onEdit={handleEditWord}
        onDelete={handleDeleteWord}
        onViewStats={handleViewStats}
        onPractice={handlePractice}
      />
    </View>
  );
}

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
