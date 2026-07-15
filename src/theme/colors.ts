// ─── Colors ──────────────────────────────────────────────────────────────────

export const COLORS = {
  // Brand
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  primaryLight: '#93c5fd',
  secondary: '#8b5cf6',
  secondaryDark: '#7c3aed',
  secondaryLight: '#c4b5fd',

  // Semantic
  success: '#22c55e',
  successLight: '#bbf7d0',
  warning: '#f59e0b',
  warningLight: '#fde68a',
  error: '#ef4444',
  errorLight: '#fecaca',
  info: '#06b6d4',
  infoLight: '#a5f3fc',

  // Priority Colors
  priorityLow: '#22c55e',
  priorityMedium: '#f59e0b',
  priorityHigh: '#f97316',
  priorityCritical: '#ef4444',

  // Category Colors
  categoryPersonal: '#8b5cf6',
  categoryWork: '#3b82f6',
  categoryStudy: '#06b6d4',
  categoryShopping: '#f59e0b',
  categoryHealth: '#22c55e',
  categoryFinance: '#10b981',
  categoryTravel: '#f97316',
  categoryOthers: '#94a3b8',

  // Task Colors (color picker)
  taskColors: [
    '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444',
    '#f97316', '#f59e0b', '#22c55e', '#06b6d4',
    '#6366f1', '#14b8a6', '#84cc16', '#64748b',
  ],

  // Dark Theme
  dark: {
    background: '#0a0a0f',
    surface: '#111118',
    card: '#1a1a24',
    cardElevated: '#1e1e2e',
    border: '#2a2a3a',
    borderLight: '#333344',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#475569',
    placeholder: '#475569',
    overlay: 'rgba(0,0,0,0.7)',
    glass: 'rgba(255,255,255,0.05)',
    glassBorder: 'rgba(255,255,255,0.1)',
    tabBar: '#111118',
    tabBarBorder: '#2a2a3a',
  },

  // Light Theme
  light: {
    background: '#f8fafc',
    surface: '#ffffff',
    card: '#ffffff',
    cardElevated: '#f1f5f9',
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    placeholder: '#cbd5e1',
    overlay: 'rgba(0,0,0,0.5)',
    glass: 'rgba(255,255,255,0.8)',
    glassBorder: 'rgba(255,255,255,0.9)',
    tabBar: '#ffffff',
    tabBarBorder: '#e2e8f0',
  },

  // Accent Colors
  accents: {
    blue: '#3b82f6',
    purple: '#8b5cf6',
    green: '#22c55e',
    orange: '#f97316',
    pink: '#ec4899',
    teal: '#14b8a6',
  },

  // Common
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
} as const;

// ─── Priority Color Map ───────────────────────────────────────────────────────

export const PRIORITY_COLORS = {
  low: COLORS.priorityLow,
  medium: COLORS.priorityMedium,
  high: COLORS.priorityHigh,
  critical: COLORS.priorityCritical,
} as const;

// ─── Category Color Map ───────────────────────────────────────────────────────

export const CATEGORY_COLORS: Record<string, string> = {
  personal: COLORS.categoryPersonal,
  work: COLORS.categoryWork,
  study: COLORS.categoryStudy,
  shopping: COLORS.categoryShopping,
  health: COLORS.categoryHealth,
  finance: COLORS.categoryFinance,
  travel: COLORS.categoryTravel,
  others: COLORS.categoryOthers,
};
