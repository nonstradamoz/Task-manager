// ─── Notification Service ───────────────────────────────────────────────────────
// Handles sending push notifications via Expo Push API directly from the client.

export interface PushNotificationMessage {
  to: string;
  sound?: 'default' | null;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

class NotificationService {
  /**
   * Sends a push notification using Expo's Push API.
   * @param message The message payload to send.
   */
  async sendPushNotification(message: PushNotificationMessage): Promise<void> {
    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        console.error('Failed to send push notification:', await response.text());
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  /**
   * Sends a task assignment notification to a specific user.
   */
  async sendTaskAssignmentNotification(
    expoPushToken: string,
    taskTitle: string,
    assignerName: string
  ): Promise<void> {
    await this.sendPushNotification({
      to: expoPushToken,
      sound: 'default',
      title: 'New Task Assigned! 📋',
      body: `${assignerName} assigned you a new task: ${taskTitle}`,
      data: { type: 'task_assigned' },
    });
  }
  /**
   * Sends a chat message notification to a specific user.
   */
  async sendChatMessageNotification(
    expoPushToken: string,
    senderName: string,
    messageText: string
  ): Promise<void> {
    await this.sendPushNotification({
      to: expoPushToken,
      sound: 'default',
      title: `New Message from ${senderName} 💬`,
      body: messageText,
      data: { type: 'chat_message' },
    });
  }
}

export const notificationService = new NotificationService();
