import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from './notifications.service';
import { NotificationType, TaskStatus } from '@prisma/client';

/**
 * Periodic job to send reminders for due tasks and lead follow-ups.
 *
 * This relies on NotificationPreferences/Do Not Disturb in NotificationsService,
 * so user settings are always respected.
 */
@Injectable()
export class NotificationCronService {
  private readonly logger = new Logger(NotificationCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // Run every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async handleDueReminders() {
    const now = new Date();
    const windowStart = new Date(now.getTime() - 5 * 60 * 1000); // last 5 minutes

    try {
      await Promise.all([
        this.handleDueTasks(windowStart, now),
        this.handleDueFollowUps(windowStart, now),
      ]);
    } catch (error) {
      this.logger.error('Error running due reminders cron:', error);
    }
  }

  private async handleDueTasks(windowStart: Date, now: Date) {
    const tasks = await this.prisma.task.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        status: { in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS] },
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
      if (!task.assignedTo) continue;

      try {
        await this.notificationsService.create({
          userId: task.assignedTo,
          type: NotificationType.TASK_DUE,
          title: 'Task Due',
          message:
            'Task "' +
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
          } as any,
        });
      } catch (error) {
        this.logger.error('Failed to send task due notification:', error);
      }
    }
  }

  private async handleDueFollowUps(windowStart: Date, now: Date) {
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
        // Prefer notifying the lead owner if available; otherwise, the follow-up owner
        const lead = await this.prisma.lead.findUnique({
          where: { id: fu.leadId },
          select: { id: true, firstName: true, lastName: true, assignedTo: true },
        });

        const targetUserId = lead?.assignedTo || fu.userId;
        if (!targetUserId) continue;

        await this.notificationsService.create({
          userId: targetUserId,
          type: NotificationType.FOLLOW_UP_DUE,
          title: 'Follow-up Due',
          message:
            'Follow-up "' +
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
          } as any,
        });
      } catch (error) {
        this.logger.error('Failed to send follow-up due notification:', error);
      }
    }
  }
}