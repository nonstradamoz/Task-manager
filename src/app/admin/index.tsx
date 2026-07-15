import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { authService } from '../../services/auth/AuthService';
import { useAuthStore } from '../../store/authStore';
import { useTaskStore } from '../../store/taskStore';
import { UserProfile } from '../../types/auth';
import { Priority, RepeatInterval, TaskStatus } from '../../types/task';
import { Button } from '../../components/ui/Button';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firestore, COLLECTIONS } from '../../config/firebase';

export default function AdminPanelScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user: currentUser } = useAuthStore();
  const { createTask } = useTaskStore();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        const fetchedUsers = await authService.getAllUsers();
        setUsers(fetchedUsers.filter(u => u.uid !== currentUser?.uid));
      } catch (error) {
        Alert.alert('Error', 'Failed to load users');
      } finally {
        setIsLoading(false);
      }
    }
    loadUsers();
  }, []);


  async function handleCreateDummyUser() {
    setIsLoading(true);
    try {
      const dummyId = `dummy_${Date.now()}`;
      await setDoc(doc(firestore, COLLECTIONS.USERS, dummyId), {
        uid: dummyId,
        email: `dummy_${Date.now()}@biotasks.app`,
        displayName: 'Test Member',
        emailVerified: true,
        role: 'member',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      // Refresh the list
      const fetchedUsers = await authService.getAllUsers();
      setUsers(fetchedUsers.filter(u => u.uid !== currentUser?.uid));
      Alert.alert('Success', 'Dummy user created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create dummy user');
    } finally {
      setIsLoading(false);
    }
  }

  if (currentUser?.role !== 'admin') {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: theme.colors.error, fontSize: 18, fontWeight: '700' }}>Access Denied</Text>
        <Button title="Go Back" onPress={() => router.back()} style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border }}>
          <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={{ flex: 1, color: theme.colors.text, fontSize: 22, fontWeight: '800' }}>Admin Panel</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 15, marginBottom: 20 }}>
          Select a member to assign a task.
        </Text>

        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.accent} style={{ marginTop: 40 }} />
        ) : (
          <View style={{ gap: 12 }}>
            {users.map(u => (
              <TouchableOpacity
                key={u.uid}
                onPress={() => setSelectedUser(selectedUser?.uid === u.uid ? null : u)}
                style={{
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: selectedUser?.uid === u.uid ? `${theme.colors.accent}20` : theme.colors.card,
                  borderWidth: 1.5,
                  borderColor: selectedUser?.uid === u.uid ? theme.colors.accent : theme.colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>{u.displayName?.[0]?.toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '700' }}>{u.displayName}</Text>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>{u.email}</Text>
                </View>
                {selectedUser?.uid === u.uid && (
                  <Ionicons name="checkmark-circle" size={24} color={theme.colors.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedUser && (
          <View style={{ marginTop: 30, gap: 12, backgroundColor: theme.colors.card, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center' }}>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 10 }}>
              You have selected {selectedUser.displayName}.
            </Text>

            <Button
              title={`Proceed to Assign Task`}
              onPress={() => router.push({ pathname: '/tasks/create', params: { assignTo: selectedUser.uid, assignToName: selectedUser.displayName || 'User' } })}
              fullWidth
            />
          </View>
        )}
        
        {!isLoading && (
          <Button 
            title="Create Dummy User" 
            onPress={handleCreateDummyUser} 
            variant="outline"
            style={{ marginTop: 40 }}
          />
        )}
      </ScrollView>
    </View>
  );
}
