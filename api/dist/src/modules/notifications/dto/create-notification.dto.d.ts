import { NotificationType } from '@prisma/client';
export declare class CreateNotificationDto {
    userId: number;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    metadata?: Record<string, any>;
}
export declare class BulkNotificationDto {
    userIds: number[];
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    metadata?: Record<string, any>;
}
