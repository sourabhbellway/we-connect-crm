import { MessageEvent } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, BulkNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { UpdateNotificationPreferenceDto } from './dto/notification-preference.dto';
import { Observable } from 'rxjs';
interface NotificationEvent {
    userId: number;
    notification: any;
}
export declare class NotificationsController {
    private readonly notificationsService;
    private userStreams;
    constructor(notificationsService: NotificationsService);
    getNotifications(req: any, query: QueryNotificationsDto): Promise<{
        success: boolean;
        data: {
            notifications: {
                createdAt: Date;
                updatedAt: Date;
                id: number;
                link: string | null;
                message: string;
                userId: number;
                type: import("@prisma/client").$Enums.NotificationType;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                title: string;
                read: boolean;
                readAt: Date | null;
            }[];
            unreadCount: number;
            pagination: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
            };
        };
    }>;
    getUnreadCount(req: any): Promise<{
        success: boolean;
        data: {
            unreadCount: number;
        };
    }>;
    markAsRead(id: string, req: any): Promise<{
        success: boolean;
        data: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            link: string | null;
            message: string;
            userId: number;
            type: import("@prisma/client").$Enums.NotificationType;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            title: string;
            read: boolean;
            readAt: Date | null;
        };
    }>;
    markAllAsRead(req: any): Promise<{
        success: boolean;
        data: {
            count: number;
        };
    }>;
    deleteNotification(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    createNotification(dto: CreateNotificationDto): Promise<{
        success: boolean;
        skipped: boolean;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            link: string | null;
            message: string;
            userId: number;
            type: import("@prisma/client").$Enums.NotificationType;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            title: string;
            read: boolean;
            readAt: Date | null;
        };
        skipped?: undefined;
    }>;
    createBulkNotifications(dto: BulkNotificationDto): Promise<{
        success: boolean;
        data: {
            count: number;
        };
    }>;
    getPreferences(req: any): Promise<{
        success: boolean;
        data: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            userId: number;
            preferences: import("@prisma/client/runtime/library").JsonValue;
            inAppEnabled: boolean;
            emailEnabled: boolean;
            soundEnabled: boolean;
            doNotDisturbStart: number | null;
            doNotDisturbEnd: number | null;
        };
    }>;
    updatePreferences(req: any, dto: UpdateNotificationPreferenceDto): Promise<{
        success: boolean;
        data: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            userId: number;
            preferences: import("@prisma/client/runtime/library").JsonValue;
            inAppEnabled: boolean;
            emailEnabled: boolean;
            soundEnabled: boolean;
            doNotDisturbStart: number | null;
            doNotDisturbEnd: number | null;
        };
    }>;
    streamNotifications(req: any): Observable<MessageEvent>;
    handleNotificationCreated(payload: NotificationEvent): void;
}
export {};
