import { Stack } from 'expo-router';
import { Colors } from '../../../styles/SharedStyles';

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
          title: 'Word set',
        }}
      />
      <Stack.Screen 
        name="add-word" 
        options={{
          title: 'Add words to set',
        }}
      />
    </Stack>
  );
}