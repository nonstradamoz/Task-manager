import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../contexts/ThemeContext';
import { getData } from '../storage/asyncStorage';
import { STORAGE_KEYS } from '../constants';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { theme } = useTheme();
  const [onboardingComplete, setOnboardingComplete] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    getData<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETE).then(val => {
      setOnboardingComplete(val ?? false);
    });
  }, []);

  if (isLoading || onboardingComplete === null) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: theme.colors.text, fontSize: 20 }}>Debug State:</Text>
        <Text style={{ color: theme.colors.text }}>isLoading: {String(isLoading)}</Text>
        <Text style={{ color: theme.colors.text }}>onboardingComplete: {String(onboardingComplete)}</Text>
      </View>
    );
  }

  if (!onboardingComplete) return <Redirect href="/onboarding" />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  return <Redirect href="/tabs" />;
}
