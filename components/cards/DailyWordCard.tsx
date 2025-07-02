import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { WordWithExamples } from "../../data/DataModels";
import { Utils } from "../../data/DataUtils";
import {
  Colors,
  DeviceUtils,
  Spacing,
  SharedStyles,
  getLevelColor,
} from "../../services/database/styles/SharedStyles";

interface DailyWordCardProps {
  word: WordWithExamples;
  onPress: (word: WordWithExamples) => void;
}

/**
 * Single Responsibility: Display a word card with essential information
 * Open/Closed: Can be extended with additional word display options
 * Dependency Inversion: Depends on abstractions (WordWithExamples interface)
 */
const DailyWordCard: React.FC<DailyWordCardProps> = ({ word, onPress }) => {
  const handlePress = () => {
    onPress(word);
  };

  const firstExample = word.examples?.length > 0 ? word.examples[0] : null;

  return (
    <TouchableOpacity
      style={[SharedStyles.card, styles.container]}
      onPress={handlePress}
    >
      <View style={styles.header}>
        <View style={styles.wordInfo}>
          <Text style={[SharedStyles.h4, SharedStyles.textPrimary]}>
            {word.word}
          </Text>
          {word.transcription && (
            <Text
              style={[
                SharedStyles.bodySmall,
                SharedStyles.textTertiary,
                styles.transcription,
              ]}
            >
              [{word.transcription}]
            </Text>
          )}
          <Text
            style={[
              SharedStyles.bodyMedium,
              SharedStyles.textSecondary,
              styles.translation,
            ]}
          >
            {word.translation}
          </Text>
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

      {firstExample && (
        <View style={styles.exampleContainer}>
          <Text style={[SharedStyles.bodySmall, styles.exampleText]}>
            {Utils.TextProcessor.stripMarkdown(firstExample.sentence)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = {
  container: {
    width: DeviceUtils.getValue(280, 320),
    minHeight: DeviceUtils.getValue(140, 160),
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
  },
  wordInfo: {
    flex: 1,
  },
  transcription: {
    marginTop: 2,
  },
  translation: {
    marginTop: Spacing.xs,
  },
  levelBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
    minWidth: 36,
    alignItems: "center" as const,
  },
  levelText: {
    color: Colors.textPrimary,
    fontWeight: "600" as const,
  },
  exampleContainer: {
    marginTop: Spacing.md,
  },
  exampleText: {
    fontStyle: "italic" as const,
    color: Colors.textTertiary,
  },
};

export default DailyWordCard;
