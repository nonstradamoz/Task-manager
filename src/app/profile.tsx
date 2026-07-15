import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, updateUserRole, logout } = useAuthStore();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const initialName = user?.displayName?.[0]?.toUpperCase() || 'U';

  async function handleSave() {
    setIsLoading(true);
    // Simulation
    setTimeout(() => {
      setIsEditing(false);
      setIsLoading(false);
    }, 1000);
  }

  async function handleToggleAdmin() {
    if (!user) return;
    try {
      const newRole = user.role === 'admin' ? 'member' : 'admin';
      await updateUserRole(user.uid, newRole);
    } catch (error) {
      console.warn('Failed to toggle admin:', error);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border }}>
          <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={{ flex: 1, color: theme.colors.text, fontSize: 22, fontWeight: '800' }}>Profile</Text>
        {!isEditing ? (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={{ color: theme.colors.accent, fontSize: 15, fontWeight: '700' }}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(false)}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 15, fontWeight: '600' }}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
        {/* Avatar */}
        <Animated.View entering={FadeInDown.delay(0).springify()} style={{ alignItems: 'center', marginVertical: 32 }}>
          <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center', shadowColor: theme.colors.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 10 }}>
            <Text style={{ color: '#fff', fontSize: 40, fontWeight: '800' }}>{initialName}</Text>
          </View>
          {isEditing && (
            <TouchableOpacity style={{ position: 'absolute', bottom: -10, backgroundColor: theme.colors.card, padding: 8, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border }}>
              <Ionicons name="camera" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.delay(60).springify()} style={{ gap: 20 }}>
          <View style={{ gap: 6 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13, fontWeight: '500' }}>Display Name</Text>
            <TextInput
              value={displayName} onChangeText={setDisplayName} editable={isEditing}
              style={{ backgroundColor: isEditing ? theme.colors.card : 'transparent', borderRadius: 14, borderWidth: isEditing ? 1.5 : 0, borderColor: theme.colors.border, padding: isEditing ? 14 : 0, color: theme.colors.text, fontSize: 16, fontWeight: '500' }}
            />
          </View>

          <View style={{ gap: 6 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13, fontWeight: '500' }}>Email Address</Text>
            <TextInput
              value={email} editable={false}
              style={{ backgroundColor: 'transparent', borderRadius: 14, borderWidth: 0, padding: 0, color: theme.colors.textMuted, fontSize: 16, fontWeight: '500' }}
            />
            {isEditing && <Text style={{ color: theme.colors.textMuted, fontSize: 11 }}>Email cannot be changed.</Text>}
          </View>

          {isEditing && (
            <Button title="Save Changes" onPress={handleSave} isLoading={isLoading} size="lg" fullWidth style={{ marginTop: 12 }} />
          )}
        </Animated.View>

        {/* Admin section */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={{ marginTop: 32, gap: 16 }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 13, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' }}>Account Actions</Text>
          
          <Button 
            title={user?.role === 'admin' ? "Revoke Admin Rights" : "Make Me Admin (Test)"} 
            onPress={handleToggleAdmin} 
            variant="outline" 
            fullWidth 
          />

          {user?.role === 'admin' && (
            <Button 
              title="Open Admin Panel" 
              onPress={() => router.push('/admin')} 
              variant="primary" 
              fullWidth 
              style={{ backgroundColor: theme.colors.success }}
            />
          )}

          <Button 
            title="Log Out" 
            onPress={handleLogout} 
            variant="ghost" 
            fullWidth 
            style={{ marginTop: 8 }}
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
