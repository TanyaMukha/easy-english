import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '../../../styles/SharedStyles';

export default function EditWordsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { 
          backgroundColor: Colors.background 
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="[wordId]" 
        options={{
          title: 'Edit Word',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}