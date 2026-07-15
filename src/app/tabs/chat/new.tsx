import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { firestore, COLLECTIONS } from '../../../config/firebase';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuthStore } from '../../../store/authStore';
import { ChatService } from '../../../services/chat/ChatService';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function NewChatScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const querySnapshot = await getDocs(collection(firestore, COLLECTIONS.USERS));
        const fetchedUsers = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as UserProfile))
          .filter(u => u.id !== currentUser?.uid); // Exclude self
        
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching users for chat:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [currentUser]);

  const handleSelectUser = async (selectedUser: UserProfile) => {
    if (!currentUser) return;
    
    try {
      // Show loading overlay or just wait
      const chatId = await ChatService.createOrGetDirectChat(
        currentUser.uid,
        currentUser.name || 'User',
        selectedUser.id,
        selectedUser.name || 'User'
      );
      
      // Navigate to chat room and close modal
      router.replace(`/tabs/chat/${chatId}?name=${encodeURIComponent(selectedUser.name || 'User')}`);
    } catch (error) {
      console.error('Error creating direct chat:', error);
    }
  };

  const renderUser = ({ item }: { item: UserProfile }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        alignItems: 'center'
      }}
      onPress={() => handleSelectUser(item)}
    >
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${theme.colors.primary}20`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16
      }}>
        <Ionicons name="person" size={20} color={theme.colors.primary} />
      </View>
      <View>
        <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text }}>
          {item.name || 'Unknown User'}
        </Text>
        <Text style={{ fontSize: 13, color: theme.colors.textSecondary }}>
          {item.email}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        ListEmptyComponent={
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ color: theme.colors.textMuted, textAlign: 'center' }}>
              No other teammates found.
            </Text>
          </View>
        }
      />
    </View>
  );
}
