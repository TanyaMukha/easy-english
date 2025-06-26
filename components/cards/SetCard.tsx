// components/SetCard.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

import { Set } from "../../data/DataModels";
import { SetService } from "../../services/SetService";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
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
  const wordCount = SetService.getWordCount(set.id);

  const handlePress = () => {
    onPress?.(set);
  };

  const handleMenuPress = () => {
    onMenuPress?.(set);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never studied";

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 4) return Colors.success;
    if (rate >= 3) return Colors.warning;
    if (rate >= 2) return Colors.accent;
    return Colors.error;
  };

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
            <Icon name="list" size={24} color={Colors.success} />
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {set.title}
            </Text>
            <Text style={styles.wordCount}>
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </Text>
          </View>

          {showMenu && (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={handleMenuPress}
              activeOpacity={0.7}
              accessible={true}
              accessibilityLabel="Set options"
              accessibilityHint="Tap to show set menu"
            >
              <Icon
                name="ellipsis-vertical"
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Description */}
        {set.description && (
          <Text style={styles.description} numberOfLines={2}>
            {set.description}
          </Text>
        )}

        {/* Progress and Stats */}
        {showProgress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressRow}>
              <View style={styles.statItem}>
                <Icon name="calendar" size={16} color={Colors.textSecondary} />
                <Text style={styles.statText}>
                  {formatDate(set.lastReviewDate)}
                </Text>
              </View>

              <View style={styles.statItem}>
                <Icon name="repeat" size={16} color={Colors.textSecondary} />
                <Text style={styles.statText}>{set.reviewCount} reviews</Text>
              </View>
            </View>

            {/* Progress bar */}
            {set.rate > 0 && (
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${(set.rate / 5) * 100}%`,
                        backgroundColor: getProgressColor(set.rate),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.rateText}>{set.rate.toFixed(1)}/5</Text>
              </View>
            )}
          </View>
        )}

        {/* Creation date */}
        <Text style={styles.createdDate}>
          Created {new Date(set.createdAt || "").toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.successContainer,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...Typography.headlineSmall,
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  wordCount: {
    ...Typography.bodyMedium,
    color: Colors.success,
    fontWeight: "600",
  },
  menuButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  description: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
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
    ...Typography.bodySmall,
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
    backgroundColor: Colors.outline,
    borderRadius: 2,
    marginRight: Spacing.sm,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  rateText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: "600",
    minWidth: 32,
    textAlign: "right",
  },
  createdDate: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: "right",
  },
});

export default SetCard;
