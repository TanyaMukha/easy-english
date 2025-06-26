// app/sets/create.tsx
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { router } from "expo-router";

import { ScreenHeader } from "../../components/ui";
import { SetService } from "../../services/SetService";
import {
  BorderRadius,
  Colors,
  SharedStyles,
  Spacing,
  Typography,
} from "../../styles/SharedStyles";

/**
 * Create Set Screen
 * Single Responsibility: Handle new set creation
 * Open/Closed: Can be extended with additional set configuration options
 */
export default function CreateSetScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      const response = await SetService.create({
        title: title.trim(),
        description: description.trim() || undefined,
      });

      if (response.success) {
        Alert.alert("Success", "Set created successfully!", [
          {
            text: "OK",
            onPress: () => {
              router.back();
            },
          },
        ]);
      } else {
        setErrors({ general: response.error || "Failed to create set" });
      }
    } catch (error) {
      setErrors({ general: "Failed to create set. Please try again." });
      console.error("Error creating set:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Check if form has changes
    const hasChanges = title.trim() || description.trim();

    if (hasChanges) {
      Alert.alert(
        "Discard Changes",
        "Are you sure you want to discard your changes?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ],
      );
    } else {
      router.back();
    }
  };

  const canSave = title.trim() && !isSubmitting;

  return (
    <View style={SharedStyles.container}>
      {/* Header */}
      <ScreenHeader
        title="Create Set"
        // showBackButton={true}
        onBackPress={handleCancel}
        // rightText="Save"
        // onRightPress={handleSave}
        // rightDisabled={!canSave}
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* General Error */}
          {errors.general && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={16} color={Colors.error} />
              <Text style={styles.generalErrorText}>{errors.general}</Text>
            </View>
          )}

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
              autoFocus={true}
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

            <View style={styles.infoItem}>
              <Icon name="users" size={16} color={Colors.success} />
              <Text style={styles.infoText}>
                Sets help you organize words by topic or difficulty level
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Icon name="play" size={16} color={Colors.warning} />
              <Text style={styles.infoText}>
                Practice and test yourself with words from this set
              </Text>
            </View>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={[
              styles.createButton,
              !canSave && styles.createButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!canSave}
            accessible={true}
            accessibilityLabel="Create set"
          >
            <Icon
              name="plus"
              size={20}
            //   color={canSave ? Colors.onPrimary : Colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.createButtonText,
                !canSave && styles.createButtonTextDisabled,
              ]}
            >
              {isSubmitting ? "Creating Set..." : "Create Set"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: Colors.errorContainer,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  generalErrorText: {
    // ...Typography.bodyMedium,
    color: Colors.error,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  fieldContainer: {
    marginBottom: Spacing.xl,
  },
  label: {
    // ...Typography.labelLarge,
    // color: Colors.onSurface,
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  required: {
    color: Colors.error,
  },
  input: {
    // ...Typography.bodyLarge,
    // color: Colors.onSurface,
    // backgroundColor: Colors.surfaceContainer,
    borderWidth: 1,
    // borderColor: Colors.outline,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 48,
  },
  textArea: {
    // ...Typography.bodyLarge,
    // color: Colors.onSurface,
    // backgroundColor: Colors.surfaceContainer,
    borderWidth: 1,
    // borderColor: Colors.outline,
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
    // ...Typography.bodySmall,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  characterCount: {
    // ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: "right",
    marginTop: Spacing.xs,
  },
  infoContainer: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    padding: Spacing.md,
    // backgroundColor: Colors.primaryContainer,
    borderRadius: BorderRadius.md,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  infoText: {
    // ...Typography.bodyMedium,
    // color: Colors.onPrimaryContainer,
    marginLeft: Spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  createButtonDisabled: {
    // backgroundColor: Colors.outline,
  },
  createButtonText: {
    // ...Typography.labelLarge,
    // color: Colors.onPrimary,
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
  createButtonTextDisabled: {
    // color: Colors.onSurfaceVariant,
  },
});
