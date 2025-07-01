// components/cards/SetCard.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { Set } from "../../data/DataModels";
import { setService } from "../../services/database";
import {
  Colors,
  SharedStyles,
  Spacing,
  Typography,
  BorderRadius,
  Shadows,
} from "../../styles/SharedStyles";

interface SetCardProps {
  set: Set;
  showProgress?: boolean;
  showMenu?: boolean;
  onPress?: (set: Set) => void;
  onMenuPress?: (set: Set) => void;
}

/**
 * Reusable set card component
 * Single Responsibility: Display set information in card format
 * Open/Closed: Can be extended with additional display options
 */
const SetCard: React.FC<SetCardProps> = ({
  set,
  showProgress = false,
  showMenu = false,
  onPress,
  onMenuPress,
}) => {
  const { t } = useTranslation();
  const wordCount = 10 //setService.getWordCount(set.id);

  const handlePress = () => {
    onPress?.(set);
  };

  const handleMenuPress = () => {
    onMenuPress?.(set);
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return t("vocabulary.neverStudied", "Never studied");

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return t("common.yesterday", "Yesterday");
    if (diffDays < 7) return t("common.daysAgo", `${diffDays} days ago`);
    if (diffDays < 30) return t("common.weeksAgo", `${Math.ceil(diffDays / 7)} weeks ago`);
    return date.toLocaleDateString();
  };

  const getProgressColor = (rate: number): string => {
    if (rate >= 4) return Colors.success;
    if (rate >= 3) return Colors.warning;
    if (rate >= 2) return Colors.accent;
    return Colors.error;
  };

  const averageRate = set.rate || 0;
  const progressPercentage = Math.min((averageRate / 5) * 100, 100);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={`Set: ${set.title}`}
      accessibilityHint="Tap to view set details"
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="list" size={24} color={Colors.success} />
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {set.title}
            </Text>
            <Text style={styles.wordCount}>
              {wordCount} {/* wordCount === 1 */ false ? t("vocabulary.word", "word") : t("vocabulary.words", "words")}
            </Text>
          </View>

          {showMenu && (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={handleMenuPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="ellipsis-vertical" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Description */}
        {set.description && (
          <Text style={styles.description} numberOfLines={2}>
            {set.description}
          </Text>
        )}

        {/* Progress Section */}
        {showProgress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressRow}>
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.statText}>
                  {set.reviewCount || 0} {t("vocabulary.reviews", "reviews")}
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Ionicons name="time" size={16} color={Colors.textSecondary} />
                <Text style={styles.statText}>
                  {formatDate(set.updatedAt)}
                </Text>
              </View>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${progressPercentage}%`,
                      backgroundColor: getProgressColor(averageRate),
                    },
                  ]}
                />
              </View>
              <Text style={styles.rateText}>
                {averageRate.toFixed(1)}/5
              </Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.createdDate}>
            {t("vocabulary.created", "Created")}: {formatDate(set.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    ...SharedStyles.card,
    marginBottom: Spacing.md,
  },
  
  content: {
    flex: 1,
  },
  
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  
  titleContainer: {
    flex: 1,
  },
  
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  
  wordCount: {
    fontSize: Typography.fontSize.sm,
    color: Colors.success,
    fontWeight: Typography.fontWeight.semibold,
  },
  
  menuButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  
  description: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
  },
  
  progressContainer: {
    marginBottom: Spacing.md,
  },
  
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  
  statText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  
  progressBarBackground: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
    overflow: "hidden",
  },
  
  progressBarFill: {
    height: "100%",
    borderRadius: BorderRadius.sm,
  },
  
  rateText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.semibold,
    minWidth: 32,
    textAlign: "right",
  },
  
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  
  createdDate: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
    textAlign: "right",
  },
});

export default SetCard;