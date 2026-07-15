import React, { useState } from 'react';
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

const schema = z.object({ email: z.string().email('Enter a valid email') });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { sendPasswordReset, isLoading, error, clearError } = useAuthStore();
  const [sent, setSent] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    clearError();
    try {
      await sendPasswordReset(data.email);
      setSent(true);
    } catch {}
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 32 }} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 32 }}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        {sent ? (
          <Animated.View entering={FadeInDown.springify()} style={{ alignItems: 'center', paddingTop: 60, gap: 20 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: `${theme.colors.success}20`, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="mail-open" size={40} color={theme.colors.success} />
            </View>
            <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '800', textAlign: 'center' }}>Check your inbox!</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22 }}>We've sent a password reset link to your email.</Text>
            <Button title="Back to Login" onPress={() => router.replace('/(auth)/login')} size="lg" fullWidth />
          </Animated.View>
        ) : (
          <>
            <Animated.View entering={FadeInDown.delay(0).springify()} style={{ marginBottom: 36 }}>
              <Text style={{ color: theme.colors.text, fontSize: 30, fontWeight: '800', letterSpacing: -1, marginBottom: 8 }}>Reset Password</Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 15, lineHeight: 22 }}>Enter your email and we'll send you a reset link.</Text>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(100).springify()} style={{ gap: 16 }}>
              <Controller control={control} name="email" render={({ field: { onChange, value, onBlur, ref } }) => (
                <Input ref={ref} label="Email" leftIcon="mail-outline" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.email?.message} />
              )} />
              {error && (
                <View style={{ backgroundColor: `${theme.colors.error}15`, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: `${theme.colors.error}40` }}>
                  <Text style={{ color: theme.colors.error, fontSize: 13 }}>{error}</Text>
                </View>
              )}
              <Button title="Send Reset Link" onPress={handleSubmit(onSubmit)} isLoading={isLoading} fullWidth size="lg" style={{ marginTop: 8 }} />
            </Animated.View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
