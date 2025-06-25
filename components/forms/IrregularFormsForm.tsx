// components/IrregularFormsForm.tsx
import React from "react";
import { Text, TextInput, View } from "react-native";

import { PartOfSpeech } from "../../data/DataModels";
import {
  BorderRadius,
  Colors,
  GlobalStyles,
  Spacing,
  Typography,
} from "../../styles/GlobalStyles";

interface IrregularForms {
  // For verbs: base, past, pastParticiple
  base?: string;
  past?: string;
  pastParticiple?: string;

  // For nouns: singular, plural
  singular?: string;
  plural?: string;

  // For adjectives/adverbs: positive, comparative, superlative
  positive?: string;
  comparative?: string;
  superlative?: string;
}

interface IrregularFormsFormProps {
  partOfSpeech: PartOfSpeech;
  irregularForms: IrregularForms | null;
  isIrregular: boolean;
  setIrregularForms: (forms: IrregularForms | null) => void;
}

/**
 * Form component for irregular word forms
 * Single Responsibility: Handle irregular forms input based on part of speech
 */
const IrregularFormsForm: React.FC<IrregularFormsFormProps> = ({
  partOfSpeech,
  irregularForms,
  isIrregular,
  setIrregularForms,
}) => {
  if (!isIrregular) {
    return null;
  }

  const updateForm = (field: keyof IrregularForms, value: string) => {
    setIrregularForms({
      ...irregularForms,
      [field]: value,
    });
  };

  const renderVerbForms = () => (
    <View style={styles.container}>
      <Text style={[GlobalStyles.h5, GlobalStyles.textPrimary, styles.title]}>
        Irregular Verb Forms
      </Text>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Base Form</Text>
        <TextInput
          style={[GlobalStyles.input, styles.input]}
          value={irregularForms?.base || ""}
          onChangeText={(text) => updateForm("base", text)}
          placeholder="e.g., go"
          placeholderTextColor={Colors.inputPlaceholder}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Past Simple</Text>
        <TextInput
          style={[GlobalStyles.input, styles.input]}
          value={irregularForms?.past || ""}
          onChangeText={(text) => updateForm("past", text)}
          placeholder="e.g., went"
          placeholderTextColor={Colors.inputPlaceholder}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Past Participle</Text>
        <TextInput
          style={[GlobalStyles.input, styles.input]}
          value={irregularForms?.pastParticiple || ""}
          onChangeText={(text) => updateForm("pastParticiple", text)}
          placeholder="e.g., gone"
          placeholderTextColor={Colors.inputPlaceholder}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  );

  const renderNounForms = () => (
    <View style={styles.container}>
      <Text style={[GlobalStyles.h5, GlobalStyles.textPrimary, styles.title]}>
        Irregular Noun Forms
      </Text>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Singular</Text>
        <TextInput
          style={[GlobalStyles.input, styles.input]}
          value={irregularForms?.singular || ""}
          onChangeText={(text) => updateForm("singular", text)}
          placeholder="e.g., child"
          placeholderTextColor={Colors.inputPlaceholder}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Plural</Text>
        <TextInput
          style={[GlobalStyles.input, styles.input]}
          value={irregularForms?.plural || ""}
          onChangeText={(text) => updateForm("plural", text)}
          placeholder="e.g., children"
          placeholderTextColor={Colors.inputPlaceholder}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  );

  const renderAdjectiveForms = () => (
    <View style={styles.container}>
      <Text style={[GlobalStyles.h5, GlobalStyles.textPrimary, styles.title]}>
        Irregular Adjective Forms
      </Text>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Positive</Text>
        <TextInput
          style={[GlobalStyles.input, styles.input]}
          value={irregularForms?.positive || ""}
          onChangeText={(text) => updateForm("positive", text)}
          placeholder="e.g., good"
          placeholderTextColor={Colors.inputPlaceholder}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Comparative</Text>
        <TextInput
          style={[GlobalStyles.input, styles.input]}
          value={irregularForms?.comparative || ""}
          onChangeText={(text) => updateForm("comparative", text)}
          placeholder="e.g., better"
          placeholderTextColor={Colors.inputPlaceholder}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Superlative</Text>
        <TextInput
          style={[GlobalStyles.input, styles.input]}
          value={irregularForms?.superlative || ""}
          onChangeText={(text) => updateForm("superlative", text)}
          placeholder="e.g., best"
          placeholderTextColor={Colors.inputPlaceholder}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  );

  const renderAdverbForms = () => (
    <View style={styles.container}>
      <Text style={[GlobalStyles.h5, GlobalStyles.textPrimary, styles.title]}>
        Irregular Adverb Forms
      </Text>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Positive</Text>
        <TextInput
          style={[GlobalStyles.input, styles.input]}
          value={irregularForms?.positive || ""}
          onChangeText={(text) => updateForm("positive", text)}
          placeholder="e.g., well"
          placeholderTextColor={Colors.inputPlaceholder}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Comparative</Text>
        <TextInput
          style={[GlobalStyles.input, styles.input]}
          value={irregularForms?.comparative || ""}
          onChangeText={(text) => updateForm("comparative", text)}
          placeholder="e.g., better"
          placeholderTextColor={Colors.inputPlaceholder}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Superlative</Text>
        <TextInput
          style={[GlobalStyles.input, styles.input]}
          value={irregularForms?.superlative || ""}
          onChangeText={(text) => updateForm("superlative", text)}
          placeholder="e.g., best"
          placeholderTextColor={Colors.inputPlaceholder}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  );

  // Render appropriate form based on part of speech
  switch (partOfSpeech) {
    case PartOfSpeech.VERB:
    case PartOfSpeech.PHRASAL_VERB:
      return renderVerbForms();

    case PartOfSpeech.NOUN:
      return renderNounForms();

    case PartOfSpeech.ADJECTIVE:
      return renderAdjectiveForms();

    case PartOfSpeech.ADVERB:
      return renderAdverbForms();

    default:
      return (
        <View style={styles.container}>
          <Text
            style={[
              GlobalStyles.bodyMedium,
              GlobalStyles.textSecondary,
              styles.noFormsText,
            ]}
          >
            No irregular forms available for this part of speech.
          </Text>
        </View>
      );
  }
};

const styles = {
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    marginBottom: Spacing.lg,
    fontWeight: Typography.weightSemiBold,
  },
  fieldContainer: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.weightMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  input: {
    marginBottom: 0,
  },
  noFormsText: {
    textAlign: "center" as const,
    fontStyle: "italic" as const,
  },
};

export default IrregularFormsForm;
