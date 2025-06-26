// app/sets/[setId]/add-words.tsx
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";

import { WordCard } from "../../components/cards";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  ScreenHeader,
  SearchBar,
} from "../../components/ui";
import { WordWithExamples } from "../../data/DataModels";
import { MockDataService } from "../../data/MockData";
import { SetService } from "../../services/SetService";
import {
  BorderRadius,
  Colors,
  SharedStyles,
  Spacing,
  Typography,
} from "../../styles/SharedStyles";

/**
 * Add Words to Set Screen
 * Single Responsibility: Allow users to add words to a specific set
 * Open/Closed: Can be extended with filtering and sorting options
 */
export default function AddWordsToSetScreen() {
  const { setId } = useLocalSearchParams<{ setId: string }>();
  const setIdNumber = parseInt(setId || "1", 10);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [words, setWords] = useState<WordWithExamples[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWords, setSelectedWords] = useState<Set<number>>(new Set());
  const [isAdding, setIsAdding] = useState(false);

  const filteredWords = searchQuery.trim()
    ? words.filter(
        (word) =>
          word.word.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          word.translation
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase().trim()),
      )
    : words;

  const loadWords = async () => {
    try {
      setError(null);

      // Load available words - in real implementation, this would exclude
      // words already in the set
      const wordsData = await MockDataService.getWords({ limit: 100 });
      setWords(wordsData.words);
    } catch (err) {
      setError("Failed to load words. Please try again.");
      console.error("Error loading words:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleWordSelect = (word: WordWithExamples) => {
    const newSelectedWords = new Set(selectedWords);

    if (newSelectedWords.has(word.id!)) {
      newSelectedWords.delete(word.id!);
    } else {
      newSelectedWords.add(word.id!);
    }

    setSelectedWords(newSelectedWords);
  };

  const handleAddSelectedWords = async () => {
    if (selectedWords.size === 0) return;

    setIsAdding(true);

    try {
      // Add each selected word to the set
      const promises = Array.from(selectedWords).map((wordId) =>
        SetService.addWordToSet({ setId: setIdNumber, wordId }),
      );

      const results = await Promise.all(promises);
      const successCount = results.filter((result) => result.success).length;

      if (successCount === selectedWords.size) {
        // All words added successfully
        router.back();
      } else {
        // Some words failed to add
        setError(`Added ${successCount} of ${selectedWords.size} words`);
        setSelectedWords(new Set()); // Clear selection
      }
    } catch (err) {
      setError("Failed to add words to set. Please try again.");
      console.error("Error adding words to set:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedWords.size === filteredWords.length) {
      // Deselect all
      setSelectedWords(new Set());
    } else {
      // Select all visible words
      const allWordIds = new Set(filteredWords.map((word) => word.id!));
      setSelectedWords(allWordIds);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  // Load words on mount
  useEffect(() => {
    loadWords();
  }, []);

  const renderWord = ({ item }: { item: WordWithExamples }) => {
    const isSelected = selectedWords.has(item.id!);

    return (
      <TouchableOpacity
        style={[
          styles.wordContainer,
          isSelected && styles.selectedWordContainer,
        ]}
        onPress={() => handleWordSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.wordContent}>
          <WordCard
            word={item}
            onPress={() => {}} // Disable default press action
            showProgress={false}
            showExamples={false}
            showMenu={false}
          />
        </View>

        <View style={styles.selectionIndicator}>
          <View style={[styles.checkbox, isSelected && styles.checkedCheckbox]}>
            {isSelected && (
              <Icon name="check" size={16} color={Colors.onPrimary} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSeparator = () => <View style={{ height: Spacing.sm }} />;

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.selectAllButton}
        onPress={handleSelectAll}
        disabled={filteredWords.length === 0}
      >
        <Text style={styles.selectAllText}>
          {selectedWords.size === filteredWords.length
            ? "Deselect All"
            : "Select All"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.selectionCount}>{selectedWords.size} selected</Text>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return <LoadingState message="Loading words..." />;
    }

    if (error) {
      return (
        <ErrorState
          title="Failed to Load Words"
          description={error}
          actionText="Try Again"
          onActionPress={loadWords}
        />
      );
    }

    if (filteredWords.length === 0 && !searchQuery.trim()) {
      return (
        <EmptyState
          icon="list"
          title="No Words Available"
          description="There are no words available to add to this set"
        />
      );
    }

    if (filteredWords.length === 0 && searchQuery.trim()) {
      return (
        <EmptyState
          icon="search"
          title="No Words Found"
          description={`No words match "${searchQuery}"`}
          actionText="Clear Search"
          onActionPress={() => setSearchQuery("")}
        />
      );
    }

    return (
      <FlatList
        data={filteredWords}
        renderItem={renderWord}
        keyExtractor={(item) => item.id!.toString()}
        ItemSeparatorComponent={renderSeparator}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={SharedStyles.container}>
      {/* Header */}
      <ScreenHeader
        title="Add Words to Set"
        subtitle={`${selectedWords.size} words selected`}
        showBackButton={true}
        onBackPress={handleBackPress}
        rightText={selectedWords.size > 0 ? "Add" : undefined}
        onRightPress={
          selectedWords.size > 0 ? handleAddSelectedWords : undefined
        }
        rightDisabled={isAdding}
      />

      {/* Search */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search words..."
        containerStyle={styles.searchContainer}
      />

      {/* Content */}
      {renderContent()}

      {/* Add Button */}
      {selectedWords.size > 0 && (
        <View style={styles.addButtonContainer}>
          <TouchableOpacity
            style={[styles.addButton, isAdding && styles.addButtonDisabled]}
            onPress={handleAddSelectedWords}
            disabled={isAdding}
          >
            <Icon
              name="plus"
              size={20}
              color={isAdding ? Colors.onSurfaceVariant : Colors.onPrimary}
            />
            <Text
              style={[
                styles.addButtonText,
                isAdding && styles.addButtonTextDisabled,
              ]}
            >
              {isAdding ? "Adding..." : `Add ${selectedWords.size} Words`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surfaceContainer,
    marginBottom: Spacing.md,
  },
  selectAllButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primaryContainer,
  },
  selectAllText: {
    ...Typography.labelMedium,
    color: Colors.primary,
    fontWeight: "600",
  },
  selectionCount: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  listContainer: {
    paddingBottom: 120, // Space for add button
  },
  wordContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: Spacing.md,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.md,
  },
  selectedWordContainer: {
    backgroundColor: Colors.primaryContainer,
  },
  wordContent: {
    flex: 1,
  },
  selectionIndicator: {
    padding: Spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.outline,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  checkedCheckbox: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  addButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.outline,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  addButtonDisabled: {
    backgroundColor: Colors.outline,
  },
  addButtonText: {
    ...Typography.labelLarge,
    color: Colors.onPrimary,
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
  addButtonTextDisabled: {
    color: Colors.onSurfaceVariant,
  },
});
