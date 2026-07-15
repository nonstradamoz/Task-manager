import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { firestore, COLLECTIONS } from '../../config/firebase';
import { notificationService } from '../notifications/NotificationService';
export type ChatType = 'global' | 'direct';
export interface ChatRoom {
  id: string;
  type: ChatType;
  members: string[]; // User IDs
  memberNames?: Record<string, string>; // Map of uid -> name
  lastMessage?: {
    text: string;
    senderId: string;
    createdAt: number | null;
  };
  updatedAt: number | null;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: number | null;
}

const GLOBAL_CHAT_ID = 'global_team_chat';

export class ChatService {

  // ─── Initialize Global Chat ──────────────────────────────────────────────
  static async initializeGlobalChatIfMissing() {
    const docRef = doc(firestore, COLLECTIONS.CHATS, GLOBAL_CHAT_ID);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      await setDoc(docRef, {
        type: 'global',
        members: [],
        updatedAt: serverTimestamp(),
      });
    }
  }

  // ─── Subscriptions ────────────────────────────────────────────────────────

  static subscribeToUserChats(userId: string, onUpdate: (chats: ChatRoom[]) => void) {
    let globalChats: ChatRoom[] = [];
    let directChats: ChatRoom[] = [];

    const notify = () => {
      const allChats = [...globalChats, ...directChats];
      // Sort by updatedAt descending (latest at top)
      allChats.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      onUpdate(allChats);
    };

    const globalQuery = query(
      collection(firestore, COLLECTIONS.CHATS),
      where('type', '==', 'global')
    );

    const unsubscribeGlobal = onSnapshot(globalQuery, (snapshot) => {
      globalChats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
        lastMessage: doc.data().lastMessage ? {
          ...doc.data().lastMessage,
          createdAt: doc.data().lastMessage.createdAt?.toMillis() || Date.now()
        } : undefined
      })) as ChatRoom[];
      notify();
    });

    const directQuery = query(
      collection(firestore, COLLECTIONS.CHATS),
      where('type', '==', 'direct'),
      where('members', 'array-contains', userId)
    );

    const unsubscribeDirect = onSnapshot(directQuery, (snapshot) => {
      directChats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
        lastMessage: doc.data().lastMessage ? {
          ...doc.data().lastMessage,
          createdAt: doc.data().lastMessage.createdAt?.toMillis() || Date.now()
        } : undefined
      })) as ChatRoom[];
      notify();
    });

    return () => {
      unsubscribeGlobal();
      unsubscribeDirect();
    };
  }

  static subscribeToMessages(chatId: string, onUpdate: (messages: ChatMessage[]) => void) {
    const messagesQuery = query(
      collection(firestore, COLLECTIONS.messages(chatId)),
      orderBy('createdAt', 'desc') // For inverted flatlist
    );

    return onSnapshot(messagesQuery, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis() || Date.now()
      })) as ChatMessage[];
      onUpdate(messages);
    });
  }

  // ─── Actions ─────────────────────────────────────────────────────────────

  static async sendMessage(chatId: string, text: string, senderId: string, senderName: string) {
    const timestamp = serverTimestamp();

    // 1. Add message
    await addDoc(collection(firestore, COLLECTIONS.messages(chatId)), {
      text,
      senderId,
      senderName,
      createdAt: timestamp,
    });

    // 2. Update parent chat room
    await setDoc(doc(firestore, COLLECTIONS.CHATS, chatId), {
      lastMessage: {
        text,
        senderId,
        createdAt: timestamp,
      },
      updatedAt: timestamp,
    }, { merge: true });
    // 3. Send Push Notification for Direct Messages
    try {
      const chatDoc = await getDoc(doc(firestore, COLLECTIONS.CHATS, chatId));
      if (chatDoc.exists()) {
        const chatData = chatDoc.data() as ChatRoom;
        if (chatData.type === 'direct' && chatData.members) {
          const recipientId = chatData.members.find(id => id !== senderId);
          if (recipientId) {
            const userDoc = await getDoc(doc(firestore, COLLECTIONS.USERS, recipientId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              // Check if they have disabled chat notifications explicitly
              const chatNotificationsEnabled = userData.notificationPreferences?.chat !== false;
              
              if (chatNotificationsEnabled && userData.expoPushToken) {
                await notificationService.sendChatMessageNotification(
                  userData.expoPushToken,
                  senderName,
                  text
                );
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to send chat push notification:', error);
    }
  }

  static async createOrGetDirectChat(user1Id: string, user1Name: string, user2Id: string, user2Name: string): Promise<string> {
    const chatId = [user1Id, user2Id].sort().join('_');
    const chatRef = doc(firestore, COLLECTIONS.CHATS, chatId);

    const snap = await getDoc(chatRef);
    if (!snap.exists()) {
      await setDoc(chatRef, {
        type: 'direct',
        members: [user1Id, user2Id],
        memberNames: {
          [user1Id]: user1Name,
          [user2Id]: user2Name
        },
        updatedAt: serverTimestamp(),
      });
    }
    return chatId;
  }
}
