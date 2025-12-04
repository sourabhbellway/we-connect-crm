import apiClient from './apiClient';
import { STORAGE_KEYS } from '../constants';
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

// Payload allowed by UpdateNotificationPreferenceDto on the backend
export interface UpdateNotificationPreferencePayload {
  inAppEnabled?: boolean;
  emailEnabled?: boolean;
  soundEnabled?: boolean;
  preferences?: NotificationPreference['preferences'];
  doNotDisturbStart?: number;
  doNotDisturbEnd?: number;
}

export const notificationService = {
  // Get all notifications
  async getNotifications(params?: {
    type?: string;
    read?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    notifications: Notification[];
    unreadCount: number;
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const response = await apiClient.get('/notifications', { params });
    // Backend shape: { success, data: { notifications, unreadCount, pagination } }
    return response.data.data;
  },

  // Get unread count
  async getUnreadCount(): Promise<{ unreadCount: number }> {
    const response = await apiClient.get('/notifications/unread-count');
    // Backend shape: { success, data: { unreadCount } }
    return response.data.data;
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
  async getPreferences(): Promise<NotificationPreference> {
    const response = await apiClient.get('/notifications/preferences');
    // Backend shape: { success, data: NotificationPreference }
    return response.data.data;
  },

  // Update preferences
  async updatePreferences(preferences: NotificationPreference) {
    // Backend ValidationPipe uses forbidNonWhitelisted, so we must only
    // send properties that exist on UpdateNotificationPreferenceDto
    const payload: UpdateNotificationPreferencePayload = {
      inAppEnabled: preferences.inAppEnabled,
      emailEnabled: preferences.emailEnabled,
      soundEnabled: preferences.soundEnabled,
      preferences: preferences.preferences,
      doNotDisturbStart: preferences.doNotDisturbStart,
      doNotDisturbEnd: preferences.doNotDisturbEnd,
    };

    const response = await apiClient.patch('/notifications/preferences', payload);
    return response.data;
  },

  // Connect to SSE stream
  connectToStream(onNotification: (notification: Notification) => void, onError?: (error: Event) => void) {
    // Support both legacy and new token keys, same as apiClient
    const token =
      localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ||
      localStorage.getItem('token');

    if (!token) {
      console.error('No token found for SSE connection');
      return null;
    }

    // Build SSE URL from the same base the rest of the API uses.
    // In dev, API_BASE_URL defaults to "/api" which becomes
    // window.location.origin + "/api" in the browser.
    const base = API_BASE_URL || '/api';

    let streamUrl: string;
    if (base.startsWith('http')) {
      // e.g. https://crm.example.com/api -> https://crm.example.com/api/notifications/stream
      const apiBase = base.replace(/\/$/, '');
      streamUrl = `${apiBase}/notifications/stream?token=${encodeURIComponent(token)}`;
    } else {
      // e.g. "/api" -> same origin + /api/notifications/stream
      const apiBase = window.location.origin + base.replace(/\/$/, '');
      streamUrl = `${apiBase}/notifications/stream?token=${encodeURIComponent(token)}`;
    }

    // JwtStrategy is configured to read ?token= for SSE because
    // EventSource cannot send Authorization headers.

    const eventSource = new EventSource(streamUrl, {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'connected') {
          
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
