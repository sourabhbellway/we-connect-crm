import apiClient from './apiClient';
import { API_BASE_URL } from '../config/config';

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  readAt?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreference {
  id: number;
  userId: number;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  soundEnabled: boolean;
  preferences: {
    leadCreated?: boolean;
    leadUpdated?: boolean;
    leadAssigned?: boolean;
    clientReply?: boolean;
    paymentAdded?: boolean;
    paymentUpdated?: boolean;
    taskAssigned?: boolean;
    taskDue?: boolean;
    meetingScheduled?: boolean;
    followUpDue?: boolean;
    dealCreated?: boolean;
    dealWon?: boolean;
    dealLost?: boolean;
    quotationSent?: boolean;
    quotationAccepted?: boolean;
    invoiceSent?: boolean;
    invoicePaid?: boolean;
  };
  doNotDisturbStart?: number;
  doNotDisturbEnd?: number;
  createdAt: string;
  updatedAt: string;
}

export const notificationService = {
  // Get all notifications
  async getNotifications(params?: {
    type?: string;
    read?: boolean;
    page?: number;
    limit?: number;
  }) {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },

  // Get unread count
  async getUnreadCount() {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
  },

  // Mark notification as read
  async markAsRead(id: number) {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all as read
  async markAllAsRead() {
    const response = await apiClient.patch('/notifications/mark-all-read');
    return response.data;
  },

  // Delete notification
  async deleteNotification(id: number) {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  },

  // Get preferences
  async getPreferences(): Promise<{ success: boolean; data: NotificationPreference }> {
    const response = await apiClient.get('/notifications/preferences');
    return response.data;
  },

  // Update preferences
  async updatePreferences(preferences: Partial<NotificationPreference>) {
    const response = await apiClient.patch('/notifications/preferences', preferences);
    return response.data;
  },

  // Connect to SSE stream
  connectToStream(onNotification: (notification: Notification) => void, onError?: (error: Event) => void) {
    // Use the same API base URL as axios

    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) {
      console.error('No token found for SSE connection');
      return null;
    }

    // Build absolute SSE URL and include JWT via query param (EventSource cannot send headers)
    const base = API_BASE_URL as string;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const normalizedBase = base.startsWith('http') ? base.replace(/\/$/, '') : `${origin}${base.replace(/\/$/, '')}`;
    const sseUrl = `${normalizedBase}/notifications/stream?token=${encodeURIComponent(token)}`;

    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'connected') {
          console.log('Notification stream connected');
        } else if (data.type === 'notification') {
          onNotification(data.notification);
        }
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      if (onError) {
        onError(error);
      }
    };

    return eventSource;
  },

  // Play notification sound
  playNotificationSound() {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch((error) => {
        console.error('Failed to play notification sound:', error);
      });
    } catch (error) {
      console.error('Error creating audio:', error);
    }
  },
};
