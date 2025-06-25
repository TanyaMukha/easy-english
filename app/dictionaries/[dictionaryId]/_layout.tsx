import { Stack } from 'expo-router';
import { Colors } from '../../../styles/GlobalStyles';

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
      {/* Редагування конкретного слова */}
      <Stack.Screen 
        name="index" 
        options={{
          title: 'View Dictionary',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}