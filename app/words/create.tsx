import { useState } from "react";
import { Alert, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { UpdatedWordForm } from "../../components/forms";
import { ScreenHeader } from "../../components/ui";
import { WordWithExamples } from "../../data/DataModels";
import { wordService } from "../../services/database";
import { SharedStyles } from "../../services/database/styles/SharedStyles";
import guid, { generateGuid } from "utils/guid";

export default function CreateWordScreen() {
  const { dictionaryId } = useLocalSearchParams<{ dictionaryId?: string }>();
  const [loading, setLoading] = useState(false);

  const targetDictionaryId = dictionaryId ? parseInt(dictionaryId, 10) : 1;

  const handleSave = async (wordData: WordWithExamples) => {
    setLoading(true);

    try {
      // Convert WordWithExamples to CreateWordRequest format
      const createRequest = {
        word: wordData.word,
        guid: generateGuid(),
        transcription: wordData.transcription ?? "",
        translation: wordData.translation || "",
        explanation: wordData.explanation ?? "",
        definition: wordData.definition ?? "",
        partOfSpeech: wordData.partOfSpeech,
        language: wordData.language,
        level: wordData.level,
        isIrregular: wordData.isIrregular,
        dictionaryId: targetDictionaryId,
        examples: wordData.examples?.map((ex) => ({
          guid: ex.guid || generateGuid(),
          sentence: ex.sentence,
          translation: ex.translation ?? "",
        })),
      };

      const response = await wordService.createWord(createRequest);

      if (response.success && response.data) {
        Alert.alert(
          "Success",
          `Word "${response.data?.[0]?.word}" has been created successfully!`,
          [
            {
              text: "Add Another",
              style: "default",
              onPress: () => {
                router.replace(
                  `/words/create?dictionaryId=${targetDictionaryId}`,
                );
              },
            },
            {
              text: "View Word",
              style: "default",
              onPress: () => {
                router.replace(`/words/${response.data?.[0]?.id}`);
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
        Alert.alert("Error", response.error || "Failed to create word");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create word. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <View style={SharedStyles.container}>
      <ScreenHeader
        title="Add New Word"
        subtitle="Build your vocabulary"
        showBackButton={true}
        onBackPress={handleBackPress}
      />

      <UpdatedWordForm
        dictionaryId={targetDictionaryId}
        onSave={handleSave}
        onCancel={handleCancel}
        loading={loading}
      />
    </View>
  );
}
