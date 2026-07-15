import { Task, Priority, TaskStatus } from '../types/task';
import { COLORS, PRIORITY_COLORS } from '../theme/colors';

// ─── Priority Helpers ─────────────────────────────────────────────────────────

export function getPriorityColor(priority: Priority): string {
  return PRIORITY_COLORS[priority];
}

export function getPriorityLabel(priority: Priority): string {
  const labels: Record<Priority, string> = {
    [Priority.LOW]: 'Low',
    [Priority.MEDIUM]: 'Medium',
    [Priority.HIGH]: 'High',
    [Priority.CRITICAL]: 'Critical',
  };
  return labels[priority];
}

export function getPriorityOrder(priority: Priority): number {
  const order: Record<Priority, number> = {
    [Priority.CRITICAL]: 0,
    [Priority.HIGH]: 1,
    [Priority.MEDIUM]: 2,
    [Priority.LOW]: 3,
  };
  return order[priority];
}

// ─── Category Helpers ─────────────────────────────────────────────────────────

export function getCategoryColor(categoryId: string): string {
  const colorMap: Record<string, string> = {
    personal: '#8b5cf6',
    work: '#3b82f6',
    study: '#06b6d4',
    shopping: '#f59e0b',
    health: '#22c55e',
    finance: '#10b981',
    travel: '#f97316',
    others: '#94a3b8',
  };
  return colorMap[categoryId] ?? '#94a3b8';
}

// ─── Task Status Helpers ──────────────────────────────────────────────────────

export function getStatusColor(status: TaskStatus, isDark: boolean): string {
  const map: Record<TaskStatus, string> = {
    [TaskStatus.ACTIVE]: isDark ? '#f1f5f9' : '#0f172a',
    [TaskStatus.COMPLETED]: COLORS.success,
    [TaskStatus.ARCHIVED]: COLORS.dark.textMuted,
  };
  return map[status];
}

// ─── Completion Percentage ────────────────────────────────────────────────────

export function getCompletionPercentage(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter(t => t.completed).length;
  return Math.round((completed / tasks.length) * 100);
}

// ─── Productivity Score ───────────────────────────────────────────────────────

export function getProductivityScore(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayTasks = tasks.filter(t => {
    if (!t.createdAt) return false;
    return new Date(t.createdAt) >= todayStart;
  });
  const completedToday = todayTasks.filter(t => {
    if (!t.completedAt) return false;
    return new Date(t.completedAt) >= todayStart;
  });
  if (todayTasks.length === 0) return 0;
  return Math.round((completedToday.length / todayTasks.length) * 100);
}

// ─── Task Deduplication ───────────────────────────────────────────────────────

export function deduplicateTasks(tasks: Task[]): Task[] {
  const seen = new Set<string>();
  return tasks.filter(t => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}

// ─── Task Clone ───────────────────────────────────────────────────────────────

export function cloneTask(task: Task): Omit<Task, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    ...task,
    title: `${task.title} (copy)`,
    completed: false,
    completedAt: null,
    status: TaskStatus.ACTIVE,
  };
}

// ─── Tag helpers ──────────────────────────────────────────────────────────────

export function parseTagsFromString(input: string): string[] {
  return input
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(t => t.length > 0);
}
