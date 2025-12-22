import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';
import { getAccessibleUserIds } from '../../common/utils/permission.util';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) { }

  async list({
    page = 1,
    limit = 10,
    status,
    search,
    leadId,
    dealId,
    assignedTo,
  }: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    leadId?: number;
    dealId?: number;
    assignedTo?: number;
  }, user?: any) {
    const where: any = { deletedAt: null };

    // Role-based filtering
    if (user && user.userId) {
      const accessibleIds = await getAccessibleUserIds(user.userId, this.prisma);
      if (accessibleIds) {
        where.AND = [
          {
            OR: [
              { assignedTo: { in: accessibleIds } },
              { createdBy: { in: accessibleIds } },
              { lead: { assignedTo: { in: accessibleIds } } },
              { deal: { assignedTo: { in: accessibleIds } } },
            ],
          },
        ];
      }
    }
    if (status) {
      const values = status.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
      where.status = values.length > 1 ? { in: values as any } : values[0];
    }
    if (leadId) where.leadId = leadId;
    if (dealId) where.dealId = dealId;
    if (assignedTo) where.assignedTo = assignedTo;
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },

        // --- UPDATED INCLUDE CLAUSE ---
        include: {
          assignedUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          createdByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          // --- NEW: Lead की पूरी information लाने के लिए ---
          lead: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              company: true,
            },
          },
        },
      }),
      this.prisma.task.count({ where }),
    ]);
    return { success: true, data: { items, tasks: items, total, page, limit } };
  }

  async getById(id: number, user?: any) {
    const where: any = { id, deletedAt: null };

    // Role-based filtering
    if (user && user.userId) {
      const accessibleIds = await getAccessibleUserIds(user.userId, this.prisma);
      if (accessibleIds) {
        where.AND = [
          {
            OR: [
              { assignedTo: { in: accessibleIds } },
              { createdBy: { in: accessibleIds } },
              { lead: { assignedTo: { in: accessibleIds } } },
              { deal: { assignedTo: { in: accessibleIds } } },
            ],
          },
        ];
      }
    }

    const task = await this.prisma.task.findFirst({
      where,

      // --- UPDATED INCLUDE CLAUSE ---
      include: {
        assignedUser: { select: { id: true, firstName: true, lastName: true } },
        createdByUser: { select: { id: true, firstName: true, lastName: true } },
        // --- NEW: Lead की पूरी information लाने के लिए ---
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            company: true,
          },
        },
      },
    });
    if (!task) return { success: false, message: 'Task not found' };
    return { success: true, data: { task } };
  }

  async create(dto: CreateTaskDto) {
    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        status: (dto.status as any) ?? 'PENDING',
        priority: (dto.priority as any) ?? 'MEDIUM',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        assignedTo: dto.assignedTo ?? null,
        createdBy: dto.createdBy,
        leadId: dto.leadId ?? null,
        dealId: dto.dealId ?? null,
      },
      // --- UPDATED INCLUDE CLAUSE ---
      include: {
        assignedUser: { select: { id: true, firstName: true, lastName: true } },
        createdByUser: { select: { id: true, firstName: true, lastName: true } },
        // --- NEW: Lead की पूरी information लाने के लिए ---
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            company: true,
          },
        },
      },
    });

    // Log activity
    await this.prisma.activity.create({
      data: {
        title: 'Task created',
        description: `Task \"${task.title}\" created${task.assignedUser ? ' and assigned' : ''}.`,
        type: 'TASK_CREATED' as any,
        icon: 'CheckCircle',
        iconColor: 'text-orange-600',
        metadata: {
          taskId: task.id,
          leadId: task.leadId,
          dealId: task.dealId,
          assignedTo: task.assignedTo,
          priority: task.priority,
          dueDate: task.dueDate,
        } as any,
        userId: dto.createdBy,
        leadId: task.leadId ?? undefined,
      },
    });

    // Send notification to assigned user if task is assigned
    if (task.assignedTo) {
      try {
        await this.notificationsService.create({
          userId: task.assignedTo,
          type: NotificationType.TASK_ASSIGNED,
          title: 'New Task Assigned',
          message: `Task "${task.title}" has been assigned to you.`,
          link: task.leadId
            ? `/leads/${task.leadId}`
            : task.dealId
              ? `/deals/${task.dealId}`
              : undefined,
          metadata: {
            taskId: task.id,
            leadId: task.leadId,
            dealId: task.dealId,
          } as any,
        });
      } catch (error) {
        console.error('Failed to send task assignment notification:', error);
      }
    }

    return { success: true, data: { task } };
  }

  async update(id: number, dto: UpdateTaskDto) {
    const existing = await this.prisma.task.findUnique({ where: { id } });

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status as any,
        priority: dto.priority as any,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        assignedTo: dto.assignedTo ?? undefined,
        leadId: dto.leadId ?? undefined,
        dealId: dto.dealId ?? undefined,
        updatedAt: new Date(),
      },
      // --- UPDATED INCLUDE CLAUSE ---
      include: {
        assignedUser: { select: { id: true, firstName: true, lastName: true } },
        createdByUser: { select: { id: true, firstName: true, lastName: true } },
        // --- NEW: Lead की पूरी information लाने के लिए ---
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            company: true,
          },
        },
      },
    });

    // Log activity
    await this.prisma.activity.create({
      data: {
        title: 'Task updated',
        description: `Task \"${task.title}\" updated.`,
        type: 'TASK_UPDATED' as any,
        icon: 'Edit',
        iconColor: 'text-blue-600',
        metadata: {
          taskId: task.id,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          assignedTo: task.assignedTo,
        } as any,
        userId: task.createdBy,
        leadId: task.leadId ?? undefined,
      },
    });

    // If assignment changed, notify the new assignee
    if (task.assignedTo && task.assignedTo !== existing?.assignedTo) {
      try {
        await this.notificationsService.create({
          userId: task.assignedTo,
          type: NotificationType.TASK_ASSIGNED,
          title: 'Task Assigned',
          message: `Task "${task.title}" has been assigned to you.`,
          link: task.leadId
            ? `/leads/${task.leadId}`
            : task.dealId
              ? `/deals/${task.dealId}`
              : undefined,
          metadata: {
            taskId: task.id,
            leadId: task.leadId,
            dealId: task.dealId,
          } as any,
        });
      } catch (error) {
        console.error('Failed to send task reassignment notification:', error);
      }
    }

    return { success: true, data: { task } };
  }

  async complete(id: number) {
    const task = await this.prisma.task.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date() },
      // --- UPDATED INCLUDE CLAUSE ---
      include: {
        assignedUser: { select: { id: true, firstName: true, lastName: true } },
        createdByUser: { select: { id: true, firstName: true, lastName: true } },
        // --- NEW: Lead की पूरी information लाने के लिए ---
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            company: true,
          },
        },
      },
    });

    // Log activity
    await this.prisma.activity.create({
      data: {
        title: 'Task completed',
        description: `Task "${task.title}" marked completed.`,
        type: 'TASK_COMPLETED' as any,
        icon: 'CheckCircle',
        iconColor: 'text-green-600',
        metadata: { taskId: task.id } as any,
        userId: task.createdBy,
      },
    });

    return { success: true, data: { task } };
  }

  async remove(id: number) {
    await this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    return { success: true };
  }
}