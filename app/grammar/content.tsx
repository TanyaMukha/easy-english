import React, { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import HTML from "react-native-render-html";
import { useLocalSearchParams } from "expo-router";

import { useGrammarTopic } from "../../hooks/useGrammarTopic";

/**
 * Компонент для отображения грамматического контента с переключением языков
 */
const GrammarTopicContentScreen = () => {
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const { topicId } = useLocalSearchParams();

  const {
    currentLanguage,
    topic,
    loading,
    error,
    availableLanguages,
    switchLanguage,
  } = useGrammarTopic(topicId as string);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : !topic ? (
        <View style={styles.centered}>
          <Text>{t("error.topicNotFound")}</Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>{topic.title}</Text>
            {availableLanguages.length > 1 && (
              <View style={styles.languageButtonsContainer}>
                {availableLanguages.map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    style={[
                      styles.languageButton,
                      currentLanguage === lang && styles.activeLanguageButton,
                    ]}
                    onPress={() => switchLanguage(lang)}
                  >
                    <Text
                      style={[
                        styles.languageText,
                        currentLanguage === lang && styles.activeLanguageText,
                      ]}
                    >
                      {lang === "en"
                        ? "🇬🇧"
                        : lang === "uk"
                          ? "🇺🇦"
                          : lang.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <ScrollView style={styles.contentScrollView}>
            <View style={styles.contentContainer}>
              <HTML
                source={{ html: topic.content }}
                contentWidth={width - 32}
                tagsStyles={{
                  p: styles.paragraph,
                  ul: styles.list,
                  li: styles.listItem,
                  table: styles.table,
                  th: styles.tableHeader,
                  td: styles.tableCell,
                  strong: styles.bold,
                  em: styles.italic,
                  h2: styles.h2,
                  h3: styles.h3,
                  div: styles.div,
                  details: styles.details,
                  summary: styles.summary,
                  ol: styles.orderedList,
                }}
              />
            </View>
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    backgroundColor: "#F8F8F8",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    flex: 1,
  },
  languageButtonsContainer: {
    flexDirection: "row",
  },
  languageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    backgroundColor: "#F0F0F0",
  },
  activeLanguageButton: {
    backgroundColor: "#007AFF",
  },
  languageText: {
    fontSize: 14,
    color: "#666666",
  },
  activeLanguageText: {
    color: "#FFFFFF",
  },
  description: {
    fontSize: 14,
    color: "#666666",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  contentScrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333333",
    marginBottom: 12,
  },
  list: {
    marginLeft: 16,
    marginBottom: 12,
  },
  listItem: {
    marginBottom: 8,
  },
  orderedList: {
    marginLeft: 16,
    marginBottom: 12,
  },
  table: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    marginVertical: 12,
  },
  tableHeader: {
    backgroundColor: "#F5F5F5",
    padding: 8,
    fontWeight: "bold",
  },
  tableCell: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  bold: {
    fontWeight: "bold",
  },
  italic: {
    fontStyle: "italic",
  },
  h2: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 16,
    color: "#333333",
  },
  h3: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 12,
    color: "#333333",
  },
  div: {
    marginBottom: 16,
  },
  details: {
    marginTop: 12,
    marginBottom: 12,
  },
  summary: {
    fontWeight: "bold",
    color: "#007AFF",
  },
});

export default GrammarTopicContentScreen;
