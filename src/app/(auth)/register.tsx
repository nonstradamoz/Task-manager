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
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });
type FormData = z.infer<typeof schema>;

export default function RegisterScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { register, isLoading, error, clearError } = useAuthStore();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    clearError();
    try {
      await register(data.email, data.password, data.displayName);
      router.replace('/tabs');
    } catch {}
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 32 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 24 }}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Animated.View entering={FadeInDown.delay(0).springify()} style={{ marginBottom: 36 }}>
          <Text style={{ color: theme.colors.text, fontSize: 32, fontWeight: '800', letterSpacing: -1, marginBottom: 8 }}>Create Account</Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 16 }}>Join BioTasks and boost your productivity</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()} style={{ gap: 16 }}>
          <Controller control={control} name="displayName" render={({ field: { onChange, value, onBlur, ref } }) => (
            <Input ref={ref} label="Full Name" leftIcon="person-outline" placeholder="Your name" autoCapitalize="words" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.displayName?.message} />
          )} />
          <Controller control={control} name="email" render={({ field: { onChange, value, onBlur, ref } }) => (
            <Input ref={ref} label="Email" leftIcon="mail-outline" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.email?.message} />
          )} />
          <Controller control={control} name="password" render={({ field: { onChange, value, onBlur, ref } }) => (
            <Input ref={ref} label="Password" leftIcon="lock-closed-outline" placeholder="At least 6 characters" isPassword value={value} onChangeText={onChange} onBlur={onBlur} error={errors.password?.message} />
          )} />
          <Controller control={control} name="confirmPassword" render={({ field: { onChange, value, onBlur, ref } }) => (
            <Input ref={ref} label="Confirm Password" leftIcon="lock-closed-outline" placeholder="Repeat password" isPassword value={value} onChangeText={onChange} onBlur={onBlur} error={errors.confirmPassword?.message} />
          )} />

          {error && (
            <View style={{ backgroundColor: `${theme.colors.error}15`, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: `${theme.colors.error}40` }}>
              <Text style={{ color: theme.colors.error, fontSize: 13 }}>{error}</Text>
            </View>
          )}

          <Button title="Create Account" onPress={handleSubmit(onSubmit)} isLoading={isLoading} fullWidth size="lg" style={{ marginTop: 8 }} />

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 15 }}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={{ color: theme.colors.accent, fontSize: 15, fontWeight: '700' }}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
