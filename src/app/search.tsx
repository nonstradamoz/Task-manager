import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';
import { SearchBar } from '../components/common/SearchBar';
import { TaskCard } from '../components/common/TaskCard';
import { EmptyState } from '../components/ui/EmptyState';
import { SAMPLE_USER_ID } from '../constants/dummyData';

export default function SearchScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { tasks, completeTask, deleteTask, archiveTask } = useTaskStore();
  const userId = user?.uid ?? SAMPLE_USER_ID;

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'archived'>('all');

  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Filter by status
    if (filter === 'active') result = result.filter(t => !t.completed && t.status !== 'archived');
    else if (filter === 'completed') result = result.filter(t => t.completed && t.status !== 'archived');
    else if (filter === 'archived') result = result.filter(t => t.status === 'archived');
    else result = result.filter(t => t.status !== 'archived'); // all non-archived

    // Search query
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tasks, query, filter]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 16, gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border }}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search tasks, tags..." />
        </View>

        {/* Filters */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['all', 'active', 'completed', 'archived'] as const).map(f => (
            <TouchableOpacity key={f} onPress={() => setFilter(f)} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: filter === f ? theme.colors.accent : theme.colors.card, borderWidth: 1, borderColor: filter === f ? theme.colors.accent : theme.colors.border }}>
              <Text style={{ color: filter === f ? '#fff' : theme.colors.textSecondary, fontSize: 13, fontWeight: '600', textTransform: 'capitalize' }}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {filteredTasks.length === 0 ? (
          <EmptyState
            icon="search-outline"
            title={query ? 'No results found' : `No ${filter} tasks`}
            subtitle={query ? 'Try adjusting your search or filters.' : 'You don\'t have any tasks matching this filter.'}
          />
        ) : (
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text style={{ color: theme.colors.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 12, marginLeft: 4 }}>
              {filteredTasks.length} {filteredTasks.length === 1 ? 'result' : 'results'}
            </Text>
            {filteredTasks.map((task, i) => (
              <TaskCard
                key={task.id} task={task} index={i}
                onPress={() => router.push(`/tasks/${task.id}`)}
                onComplete={() => completeTask(userId, task.id)}
                onDelete={() => deleteTask(userId, task.id)}
                onArchive={() => archiveTask(userId, task.id)}
              />
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}
