import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

export default function AboutScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border }}>
          <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={{ flex: 1, color: theme.colors.text, fontSize: 22, fontWeight: '800' }}>About BioTasks</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
        <Animated.View entering={FadeInDown.delay(0).springify()} style={{ alignItems: 'center', marginVertical: 32 }}>
          <View style={{ width: 90, height: 90, borderRadius: 24, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center', shadowColor: theme.colors.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 10, marginBottom: 20 }}>
            <Ionicons name="checkmark-done" size={48} color="#fff" />
          </View>
          <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 }}>BioTasks</Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 15, marginTop: 4 }}>Version 1.0.0</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()} style={{ gap: 20 }}>
          <View style={{ backgroundColor: theme.colors.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: theme.colors.border }}>
            <Text style={{ color: theme.colors.text, fontSize: 16, lineHeight: 24, textAlign: 'center' }}>
              BioTasks is a modern, premium task management application designed to boost your productivity with an elegant and intuitive interface.
            </Text>
          </View>

          <View style={{ backgroundColor: theme.colors.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: theme.colors.border, gap: 16 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' }}>Features</Text>
            <View style={{ gap: 12 }}>
              {(['Cross-platform support (iOS & Android)', 'Beautiful Dark & Light Modes', 'Firebase Cloud Sync', 'Advanced Statistics & Progress Tracking', 'Customizable Accent Colors']).map((f, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
                  <Text style={{ color: theme.colors.text, fontSize: 15 }}>{f}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>Developed by nonstradamoz</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 13, marginTop: 4 }}>© 2026 BioTasks</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
