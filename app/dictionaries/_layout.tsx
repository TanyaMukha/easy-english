import { Stack } from 'expo-router';
import { Colors } from '../../styles/GlobalStyles';

export default function DictionariesLayout() {
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
          title: 'Dictionaries',
        }}
      />
      <Stack.Screen 
        name="create" 
        options={{
          title: 'New Dictionary',
        }}
      />
      <Stack.Screen 
        name="[dictionaryId]" 
        options={{
          title: 'Dictionary',
        }}
      />
    </Stack>
  );
}