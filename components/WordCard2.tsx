import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Text, TouchableOpacity, View } from "react-native";

import {
  Colors,
  getCardColor,
  SharedStyles,
  Spacing,
} from "../styles/SharedStyles";
import { Card, PartOfSpeech } from "../types";

interface WordCardProps {
  card: Card;
  showTranslation?: boolean;
  isFlipped?: boolean;
  onFlip?: () => void;
  onAction?: (action: "easy" | "good" | "again") => void;
  showActions?: boolean;
  style?: any;
}

/**
 * Word card component for displaying vocabulary cards
 * Supports flipping animation and learning actions
 */
export const WordCard: React.FC<WordCardProps> = ({
  card,
  showTranslation = false,
  isFlipped = false,
  onFlip,
  onAction,
  showActions = false,
  style,
}) => {
  const { t } = useTranslation();
  const [flipAnimation] = useState(new Animated.Value(0));

  const cardColor = getCardColor(card.partOfSpeech);
  const partOfSpeechLabel = t(`partOfSpeech.${card.partOfSpeech}`);

  const handleFlip = () => {
    if (!onFlip) return;

    Animated.timing(flipAnimation, {
      toValue: isFlipped ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    onFlip();
  };

  const handleAction = (action: "easy" | "good" | "again") => {
    onAction?.(action);
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  return (
    <View style={[styles.container, style]}>
      {/* Main Card */}
      <TouchableOpacity
        style={[styles.card, { borderLeftColor: cardColor }]}
        onPress={handleFlip}
        activeOpacity={0.9}
        disabled={!onFlip}
      >
        {/* Front Side */}
        {!isFlipped && (
          <Animated.View
            style={[
              styles.cardSide,
              { transform: [{ rotateY: frontInterpolate }] },
            ]}
          >
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.partOfSpeechBadge,
                  { backgroundColor: cardColor },
                ]}
              >
                <Text style={styles.partOfSpeechText}>{partOfSpeechLabel}</Text>
              </View>

              {card.isFavorite && <Text style={styles.favoriteIcon}>⭐</Text>}
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.mainWord}>{card.englishWord}</Text>

              {card.pronunciation && (
                <Text style={styles.pronunciation}>[{card.pronunciation}]</Text>
              )}

              {showTranslation && (
                <Text style={styles.translation}>
                  {card.ukrainianTranslation}
                </Text>
              )}
            </View>

            {onFlip && (
              <Text style={styles.flipHint}>Торкніться, щоб перевернути</Text>
            )}
          </Animated.View>
        )}

        {/* Back Side */}
        {isFlipped && (
          <Animated.View
            style={[
              styles.cardSide,
              { transform: [{ rotateY: backInterpolate }] },
            ]}
          >
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.partOfSpeechBadge,
                  { backgroundColor: cardColor },
                ]}
              >
                <Text style={styles.partOfSpeechText}>{partOfSpeechLabel}</Text>
              </View>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.translation}>
                {card.ukrainianTranslation}
              </Text>
              <Text style={styles.originalWord}>{card.englishWord}</Text>

              {card.example && (
                <View style={styles.exampleSection as any}>
                  <Text style={styles.exampleLabel}>Приклад:</Text>
                  <Text style={styles.exampleText}>{card.example}</Text>
                  {card.exampleTranslation && (
                    <Text style={styles.exampleTranslation}>
                      {card.exampleTranslation}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </Animated.View>
        )}
      </TouchableOpacity>

      {/* Action Buttons */}
      {showActions && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.againButton]}
            onPress={() => handleAction("again")}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>Знову</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.goodButton]}
            onPress={() => handleAction("good")}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>Добре</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.easyButton]}
            onPress={() => handleAction("easy")}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>Легко</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Progress Indicator */}
      {card.reviewCount > 0 && (
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill as any,
                {
                  width: `${Math.min((card.correctCount / card.reviewCount) * 100, 100)}%`,
                  backgroundColor: cardColor,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {card.correctCount}/{card.reviewCount} правильно
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = {
  container: {
    marginVertical: Spacing.sm,
  },

  card: {
    ...SharedStyles.card,
    borderLeftWidth: 4,
    minHeight: 200,
    position: "relative" as const,
  },

  cardSide: {
    flex: 1,
    backfaceVisibility: "hidden" as const,
  },

  cardHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: Spacing.md,
  },

  partOfSpeechBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },

  partOfSpeechText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.text,
  },

  favoriteIcon: {
    fontSize: 20,
  },

  cardContent: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },

  mainWord: {
    ...SharedStyles.title,
    textAlign: "center" as const,
    marginBottom: Spacing.sm,
  },

  pronunciation: {
    ...SharedStyles.caption,
    fontStyle: "italic" as const,
    marginBottom: Spacing.sm,
  },

  translation: {
    ...SharedStyles.subtitle,
    textAlign: "center" as const,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },

  originalWord: {
    ...SharedStyles.body,
    textAlign: "center" as const,
    color: Colors.textTertiary,
    marginBottom: Spacing.md,
  },

  exampleSection: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 8,
    width: "100%",
  },

  exampleLabel: {
    ...SharedStyles.caption,
    fontWeight: "600" as const,
    marginBottom: 4,
  },

  exampleText: {
    ...SharedStyles.body,
    fontStyle: "italic" as const,
    marginBottom: 4,
  },

  exampleTranslation: {
    ...SharedStyles.caption,
    color: Colors.textSecondary,
  },

  flipHint: {
    ...SharedStyles.caption,
    textAlign: "center" as const,
    position: "absolute" as const,
    bottom: Spacing.sm,
    left: 0,
    right: 0,
  },

  actionsContainer: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },

  actionButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    alignItems: "center" as const,
  },

  againButton: {
    backgroundColor: Colors.error,
  },

  goodButton: {
    backgroundColor: Colors.primary,
  },

  easyButton: {
    backgroundColor: Colors.success,
  },

  actionButtonText: {
    ...SharedStyles.buttonText,
    fontSize: 14,
  },

  progressSection: {
    marginTop: Spacing.sm,
  },

  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: "hidden" as const,
  },

  progressFill: {
    height: "100%",
    borderRadius: 2,
  },

  progressText: {
    ...SharedStyles.caption,
    textAlign: "center" as const,
    marginTop: 4,
  },
};
