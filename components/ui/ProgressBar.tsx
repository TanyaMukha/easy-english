import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

interface ProgressBarProps {
  currentIndex: number;
  total: number;
  correctCount?: number;
  incorrectCount?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentIndex,
  total,
  correctCount,
  incorrectCount,
}) => {
  const showColoredProgress =
    correctCount !== undefined && incorrectCount !== undefined;
  const correctWidth = showColoredProgress ? (correctCount / total) * 100 : 0;
  const incorrectWidth = showColoredProgress
    ? (incorrectCount / total) * 100
    : 0;
  const defaultWidth = showColoredProgress
    ? 0
    : ((currentIndex + 1) / total) * 100;

  return (
    <View style={styles.container}>
      {/* <TouchableOpacity onPress={() => router.back()}>
        <Feather name="arrow-left" size={24} color="#666" />
      </TouchableOpacity> */}

      <View style={styles.progressBar}>
        {showColoredProgress ? (
          <>
            <View
              style={[
                styles.progressFill,
                styles.correctFill,
                { width: `${correctWidth}%` },
              ]}
            />
            <View
              style={[
                styles.progressFill,
                styles.incorrectFill,
                { width: `${incorrectWidth}%`, left: `${correctWidth}%` },
              ]}
            />
          </>
        ) : (
          <View
            style={[
              styles.progressFill,
              styles.defaultFill,
              { width: `${defaultWidth}%` },
            ]}
          />
        )}
      </View>

      <Text style={styles.progressText}>
        {currentIndex + 1} / {total}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 16,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    position: "absolute",
  },
  defaultFill: {
    backgroundColor: "#4CAF50",
  },
  correctFill: {
    backgroundColor: "#4CAF50",
    left: 0,
  },
  incorrectFill: {
    backgroundColor: "#F44336",
  },
  progressText: {
    fontSize: 14,
    color: "#666",
  },
});
