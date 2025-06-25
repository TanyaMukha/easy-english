import { Stack } from 'expo-router';
import { Colors } from '../../../styles/GlobalStyles';

export default function ManageWordsLayout() {
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
      {/* Створення словника */}
      <Stack.Screen 
        name="create" 
        options={{
          title: 'Create Dictionary',
          presentation: 'modal', // Модальне вікно
        }}
      />
      
    </Stack>
  );
}