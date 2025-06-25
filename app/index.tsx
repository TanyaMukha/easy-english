import React from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { router } from "expo-router";

import DailyWordsSection from "../components/DailyWordsSection";
import ErrorState from "../components/ErrorState";
import HomeHeader from "../components/HomeHeader";
import LearningGoals from "../components/LearningGoals";
import LoadingState from "../components/LoadingState";
import MotivationalQuote from "../components/MotivationalQuote";
import ProgressChart from "../components/ProgressChart";
import QuickShortcutsSection from "../components/QuickShortcutsSection";
import QuickStatsCard from "../components/QuickStatsCard";
import WordCollectionsSection from "../components/WordCollectionsSection";
import { WordWithExamples } from "../data/DataModels";
import { useHomeData } from "../hooks/useHomeData";
import { useWords } from "../hooks/useWords";
import { Colors, GlobalStyles, Spacing } from "../styles/GlobalStyles";

export default function HomeScreen() {
  const {
    loading,
    refreshing,
    error,
    dailyWords,
    userStats,
    todayProgress,
    quoteOfDay,
    onRefresh,
    loadData,
  } = useHomeData();

  const { getRandomWords, getWordsForReview } = useWords();

  // Navigation handlers
  const handleWordPress = (word: WordWithExamples) => {
    router.push(`/words/${word.id}`);
  };

  const handleProfilePress = () => {
    // TODO: Create profile screen
    console.log("Navigate to profile");
  };

  const handleSeeAllWords = () => {
    router.push("/words");
  };

  const handleFlashcardsPress = async () => {
    const wordsForReview = await getWordsForReview(10);
    if (wordsForReview.length > 0) {
      // TODO: Create practice screen and pass words
      console.log("Navigate to practice with words:", wordsForReview.length);
    } else {
      console.log("No words for review, navigate to general practice");
    }
  };

  const handleTestsPress = async () => {
    const testWords = await getRandomWords(20);
    if (testWords.length > 0) {
      // TODO: Create test screen and pass words
      console.log("Navigate to test with words:", testWords.length);
    } else {
      console.log("No words available for testing");
    }
  };

  const handleGrammarPress = () => {
    // TODO: Create grammar screen
    console.log("Navigate to grammar");
  };

  const handleDictionariesPress = () => {
    router.push("/dictionaries");
  };

  const handleSetsPress = () => {
    // TODO: Create sets screen
    console.log("Navigate to sets");
  };

  const handleUnitsPress = () => {
    // TODO: Create units screen
    console.log("Navigate to units");
  };

  const handleCreateWordPress = () => {
    router.push("/words/create");
  };

  // Collections data with real navigation
  const collections = [
    {
      id: "dict-1",
      title: "Oxford Dictionary",
      subtitle: "Dictionary",
      icon: "book",
      color: Colors.primary,
      count: 150,
      onPress: () => router.push("/dictionaries/1"),
    },
    {
      id: "dict-2",
      title: "Cambridge Dictionary",
      subtitle: "Dictionary",
      icon: "book",
      color: Colors.primary,
      count: 89,
      onPress: () => router.push("/dictionaries/2"),
    },
    {
      id: "set-1",
      title: "Basic Vocabulary",
      subtitle: "25 words",
      icon: "list",
      color: Colors.success,
      count: 25,
      onPress: () => console.log("Navigate to set 1"), // TODO: Create sets
    },
  ];

  const navigateToAllCollections = () => {
    router.push("/dictionaries"); // For now, redirect to dictionaries
  };

  // Shortcuts with real navigation
  const shortcuts = [
    {
      title: "Add New Word",
      subtitle: "Expand your vocabulary",
      icon: "add-circle",
      color: Colors.success,
      onPress: handleCreateWordPress,
    },
    {
      title: "Practice Flashcards",
      subtitle: "Review your vocabulary",
      icon: "layers",
      color: Colors.primary,
      onPress: handleFlashcardsPress,
    },
    {
      title: "Take a Test",
      subtitle: "Check your progress",
      icon: "checkmark-circle",
      color: Colors.accent,
      onPress: handleTestsPress,
    },
    {
      title: "Browse All Words",
      subtitle: "Manage your vocabulary",
      icon: "library",
      color: Colors.info,
      onPress: handleSeeAllWords,
    },
    {
      title: "Browse Dictionaries",
      subtitle: "Explore word collections",
      icon: "book",
      color: Colors.secondary,
      onPress: handleDictionariesPress,
    },
    {
      title: "Word Sets",
      subtitle: "Organized vocabulary lists",
      icon: "list",
      color: Colors.warning,
      onPress: handleSetsPress,
    },
    {
      title: "Learning Units",
      subtitle: "Structured lessons",
      icon: "school",
      color: Colors.accent,
      onPress: handleUnitsPress,
    },
    {
      title: "Grammar Lessons",
      subtitle: "Learn grammar rules",
      icon: "library",
      color: Colors.info,
      onPress: handleGrammarPress,
    },
  ];

  return (
    <View style={GlobalStyles.container}>
      {loading && <LoadingState message="Loading your learning data..." />}

      {!loading && (error || !userStats) && (
        <ErrorState
          title="Failed to load data"
          message={error ?? ""}
          onRetry={loadData}
        />
      )}

      {!loading && !error && userStats && (
        <ScrollView
          style={GlobalStyles.flex1}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
        >
          <HomeHeader onProfilePress={handleProfilePress} />

          <View style={[GlobalStyles.paddingHorizontalLg, styles.statsSection]}>
            <View style={GlobalStyles.flexRow}>
              <QuickStatsCard
                title="Words learned"
                value={userStats.wordsLearned}
                icon="book"
                color={Colors.success}
              />
              <View style={{ width: Spacing.md }} />
              <QuickStatsCard
                title="Current streak"
                value={`${userStats.currentStreak}d`}
                icon="flame"
                color={Colors.warning}
              />
            </View>
          </View>

          <View style={GlobalStyles.paddingHorizontalLg}>
            <LearningGoals
              currentStreak={userStats.currentStreak}
              dailyGoal={20}
              todayProgress={todayProgress}
            />
          </View>

          <DailyWordsSection
            words={dailyWords}
            onWordPress={handleWordPress}
            onSeeAllPress={handleSeeAllWords}
          />

          <WordCollectionsSection
            collections={collections}
            onSeeAllPress={navigateToAllCollections}
          />

          <View style={GlobalStyles.paddingHorizontalLg}>
            <MotivationalQuote quote={quoteOfDay} />
          </View>

          <View style={GlobalStyles.paddingHorizontalLg}>
            <ProgressChart dailyProgress={userStats.dailyProgress} />
          </View>

          <QuickShortcutsSection shortcuts={shortcuts} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = {
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  statsSection: {
    marginBottom: Spacing.lg,
  },
};
