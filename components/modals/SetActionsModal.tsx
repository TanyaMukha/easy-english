// components/SetActionsModal.tsx
import React from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

import { Set } from "../../data/DataModels";
import { setService } from "../../services/database";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "../../services/database/styles/SharedStyles";

interface SetActionsModalProps {
  visible: boolean;
  set: Set | null;
  onClose: () => void;
  onEdit: (set: Set) => void;
  onDelete: (set: Set) => void;
  onViewStats: (set: Set) => void;
  onManageWords: (set: Set) => void;
}

interface ActionItem {
  id: string;
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
  destructive?: boolean;
}

/**
 * Action sheet modal for set operations
 * Single Responsibility: Provide set action menu
 * Open/Closed: Can be extended with additional actions
 */
const SetActionsModal: React.FC<SetActionsModalProps> = ({
  visible,
  set,
  onClose,
  onEdit,
  onDelete,
  onViewStats,
  onManageWords,
}) => {
  if (!set) return null;

  const wordCount = 10 //setService.getWordCount(set.id);

  const handleDelete = () => {
    Alert.alert(
      "Delete Set",
      `Are you sure you want to delete "${set.title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onDelete(set);
          },
        },
      ],
    );
  };

  const actions: ActionItem[] = [
    {
      id: "view",
      title: "View Set",
      icon: "eye",
      color: Colors.primary,
      onPress: () => {
        onClose();
        // Navigate to set details - will be implemented in screen
        console.log("View set:", set.id);
      },
    },
    {
      id: "edit",
      title: "Edit Set",
      icon: "edit",
      color: Colors.primary,
      onPress: () => {
        onEdit(set);
      },
    },
    {
      id: "manage-words",
      title: "Manage Words",
      icon: "list",
      color: Colors.success,
      onPress: () => {
        onManageWords(set);
      },
    },
    {
      id: "stats",
      title: "View Statistics",
      icon: "bar-chart",
      color: Colors.accent,
      onPress: () => {
        onViewStats(set);
      },
    },
    {
      id: "practice",
      title: "Practice Words",
      icon: "play",
      color: Colors.warning,
      onPress: () => {
        onClose();
        // Navigate to practice - will be implemented
        console.log("Practice set:", set.id);
      },
    },
    {
      id: "test",
      title: "Take Test",
      icon: "check-circle",
      color: Colors.info,
      onPress: () => {
        onClose();
        // Navigate to test - will be implemented
        console.log("Test set:", set.id);
      },
    },
    {
      id: "export",
      title: "Export Set",
      icon: "download",
      color: Colors.textSecondary,
      onPress: () => {
        onClose();
        // Export functionality - will be implemented
        console.log("Export set:", set.id);
      },
    },
    {
      id: "delete",
      title: "Delete Set",
      icon: "trash",
      color: Colors.error,
      onPress: handleDelete,
      destructive: true,
    },
  ];

  const renderActionItem = (action: ActionItem) => (
    <TouchableOpacity
      key={action.id}
      style={[
        styles.actionItem,
        action.destructive && styles.destructiveAction,
      ]}
      onPress={action.onPress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={action.title}
      accessibilityRole="button"
    >
      <View
        style={[styles.actionIcon, { backgroundColor: `${action.color}15` }]}
      >
        <Icon name={action.icon} size={20} color={action.color} />
      </View>
      <Text
        style={[
          styles.actionTitle,
          action.destructive && styles.destructiveText,
        ]}
      >
        {action.title}
      </Text>
      <Icon name="chevron-right" size={16} color={Colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      transparent={true}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.dragHandle} />

            <View style={styles.setInfo}>
              <Text style={styles.setTitle} numberOfLines={1}>
                {set.title}
              </Text>
              <Text style={styles.setSubtitle}>
                {wordCount} {/* wordCount === 1 */ false ? "word" : "words"}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessible={true}
              accessibilityLabel="Close menu"
            >
              <Icon name="x" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            {actions.map(renderActionItem)}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdrop: {
    flex: 1,
  },
  container: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.md,
  },
  setInfo: {
    alignItems: "center",
    flex: 1,
  },
  setTitle: {
    marginBottom: Spacing.xs,
  },
  setSubtitle: {
    color: Colors.textSecondary,
  },
  closeButton: {
    position: "absolute",
    right: Spacing.lg,
    top: Spacing.md,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  actionsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  destructiveAction: {
    backgroundColor: `${Colors.error}08`,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  actionTitle: {
    flex: 1,
  },
  destructiveText: {
    color: Colors.error,
  },
});

export default SetActionsModal;
