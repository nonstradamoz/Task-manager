import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';
import { DEFAULT_CATEGORIES } from '../constants';
import { EmptyState } from '../components/ui/EmptyState';
import { FAB } from '../components/ui/FAB';

export default function CategoriesScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { categories, tasks } = useTaskStore();

  const allCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES.map(c => ({ ...c, createdAt: new Date() }));

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border }}>
          <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={{ flex: 1, color: theme.colors.text, fontSize: 22, fontWeight: '800' }}>Categories</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, gap: 12 }}>
        {allCategories.length === 0 ? (
          <EmptyState icon="folder-open-outline" title="No Categories" subtitle="You haven't created any custom categories yet." />
        ) : (
          allCategories.map((category, index) => {
            const categoryTasks = tasks.filter(t => t.category === category.id && t.status !== 'archived');
            return (
              <Animated.View key={category.id} entering={FadeInDown.delay(index * 60).springify()}>
                <TouchableOpacity style={{ backgroundColor: theme.colors.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: `${category.color}20`, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={category.icon as any} size={24} color={category.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: '700' }}>{category.name}</Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 13, marginTop: 2 }}>{categoryTasks.length} {categoryTasks.length === 1 ? 'task' : 'tasks'}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </Animated.View>
            );
          })
        )}
      </ScrollView>

      <View style={{ position: 'absolute', bottom: insets.bottom + 20, right: 20 }}>
        <FAB onPress={() => {}} icon="add" />
      </View>
    </View>
  );
}
