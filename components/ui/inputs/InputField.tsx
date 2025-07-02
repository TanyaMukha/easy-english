// components/ui/InputField.tsx
import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

import {
  Colors,
  SharedStyles,
  Spacing,
  Typography,
} from "../../../services/database/styles/SharedStyles";

interface InputFieldProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  rightElement?: React.ReactNode;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Reusable input field component with label and optional right element
 * Single Responsibility: Provide consistent input field styling and behavior
 */
const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  rightElement,
  error,
  required = false,
  disabled = false,
  multiline = false,
  ...textInputProps
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            multiline ? SharedStyles.inputMultiline : SharedStyles.input,
            styles.input,
            rightElement && styles.inputWithRightElement as any,
            error && styles.inputError,
            disabled && styles.inputDisabled,
          ]}
          value={value}
          onChangeText={onChangeText}
          editable={!disabled}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          placeholderTextColor={Colors.inputPlaceholder}
          autoCapitalize="none"
          autoCorrect={false}
          {...textInputProps}
        />

        {rightElement && (
          <View style={styles.rightElement}>{rightElement}</View>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = {
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.weightMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  required: {
    color: Colors.error,
  },
  inputContainer: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
  },
  input: {
    flex: 1,
    marginBottom: 0,
  },
  inputWithRightElement: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 0,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorBg,
  },
  inputDisabled: {
    backgroundColor: Colors.backgroundSecondary,
    color: Colors.textDisabled,
    opacity: 0.6,
  },
  rightElement: {
    marginLeft: -1, // Remove border gap
  },
  errorText: {
    fontSize: Typography.bodySmall,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
};

export default InputField;
