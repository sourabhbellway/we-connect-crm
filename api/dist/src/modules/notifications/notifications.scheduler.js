"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationCronService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationCronService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../database/prisma.service");
const notifications_service_1 = require("./notifications.service");
const client_1 = require("@prisma/client");
let NotificationCronService = NotificationCronService_1 = class NotificationCronService {
    prisma;
    notificationsService;
    logger = new common_1.Logger(NotificationCronService_1.name);
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async handleDueReminders() {
        const now = new Date();
        const windowStart = new Date(now.getTime() - 5 * 60 * 1000);
        try {
            await Promise.all([
                this.handleDueTasks(windowStart, now),
                this.handleDueFollowUps(windowStart, now),
            ]);
        }
        catch (error) {
            this.logger.error('Error running due reminders cron:', error);
        }
    }
    async handleDueTasks(windowStart, now) {
        const tasks = await this.prisma.task.findMany({
            where: {
                deletedAt: null,
                isActive: true,
                status: { in: [client_1.TaskStatus.PENDING, client_1.TaskStatus.IN_PROGRESS] },
                dueDate: {
                    lte: now,
                    gte: windowStart,
                },
                assignedTo: { not: null },
            },
            select: {
                id: true,
                title: true,
                assignedTo: true,
                leadId: true,
                dealId: true,
                dueDate: true,
            },
        });
        for (const task of tasks) {
            if (!task.assignedTo)
                continue;
            try {
                await this.notificationsService.create({
                    userId: task.assignedTo,
                    type: client_1.NotificationType.TASK_DUE,
                    title: 'Task Due',
                    message: 'Task "' +
                        task.title +
                        '" is due now' +
                        (task.dueDate
                            ? ' (due at ' + task.dueDate.toLocaleTimeString() + ')'
                            : '') +
                        '.',
                    link: task.leadId
                        ? `/leads/${task.leadId}`
                        : task.dealId
                            ? `/deals/${task.dealId}`
                            : undefined,
                    metadata: {
                        taskId: task.id,
                        leadId: task.leadId,
                        dealId: task.dealId,
                        dueDate: task.dueDate,
                    },
                });
            }
            catch (error) {
                this.logger.error('Failed to send task due notification:', error);
            }
        }
    }
    async handleDueFollowUps(windowStart, now) {
        const followUps = await this.prisma.leadFollowUp.findMany({
            where: {
                isCompleted: false,
                reminderSet: true,
                scheduledAt: {
                    lte: now,
                    gte: windowStart,
                },
            },
            select: {
                id: true,
                subject: true,
                scheduledAt: true,
                leadId: true,
                userId: true,
            },
        });
        for (const fu of followUps) {
            try {
                const lead = await this.prisma.lead.findUnique({
                    where: { id: fu.leadId },
                    select: { id: true, firstName: true, lastName: true, assignedTo: true },
                });
                const targetUserId = lead?.assignedTo || fu.userId;
                if (!targetUserId)
                    continue;
                await this.notificationsService.create({
                    userId: targetUserId,
                    type: client_1.NotificationType.FOLLOW_UP_DUE,
                    title: 'Follow-up Due',
                    message: 'Follow-up "' +
                        fu.subject +
                        '" is due now' +
                        (fu.scheduledAt
                            ? ' (at ' + fu.scheduledAt.toLocaleTimeString() + ')'
                            : '') +
                        '.',
                    link: `/leads/${fu.leadId}`,
                    metadata: {
                        followUpId: fu.id,
                        leadId: fu.leadId,
                        scheduledAt: fu.scheduledAt,
                    },
                });
            }
            catch (error) {
                this.logger.error('Failed to send follow-up due notification:', error);
            }
        }
    }
};
exports.NotificationCronService = NotificationCronService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationCronService.prototype, "handleDueReminders", null);
exports.NotificationCronService = NotificationCronService = NotificationCronService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], NotificationCronService);
//# sourceMappingURL=notifications.scheduler.js.map