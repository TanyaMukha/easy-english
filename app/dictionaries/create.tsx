import { Alert, View } from "react-native";
import { router } from "expo-router";

import { DictionaryForm } from "../../components/forms";
import { ScreenHeader } from "../../components/ui";
import { Dictionary } from "../../data/DataModels";
import { GlobalStyles } from "../../styles/GlobalStyles";

/**
 * Screen for creating new dictionaries
 * Single Responsibility: Handle dictionary creation flow
 */
export default function CreateDictionaryScreen() {
  const handleSave = (dictionary: Dictionary) => {
    console.log("Dictionary created:", dictionary);

    // Show success message
    Alert.alert(
      "Success",
      `Dictionary "${dictionary.title}" has been created successfully!`,
      [
        {
          text: "OK",
          onPress: () => {
            // Navigate back to dictionaries list
            router.back();
          },
        },
      ],
    );
  };

  const handleCancel = () => {
    router.back();
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <View style={GlobalStyles.container}>
      {/* Header */}
      <ScreenHeader
        title="New Dictionary"
        subtitle="Create a vocabulary collection"
        showBackButton={true}
        onBackPress={handleBackPress}
      />

      {/* Form */}
      <DictionaryForm onSave={handleSave} onCancel={handleCancel} />
    </View>
  );
}
