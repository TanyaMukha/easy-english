import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TestFinalStatsProps {
  stats: {
    correct: number;
    incorrect: number;
  };
  onClose: () => void;
}

const TestFinalStats: React.FC<TestFinalStatsProps> = ({
  stats,
  onClose,
}) => {
  const { t } = useTranslation();

  const totalAnswers = stats.correct + stats.incorrect;
  const accuracy =
    totalAnswers > 0 ? Math.round((stats.correct / totalAnswers) * 100) : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("learning.results.completed")}</Text>
      <Text style={styles.statsText}>
        {t("learning.results.correctAnswers", { count: stats.correct })}
      </Text>
      <Text style={styles.statsText}>
        {t("learning.results.incorrectAnswers", { count: stats.incorrect })}
      </Text>
      <Text style={styles.statsText}>
        {t("learning.results.accuracy", { percentage: accuracy })}
      </Text>
      <TouchableOpacity
        style={[styles.button, styles.resetButton]}
        onPress={onClose}
      >
        <Text style={styles.buttonText}>{t("learning.buttons.finish")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A237E",
    marginBottom: 16,
  },
  statsText: {
    fontSize: 18,
    color: "#333",
    marginBottom: 8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    minWidth: 200,
  },
  resetButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default TestFinalStats;
