import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { login, isLoading, error, clearError } = useAuthStore();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    clearError();
    try {
      await login(data.email, data.password);
      router.replace('/tabs');
    } catch {}
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Logo */}
        <Animated.View entering={FadeInDown.delay(0).springify()} style={{ marginBottom: 48 }}>
          <View style={{ width: 72, height: 72, borderRadius: 22, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 24, shadowColor: theme.colors.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 }}>
            <Ionicons name="checkmark-done" size={36} color="#fff" />
          </View>
          <Text style={{ color: theme.colors.text, fontSize: 32, fontWeight: '800', letterSpacing: -1, marginBottom: 8 }}>
            Welcome back 👋
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 16 }}>
            Sign in to continue to BioTasks
          </Text>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={{ gap: 16 }}>
          <Controller control={control} name="email" render={({ field: { onChange, value, onBlur, ref } }) => (
            <Input ref={ref} label="Email" leftIcon="mail-outline" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.email?.message} />
          )} />

          <Controller control={control} name="password" render={({ field: { onChange, value, onBlur, ref } }) => (
            <Input ref={ref} label="Password" leftIcon="lock-closed-outline" placeholder="Enter your password" isPassword value={value} onChangeText={onChange} onBlur={onBlur} error={errors.password?.message} />
          )} />

          {error && (
            <View style={{ backgroundColor: `${theme.colors.error}15`, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: `${theme.colors.error}40` }}>
              <Text style={{ color: theme.colors.error, fontSize: 13 }}>{error}</Text>
            </View>
          )}

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={{ alignSelf: 'flex-end' }}>
            <Text style={{ color: theme.colors.accent, fontSize: 14, fontWeight: '600' }}>Forgot password?</Text>
          </TouchableOpacity>

          <Button title="Sign In" onPress={handleSubmit(onSubmit)} isLoading={isLoading} fullWidth size="lg" style={{ marginTop: 8 }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 8 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
            <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>or</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 15 }}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={{ color: theme.colors.accent, fontSize: 15, fontWeight: '700' }}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
