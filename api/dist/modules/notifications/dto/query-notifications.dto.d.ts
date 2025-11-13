import { NotificationType } from '@prisma/client';
export declare class QueryNotificationsDto {
    type?: NotificationType;
    read?: boolean;
    page?: number;
    limit?: number;
}
