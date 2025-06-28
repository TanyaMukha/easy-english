// app/words/[wordId].tsx
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { ErrorState, LoadingState, ScreenHeader } from "../../components/ui";
import { WordWithExamples } from "../../data/DataModels";
import { WordService } from "../../services/words";
import {
  Colors,
  getLevelColor,
  SharedStyles,
  Spacing,
} from "../../styles/SharedStyles";

/**
 * Word Details Screen
 * Single Responsibility: Display detailed word information
 */
export default function WordDetailsScreen() {
  const { wordId } = useLocalSearchParams<{ wordId: string }>();
  const wordIdNumber = parseInt(wordId || "0", 10);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [word, setWord] = useState<WordWithExamples | null>(null);

  const loadWordData = async () => {
    try {
      setError(null);
      const response = await WordService.getById(wordIdNumber);

      if (response.success && response.data) {
        setWord(response.data);
      } else {
        setError(response.error || "Word not found");
      }
    } catch (err) {
      setError("Failed to load word details. Please try again.");
      console.error("Error loading word:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/words/edit/${wordId}`);
  };

  const handleDelete = () => {
    if (!word) return;

    Alert.alert(
      "Delete Word",
      `Are you sure you want to delete "${word.word}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: confirmDelete,
        },
      ],
    );
  };

  const confirmDelete = async () => {
    if (!word) return;

    try {
      const response = await WordService.delete(word.id!);

      if (response.success) {
        Alert.alert("Success", "Word deleted successfully!", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert("Error", response.error || "Failed to delete word");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to delete word. Please try again.");
    }
  };

  const handlePractice = () => {
    // TODO: Navigate to practice screen with this word
    console.log("Practice word:", word?.id);
    Alert.alert(
      "Practice Word",
      "Practice functionality will be implemented soon.",
      [{ text: "OK" }],
    );
  };

  const getPartOfSpeechColor = (partOfSpeech: string) => {
    const colors: Record<string, string> = {
      noun: Colors.primary,
      verb: Colors.success,
      adjective: Colors.warning,
      adverb: Colors.secondary,
      preposition: Colors.accent,
      phrase: Colors.info,
      phrasal_verb: Colors.info,
      idiom: Colors.secondary,
      pronoun: Colors.accent,
      conjunction: Colors.warning,
      interjection: Colors.error,
      slang: Colors.secondary,
      abbreviation: Colors.info,
      fixed_expression: Colors.accent,
      irregular: Colors.error,
    };
    return colors[partOfSpeech] || Colors.textTertiary;
  };

  const getProgressColor = (rate: number) => {
    if (rate <= 1) return Colors.error;
    if (rate <= 2) return Colors.warning;
    if (rate <= 3) return Colors.info;
    if (rate <= 4) return Colors.accent;
    return Colors.success;
  };

  useEffect(() => {
    if (wordIdNumber > 0) {
      loadWordData();
    } else {
      setError("Invalid word ID");
      setLoading(false);
    }
  }, [wordIdNumber]);

  return (
    <View style={SharedStyles.container}>
      {/* Header */}
      <ScreenHeader
        title={word?.word || "Word Details"}
        subtitle={word?.translation ?? ""}
        showBackButton={true}
        onBackPress={() => router.back()}
        rightIcon="create"
        onRightPress={handleEdit}
        onRightPressAccessibilityLabel="Edit word"
      />

      {loading ? (
        <LoadingState message="Loading word details..." />
      ) : error || !word ? (
        <ErrorState
          title="Failed to load word"
          message={error || "Word not found"}
          onRetry={loadWordData}
        />
      ) : (
        <ScrollView
          style={SharedStyles.flex1}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Main Info Card */}
          <View style={[SharedStyles.card, styles.mainCard]}>
            <View style={styles.wordHeader}>
              <View style={styles.wordTitleContainer}>
                <Text style={[SharedStyles.h2, SharedStyles.textPrimary]}>
                  {word.word}
                </Text>
                {word.transcription && (
                  <Text
                    style={[
                      SharedStyles.bodyMedium,
                      SharedStyles.textTertiary,
                      styles.transcription,
                    ]}
                  >
                    [{word.transcription}]
                  </Text>
                )}
              </View>
              <View
                style={[
                  styles.levelBadge,
                  { backgroundColor: getLevelColor(word.level) },
                ]}
              >
                <Text style={[SharedStyles.bodySmall, styles.levelText]}>
                  {word.level}
                </Text>
              </View>
            </View>

            <Text
              style={[
                SharedStyles.h4,
                SharedStyles.textSecondary,
                styles.translation,
              ]}
            >
              {word.translation}
            </Text>

            <View style={styles.metaInfo}>
              <View
                style={[
                  styles.partOfSpeechBadge,
                  {
                    backgroundColor:
                      getPartOfSpeechColor(word.partOfSpeech) + "20",
                  },
                ]}
              >
                <Text
                  style={[
                    SharedStyles.bodySmall,
                    { color: getPartOfSpeechColor(word.partOfSpeech) },
                  ]}
                >
                  {word.partOfSpeech.replace("_", " ")}
                </Text>
              </View>

              {word.isIrregular && (
                <View style={styles.irregularBadge}>
                  <Text style={[SharedStyles.bodySmall, styles.irregularText]}>
                    irregular
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Definition Card */}
          {word.definition && (
            <View style={[SharedStyles.card, styles.sectionCard]}>
              <Text
                style={[
                  SharedStyles.h4,
                  SharedStyles.textPrimary,
                  styles.sectionTitle,
                ]}
              >
                Definition
              </Text>
              <Text
                style={[SharedStyles.bodyMedium, SharedStyles.textSecondary]}
              >
                {word.definition}
              </Text>
            </View>
          )}

          {/* Explanation Card */}
          {word.explanation && (
            <View style={[SharedStyles.card, styles.sectionCard]}>
              <Text
                style={[
                  SharedStyles.h4,
                  SharedStyles.textPrimary,
                  styles.sectionTitle,
                ]}
              >
                Explanation
              </Text>
              <Text
                style={[SharedStyles.bodyMedium, SharedStyles.textSecondary]}
              >
                {word.explanation}
              </Text>
            </View>
          )}

          {/* Examples Card */}
          {word.examples.length > 0 && (
            <View style={[SharedStyles.card, styles.sectionCard]}>
              <Text
                style={[
                  SharedStyles.h4,
                  SharedStyles.textPrimary,
                  styles.sectionTitle,
                ]}
              >
                Examples ({word.examples.length})
              </Text>
              {word.examples.map((example, index) => (
                <View key={example.id} style={styles.exampleItem}>
                  <Text
                    style={[
                      SharedStyles.bodyMedium,
                      SharedStyles.textPrimary,
                      styles.exampleSentence,
                    ]}
                  >
                    {example.sentence}
                  </Text>
                  {example.translation && (
                    <Text
                      style={[
                        SharedStyles.bodySmall,
                        SharedStyles.textTertiary,
                        styles.exampleTranslation,
                      ]}
                    >
                      {example.translation}
                    </Text>
                  )}
                  {index < word.examples.length - 1 && (
                    <View style={styles.exampleSeparator} />
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Progress Card */}
          <View style={[SharedStyles.card, styles.sectionCard]}>
            <Text
              style={[
                SharedStyles.h4,
                SharedStyles.textPrimary,
                styles.sectionTitle,
              ]}
            >
              Learning Progress
            </Text>

            <View style={styles.progressContainer}>
              <View style={styles.progressItem}>
                <Text
                  style={[SharedStyles.bodySmall, SharedStyles.textTertiary]}
                >
                  Progress Rating
                </Text>
                <View style={styles.ratingContainer}>
                  <View
                    style={[
                      styles.ratingBadge,
                      {
                        backgroundColor:
                          getProgressColor(word.rate || 0) + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        SharedStyles.h5,
                        { color: getProgressColor(word.rate || 0) },
                      ]}
                    >
                      {word.rate || 0}/5
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.progressItem}>
                <Text
                  style={[SharedStyles.bodySmall, SharedStyles.textTertiary]}
                >
                  Times Reviewed
                </Text>
                <Text style={[SharedStyles.h5, SharedStyles.textPrimary]}>
                  {word.reviewCount || 0}
                </Text>
              </View>

              <View style={styles.progressItem}>
                <Text
                  style={[SharedStyles.bodySmall, SharedStyles.textTertiary]}
                >
                  Last Reviewed
                </Text>
                <Text
                  style={[SharedStyles.bodyMedium, SharedStyles.textSecondary]}
                >
                  {word.lastReviewDate
                    ? new Date(word.lastReviewDate).toLocaleDateString()
                    : "Never"}
                </Text>
              </View>
            </View>
          </View>

          {/* Tags Card */}
          {word.tags.length > 0 && (
            <View style={[SharedStyles.card, styles.sectionCard]}>
              <Text
                style={[
                  SharedStyles.h4,
                  SharedStyles.textPrimary,
                  styles.sectionTitle,
                ]}
              >
                Tags
              </Text>
              <View style={styles.tagsContainer}>
                {word.tags.map((tag) => (
                  <View key={tag.id} style={styles.tag}>
                    <Text style={[SharedStyles.bodySmall, styles.tagText]}>
                      {tag.title}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[
                SharedStyles.button,
                SharedStyles.buttonPrimary,
                styles.actionButton,
              ]}
              onPress={handlePractice}
              activeOpacity={0.8}
            >
              <Ionicons
                name="school"
                size={20}
                color={Colors.textPrimary}
                style={styles.buttonIcon}
              />
              <Text style={SharedStyles.buttonText}>Practice</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                SharedStyles.button,
                SharedStyles.buttonOutline,
                styles.actionButton,
              ]}
              onPress={handleEdit}
              activeOpacity={0.7}
            >
              <Ionicons
                name="create"
                size={20}
                color={Colors.primary}
                style={styles.buttonIcon}
              />
              <Text
                style={[SharedStyles.buttonText, { color: Colors.primary }]}
              >
                Edit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                SharedStyles.button,
                styles.deleteButton,
                styles.actionButton,
              ]}
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Ionicons
                name="trash"
                size={20}
                color={Colors.error}
                style={styles.buttonIcon}
              />
              <Text style={[SharedStyles.buttonText, { color: Colors.error }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = {
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  mainCard: {
    marginBottom: Spacing.lg,
  },
  wordHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    marginBottom: Spacing.md,
  },
  wordTitleContainer: {
    flex: 1,
  },
  transcription: {
    marginTop: Spacing.xs,
  },
  levelBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    minWidth: 40,
    alignItems: "center" as const,
  },
  levelText: {
    color: Colors.textPrimary,
    fontWeight: "600" as const,
  },
  translation: {
    marginBottom: Spacing.lg,
  },
  metaInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: Spacing.md,
  },
  partOfSpeechBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  irregularBadge: {
    backgroundColor: Colors.warning + "20",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  irregularText: {
    color: Colors.warning,
    fontWeight: "500" as const,
  },
  sectionCard: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  exampleItem: {
    marginBottom: Spacing.md,
  },
  exampleSentence: {
    fontStyle: "italic" as const,
    marginBottom: Spacing.xs,
  },
  exampleTranslation: {
    fontStyle: "italic" as const,
  },
  exampleSeparator: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: Spacing.md,
  },
  progressContainer: {
    gap: Spacing.lg,
  },
  progressItem: {
    gap: Spacing.xs,
  },
  ratingContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  ratingBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center" as const,
  },
  tagsContainer: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: Spacing.sm,
  },
  tag: {
    backgroundColor: Colors.backgroundTertiary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  tagText: {
    color: Colors.textSecondary,
  },
  actionsContainer: {
    flexDirection: "row" as const,
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  buttonIcon: {
    marginRight: Spacing.sm,
  },
  deleteButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.error,
  },
};
