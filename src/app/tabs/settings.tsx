import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { COLORS } from '../../theme/colors';
import type { AccentColor } from '../../types/settings';

const ACCENT_COLORS: { key: AccentColor; color: string; label: string }[] = [
  { key: 'blue', color: COLORS.accents.blue, label: 'Blue' },
  { key: 'purple', color: COLORS.accents.purple, label: 'Purple' },
  { key: 'green', color: COLORS.accents.green, label: 'Green' },
  { key: 'orange', color: COLORS.accents.orange, label: 'Orange' },
  { key: 'pink', color: COLORS.accents.pink, label: 'Pink' },
  { key: 'teal', color: COLORS.accents.teal, label: 'Teal' },
];

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
}

function SettingRow({ icon, iconColor, label, subtitle, onPress, right }: SettingRowProps) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress && !right} activeOpacity={onPress ? 0.7 : 1}
      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14 }}>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${iconColor ?? theme.colors.accent}20`, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={18} color={iconColor ?? theme.colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '500' }}>{label}</Text>
        {subtitle && <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 1 }}>{subtitle}</Text>}
      </View>
      {right ?? (onPress && <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />)}
    </TouchableOpacity>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={{ backgroundColor: theme.colors.card, borderRadius: 18, paddingHorizontal: 16, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' }}>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, logout, updateNotificationPreferences } = useAuthStore();
  const { settings, updateSettings, setAccentColor } = useSettingsStore();

  const chatEnabled = user?.notificationPreferences?.chat !== false;
  const tasksEnabled = user?.notificationPreferences?.tasks !== false;

  async function handleLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

      {/* Header */}
      <Animated.View entering={FadeInDown.delay(0).springify()} style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 20 }}>
        <Text style={{ color: theme.colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.8 }}>Settings</Text>
      </Animated.View>

      {/* Profile Card */}
      <Animated.View entering={FadeInDown.delay(60).springify()} style={{ marginHorizontal: 20, marginBottom: 20 }}>
        <TouchableOpacity onPress={() => router.push('/profile')} style={{ backgroundColor: theme.colors.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', alignItems: 'center', gap: 14 }} activeOpacity={0.8}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 22 }}>
              {(user?.displayName ?? 'U')[0].toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: '700' }}>{user?.displayName ?? 'User'}</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>{user?.email ?? ''}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </Animated.View>

      <View style={{ paddingHorizontal: 20, gap: 16 }}>

        {/* Appearance */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 0.6, marginBottom: 8, textTransform: 'uppercase' }}>Appearance</Text>
          <SectionCard>
            <SettingRow icon="moon-outline" label="Dark Mode" subtitle={isDark ? 'On' : 'Off'}
              right={<Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: theme.colors.border, true: `${theme.colors.accent}80` }} thumbColor={isDark ? theme.colors.accent : theme.colors.textMuted} />}
            />
            <View style={{ height: 1, backgroundColor: theme.colors.border }} />
            <View style={{ paddingVertical: 14 }}>
              <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '500', marginBottom: 12 }}>Accent Color</Text>
              <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
                {ACCENT_COLORS.map(ac => (
                  <TouchableOpacity key={ac.key} onPress={() => setAccentColor(ac.key)}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: ac.color, alignItems: 'center', justifyContent: 'center', borderWidth: settings.accentColor === ac.key ? 3 : 0, borderColor: '#fff' }}>
                      {settings.accentColor === ac.key && <Ionicons name="checkmark" size={18} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </SectionCard>
        </Animated.View>

        {/* Notifications */}
        <Animated.View entering={FadeInDown.delay(140).springify()}>
          <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 0.6, marginBottom: 8, textTransform: 'uppercase' }}>Push Notifications</Text>
          <SectionCard>
            <SettingRow icon="notifications-outline" label="Task Reminders" subtitle="Get notified before tasks are due"
              right={<Switch value={tasksEnabled} onValueChange={v => {
                if (user?.uid) updateNotificationPreferences(user.uid, { ...user.notificationPreferences, tasks: v });
              }} trackColor={{ false: theme.colors.border, true: `${theme.colors.accent}80` }} thumbColor={tasksEnabled ? theme.colors.accent : theme.colors.textMuted} />}
            />
            <View style={{ height: 1, backgroundColor: theme.colors.border }} />
            <SettingRow icon="chatbubble-outline" label="Chat Messages" subtitle="Get notified for direct messages"
              right={<Switch value={chatEnabled} onValueChange={v => {
                if (user?.uid) updateNotificationPreferences(user.uid, { ...user.notificationPreferences, chat: v });
              }} trackColor={{ false: theme.colors.border, true: `${theme.colors.accent}80` }} thumbColor={chatEnabled ? theme.colors.accent : theme.colors.textMuted} />}
            />
          </SectionCard>
        </Animated.View>

        {/* Data */}
        <Animated.View entering={FadeInDown.delay(180).springify()}>
          <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 0.6, marginBottom: 8, textTransform: 'uppercase' }}>Data</Text>
          <SectionCard>
            <SettingRow icon="folder-outline" label="Categories" subtitle="Manage task categories" onPress={() => router.push('/categories')} />
            <View style={{ height: 1, backgroundColor: theme.colors.border }} />
            <SettingRow icon="archive-outline" label="Archived Tasks" onPress={() => router.push('/archived')} />
            <View style={{ height: 1, backgroundColor: theme.colors.border }} />
            <SettingRow icon="checkmark-done-outline" label="Completed Tasks" onPress={() => router.push('/completed')} />
          </SectionCard>
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeInDown.delay(220).springify()}>
          <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 0.6, marginBottom: 8, textTransform: 'uppercase' }}>About</Text>
          <SectionCard>
            <SettingRow icon="information-circle-outline" label="About BioTasks" onPress={() => router.push('/about')} />
            <View style={{ height: 1, backgroundColor: theme.colors.border }} />
            <SettingRow icon="shield-checkmark-outline" label="Privacy Policy" iconColor="#22c55e" />
          </SectionCard>
        </Animated.View>

        {/* Logout */}
        <Animated.View entering={FadeInDown.delay(260).springify()}>
          <SectionCard>
            <SettingRow icon="log-out-outline" iconColor="#ef4444" label="Log Out" onPress={handleLogout} />
          </SectionCard>
        </Animated.View>

      </View>
    </ScrollView>
  );
}
