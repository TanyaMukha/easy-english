import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";

import EmptyTestView from "../../components/features/grammar-tests/EmptyTestView";
import { ProgressBar } from "../../components/ui/ProgressBar";
import TestFinalStats from "../../components/ui/TestFinalStats";
import { GrammarTestQuestionEntity } from "../../interfaces/entities/GrammarTestQuestionEntity";
import { mapGrammarTestQuestionEntityToModel } from "../../interfaces/mappers/GrammarTestQuestionMapper";
import { GrammarTestQuestionModel } from "../../interfaces/models/GrammarTestQuestionModel";
import { GRAMMAR_TESTS } from "../../mock/mockGrammarTests";
import { GrammarTestQuestionService } from "../../services/GrammarTestQuestionService";
import { GrammarTestService } from "../../services/GrammarTestService";
import { shuffleArray } from "../../utils/shuffleArray";

export const CustomTestScreen = () => {
  const { t } = useTranslation();
  const params = useLocalSearchParams();

  const [currentQuestion, setCurrentQuestion] =
    useState<GrammarTestQuestionModel | null>(null);
  const [questions, setQuestions] = useState<GrammarTestQuestionModel[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [stats, setStats] = useState({
    correct: 0,
    incorrect: 0,
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showFinalStats, setShowFinalStats] = useState(false);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);
  const [mask, setMask] = useState<string>("_______");
  const [testId] = useState<number>(
    params?.testId as unknown as number,
  );

  function capitalizeFirstLetter(str: string) {
    return str[0].toUpperCase() + str.slice(1);
  }

  const resetTestState = useCallback(() => {
    setCurrentQuestion(null);
    setQuestions([]);
    setSelectedAnswer(null);
    setShowResults(false);
    setStats({ correct: 0, incorrect: 0 });
    setCurrentIndex(0);
    setTotalCount(0);
    setShowFinalStats(false);
    setShuffledAnswers([]);
  }, []);

  const initializeQuestions = async () => {
    try {
      // const testQuestions =
      //   await GrammarTestQuestionService.getAllByTestId(testId);
      const testQuestions =
        GRAMMAR_TESTS.find((test) => test.id === Number(testId))?.questions ?? [];
      // const _mask = (await GrammarTestService.getById(testId))?.mask;
      const _mask = GRAMMAR_TESTS.find((test) => test.id === testId)?.mask;
      if (_mask) {
        setMask(_mask);
      }

      const shuffledQuestions = shuffleArray(testQuestions);
      setQuestions(shuffledQuestions);
      const firstQuestion = shuffledQuestions[0] || null;
      setCurrentQuestion(firstQuestion);
      if (firstQuestion) {
        setShuffledAnswers(firstQuestion.answers);
      }
      setTotalCount(testQuestions.length);
    } catch (error) {
      console.error(error as Error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      resetTestState();
      initializeQuestions();

      return () => {
        resetTestState();
      };
    }, [testId, resetTestState]),
  );

  useEffect(() => {
    resetTestState();
    initializeQuestions();
  }, [testId]);

  const getQuestionWithGap = (sentence?: string) => {
    return sentence?.replace(/{{answer}}/g, mask) ?? "";
  };

  const getQuestionWithAnswer = (sentence?: string, answer?: string) => {
    return sentence?.replace(/{{answer}}/g, answer ?? "") ?? "";
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    const isCorrect =
      answer.toLowerCase() === currentQuestion?.correctAnswer.toLowerCase();
    setStats((prev) => ({
      ...prev,
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
    }));
    setShowResults(true);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      finishTest();
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    const nextQuestion = questions[currentIndex + 1];
    setCurrentQuestion(nextQuestion);
    setShuffledAnswers(shuffleArray(nextQuestion.answers));
    setSelectedAnswer(null);
    setShowResults(false);
  };

  const finishTest = async () => {
    try {
    } catch (error) {
      console.error(`Error updating test progress: ${error}`);
    }
    setShowFinalStats(true);
  };

  const handleClose = () => {
    resetTestState();
    router.back();
  };

  return (
    <>
      {!currentQuestion ? (
        <EmptyTestView type="test" />
      ) : showFinalStats ? (
        <TestFinalStats stats={stats} onClose={handleClose} />
      ) : (
        <SafeAreaView style={styles.container}>
          <ProgressBar
            currentIndex={currentIndex}
            total={totalCount}
            correctCount={stats.correct}
            incorrectCount={stats.incorrect}
          />

          <View style={styles.content}>
            <View style={styles.questionContainer}>
              <Text style={styles.question}>
                {showResults
                  ? capitalizeFirstLetter(
                      getQuestionWithAnswer(
                        currentQuestion?.sentence,
                        currentQuestion?.correctAnswer,
                      ),
                    )
                  : getQuestionWithGap(currentQuestion?.sentence)}
              </Text>
              <Text style={styles.translation}>
                {currentQuestion?.translation}
              </Text>
            </View>

            <View style={styles.answersContainer}>
              {shuffledAnswers.map((answer, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.answerButton,
                    showResults &&
                      answer === selectedAnswer &&
                      (answer === currentQuestion?.correctAnswer
                        ? styles.correctAnswer
                        : styles.incorrectAnswer),
                    showResults &&
                      answer === currentQuestion?.correctAnswer &&
                      styles.correctAnswer,
                  ]}
                  onPress={() => handleAnswerSelect(answer)}
                  disabled={showResults}
                >
                  <Text style={styles.answerText}>{answer}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {showResults && (
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.buttonText}>
                  {currentIndex + 1 === questions.length
                    ? t("tests.finish")
                    : t("tests.next")}
                </Text>
                <Feather name="arrow-right" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 8,
    gap: 8,
    marginTop: 24,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  questionContainer: {
    marginVertical: 24,
  },
  question: {
    fontSize: 20,
    color: "#333",
    marginBottom: 8,
    lineHeight: 28,
  },
  translation: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
  },
  answersContainer: {
    marginTop: 24,
  },
  answerButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 12,
  },
  answerText: {
    fontSize: 16,
    color: "#333",
  },
  correctAnswer: {
    backgroundColor: "#E8F5E9",
    borderColor: "#4CAF50",
  },
  incorrectAnswer: {
    backgroundColor: "#FFEBEE",
    borderColor: "#F44336",
  },
});

export default CustomTestScreen;
