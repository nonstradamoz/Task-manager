import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuthStore } from '../../../store/authStore';
import { ChatService, ChatMessage } from '../../../services/chat/ChatService';

export default function ChatRoomScreen() {
  const { id, name } = useLocalSearchParams<{ id: string, name: string }>();
  const { theme } = useTheme();
  const { user } = useAuthStore();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!id) return;
    
    const unsubscribe = ChatService.subscribeToMessages(id, (newMessages) => {
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [id]);

  const handleSend = async () => {
    if (!inputText.trim() || !user || !id) return;
    
    const textToSend = inputText.trim();
    setInputText('');
    
    try {
      await ChatService.sendMessage(id, textToSend, user.uid, user.name || 'User');
    } catch (error) {
      console.error('Failed to send message:', error);
      // Could add a toast here
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === user?.uid;
    const timeString = item.createdAt 
      ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

    return (
      <View style={{
        marginVertical: 4,
        marginHorizontal: 16,
        alignItems: isMe ? 'flex-end' : 'flex-start'
      }}>
        {!isMe && (
          <Text style={{ fontSize: 11, color: theme.colors.textMuted, marginBottom: 2, marginLeft: 4 }}>
            {item.senderName}
          </Text>
        )}
        <View style={{
          backgroundColor: isMe ? theme.colors.accent : theme.colors.card,
          padding: 12,
          borderRadius: 16,
          borderBottomRightRadius: isMe ? 4 : 16,
          borderBottomLeftRadius: isMe ? 16 : 4,
          maxWidth: '80%',
        }}>
          <Text style={{ 
            color: isMe ? '#ffffff' : theme.colors.text,
            fontSize: 15,
            lineHeight: 20
          }}>
            {item.text}
          </Text>
          {timeString ? (
            <Text style={{ 
              color: isMe ? 'rgba(255,255,255,0.7)' : theme.colors.textMuted,
              fontSize: 10,
              marginTop: 4,
              alignSelf: 'flex-end'
            }}>
              {timeString}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen options={{ title: name || 'Chat' }} />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          inverted // This flips the list so new messages are at the bottom visually
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
        />

        {/* Input Area */}
        <View style={{
          flexDirection: 'row',
          padding: 12,
          paddingBottom: Platform.OS === 'ios' ? 12 : 24,
          backgroundColor: theme.colors.card,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          alignItems: 'center'
        }}>
          <TextInput
            style={{
              flex: 1,
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 10,
              fontSize: 15,
              maxHeight: 100,
            }}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            onPress={handleSend}
            disabled={!inputText.trim()}
            style={{
              marginLeft: 12,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: inputText.trim() ? theme.colors.accent : theme.colors.border,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Ionicons name="send" size={18} color="#fff" style={{ marginLeft: 3 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
