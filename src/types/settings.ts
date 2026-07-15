// ─── App Settings ─────────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'teal';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'hi';

export interface NotificationSettings {
  enabled: boolean;
  dailySummary: boolean;
  dailySummaryTime: string; // 'HH:mm'
  reminders: boolean;
  upcomingAlerts: boolean;
  upcomingAlertMinutes: number; // minutes before due
}

export interface AppSettings {
  themeMode: ThemeMode;
  accentColor: AccentColor;
  language: Language;
  notifications: NotificationSettings;
  hapticFeedback: boolean;
  showCompletedTasks: boolean;
  defaultCategory: string;
  defaultPriority: string;
  firstDayOfWeek: 0 | 1; // 0 = Sunday, 1 = Monday
}
