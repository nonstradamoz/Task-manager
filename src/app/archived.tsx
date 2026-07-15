import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';
import { TaskCard } from '../components/common/TaskCard';
import { EmptyState } from '../components/ui/EmptyState';
import { SAMPLE_USER_ID } from '../constants/dummyData';

export default function ArchivedTasksScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { tasks, completeTask, deleteTask, archiveTask } = useTaskStore();
  const userId = user?.uid ?? SAMPLE_USER_ID;

  const archivedTasks = tasks.filter(t => t.status === 'archived').sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border }}>
          <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={{ flex: 1, color: theme.colors.text, fontSize: 22, fontWeight: '800' }}>Archived Tasks</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {archivedTasks.length === 0 ? (
          <EmptyState icon="archive-outline" title="No Archived Tasks" subtitle="Tasks you archive will appear here." />
        ) : (
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text style={{ color: theme.colors.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 12, marginLeft: 4 }}>
              {archivedTasks.length} {archivedTasks.length === 1 ? 'task' : 'tasks'}
            </Text>
            {archivedTasks.map((task, i) => (
              <TaskCard
                key={task.id} task={task} index={i}
                onPress={() => router.push(`/tasks/${task.id}`)}
                onComplete={() => completeTask(userId, task.id)}
                onDelete={() => deleteTask(userId, task.id)}
                onArchive={() => archiveTask(userId, task.id)} // Could act as unarchive
              />
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}
