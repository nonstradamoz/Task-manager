import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { useTaskStore } from '../../store/taskStore';
import { Task } from '../../types/task';
import { formatDate, formatTime, formatDuration } from '../../utils/dateUtils';
import { getPriorityColor, getPriorityLabel } from '../../utils/taskUtils';
import { Button } from '../../components/ui/Button';
import { SAMPLE_USER_ID } from '../../constants/dummyData';

export default function TaskDetailScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { tasks, completeTask, deleteTask, archiveTask, updateTask } = useTaskStore();
  const userId = user?.uid ?? SAMPLE_USER_ID;

  const task = tasks.find(t => t.id === id);

  if (!task) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 16 }}>Task not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: theme.colors.accent, fontSize: 15, fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const priorityColor = getPriorityColor(task.priority);

  async function handleDelete() {
    if (!task) return;
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await deleteTask(userId, task!.id);
          router.back();
        },
      },
    ]);
  }

  async function handleArchive() {
    if (!task) return;
    await archiveTask(userId, task.id);
    router.back();
  }

  async function handleToggleFavorite() {
    if (!task) return;
    await updateTask(userId, task.id, { isFavorite: !task.isFavorite });
  }

  async function handleComplete() {
    if (!task) return;
    await completeTask(userId, task.id);
    router.back();
  }

  function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }}>
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${theme.colors.accent}15`, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon} size={16} color={theme.colors.accent} />
        </View>
        <View>
          <Text style={{ color: theme.colors.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 0.3 }}>{label.toUpperCase()}</Text>
          <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '500', marginTop: 2 }}>{value}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Priority header bar */}
        <View style={{ height: 4, backgroundColor: priorityColor }} />

        {/* Navigation */}
        <Animated.View entering={FadeInDown.delay(0).springify()} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: insets.top + 12, paddingBottom: 16 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border }}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={handleToggleFavorite} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border }}>
              <Ionicons name={task.isFavorite ? 'star' : 'star-outline'} size={18} color={task.isFavorite ? '#f59e0b' : theme.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push(`/tasks/edit/${task.id}`)} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border }}>
              <Ionicons name="pencil" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={{ paddingHorizontal: 20 }}>
          {/* Title & Status */}
          <Animated.View entering={FadeInDown.delay(60).springify()} style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: task.color, marginTop: 8 }} />
              <Text style={{ flex: 1, color: task.completed ? theme.colors.textMuted : theme.colors.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.6, textDecorationLine: task.completed ? 'line-through' : 'none', lineHeight: 32 }}>
                {task.title}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <View style={{ backgroundColor: `${priorityColor}20`, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 }}>
                <Text style={{ color: priorityColor, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {getPriorityLabel(task.priority)}
                </Text>
              </View>
              {task.completed && (
                <View style={{ backgroundColor: `${theme.colors.success}20`, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 }}>
                  <Text style={{ color: theme.colors.success, fontSize: 12, fontWeight: '700' }}>✓ Completed</Text>
                </View>
              )}
              {task.tags.map(tag => (
                <View key={tag} style={{ backgroundColor: theme.colors.border, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>#{tag}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Description */}
          {task.description && (
            <Animated.View entering={FadeInDown.delay(100).springify()} style={{ backgroundColor: theme.colors.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border }}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 0.3, marginBottom: 8 }}>DESCRIPTION</Text>
              <Text style={{ color: theme.colors.text, fontSize: 15, lineHeight: 23 }}>{task.description}</Text>
            </Animated.View>
          )}

          {/* Details */}
          <Animated.View entering={FadeInDown.delay(140).springify()} style={{ backgroundColor: theme.colors.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 0.3, marginBottom: 4 }}>DETAILS</Text>
            <InfoRow icon="calendar-outline" label="Due Date" value={task.dueDate ? formatDate(task.dueDate) : 'No due date'} />
            {task.dueTime && <><View style={{ height: 1, backgroundColor: theme.colors.border }} /><InfoRow icon="time-outline" label="Due Time" value={task.dueTime} /></>}
            <View style={{ height: 1, backgroundColor: theme.colors.border }} />
            <InfoRow icon="folder-outline" label="Category" value={task.category} />
            <View style={{ height: 1, backgroundColor: theme.colors.border }} />
            <InfoRow icon="repeat-outline" label="Repeat" value={task.repeat === 'none' ? 'No repeat' : task.repeat} />
            {task.estimatedTime && <><View style={{ height: 1, backgroundColor: theme.colors.border }} /><InfoRow icon="timer-outline" label="Estimated Time" value={formatDuration(task.estimatedTime)} /></>}
            <View style={{ height: 1, backgroundColor: theme.colors.border }} />
            <InfoRow icon="create-outline" label="Created" value={formatDate(task.createdAt)} />
          </Animated.View>

          {/* Notes */}
          {task.notes && (
            <Animated.View entering={FadeInDown.delay(180).springify()} style={{ backgroundColor: theme.colors.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border }}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 0.3, marginBottom: 8 }}>NOTES</Text>
              <Text style={{ color: theme.colors.text, fontSize: 15, lineHeight: 23 }}>{task.notes}</Text>
            </Animated.View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <Animated.View entering={FadeInDown.delay(0).springify()} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: insets.bottom + 16, backgroundColor: theme.colors.background, borderTopWidth: 1, borderTopColor: theme.colors.border, gap: 10 }}>
        {!task.completed && (
          <Button title="Mark as Complete ✓" onPress={handleComplete} size="lg" fullWidth />
        )}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button title="Archive" onPress={handleArchive} variant="secondary" size="md" style={{ flex: 1 }} />
          <Button title="Delete" onPress={handleDelete} variant="danger" size="md" style={{ flex: 1 }} />
        </View>
      </Animated.View>
    </View>
  );
}
