import { Stack } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';

export default function ChatLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Chats',
          headerShown: false // We will render our own custom header in index
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Chat',
          headerBackTitle: 'Back'
        }} 
      />
      <Stack.Screen 
        name="new" 
        options={{ 
          title: 'New Chat',
          presentation: 'modal',
          headerBackTitle: 'Cancel'
        }} 
      />
    </Stack>
  );
}
