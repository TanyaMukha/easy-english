// components/words/WordActionsModal.tsx

import React from "react";
import { Alert, Modal, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { WordWithExamples } from "../../data/DataModels";
import { WordService } from "../../services/words";
import { Colors, SharedStyles, Spacing } from "../../styles/SharedStyles";

interface WordActionsModalProps {
  visible: boolean;
  word: WordWithExamples | null;
  onClose: () => void;
  onEdit: (word: WordWithExamples) => void;
  onDelete: (word: WordWithExamples) => void;
  onViewStats: (word: WordWithExamples) => void;
  onPractice: (word: WordWithExamples) => void;
}

interface ActionItem {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
  destructive?: boolean;
}

/**
 * Modal for word context actions
 * Single Responsibility: Handle word action selection
 */
const WordActionsModal: React.FC<WordActionsModalProps> = ({
  visible,
  word,
  onClose,
  onEdit,
  onDelete,
  onViewStats,
  onPractice,
}) => {
  if (!word) {
    return null;
  }

  const handleEdit = () => {
    onClose();
    onEdit(word);
  };

  const handlePractice = () => {
    onClose();
    onPractice(word);
  };

  const handleViewStats = () => {
    onClose();
    onViewStats(word);
  };

  const handleDuplicate = async () => {
    onClose();

    try {
      // TODO: Implement word duplication functionality
      Alert.alert(
        "Duplicate Word",
        "Word duplication functionality will be implemented soon.",
        [{ text: "OK" }],
      );
    } catch (error) {
      Alert.alert("Error", "Failed to duplicate word");
    }
  };

  const handleExport = async () => {
    onClose();

    try {
      // TODO: Implement word export functionality
      Alert.alert(
        "Export Word",
        "Export functionality will be implemented soon.",
        [{ text: "OK" }],
      );
    } catch (error) {
      Alert.alert("Error", "Failed to export word");
    }
  };

  const handleMarkAsLearned = async () => {
    onClose();

    try {
      const response = await WordService.updateProgress(word.id!, true);
      if (response.success) {
        Alert.alert("Success", "Word marked as learned!", [{ text: "OK" }]);
      } else {
        Alert.alert("Error", "Failed to update word progress");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to mark word as learned");
    }
  };

  const handleDelete = () => {
    onClose();

    Alert.alert(
      "Delete Word",
      `Are you sure you want to delete "${word.word}"? This action cannot be undone and will also delete all examples and progress for this word.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => confirmDelete(),
        },
      ],
    );
  };

  const confirmDelete = async () => {
    try {
      const response = await WordService.delete(word.id!);

      if (response.success) {
        onDelete(word);
      } else {
        Alert.alert("Error", "Failed to delete word");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to delete word");
    }
  };

  const getProgressColor = (rate: number) => {
    if (rate <= 1) return Colors.error;
    if (rate <= 2) return Colors.warning;
    if (rate <= 3) return Colors.info;
    if (rate <= 4) return Colors.accent;
    return Colors.success;
  };

  const actions: ActionItem[] = [
    {
      icon: "create-outline",
      title: "Edit Word",
      subtitle: "Change word details and examples",
      color: Colors.primary,
      onPress: handleEdit,
    },
    {
      icon: "school-outline",
      title: "Practice Word",
      subtitle: "Start a practice session",
      color: Colors.accent,
      onPress: handlePractice,
    },
    {
      icon: "stats-chart-outline",
      title: "View Progress",
      subtitle: "See learning statistics",
      color: Colors.info,
      onPress: handleViewStats,
    },
    {
      icon: "checkmark-circle-outline",
      title: "Mark as Learned",
      subtitle: "Boost progress rating",
      color: Colors.success,
      onPress: handleMarkAsLearned,
    },
    {
      icon: "copy-outline",
      title: "Duplicate Word",
      subtitle: "Create a copy",
      color: Colors.secondary,
      onPress: handleDuplicate,
    },
    {
      icon: "download-outline",
      title: "Export Word",
      subtitle: "Save word data",
      color: Colors.warning,
      onPress: handleExport,
    },
    {
      icon: "trash-outline",
      title: "Delete Word",
      subtitle: "Remove permanently",
      color: Colors.error,
      onPress: handleDelete,
      destructive: true,
    },
  ];

  const renderAction = (action: ActionItem) => (
    <TouchableOpacity
      key={action.title}
      style={[
        styles.actionItem,
        action.destructive && styles.destructiveAction,
      ]}
      onPress={action.onPress}
      activeOpacity={0.7}
    >
      <View
        style={[styles.actionIcon, { backgroundColor: action.color + "20" }]}
      >
        <Ionicons name={action.icon as any} size={24} color={action.color} />
      </View>
      <View style={styles.actionContent}>
        <Text style={[SharedStyles.bodyLarge, SharedStyles.textPrimary]}>
          {action.title}
        </Text>
        <Text style={[SharedStyles.bodySmall, SharedStyles.textSecondary]}>
          {action.subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal as any}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.wordInfo}>
                <Text
                  style={[SharedStyles.h4, SharedStyles.textPrimary]}
                  numberOfLines={2}
                >
                  {word.word}
                </Text>
                {word.transcription && (
                  <Text
                    style={[SharedStyles.bodySmall, SharedStyles.textTertiary]}
                  >
                    [{word.transcription}]
                  </Text>
                )}
                <Text
                  style={[SharedStyles.bodyMedium, SharedStyles.textSecondary]}
                  numberOfLines={2}
                >
                  {word.translation}
                </Text>
              </View>

              {/* Progress Indicator */}
              <View style={styles.progressContainer}>
                <View
                  style={[
                    styles.progressBadge,
                    {
                      backgroundColor: getProgressColor(word.rate || 0) + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      SharedStyles.bodySmall,
                      {
                        color: getProgressColor(word.rate || 0),
                        fontWeight: "600",
                      },
                    ]}
                  >
                    {word.rate || 0}/5
                  </Text>
                </View>
                <Text style={[SharedStyles.caption, SharedStyles.textTertiary]}>
                  {word.reviewCount || 0} reviews
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Actions List */}
          <View style={styles.content}>{actions.map(renderAction)}</View>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: Spacing.lg,
  },
  modal: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flex: 1,
  },
  wordInfo: {
    marginBottom: Spacing.md,
  },
  progressContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: Spacing.sm,
  },
  progressBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    minWidth: 40,
    alignItems: "center" as const,
  },
  closeButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.md,
  },
  content: {
    padding: Spacing.md,
    maxHeight: 400,
  },
  actionItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  destructiveAction: {
    backgroundColor: Colors.errorBg,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: Spacing.md,
  },
  actionContent: {
    flex: 1,
  },
};

export default WordActionsModal;
