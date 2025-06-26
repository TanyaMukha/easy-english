import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SharedStyles, Colors, Spacing, DeviceUtils, getLevelColor } from '../../styles/SharedStyles';
import { WordWithExamples } from '../../data/DataModels';
import { Utils } from '../../data/DataUtils';

interface WordCardProps {
  word: WordWithExamples;
  onPress: (word: WordWithExamples) => void;
  showProgress?: boolean;
  showExamples?: boolean;
  showMenu?: boolean;
  onMenuPress?: (word: WordWithExamples) => void;
}

/**
 * Single Responsibility: Display word information in card format
 * Open/Closed: Can be extended with additional word display options
 * Interface Segregation: Only requires word data and handlers
 */
const WordCard: React.FC<WordCardProps> = ({
  word,
  onPress,
  showProgress = false,
  showExamples = true,
  showMenu = true,
  onMenuPress,
}) => {
  const handlePress = () => {
    onPress(word);
  };

  const handleMenuPress = () => {
    onMenuPress?.(word);
  };

  const progressPercentage = showProgress && word.reviewCount > 0 
    ? Math.min((word.rate / 5) * 100, 100) 
    : 0;

  const firstExample = word.examples.length > 0 ? word.examples[0] : null;

  const getPartOfSpeechColor = (partOfSpeech: string) => {
    const colors: Record<string, string> = {
      noun: Colors.primary,
      verb: Colors.success,
      adjective: Colors.warning,
      adverb: Colors.secondary,
      preposition: Colors.accent,
      phrase: Colors.info,
    };
    return colors[partOfSpeech] || Colors.textTertiary;
  };

  return (
    <TouchableOpacity
      style={[SharedStyles.card, styles.container]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.wordRow}>
            <Text style={[SharedStyles.h4, SharedStyles.textPrimary]} numberOfLines={1}>
              {word.word}
            </Text>
            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(word.level) }]}>
              <Text style={[SharedStyles.caption, styles.levelText]}>
                {word.level}
              </Text>
            </View>
          </View>

          {word.transcription && (
            <Text style={[SharedStyles.bodySmall, SharedStyles.textTertiary, styles.transcription]}>
              [{word.transcription}]
            </Text>
          )}

          <View style={styles.metaRow}>
            <View style={[styles.partOfSpeechBadge, { backgroundColor: getPartOfSpeechColor(word.partOfSpeech) + '20' }]}>
              <Text style={[SharedStyles.caption, { color: getPartOfSpeechColor(word.partOfSpeech) }]}>
                {word.partOfSpeech}
              </Text>
            </View>
            
            {word.isIrregular && (
              <View style={[styles.irregularBadge]}>
                <Text style={[SharedStyles.caption, styles.irregularText]}>
                  irregular
                </Text>
              </View>
            )}
          </View>
        </View>

        {showMenu && (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleMenuPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="ellipsis-vertical" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Translation */}
      {word.translation && (
        <Text style={[SharedStyles.bodyMedium, SharedStyles.textSecondary, styles.translation]}>
          {word.translation}
        </Text>
      )}

      {/* Example */}
      {showExamples && firstExample && (
        <View style={styles.exampleContainer}>
          <Text style={[SharedStyles.bodySmall, styles.exampleText]} numberOfLines={2}>
            {Utils.TextProcessor.stripMarkdown(firstExample.sentence)}
          </Text>
          {firstExample.translation && (
            <Text style={[SharedStyles.caption, SharedStyles.textTertiary]} numberOfLines={1}>
              {firstExample.translation}
            </Text>
          )}
        </View>
      )}

      {/* Progress Bar */}
      {showProgress && word.reviewCount > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressInfo}>
            <Text style={[SharedStyles.caption, SharedStyles.textTertiary]}>
              Progress • {word.reviewCount} reviews
            </Text>
            <Text style={[SharedStyles.caption, SharedStyles.textSecondary]}>
              {Math.round(progressPercentage)}%
            </Text>
          </View>
          <View style={SharedStyles.progressBarContainer}>
            <View 
              style={[
                SharedStyles.progressBarFill, 
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.tagsContainer}>
          {word.tags.slice(0, 2).map((tag, index) => (
            <View key={tag.id} style={styles.tag}>
              <Text style={[SharedStyles.caption, styles.tagText]}>
                {tag.title}
              </Text>
            </View>
          ))}
          {word.tags.length > 2 && (
            <Text style={[SharedStyles.caption, SharedStyles.textTertiary]}>
              +{word.tags.length - 2} more
            </Text>
          )}
        </View>
        
        <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = {
  container: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    marginBottom: Spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  wordRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: Spacing.xs,
  },
  levelBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 28,
    alignItems: 'center' as const,
  },
  levelText: {
    color: Colors.textPrimary,
    fontWeight: '600' as const,
  },
  transcription: {
    marginBottom: Spacing.xs,
  },
  metaRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing.sm,
  },
  partOfSpeechBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  irregularBadge: {
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  irregularText: {
    color: Colors.warning,
    fontWeight: '500' as const,
  },
  menuButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  translation: {
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  exampleContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  exampleText: {
    color: Colors.textSecondary,
    fontStyle: 'italic' as const,
    lineHeight: 18,
    marginBottom: Spacing.xs,
  },
  progressContainer: {
    marginBottom: Spacing.md,
  },
  progressInfo: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: Spacing.xs,
  },
  footer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  tagsContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing.sm,
    flex: 1,
  },
  tag: {
    backgroundColor: Colors.backgroundTertiary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    color: Colors.textSecondary,
  },
  /* 
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
  */
};

export default WordCard;