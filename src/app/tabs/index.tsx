import React, { useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { useTaskStore } from '../../store/taskStore';
import { useStatisticsStore } from '../../store/statisticsStore';
import { TaskCard } from '../../components/common/TaskCard';
import { StatisticsCard } from '../../components/common/StatisticsCard';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { FAB } from '../../components/ui/FAB';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';
import { getGreeting, getTodayFormatted } from '../../utils/dateUtils';
import { getCompletionPercentage } from '../../utils/taskUtils';
import { DUMMY_TASKS, SAMPLE_USER_ID } from '../../constants/dummyData';

export default function HomeScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { tasks, isLoading, subscribeToTasks, unsubscribeFromTasks, completeTask, deleteTask, archiveTask, loadCategories, createTask } = useTaskStore();
  const { statistics, computeStatistics } = useStatisticsStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const userId = user?.uid ?? SAMPLE_USER_ID;

  useEffect(() => {
    subscribeToTasks(userId);
    loadCategories(userId);
    return () => unsubscribeFromTasks();
  }, [userId]);

  const hasSeeded = React.useRef(false);
  // Seed sample data if no tasks exist
  useEffect(() => {
    // Only seed tasks for real users or local repo, not SAMPLE_USER_ID in Firebase
    if (!isLoading && tasks.length === 0 && !hasSeeded.current && userId !== SAMPLE_USER_ID) {
      hasSeeded.current = true;
      const seedTasks = async () => {
        try {
          for (const task of DUMMY_TASKS) {
            await createTask(userId, { ...task, userId });
          }
        } catch (error) {
          console.warn('Failed to seed tasks:', error);
        }
      };
      seedTasks();
    }
  }, [isLoading, tasks.length, userId]);

  useEffect(() => {
    computeStatistics(tasks);
  }, [tasks.length]);

  const todayTasks = useTaskStore.getState().getTodaysTasks();
  const upcomingTasks = useTaskStore.getState().getUpcomingTasks();
  const completedTasks = tasks.filter(t => t.completed);
  const activeTasks = tasks.filter(t => t.status !== 'archived');
  const pct = getCompletionPercentage(activeTasks);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await useTaskStore.getState().loadTasks(userId);
    setRefreshing(false);
  }, [userId]);

  const firstName = user?.displayName?.split(' ')[0] ?? 'there';

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.accent} />}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Header ── */}
        <Animated.View entering={FadeInDown.delay(0).springify()} style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 14, fontWeight: '500' }}>{getTodayFormatted()}</Text>
              <Text style={{ color: theme.colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.8, marginTop: 2 }}>
                {getGreeting()}, {firstName} 👋
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => router.push('/search')} style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="search" size={20} color={theme.colors.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/profile')} style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>{firstName[0]?.toUpperCase()}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* ── Progress Card ── */}
        <Animated.View entering={FadeInDown.delay(80).springify()} style={{ marginHorizontal: 20, backgroundColor: theme.colors.card, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 20 }}>
          <ProgressRing percentage={pct} size={100} strokeWidth={9} label="Done" color={theme.colors.accent} />
          <View style={{ flex: 1, gap: 12 }}>
            <View>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 0.5 }}>TODAY'S PROGRESS</Text>
              <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '800', marginTop: 4 }}>
                {completedTasks.length} of {activeTasks.length} tasks
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ backgroundColor: `${theme.colors.success}20`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                <Text style={{ color: theme.colors.success, fontSize: 12, fontWeight: '700' }}>
                  {statistics?.currentStreak ?? 0} day streak
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ── Stats Row ── */}
        <Animated.View entering={FadeInDown.delay(120).springify()} style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 24 }}>
          <StatisticsCard title="Completed" value={statistics?.completedTasks ?? 0} icon="checkmark-circle" color={theme.colors.success} />
          <StatisticsCard title="Pending" value={statistics?.pendingTasks ?? 0} icon="time" color={theme.colors.warning} />
          <StatisticsCard title="Overdue" value={statistics?.overdueTasks ?? 0} icon="alert-circle" color={theme.colors.error} />
        </Animated.View>

        {/* ── Today's Tasks ── */}
        <Animated.View entering={FadeInDown.delay(160).springify()} style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '800' }}>Today's Tasks</Text>
            <TouchableOpacity onPress={() => router.push('/search')}>
              <Text style={{ color: theme.colors.accent, fontSize: 13, fontWeight: '600' }}>See all</Text>
            </TouchableOpacity>
          </View>
          {isLoading ? <SkeletonLoader /> : todayTasks.length === 0 ? (
            <EmptyState icon="sunny" title="No tasks for today" subtitle="Tap + to add your first task!" actionLabel="Add Task" onAction={() => router.push('/tasks/create')} />
          ) : (
            todayTasks.slice(0, 5).map((task, i) => (
              <TaskCard key={task.id} task={task} index={i}
                onPress={() => router.push(`/tasks/${task.id}`)}
                onComplete={() => completeTask(userId, task.id)}
                onDelete={() => deleteTask(userId, task.id)}
                onArchive={() => archiveTask(userId, task.id)} />
            ))
          )}
        </Animated.View>

        {/* ── Upcoming ── */}
        {upcomingTasks.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).springify()} style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '800', marginBottom: 14 }}>Upcoming</Text>
            {upcomingTasks.slice(0, 3).map((task, i) => (
              <TaskCard key={task.id} task={task} index={i}
                onPress={() => router.push(`/tasks/${task.id}`)}
                onComplete={() => completeTask(userId, task.id)}
                onDelete={() => deleteTask(userId, task.id)}
                onArchive={() => archiveTask(userId, task.id)} />
            ))}
          </Animated.View>
        )}

        {/* ── Recently Completed ── */}
        {completedTasks.length > 0 && (
          <Animated.View entering={FadeInDown.delay(240).springify()} style={{ paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '800' }}>Recently Completed</Text>
              <TouchableOpacity onPress={() => router.push('/completed')}>
                <Text style={{ color: theme.colors.accent, fontSize: 13, fontWeight: '600' }}>See all</Text>
              </TouchableOpacity>
            </View>
            {completedTasks.slice(0, 3).map((task, i) => (
              <TaskCard key={task.id} task={task} index={i}
                onPress={() => router.push(`/tasks/${task.id}`)}
                onComplete={() => completeTask(userId, task.id)}
                onDelete={() => deleteTask(userId, task.id)}
                onArchive={() => archiveTask(userId, task.id)} />
            ))}
          </Animated.View>
        )}
      </ScrollView>

      {/* FAB */}
      <View style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 50 }}>
        <FAB onPress={() => router.push('/tasks/create')} />
      </View>
    </View>
  );
}
