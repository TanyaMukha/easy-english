import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '../../styles/SharedStyles';

export default function WordsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Using custom headers
        contentStyle: { 
          backgroundColor: Colors.background 
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          title: 'All Words',
        }}
      />
      <Stack.Screen 
        name="[wordId]" 
        options={{
          title: 'Word Details',
        }}
      />
      <Stack.Screen 
        name="create" 
        options={{
          title: 'Add Word',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="edit"
        options={{
          title: 'Edit Word',
        }}
      />
    </Stack>
  );
}