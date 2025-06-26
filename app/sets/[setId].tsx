// app/sets/[setId].tsx
import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { WordCard } from "../../components/cards";
import Icon from "react-native-vector-icons/Ionicons";
import { EditSetModal, SetActionsModal } from "../../components/modals";
import {
  EmptyState,
  ErrorState,
  FloatingActionButton,
  LoadingState,
  ScreenHeader,
  SearchBar,
} from "../../components/ui";
import { Set, WordWithExamples } from "../../data/DataModels";
import { MockDataService } from "../../data/MockData";
import { SetService } from "../../services/SetService";
import {
  Colors,
  GlobalStyles,
  Spacing,
  Typography,
} from "../../styles/GlobalStyles";

/**
 * Set Details Screen - shows words in a specific set
 * Single Responsibility: Display and manage words within a set
 * Open/Closed: Can be extended with additional word management features
 */
export default function SetDetailsScreen() {
  const { setId } = useLocalSearchParams<{ setId: string }>();
  const setIdNumber = parseInt(setId || "1", 10);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [set, setSet] = useState<Set | null>(null);
  const [words, setWords] = useState<WordWithExamples[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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

      // Load set details
      const setResponse = await SetService.getById(setIdNumber);
      if (!setResponse.success || !setResponse.data) {
        setError(setResponse.error || "Set not found");
        return;
      }

      setSet(setResponse.data);

      // Load words for this set - using mock data for now
      // In real implementation, this would fetch words associated with the set
      const wordsData = await MockDataService.getWords({ limit: 100 });
      setWords(wordsData.words.slice(0, 15)); // Mock: take first 15 words
    } catch (err) {
      setError("Failed to load set. Please try again.");
      console.error("Error loading set:", err);
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
    console.log("Navigate to word details:", word.id);
    router.push(`/words/${word.id}`);
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleMenuPress = () => {
    setShowActionsModal(true);
  };

  const handleAddWordsPress = () => {
    console.log("Navigate to add words to set:", setIdNumber);
    // TODO: Implement add words screen
    router.push(`/sets/add-word`, { setIdNumber: setIdNumber });
  };

  const handlePracticePress = () => {
    console.log("Start practice with set:", setIdNumber);
    // TODO: Navigate to practice screen with set words
  };

  const handleTestPress = () => {
    console.log("Start test with set:", setIdNumber);
    // TODO: Navigate to test screen with set words
  };

  const handleEditSet = () => {
    setShowEditModal(true);
    setShowActionsModal(false);
  };

  const handleDeleteSet = async () => {
    if (!set) return;

    const response = await SetService.delete(set.id);
    if (response.success) {
      router.back();
    } else {
      setError(response.error || "Failed to delete set");
    }
    setShowActionsModal(false);
  };

  const handleViewStats = () => {
    console.log("View stats for set:", setIdNumber);
    // TODO: Navigate to set statistics screen
    setShowActionsModal(false);
  };

  const handleManageWords = () => {
    console.log("Manage words for set:", setIdNumber);
    // TODO: Navigate to manage words screen
    setShowActionsModal(false);
  };

  const handleEditSave = async (updatedSet: Set) => {
    const response = await SetService.update(updatedSet.id, {
      title: updatedSet.title,
      description: updatedSet.description,
    });

    if (response.success) {
      setSet(response.data!);
      setShowEditModal(false);
      return true;
    } else {
      setError(response.error || "Failed to update set");
      return false;
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [setIdNumber]);

  const renderWord = ({ item }: { item: WordWithExamples }) => (
    <WordCard
      word={item}
      onPress={handleWordPress}
      showProgress={true}
      showExamples={true}
      showMenu={false}
    />
  );

  const renderSeparator = () => <View style={{ height: Spacing.md }} />;

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <TouchableOpacity
        style={[
          styles.quickActionButton,
          { backgroundColor: Colors.primaryContainer },
        ]}
        onPress={handlePracticePress}
        accessible={true}
        accessibilityLabel="Practice words"
      >
        <Icon name="play" size={20} color={Colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.quickActionButton,
          { backgroundColor: Colors.successContainer },
        ]}
        onPress={handleTestPress}
        accessible={true}
        accessibilityLabel="Test words"
      >
        <Icon name="check-circle" size={20} color={Colors.success} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.quickActionButton,
          { backgroundColor: Colors.warningContainer },
        ]}
        onPress={handleAddWordsPress}
        accessible={true}
        accessibilityLabel="Add words"
      >
        <Icon name="plus" size={20} color={Colors.warning} />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <EmptyState
      icon="list"
      title="No Words in Set"
      description="Add words to this set to start learning"
      actionText="Add Words"
      onActionPress={handleAddWordsPress}
    />
  );

  const renderContent = () => {
    if (loading && !refreshing) {
      return <LoadingState message="Loading set..." />;
    }

    if (error) {
      return (
        <ErrorState
          title="Failed to Load Set"
          description={error}
          actionText="Try Again"
          onActionPress={onRefresh}
        />
      );
    }

    if (filteredWords.length === 0 && !searchQuery.trim()) {
      return renderEmptyState();
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
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={GlobalStyles.container}>
      {/* Header */}
      <ScreenHeader
        title={set?.title || "Set"}
        subtitle={`${filteredWords.length} words`}
        showBackButton={true}
        onBackPress={handleBackPress}
        rightIcon="ellipsis-horizontal"
        onRightPress={handleMenuPress}
      />

      {/* Quick Actions */}
      {!loading && filteredWords.length > 0 && renderQuickActions()}

      {/* Search */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search words..."
        containerStyle={styles.searchContainer}
      />

      {/* Content */}
      {renderContent()}

      {/* Floating Action Button */}
      {!loading && (
        <FloatingActionButton
          icon="plus"
          onPress={handleAddWordsPress}
          accessibilityLabel="Add words to set"
        />
      )}

      {/* Set Actions Modal */}
      <SetActionsModal
        visible={showActionsModal}
        set={set}
        onClose={() => setShowActionsModal(false)}
        onEdit={handleEditSet}
        onDelete={handleDeleteSet}
        onViewStats={handleViewStats}
        onManageWords={handleManageWords}
      />

      {/* Edit Set Modal */}
      <EditSetModal
        visible={showEditModal}
        set={set}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditSave}
        mode="edit"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  quickActionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchContainer: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  listContainer: {
    paddingBottom: 100, // Space for FAB
  },
});
