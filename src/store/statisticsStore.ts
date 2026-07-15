import { create } from 'zustand';
import { Task, Statistics, DailyStats } from '../types/task';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';

interface StatisticsStore {
  statistics: Statistics | null;
  isLoading: boolean;
  computeStatistics: (tasks: Task[]) => void;
}

function buildEmptyStats(): Statistics {
  return {
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageTasksPerDay: 0,
    totalFocusTime: 0,
    weeklyData: [],
    monthlyData: [],
    tasksByCategory: {},
    tasksByPriority: { low: 0, medium: 0, high: 0, critical: 0 },
  };
}

export const useStatisticsStore = create<StatisticsStore>((set) => ({
  statistics: null,
  isLoading: false,

  computeStatistics: (tasks: Task[]) => {
    set({ isLoading: true });

    const now = new Date();
    const today = startOfDay(now);

    const completed = tasks.filter(t => t.completed);
    const pending = tasks.filter(t => !t.completed && t.status === 'active');
    const overdue = tasks.filter(t => {
      if (t.completed || !t.dueDate) return false;
      return new Date(t.dueDate) < today;
    });

    // Weekly data (last 7 days)
    const weeklyData: DailyStats[] = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayTasks = tasks.filter(t => t.createdAt && isSameDay(new Date(t.createdAt), date));
      const dayCompleted = tasks.filter(t => t.completedAt && isSameDay(new Date(t.completedAt), date));
      const focusTime = dayCompleted.reduce((sum, t) => sum + (t.actualTime ?? t.estimatedTime ?? 0), 0);
      return { date: dateStr, completed: dayCompleted.length, created: dayTasks.length, focusTime };
    });

    // Monthly data (last 30 days)
    const monthlyData: DailyStats[] = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(today, 29 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayTasks = tasks.filter(t => t.createdAt && isSameDay(new Date(t.createdAt), date));
      const dayCompleted = tasks.filter(t => t.completedAt && isSameDay(new Date(t.completedAt), date));
      const focusTime = dayCompleted.reduce((sum, t) => sum + (t.actualTime ?? t.estimatedTime ?? 0), 0);
      return { date: dateStr, completed: dayCompleted.length, created: dayTasks.length, focusTime };
    });

    // Streak calculation
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    for (let i = 0; i < 30; i++) {
      const date = subDays(today, i);
      const hadCompletion = tasks.some(t => t.completedAt && isSameDay(new Date(t.completedAt), date));
      if (hadCompletion) {
        tempStreak++;
        if (i === currentStreak) currentStreak = tempStreak;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (i === 0) currentStreak = 0;
        tempStreak = 0;
      }
    }

    // By category
    const tasksByCategory: Record<string, number> = {};
    tasks.forEach(t => {
      tasksByCategory[t.category] = (tasksByCategory[t.category] ?? 0) + 1;
    });

    // By priority
    const tasksByPriority = { low: 0, medium: 0, high: 0, critical: 0 };
    tasks.forEach(t => { tasksByPriority[t.priority]++; });

    const totalFocusTime = completed.reduce((sum, t) => sum + (t.actualTime ?? t.estimatedTime ?? 0), 0);
    const daysWithTasks = new Set(tasks.map(t => format(new Date(t.createdAt), 'yyyy-MM-dd'))).size;
    const averageTasksPerDay = daysWithTasks > 0 ? tasks.length / daysWithTasks : 0;

    set({
      statistics: {
        totalTasks: tasks.length,
        completedTasks: completed.length,
        pendingTasks: pending.length,
        overdueTasks: overdue.length,
        completionRate: tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0,
        currentStreak,
        longestStreak,
        averageTasksPerDay: Math.round(averageTasksPerDay * 10) / 10,
        totalFocusTime,
        weeklyData,
        monthlyData,
        tasksByCategory,
        tasksByPriority,
      },
      isLoading: false,
    });
  },
}));
