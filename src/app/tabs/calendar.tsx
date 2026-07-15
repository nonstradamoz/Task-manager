import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, addMonths, subMonths, isSameDay, isToday } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { useTaskStore } from '../../store/taskStore';
import { TaskCard } from '../../components/common/TaskCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { FAB } from '../../components/ui/FAB';
import { getCalendarGrid, formatMonthYear, formatDayOfWeek, formatDayNumber } from '../../utils/dateUtils';
import { SAMPLE_USER_ID } from '../../constants/dummyData';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CalendarScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { tasks, completeTask, deleteTask, archiveTask } = useTaskStore();
  const userId = user?.uid ?? SAMPLE_USER_ID;

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');

  const calendarGrid = useMemo(() => getCalendarGrid(currentMonth), [currentMonth]);

  // Dates that have tasks (for dot indicators)
  const taskDates = useMemo(() => {
    const dates = new Set<string>();
    tasks.forEach(t => {
      if (t.dueDate) dates.add(format(new Date(t.dueDate), 'yyyy-MM-dd'));
    });
    return dates;
  }, [tasks]);

  // Tasks for selected date
  const selectedDateTasks = useMemo(() => {
    return tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), selectedDate));
  }, [tasks, selectedDate]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header */}
        <Animated.View entering={FadeInDown.delay(0).springify()} style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 16 }}>
          <Text style={{ color: theme.colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.8 }}>Calendar</Text>

          {/* View Mode Toggle */}
          <View style={{ flexDirection: 'row', backgroundColor: theme.colors.card, borderRadius: 12, padding: 4, marginTop: 12, borderWidth: 1, borderColor: theme.colors.border }}>
            {(['month', 'agenda'] as const).map(mode => (
              <TouchableOpacity key={mode} onPress={() => setViewMode(mode)} style={{ flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center', backgroundColor: viewMode === mode ? theme.colors.accent : 'transparent' }}>
                <Text style={{ color: viewMode === mode ? '#fff' : theme.colors.textSecondary, fontSize: 13, fontWeight: '600', textTransform: 'capitalize' }}>{mode}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Month Navigator */}
        <Animated.View entering={FadeInDown.delay(60).springify()} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 }}>
          <TouchableOpacity onPress={() => setCurrentMonth(m => subMonths(m, 1))} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border }}>
            <Ionicons name="chevron-back" size={18} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={{ flex: 1, textAlign: 'center', color: theme.colors.text, fontSize: 18, fontWeight: '800' }}>
            {formatMonthYear(currentMonth)}
          </Text>
          <TouchableOpacity onPress={() => setCurrentMonth(m => addMonths(m, 1))} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border }}>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.text} />
          </TouchableOpacity>
        </Animated.View>

        {/* Calendar Grid */}
        {viewMode === 'month' && (
          <Animated.View entering={FadeInDown.delay(100).springify()} style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            {/* Weekday headers */}
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              {WEEKDAYS.map(d => (
                <Text key={d} style={{ flex: 1, textAlign: 'center', color: theme.colors.textMuted, fontSize: 12, fontWeight: '600' }}>{d}</Text>
              ))}
            </View>

            {/* Days grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {calendarGrid.map((date, i) => {
                if (!date) return <View key={`empty-${i}`} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />;

                const dateStr = format(date, 'yyyy-MM-dd');
                const hasTasks = taskDates.has(dateStr);
                const isSelected = isSameDay(date, selectedDate);
                const isTodayDate = isToday(date);

                return (
                  <TouchableOpacity
                    key={dateStr}
                    onPress={() => setSelectedDate(date)}
                    style={{ width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', padding: 4 }}
                  >
                    <View style={{
                      width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
                      backgroundColor: isSelected ? theme.colors.accent : isTodayDate ? `${theme.colors.accent}25` : 'transparent',
                    }}>
                      <Text style={{
                        color: isSelected ? '#fff' : isTodayDate ? theme.colors.accent : theme.colors.text,
                        fontSize: 14, fontWeight: isSelected || isTodayDate ? '700' : '400',
                      }}>
                        {format(date, 'd')}
                      </Text>
                    </View>
                    {hasTasks && (
                      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: isSelected ? '#ffffff88' : theme.colors.accent, marginTop: 2 }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* Selected Date Tasks */}
        <Animated.View entering={FadeInDown.delay(140).springify()} style={{ paddingHorizontal: 20 }}>
          <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '800', marginBottom: 14 }}>
            {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE, MMMM d')}
            <Text style={{ color: theme.colors.textMuted, fontSize: 14, fontWeight: '400' }}>  {selectedDateTasks.length} tasks</Text>
          </Text>

          {selectedDateTasks.length === 0 ? (
            <EmptyState icon="calendar-outline" title="No tasks this day" subtitle="Tap + to add a task for this date" actionLabel="Add Task" onAction={() => router.push('/tasks/create')} />
          ) : (
            selectedDateTasks.map((task, i) => (
              <TaskCard key={task.id} task={task} index={i}
                onPress={() => router.push(`/tasks/${task.id}`)}
                onComplete={() => completeTask(userId, task.id)}
                onDelete={() => deleteTask(userId, task.id)}
                onArchive={() => archiveTask(userId, task.id)} />
            ))
          )}
        </Animated.View>
      </ScrollView>

      <View style={{ position: 'absolute', bottom: insets.bottom + 80, right: 20 }}>
        <FAB onPress={() => router.push('/tasks/create')} />
      </View>
    </View>
  );
}
