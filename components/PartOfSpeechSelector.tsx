// components/features/dictionary/PartOfSpeechSelector.tsx
import React, { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { PartOfSpeech } from "../data/DataModels";
import {
  BorderRadius,
  Colors,
  GlobalStyles,
  Spacing,
  Typography,
} from "../styles/GlobalStyles";

interface PartOfSpeechSelectorProps {
  selected: PartOfSpeech;
  onSelect: (partOfSpeech: PartOfSpeech) => void;
  disabled?: boolean;
}

/**
 * Selector component for part of speech
 * Single Responsibility: Handle part of speech selection
 */
const PartOfSpeechSelector: React.FC<PartOfSpeechSelectorProps> = ({
  selected,
  onSelect,
  disabled = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Part of speech options with display labels
  const partOfSpeechOptions = [
    {
      value: PartOfSpeech.NOUN,
      label: "Noun",
      description: "Person, place, thing, or idea",
    },
    {
      value: PartOfSpeech.VERB,
      label: "Verb",
      description: "Action or state of being",
    },
    {
      value: PartOfSpeech.ADJECTIVE,
      label: "Adjective",
      description: "Describes a noun",
    },
    {
      value: PartOfSpeech.ADVERB,
      label: "Adverb",
      description: "Describes a verb, adjective, or adverb",
    },
    {
      value: PartOfSpeech.PREPOSITION,
      label: "Preposition",
      description: "Shows relationship between words",
    },
    {
      value: PartOfSpeech.PHRASE,
      label: "Phrase",
      description: "Group of words with meaning",
    },
    {
      value: PartOfSpeech.PHRASAL_VERB,
      label: "Phrasal Verb",
      description: "Verb + particle with new meaning",
    },
    {
      value: PartOfSpeech.IDIOM,
      label: "Idiom",
      description: "Expression with non-literal meaning",
    },
    {
      value: PartOfSpeech.PRONOUN,
      label: "Pronoun",
      description: "Replaces a noun",
    },
    {
      value: PartOfSpeech.CONJUNCTION,
      label: "Conjunction",
      description: "Connects words or clauses",
    },
    {
      value: PartOfSpeech.INTERJECTION,
      label: "Interjection",
      description: "Expresses emotion",
    },
    {
      value: PartOfSpeech.SLANG,
      label: "Slang",
      description: "Informal language",
    },
    {
      value: PartOfSpeech.ABBREVIATION,
      label: "Abbreviation",
      description: "Shortened form of words",
    },
    {
      value: PartOfSpeech.FIXED_EXPRESSION,
      label: "Fixed Expression",
      description: "Set phrase with fixed meaning",
    },
    {
      value: PartOfSpeech.IRREGULAR,
      label: "Irregular",
      description: "Special form or usage",
    },
  ];

  const getSelectedOption = () => {
    return partOfSpeechOptions.find((option) => option.value === selected);
  };

  const handleSelect = (partOfSpeech: PartOfSpeech) => {
    onSelect(partOfSpeech);
    setModalVisible(false);
  };

  const selectedOption = getSelectedOption();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Part of Speech *</Text>

      <TouchableOpacity
        style={[styles.selector, disabled && styles.selectorDisabled]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={styles.selectorContent}>
          <Text
            style={[
              GlobalStyles.bodyMedium,
              GlobalStyles.textPrimary,
              disabled && { color: Colors.textDisabled },
            ]}
          >
            {selectedOption?.label || "Select part of speech"}
          </Text>
          <Ionicons
            name="chevron-down"
            size={20}
            color={disabled ? Colors.textDisabled : Colors.textTertiary}
          />
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer as any}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[GlobalStyles.h4, GlobalStyles.textPrimary]}>
                Select Part of Speech
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Options list */}
            <ScrollView
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
            >
              {partOfSpeechOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.option,
                    selected === option.value && styles.optionSelected,
                  ]}
                  onPress={() => handleSelect(option.value)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionContent}>
                    <Text
                      style={[
                        GlobalStyles.bodyMedium,
                        GlobalStyles.textPrimary,
                        styles.optionLabel,
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text
                      style={[
                        GlobalStyles.bodySmall,
                        GlobalStyles.textSecondary,
                        styles.optionDescription,
                      ]}
                    >
                      {option.description}
                    </Text>
                  </View>

                  {selected === option.value && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={Colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = {
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.weightMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  selector: {
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 44,
  },
  selectorDisabled: {
    backgroundColor: Colors.backgroundSecondary,
    opacity: 0.6,
  },
  selectorContent: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: Spacing.lg,
  },
  modalContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  optionsList: {
    flex: 1,
    padding: Spacing.md,
  },
  option: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  optionSelected: {
    backgroundColor: Colors.primary + "20",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  optionContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  optionLabel: {
    fontWeight: Typography.weightMedium,
    marginBottom: Spacing.xs,
  },
  optionDescription: {
    lineHeight: 18,
  },
};

export default PartOfSpeechSelector;