import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useNavigation } from "expo-router";

import HeaderRightButtons from "../../components/features/grammar-tests/HeaderRightButtons";
import { GrammarTestModel } from "../../interfaces/models/GrammarTestModel";
import { GrammarTestService } from "../../services/GrammarTestService";
import { GRAMMAR_TESTS_WITHOUT_QUESTIONS } from "../../mock/mockGrammarTests";

export default function GrammarTestsNavigationScreen() {
  const { t } = useTranslation();
  const [tests, setTests] = useState<GrammarTestModel[]>([]);
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadTests();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setIsEditing(false);
      loadTests();
    }, []),
  );

  const loadTests = async () => {
    // const allTests = await GrammarTestService.getAll();
    const allTests = GRAMMAR_TESTS_WITHOUT_QUESTIONS;
    setTests(allTests);
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRightButtons isEditing={isEditing} setIsEditing={setIsEditing} />
      ),
    });
  }, [isEditing]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {tests.map((test) => (
          <TouchableOpacity
            key={test.id}
            style={styles.optionButton}
            onPress={() =>
              router.push(`/grammar-tests/custom-test?testId=${test.id}` as any)
            }
          >
            <View style={styles.optionIcon}>
              <Feather name="file-text" size={24} color="#1A237E" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{test.title}</Text>
              <Text style={styles.optionDescription}>
                {t("tests.questionsCount", { count: test.questions?.length })}
              </Text>
            </View>
            {isEditing ? (
              <TouchableOpacity
                onPress={() => {
                  // DatabaseService.deleteTest(test.id);
                  // loadTests();
                }}
              >
                <Ionicons name="close" size={24} color="red" />
              </TouchableOpacity>
            ) : (
              <Feather name="chevron-right" size={24} color="#666" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 16,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8EAF6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A237E",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: "#666",
  },
  fabButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
