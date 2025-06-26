import { useEffect, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import WordCard from "../../components/cards/WordCard";
import {
  EmptyState,
  ErrorState,
  FloatingActionButton,
  LoadingState,
  ScreenHeader,
  SearchBar,
} from "../../components/ui";
import { WordWithExamples } from "../../data/DataModels";
import { MockDataService } from "../../data/MockData";
import { Colors, SharedStyles, Spacing } from "../../styles/SharedStyles";

export default function DictionaryScreen() {
  const { dictionaryId } = useLocalSearchParams<{ dictionaryId: string }>();
  const dictionaryIdNumber = parseInt(dictionaryId || "1", 10);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dictionary, setDictionary] = useState<any>(null);
  const [words, setWords] = useState<WordWithExamples[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWords = searchQuery.trim()
    ? words.filter(
        (word) =>
          word.word.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          word.translation
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase().trim()),
      )
    : words;

  const loadData = async () => {
    try {
      setError(null);
      const [dictionaryData, wordsData] = await Promise.all([
        MockDataService.getDictionary(dictionaryIdNumber),
        MockDataService.getWords({
          dictionaryId: dictionaryIdNumber,
          limit: 100,
        }),
      ]);

      if (!dictionaryData) {
        setError("Dictionary not found");
        return;
      }

      setDictionary(dictionaryData);
      setWords(wordsData.words);
    } catch (err) {
      setError("Failed to load dictionary. Please try again.");
      console.error("Error loading dictionary:", err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleWordPress = (word: WordWithExamples) => {
    router.push(`/words/${word.id}`);
  };

  const handleAddWordPress = () => {
    router.push(`/words/create?dictionaryId=${dictionaryIdNumber}`);
  };

  const handleBackPress = () => {
    router.back();
  };

  useEffect(() => {
    loadData();
  }, [dictionaryIdNumber]);

  const renderWord = ({ item }: { item: WordWithExamples }) => (
    <WordCard word={item} onPress={handleWordPress} showProgress={true} />
  );

  const renderSeparator = () => <View style={{ height: Spacing.md }} />;

  return (
    <View style={SharedStyles.container}>
      <ScreenHeader
        title={dictionary?.title || "Dictionary"}
        subtitle={`${words.length} words`}
        showBackButton={true}
        onBackPress={handleBackPress}
        rightIcon="ellipsis-horizontal"
        onRightPress={() => console.log("Show dictionary menu")}
        onRightPressAccessibilityLabel="Dictionary options"
      />

      {loading && <LoadingState message="Loading dictionary..." />}

      {!loading && error && (
        <ErrorState
          title="Failed to load dictionary"
          message={error}
          onRetry={loadData}
        />
      )}

      {!loading && !error && dictionary && (
        <View style={SharedStyles.flex1}>
          <View
            style={[SharedStyles.paddingHorizontalLg, styles.searchContainer]}
          >
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search words..."
              showFilterButton={false}
            />
          </View>

          {filteredWords.length === 0 && !searchQuery && (
            <EmptyState
              title="No words yet"
              message="Start building your vocabulary by adding your first word"
              buttonText="Add Word"
              onButtonPress={handleAddWordPress}
              icon="book-outline"
            />
          )}

          {filteredWords.length === 0 && searchQuery && (
            <EmptyState
              title="No words found"
              message={`No words match "${searchQuery}"`}
              icon="search"
              showButton={false}
            />
          )}

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

          <FloatingActionButton
            icon="add"
            onPress={handleAddWordPress}
            accessibilityLabel="Add new word"
          />
        </View>
      )}
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
    paddingBottom: Spacing.xxxl,
  },
};
