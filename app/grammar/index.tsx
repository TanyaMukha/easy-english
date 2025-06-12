import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

import { GRAMMAR_TOPICS } from "../../mock/mockGrammarTopics";
import { GrammarTopicModel } from "../../interfaces/models/GrammarTopicModel";
import { GrammarTopicService } from "../../services/GrammarTopicService";

const GrammarTopicsNavigationScreen = () => {
  const [loading, setLoading] = useState(true);
  const [mainTopics, setMainTopics] = useState<GrammarTopicModel[]>([]);

  // Загрузка основных тем (без topicId) при монтировании компонента
  useEffect(() => {
    const loadTopics = async () => {
      try {
        setLoading(true);
        // Получаем только основные темы (где topicId === null)
        // const topics = await GrammarTopicService.getTopicsByTopicId(null);
        const topics = GRAMMAR_TOPICS.filter((topic) => topic.topicId === null);
        setMainTopics(topics);
      } catch (error) {
        console.error("Error loading grammar topics:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTopics();
  }, []);

  // Функция для навигации к контенту с передачей topicId
  const navigateToContent = (topicId: number) => {
    router.push({
      pathname: "/grammar/content",
      params: { topicId: topicId.toString() },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {mainTopics.map((section, index) => (
          <TouchableOpacity
            key={section.id}
            style={styles.sectionButton}
            onPress={() => navigateToContent(section.id as unknown as number)}
          >
            <View
              style={[styles.iconContainer, { backgroundColor: "#2196F3" }]}
            >
              <Feather name="book" size={24} color="#fff" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionDescription}>
                {section.description}
              </Text>
            </View>
            <Feather name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A237E",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A237E",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
  },
});

export default GrammarTopicsNavigationScreen;
