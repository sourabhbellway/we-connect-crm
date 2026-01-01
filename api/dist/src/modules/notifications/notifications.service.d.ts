import { PrismaService } from '../../database/prisma.service';
import { CreateNotificationDto, BulkNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { UpdateNotificationPreferenceDto } from './dto/notification-preference.dto';
import { NotificationType } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class NotificationsService {
    private readonly prisma;
    private readonly eventEmitter;
    private readonly logger;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    create(dto: CreateNotificationDto): Promise<{
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
            title: string;
            type: import("@prisma/client").$Enums.NotificationType;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            userId: number;
            read: boolean;
            readAt: Date | null;
        };
        skipped?: undefined;
    }>;
    createBulk(dto: BulkNotificationDto): Promise<{
        success: boolean;
        data: {
            count: number;
        };
    }>;
    findAll(userId: number, query: QueryNotificationsDto): Promise<{
        success: boolean;
        data: {
            notifications: {
                createdAt: Date;
                updatedAt: Date;
                id: number;
                link: string | null;
                message: string;
                title: string;
                type: import("@prisma/client").$Enums.NotificationType;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                userId: number;
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
    markAsRead(id: number, userId: number): Promise<{
        success: boolean;
        data: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            link: string | null;
            message: string;
            title: string;
            type: import("@prisma/client").$Enums.NotificationType;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            userId: number;
            read: boolean;
            readAt: Date | null;
        };
    }>;
    markAllAsRead(userId: number): Promise<{
        success: boolean;
        data: {
            count: number;
        };
    }>;
    delete(id: number, userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    getUnreadCount(userId: number): Promise<{
        success: boolean;
        data: {
            unreadCount: number;
        };
    }>;
    getPreferences(userId: number): Promise<{
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
    updatePreferences(userId: number, dto: UpdateNotificationPreferenceDto): Promise<{
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
    private shouldSendNotification;
    private getPreferenceKey;
    notifyLeadEvent(type: NotificationType, userId: number, leadId: number, leadName: string, additionalInfo?: string): Promise<{
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
            title: string;
            type: import("@prisma/client").$Enums.NotificationType;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            userId: number;
            read: boolean;
            readAt: Date | null;
        };
        skipped?: undefined;
    } | undefined>;
    sendPushNotification(deviceToken: string, title: string, body: string, data?: Record<string, string>): Promise<boolean>;
}
