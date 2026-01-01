import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateNotificationDto, BulkNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { UpdateNotificationPreferenceDto } from './dto/notification-preference.dto';
import { NotificationType } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    // Initialize Firebase Admin SDK if not already initialized
    if (!admin.apps.length) {
      try {
        // Check if Firebase credentials are provided in environment
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (serviceAccount) {
          admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(serviceAccount)),
          });
          this.logger.log('Firebase Admin SDK initialized successfully');
        } else {
          this.logger.warn('Firebase service account not configured. FCM push notifications will not work.');
        }
      } catch (error) {
        this.logger.error('Failed to initialize Firebase Admin SDK:', error);
      }
    }
  }

  // Create single notification
  async create(dto: CreateNotificationDto) {
    // Check user's notification preferences
    const shouldSend = await this.shouldSendNotification(dto.userId, dto.type);
    if (!shouldSend) {
      this.logger.log(`Notification skipped for user ${dto.userId}, type ${dto.type} (preferences)`);
      return { success: true, skipped: true };
    }

    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        link: dto.link,
        metadata: dto.metadata as any,
      },
    });

    // Emit event for real-time delivery
    this.eventEmitter.emit('notification.created', {
      userId: dto.userId,
      notification,
    });

    this.logger.log(`Notification created: ${notification.id} for user ${dto.userId}`);

    return { success: true, data: notification };
  }

  // Create bulk notifications
  async createBulk(dto: BulkNotificationDto) {
    const notifications = [];

    for (const userId of dto.userIds) {
      const shouldSend = await this.shouldSendNotification(userId, dto.type);
      if (shouldSend) {
        const notification = await this.prisma.notification.create({
          data: {
            userId,
            type: dto.type,
            title: dto.title,
            message: dto.message,
            link: dto.link,
            metadata: dto.metadata as any,
          },
        });

        // Emit event for real-time delivery
        this.eventEmitter.emit('notification.created', {
          userId,
          notification,
        });

        notifications.push(notification);
      }
    }

    this.logger.log(`Bulk notifications created: ${notifications.length} out of ${dto.userIds.length}`);

    return { success: true, data: { count: notifications.length } };
  }

  // Get notifications for a user
  async findAll(userId: number, query: QueryNotificationsDto) {
    const { type, read, page = 1, limit = 20 } = query;

    const where: any = { userId };
    if (type) where.type = type;
    if (read !== undefined) where.read = read;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    const unreadCount = await this.prisma.notification.count({
      where: { userId, read: false },
    });

    return {
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  // Mark single notification as read
  async markAsRead(id: number, userId: number) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { read: true, readAt: new Date() },
    });

    return { success: true, data: updated };
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: number) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });

    return { success: true, data: { count: result.count } };
  }

  // Delete notification
  async delete(id: number, userId: number) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.delete({ where: { id } });

    return { success: true, message: 'Notification deleted' };
  }

  // Get unread count
  async getUnreadCount(userId: number) {
    const count = await this.prisma.notification.count({
      where: { userId, read: false },
    });

    return { success: true, data: { unreadCount: count } };
  }

  // Notification Preferences
  async getPreferences(userId: number) {
    let preferences = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Create default preferences
      preferences = await this.prisma.notificationPreference.create({
        data: { userId },
      });
    }

    return { success: true, data: preferences };
  }

  async updatePreferences(userId: number, dto: UpdateNotificationPreferenceDto) {
    const existingPrefs = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    let preferences;

    if (existingPrefs) {
      // Update existing preferences, merging the nested preferences object
      const currentPrefs = (existingPrefs.preferences as any) || {};
      const newPrefs = dto.preferences
        ? { ...currentPrefs, ...dto.preferences }
        : currentPrefs;

      preferences = await this.prisma.notificationPreference.update({
        where: { userId },
        data: {
          inAppEnabled: dto.inAppEnabled,
          emailEnabled: dto.emailEnabled,
          soundEnabled: dto.soundEnabled,
          preferences: newPrefs as any,
          doNotDisturbStart: dto.doNotDisturbStart,
          doNotDisturbEnd: dto.doNotDisturbEnd,
        },
      });
    } else {
      // Create new preferences
      preferences = await this.prisma.notificationPreference.create({
        data: {
          userId,
          inAppEnabled: dto.inAppEnabled ?? true,
          emailEnabled: dto.emailEnabled ?? false,
          soundEnabled: dto.soundEnabled ?? true,
          preferences: dto.preferences as any,
          doNotDisturbStart: dto.doNotDisturbStart,
          doNotDisturbEnd: dto.doNotDisturbEnd,
        },
      });
    }

    return { success: true, data: preferences };
  }

  // Helper: Check if notification should be sent based on preferences
  private async shouldSendNotification(userId: number, type: NotificationType): Promise<boolean> {
    const prefs = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!prefs) {
      // No preferences set, allow by default
      return true;
    }

    // Check if in-app notifications are enabled
    if (!prefs.inAppEnabled) {
      return false;
    }

    // Check Do Not Disturb hours
    if (prefs.doNotDisturbStart !== null && prefs.doNotDisturbEnd !== null) {
      const currentHour = new Date().getHours();
      const start = prefs.doNotDisturbStart;
      const end = prefs.doNotDisturbEnd;

      // Handle DND spanning midnight
      if (start <= end) {
        if (currentHour >= start && currentHour < end) {
          return false; // Within DND hours
        }
      } else {
        if (currentHour >= start || currentHour < end) {
          return false; // Within DND hours (spans midnight)
        }
      }
    }

    // Check specific notification type preferences
    const preferences = (prefs.preferences as any) || {};
    const typeKey = this.getPreferenceKey(type);
    if (typeKey && preferences[typeKey] === false) {
      return false;
    }

    return true;
  }

  // Map NotificationType to preference key
  private getPreferenceKey(type: NotificationType): string | null {
    const mapping: Record<NotificationType, string> = {
      LEAD_CREATED: 'leadCreated',
      LEAD_UPDATED: 'leadUpdated',
      LEAD_ASSIGNED: 'leadAssigned',
      LEAD_STATUS_CHANGED: 'leadUpdated',
      CLIENT_REPLY: 'clientReply',
      PAYMENT_ADDED: 'paymentAdded',
      PAYMENT_UPDATED: 'paymentUpdated',
      TASK_ASSIGNED: 'taskAssigned',
      TASK_DUE: 'taskDue',
      MEETING_SCHEDULED: 'meetingScheduled',
      FOLLOW_UP_DUE: 'followUpDue',
      DEAL_CREATED: 'dealCreated',
      DEAL_WON: 'dealWon',
      DEAL_LOST: 'dealLost',
      QUOTATION_SENT: 'quotationSent',
      QUOTATION_ACCEPTED: 'quotationAccepted',
      INVOICE_SENT: 'invoiceSent',
      INVOICE_PAID: 'invoicePaid',
      SYSTEM: 'system',
    };

    return mapping[type] || null;
  }

  // Helper method to create notification for lead events
  async notifyLeadEvent(type: NotificationType, userId: number, leadId: number, leadName: string, additionalInfo?: string) {
    const messages: Record<NotificationType, { title: string; message: string } | undefined> = {
      [NotificationType.LEAD_CREATED]: {
        title: 'New Lead Created',
        message: `A new lead "${leadName}" has been created${additionalInfo ? ': ' + additionalInfo : ''}`,
      },
      [NotificationType.LEAD_UPDATED]: {
        title: 'Lead Updated',
        message: `Lead "${leadName}" has been updated${additionalInfo ? ': ' + additionalInfo : ''}`,
      },
      [NotificationType.LEAD_ASSIGNED]: {
        title: 'Lead Assigned to You',
        message: `You have been assigned to lead "${leadName}"`,
      },
      [NotificationType.LEAD_STATUS_CHANGED]: {
        title: 'Lead Status Changed',
        message: `Lead "${leadName}" status changed${additionalInfo ? ' to ' + additionalInfo : ''}`,
      },
      [NotificationType.CLIENT_REPLY]: undefined,
      [NotificationType.PAYMENT_ADDED]: undefined,
      [NotificationType.PAYMENT_UPDATED]: undefined,
      [NotificationType.TASK_ASSIGNED]: undefined,
      [NotificationType.TASK_DUE]: undefined,
      [NotificationType.MEETING_SCHEDULED]: undefined,
      [NotificationType.FOLLOW_UP_DUE]: undefined,
      [NotificationType.DEAL_CREATED]: undefined,
      [NotificationType.DEAL_WON]: undefined,
      [NotificationType.DEAL_LOST]: undefined,
      [NotificationType.QUOTATION_SENT]: undefined,
      [NotificationType.QUOTATION_ACCEPTED]: undefined,
      [NotificationType.INVOICE_SENT]: undefined,
      [NotificationType.INVOICE_PAID]: undefined,
      [NotificationType.SYSTEM]: undefined,
    };

    const config = messages[type];
    if (!config) return;

    return this.create({
      userId,
      type,
      title: config.title,
      message: config.message,
      link: `/leads/${leadId}`,
      metadata: { leadId, leadName },
    });
  }

  /**
   * Send FCM Push Notification to a device token
   * @param deviceToken - FCM device token
   * @param title - Notification title
   * @param body - Notification body
   * @param data - Optional data payload
   */
  async sendPushNotification(
    deviceToken: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<boolean> {
    try {
      if (!admin.apps.length) {
        this.logger.warn('Firebase not initialized. Cannot send push notification.');
        return false;
      }

      const message: admin.messaging.Message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        token: deviceToken,
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`Push notification sent successfully: ${response}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to send push notification:', error);
      return false;
    }
  }
}
