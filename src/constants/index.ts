import { Category } from '../types/task';

// ─── App Info ─────────────────────────────────────────────────────────────────

export const APP_NAME = 'BioTasks';
export const APP_VERSION = '1.0.0';

// ─── Default Categories ───────────────────────────────────────────────────────

export const DEFAULT_CATEGORIES: Omit<Category, 'userId' | 'createdAt'>[] = [
  { id: 'personal', name: 'Personal', color: '#8b5cf6', icon: 'person', isCustom: false },
  { id: 'work', name: 'Work', color: '#3b82f6', icon: 'briefcase', isCustom: false },
  { id: 'study', name: 'Study', color: '#06b6d4', icon: 'book', isCustom: false },
  { id: 'shopping', name: 'Shopping', color: '#f59e0b', icon: 'cart', isCustom: false },
  { id: 'health', name: 'Health', color: '#22c55e', icon: 'heart', isCustom: false },
  { id: 'finance', name: 'Finance', color: '#10b981', icon: 'wallet', isCustom: false },
  { id: 'travel', name: 'Travel', color: '#f97316', icon: 'airplane', isCustom: false },
  { id: 'others', name: 'Others', color: '#94a3b8', icon: 'ellipsis-horizontal', isCustom: false },
];

// ─── Onboarding Slides ────────────────────────────────────────────────────────

export const ONBOARDING_SLIDES = [
  {
    id: '1',
    title: 'Organize Your Life',
    subtitle: 'Create, manage and track all your tasks in one beautiful place.',
    icon: 'checkmark-circle',
    color: '#3b82f6',
  },
  {
    id: '2',
    title: 'Stay On Schedule',
    subtitle: 'Set reminders and due dates so you never miss a deadline again.',
    icon: 'calendar',
    color: '#8b5cf6',
  },
  {
    id: '3',
    title: 'Track Your Progress',
    subtitle: 'Beautiful statistics and insights to boost your productivity.',
    icon: 'bar-chart',
    color: '#22c55e',
  },
];

// ─── Storage Keys ─────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  AUTH_USER: '@biotasks/auth_user',
  TASKS: '@biotasks/tasks',
  CATEGORIES: '@biotasks/categories',
  SETTINGS: '@biotasks/settings',
  ONBOARDING_COMPLETE: '@biotasks/onboarding_complete',
  THEME_MODE: '@biotasks/theme_mode',
  ACCENT_COLOR: '@biotasks/accent_color',
} as const;

// ─── Notification IDs ─────────────────────────────────────────────────────────

export const NOTIFICATION_CHANNELS = {
  TASKS: 'tasks',
  DAILY_SUMMARY: 'daily_summary',
  REMINDERS: 'reminders',
} as const;

// ─── Animation Config ─────────────────────────────────────────────────────────

export const ANIMATION = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  spring: {
    damping: 20,
    stiffness: 150,
    mass: 0.8,
  },
} as const;

// ─── Pagination ───────────────────────────────────────────────────────────────

export const PAGE_SIZE = 20;
