import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from './notifications.service';
export declare class NotificationCronService {
    private readonly prisma;
    private readonly notificationsService;
    private readonly logger;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    handleDueReminders(): Promise<void>;
    private handleDueTasks;
    private handleDueFollowUps;
}
