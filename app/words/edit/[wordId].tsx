import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { UpdatedWordForm } from "../../../components/forms";
import { ErrorState, LoadingState, ScreenHeader } from "../../../components/ui";
import { WordWithExamples } from "../../../data/DataModels";
import { WordService } from "../../../services/WordService";
import { SharedStyles } from "../../../styles/SharedStyles";

export default function EditWordScreen() {
  const { wordId } = useLocalSearchParams<{ wordId: string }>();
  const wordIdNumber = parseInt(wordId || "0", 10);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [word, setWord] = useState<WordWithExamples | null>(null);

  const loadWordData = async () => {
    try {
      setError(null);
      const response = await WordService.getById(wordIdNumber);

      if (response.success && response.data) {
        setWord(response.data);
      } else {
        setError(response.error || "Word not found");
      }
    } catch (err) {
      setError("Failed to load word. Please try again.");
      console.error("Error loading word:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (wordData: WordWithExamples) => {
    if (!word) return;

    setSaving(true);

    try {
      // Convert WordWithExamples to UpdateWordRequest format
      const updateRequest = {
        word: wordData.word,
        transcription: wordData.transcription ?? "",
        translation: wordData.translation ?? "",
        explanation: wordData.explanation ?? "",
        definition: wordData.definition ?? "",
        partOfSpeech: wordData.partOfSpeech,
        language: wordData.language,
        level: wordData.level,
        isIrregular: wordData.isIrregular,
        examples: wordData.examples?.map((ex) => ({
          sentence: ex.sentence,
          translation: ex.translation ?? "",
        })),
      };

      const response = await WordService.update(word.id!, updateRequest);

      if (response.success && response.data) {
        Alert.alert(
          "Success",
          `Word "${response.data.word}" has been updated successfully!`,
          [
            {
              text: "View Word",
              style: "default",
              onPress: () => {
                router.replace(`/words/${response.data!.id}`);
              },
            },
            {
              text: "Done",
              style: "cancel",
              onPress: () => {
                router.back();
              },
            },
          ],
        );
      } else {
        Alert.alert("Error", response.error || "Failed to update word");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update word. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleBackPress = () => {
    router.back();
  };

  useEffect(() => {
    if (wordIdNumber > 0) {
      loadWordData();
    } else {
      setError("Invalid word ID");
      setLoading(false);
    }
  }, [wordIdNumber]);

  return (
    <View style={SharedStyles.container}>
      <ScreenHeader
        title="Edit Word"
        subtitle={word?.word || "Update word information"}
        // showBackButton={true}
        onBackPress={handleBackPress}
      />

      {loading && <LoadingState message="Loading word..." />}

      {!loading && (error || !word) && (
        <ErrorState
          title="Failed to load word"
          message={error || "Word not found"}
          onRetry={loadWordData}
        />
      )}

      {!loading && !error && word && (
        <UpdatedWordForm
          word={word}
          dictionaryId={word.dictionaryId}
          onSave={handleSave}
          onCancel={handleCancel}
          loading={saving}
        />
      )}
    </View>
  );
}
