import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { DictionaryService } from "../../services/DictionaryService";
import { Dictionary } from "../../data/DataModels";
import { Utils } from "../../data/DataUtils";
import {
  Colors,
  DeviceUtils,
  SharedStyles,
  Spacing,
} from "../../styles/SharedStyles";

interface DictionaryCardProps {
  dictionary: Dictionary;
  onPress: (dictionary: Dictionary) => void;
  showMenu?: boolean;
  onMenuPress?: (dictionary: Dictionary) => void;
}

/**
 * Single Responsibility: Display dictionary information in card format
 * Open/Closed: Can be extended with additional dictionary display options
 * Interface Segregation: Only requires dictionary data and handlers
 */
const DictionaryCard: React.FC<DictionaryCardProps> = ({
  dictionary,
  onPress,
  showMenu = true,
  onMenuPress,
}) => {
  const handlePress = () => {
    onPress(dictionary);
  };

  const handleMenuPress = () => {
    onMenuPress?.(dictionary);
  };

  // Get word count from service (safe for empty dictionaries)
  const wordCount = DictionaryService.getWordCount(dictionary.id);
  const lastStudied = dictionary.updatedAt
    ? Utils.DateUtils.formatDate(dictionary.updatedAt)
    : "Never";

  const isRecentlyUpdated =
    dictionary.updatedAt && Utils.DateUtils.daysAgo(dictionary.updatedAt) <= 7;

  const isNewDictionary = wordCount === 0;

  return (
    <TouchableOpacity
      style={[SharedStyles.card, styles.container]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="book" size={24} color={Colors.primary} />
        </View>

        <View style={styles.headerContent}>
          <Text
            style={[SharedStyles.h4, SharedStyles.textPrimary]}
            numberOfLines={2}
          >
            {dictionary.title}
          </Text>
          <Text style={[SharedStyles.bodySmall, SharedStyles.textTertiary]}>
            Created{" "}
            {Utils.DateUtils.formatDate(
              dictionary.createdAt || new Date().toISOString(),
            )}
          </Text>
        </View>

        {showMenu && (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleMenuPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={20}
              color={Colors.textTertiary}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[SharedStyles.h5, SharedStyles.textPrimary]}>
              {wordCount}
            </Text>
            <Text style={[SharedStyles.caption, SharedStyles.textSecondary]}>
              words
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={[SharedStyles.bodySmall, SharedStyles.textSecondary]}>
              Last studied
            </Text>
            <Text style={[SharedStyles.bodySmall, SharedStyles.textPrimary]}>
              {lastStudied}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        {isRecentlyUpdated && (
          <View style={styles.badge}>
            <Text style={[SharedStyles.caption, styles.badgeText]}>
              Recently updated
            </Text>
          </View>
        )}

        <Ionicons
          name="chevron-forward"
          size={20}
          color={Colors.textTertiary}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = {
  container: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: DeviceUtils.getValue(40, 48),
    height: DeviceUtils.getValue(40, 48),
    backgroundColor: Colors.primary + "20",
    borderRadius: DeviceUtils.getValue(20, 24),
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: Spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  menuButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  content: {
    marginBottom: Spacing.md,
  },
  statsContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  statItem: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  footer: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  badge: {
    backgroundColor: Colors.success + "20",
    borderRadius: 12,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  badgeText: {
    color: Colors.success,
    fontWeight: "600" as const,
  },
};

export default DictionaryCard;
