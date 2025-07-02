import { Stack } from 'expo-router';
import { Colors } from '../../styles/SharedStyles';

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
          title: 'Word Sets',
        }}
      />
      <Stack.Screen 
        name="create" 
        options={{
          title: 'New Set',
        }}
      />
      <Stack.Screen 
        name="[setId]" 
        options={{
          title: 'Set',
        }}
      />
    </Stack>
  );
}