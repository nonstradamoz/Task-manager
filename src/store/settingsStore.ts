import { create } from 'zustand';
import { AppSettings, ThemeMode, AccentColor } from '../types/settings';
import { storeData, getData } from '../storage/asyncStorage';
import { STORAGE_KEYS } from '../constants';

const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'dark',
  accentColor: 'blue',
  language: 'en',
  notifications: {
    enabled: true,
    dailySummary: true,
    dailySummaryTime: '08:00',
    reminders: true,
    upcomingAlerts: true,
    upcomingAlertMinutes: 30,
  },
  hapticFeedback: true,
  showCompletedTasks: true,
  defaultCategory: 'personal',
  defaultPriority: 'medium',
  firstDayOfWeek: 1,
};

interface SettingsStore {
  settings: AppSettings;
  isLoading: boolean;

  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setAccentColor: (color: AccentColor) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: false,

  loadSettings: async () => {
    set({ isLoading: true });
    const saved = await getData<AppSettings>(STORAGE_KEYS.SETTINGS);
    set({ settings: saved ?? DEFAULT_SETTINGS, isLoading: false });
  },

  updateSettings: async (updates) => {
    const updated = { ...get().settings, ...updates };
    set({ settings: updated });
    await storeData(STORAGE_KEYS.SETTINGS, updated);
  },

  setThemeMode: async (themeMode) => {
    await get().updateSettings({ themeMode });
  },

  setAccentColor: async (accentColor) => {
    await get().updateSettings({ accentColor });
  },

  resetSettings: async () => {
    set({ settings: DEFAULT_SETTINGS });
    await storeData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },
}));
