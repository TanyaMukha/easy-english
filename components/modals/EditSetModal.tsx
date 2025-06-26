// components/EditSetModal.tsx
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

import { Set } from "../../data/DataModels";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "../../styles/SharedStyles";

interface EditSetModalProps {
  visible: boolean;
  set: Set | null;
  onClose: () => void;
  onSave: (set: Set) => Promise<boolean>;
  mode?: "create" | "edit";
}

/**
 * Modal for creating/editing sets
 * Single Responsibility: Handle set form operations
 * Open/Closed: Can be extended with additional form fields
 */
const EditSetModal: React.FC<EditSetModalProps> = ({
  visible,
  set,
  onClose,
  onSave,
  mode = "edit",
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isCreateMode = mode === "create";
  const modalTitle = isCreateMode ? "Create New Set" : "Edit Set";
  const submitButtonText = isCreateMode ? "Create Set" : "Save Changes";

  // Reset form when modal opens/closes or set changes
  useEffect(() => {
    if (visible) {
      if (isCreateMode) {
        setTitle("");
        setDescription("");
      } else if (set) {
        setTitle(set.title);
        setDescription(set.description || "");
      }
      setErrors({});
    }
  }, [visible, set, isCreateMode]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.trim().length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    if (description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const setData: Set = {
        ...(set || ({} as Set)),
        title: title.trim(),
        description: description.trim() || undefined,
      };

      const success = await onSave(setData);

      if (success) {
        onClose();
        Alert.alert(
          "Success",
          `Set ${isCreateMode ? "created" : "updated"} successfully!`,
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        `Failed to ${isCreateMode ? "create" : "update"} set. Please try again.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;

    // Check if form has changes
    const hasChanges = isCreateMode
      ? title.trim() || description.trim()
      : title !== (set?.title || "") ||
        description !== (set?.description || "");

    if (hasChanges) {
      Alert.alert(
        "Discard Changes",
        "Are you sure you want to discard your changes?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Discard", style: "destructive", onPress: onClose },
        ],
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            disabled={isSubmitting}
            accessible={true}
            accessibilityLabel="Close modal"
          >
            <Icon name="x" size={24} color={Colors.onSurface} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{modalTitle}</Text>

          <TouchableOpacity
            style={[
              styles.saveButton,
              isSubmitting && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={isSubmitting || !title.trim()}
            accessible={true}
            accessibilityLabel={submitButtonText}
          >
            <Text
              style={[
                styles.saveButtonText,
                isSubmitting && styles.saveButtonTextDisabled,
              ]}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Title <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter set title"
              placeholderTextColor={Colors.textSecondary}
              maxLength={100}
              autoFocus={isCreateMode}
              editable={!isSubmitting}
              accessible={true}
              accessibilityLabel="Set title"
            />
            {errors.title && (
              <Text style={styles.errorText}>{errors.title}</Text>
            )}
            <Text style={styles.characterCount}>{title.length}/100</Text>
          </View>

          {/* Description Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.textArea, errors.description && styles.inputError]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter set description (optional)"
              placeholderTextColor={Colors.textSecondary}
              multiline={true}
              numberOfLines={4}
              maxLength={500}
              textAlignVertical="top"
              editable={!isSubmitting}
              accessible={true}
              accessibilityLabel="Set description"
            />
            {errors.description && (
              <Text style={styles.errorText}>{errors.description}</Text>
            )}
            <Text style={styles.characterCount}>{description.length}/500</Text>
          </View>

          {/* Info Section */}
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Icon name="info" size={16} color={Colors.primary} />
              <Text style={styles.infoText}>
                You can add words to this set after creating it
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outline,
    backgroundColor: Colors.surface,
  },
  closeButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  headerTitle: {
    ...Typography.headlineSmall,
    color: Colors.onSurface,
    flex: 1,
    textAlign: "center",
    marginHorizontal: Spacing.md,
  },
  saveButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.outline,
  },
  saveButtonText: {
    ...Typography.labelLarge,
    color: Colors.onPrimary,
    fontWeight: "600",
  },
  saveButtonTextDisabled: {
    color: Colors.onSurfaceVariant,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  fieldContainer: {
    marginBottom: Spacing.xl,
  },
  label: {
    ...Typography.labelLarge,
    color: Colors.onSurface,
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  required: {
    color: Colors.error,
  },
  input: {
    ...Typography.bodyLarge,
    color: Colors.onSurface,
    backgroundColor: Colors.surfaceContainer,
    borderWidth: 1,
    borderColor: Colors.outline,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 48,
  },
  textArea: {
    ...Typography.bodyLarge,
    color: Colors.onSurface,
    backgroundColor: Colors.surfaceContainer,
    borderWidth: 1,
    borderColor: Colors.outline,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 100,
    maxHeight: 150,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  characterCount: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: "right",
    marginTop: Spacing.xs,
  },
  infoContainer: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.primaryContainer,
    borderRadius: BorderRadius.md,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoText: {
    ...Typography.bodyMedium,
    color: Colors.onPrimaryContainer,
    marginLeft: Spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
});

export default EditSetModal;
