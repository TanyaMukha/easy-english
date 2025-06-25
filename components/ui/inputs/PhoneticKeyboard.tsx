// components/ui/PhoneticKeyboard.tsx
import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  BorderRadius,
  Colors,
  GlobalStyles,
  Spacing,
} from "../../../styles/GlobalStyles";

interface PhoneticKeyboardProps {
  visible: boolean;
  onClose: () => void;
  onKeyPress: (key: string, position: number) => void;
  cursorPosition: number;
}

/**
 * Phonetic keyboard for IPA transcription input
 * Single Responsibility: Provide IPA symbol input interface
 */
const PhoneticKeyboard: React.FC<PhoneticKeyboardProps> = ({
  visible,
  onClose,
  onKeyPress,
  cursorPosition,
}) => {
  // IPA symbols organized by categories
  const vowels = [
    "i",
    "ɪ",
    "e",
    "ɛ",
    "æ",
    "ɑ",
    "ɒ",
    "ɔ",
    "o",
    "ʊ",
    "u",
    "ʌ",
    "ə",
    "ɜ",
    "ɪə",
    "eə",
    "ʊə",
  ];

  const consonants = [
    "p",
    "b",
    "t",
    "d",
    "k",
    "g",
    "f",
    "v",
    "θ",
    "ð",
    "s",
    "z",
    "ʃ",
    "ʒ",
    "h",
    "m",
    "n",
    "ŋ",
    "l",
    "r",
    "j",
    "w",
    "tʃ",
    "dʒ",
  ];

  const stress = ["ˈ", "ˌ"];

  const handleKeyPress = (key: string) => {
    onKeyPress(key, cursorPosition);
  };

  const handleBackspace = () => {
    onKeyPress("BACKSPACE", cursorPosition);
  };

  const renderKeyboardSection = (title: string, symbols: string[]) => (
    <View style={styles.section}>
      <Text
        style={[
          GlobalStyles.bodyMedium,
          GlobalStyles.textSecondary,
          styles.sectionTitle,
        ]}
      >
        {title}
      </Text>
      <View style={styles.keysContainer}>
        {symbols.map((symbol) => (
          <TouchableOpacity
            key={symbol}
            style={styles.key}
            onPress={() => handleKeyPress(symbol)}
            activeOpacity={0.7}
          >
            <Text style={[GlobalStyles.bodyLarge, styles.keyText]}>
              {symbol}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container as any}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[GlobalStyles.h4, GlobalStyles.textPrimary]}>
              IPA Keyboard
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Keyboard content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {renderKeyboardSection("Stress Marks", stress)}
            {renderKeyboardSection("Vowels", vowels)}
            {renderKeyboardSection("Consonants", consonants)}
          </ScrollView>

          {/* Footer with utility buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.utilityButton, styles.backspaceButton]}
              onPress={handleBackspace}
              activeOpacity={0.7}
            >
              <Ionicons name="backspace" size={20} color={Colors.textPrimary} />
              <Text style={[GlobalStyles.bodySmall, styles.utilityButtonText]}>
                Backspace
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.utilityButton, styles.doneButton]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={[GlobalStyles.bodyMedium, styles.doneButtonText]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end" as const,
  },
  container: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: "70%",
  },
  header: {
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
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    fontWeight: "600" as const,
  },
  keysContainer: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: Spacing.sm,
  },
  key: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minWidth: 40,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  keyText: {
    color: Colors.textPrimary,
    fontWeight: "500" as const,
  },
  footer: {
    flexDirection: "row" as const,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.md,
  },
  utilityButton: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  backspaceButton: {
    backgroundColor: Colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  doneButton: {
    backgroundColor: Colors.primary,
  },
  utilityButtonText: {
    color: Colors.textPrimary,
  },
  doneButtonText: {
    color: Colors.textPrimary,
    fontWeight: "600" as const,
  },
};

export default PhoneticKeyboard;
