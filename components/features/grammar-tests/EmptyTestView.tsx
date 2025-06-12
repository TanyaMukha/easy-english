import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

interface EmptyTestViewProps {
  type: "study" | "test";
}

const EmptyTestView: React.FC<EmptyTestViewProps> = ({ type }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {type === "study"
          ? t("learning.noWordsForStudy")
          : t("learning.noWordsForTest")}
      </Text>
      <Text style={styles.message}>{t("learning.noDataForTest")}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A237E",
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default EmptyTestView;
