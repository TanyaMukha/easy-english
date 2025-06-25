// app/dictionaries/create.tsx
import React from 'react';
import { View, Alert } from 'react-native';
import { router } from 'expo-router';
import { GlobalStyles } from '../../styles/GlobalStyles';
import { Dictionary } from '../../data/DataModels';

// Components
import ScreenHeader from '../../components/ScreenHeader';
import DictionaryForm from '../../components/DictionaryForm';

/**
 * Screen for creating new dictionaries
 * Single Responsibility: Handle dictionary creation flow
 */
export default function CreateDictionaryScreen() {
  const handleSave = (dictionary: Dictionary) => {
    console.log('Dictionary created:', dictionary);
    
    // Show success message
    Alert.alert(
      'Success',
      `Dictionary "${dictionary.title}" has been created successfully!`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Navigate back to dictionaries list
            router.back();
          }
        }
      ]
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
      <DictionaryForm
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </View>
  );
}