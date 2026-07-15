import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuthStore } from '../../../store/authStore';
import { ChatService, ChatRoom } from '../../../services/chat/ChatService';

export default function ChatInbox() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Ensure global chat exists
    ChatService.initializeGlobalChatIfMissing();

    const unsubscribe = ChatService.subscribeToUserChats(user.uid, (updatedChats) => {
      setChats(updatedChats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const renderChatItem = ({ item }: { item: ChatRoom }) => {
    const isGlobal = item.type === 'global';
    
    // Determine the name to display for direct chats
    let chatName = 'Team Chat';
    let iconName: keyof typeof Ionicons.glyphMap = 'people';
    let iconColor = theme.colors.accent;

    if (!isGlobal && item.memberNames && user) {
      // Find the other person's name
      const otherUserId = item.members.find(id => id !== user.uid);
      if (otherUserId && item.memberNames[otherUserId]) {
        chatName = item.memberNames[otherUserId];
      } else {
        chatName = 'Direct Message';
      }
      iconName = 'person';
      iconColor = theme.colors.primary;
    }

    const lastMessageText = item.lastMessage?.text || 'No messages yet';
    const timeString = item.lastMessage?.createdAt 
      ? new Date(item.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          alignItems: 'center'
        }}
        onPress={() => router.push(`/tabs/chat/${item.id}?name=${encodeURIComponent(chatName)}`)}
      >
        <View style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: `${iconColor}20`,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 16
        }}>
          <Ionicons name={iconName} size={24} color={iconColor} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text }}>
              {chatName}
            </Text>
            {timeString ? (
              <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>
                {timeString}
              </Text>
            ) : null}
          </View>
          <Text style={{ fontSize: 14, color: theme.colors.textSecondary }} numberOfLines={1}>
            {lastMessageText}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.text }}>Chats</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      {/* FAB for new direct chat */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: theme.colors.accent,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5
        }}
        onPress={() => router.push('/tabs/chat/new')}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
