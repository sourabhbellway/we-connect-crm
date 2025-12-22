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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const client_1 = require("@prisma/client");
const permission_util_1 = require("../../common/utils/permission.util");
let TasksService = class TasksService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async list({ page = 1, limit = 10, status, search, leadId, dealId, assignedTo, }, user) {
        const where = { deletedAt: null };
        if (user && user.userId) {
            const accessibleIds = await (0, permission_util_1.getAccessibleUserIds)(user.userId, this.prisma);
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
            where.status = values.length > 1 ? { in: values } : values[0];
        }
        if (leadId)
            where.leadId = leadId;
        if (dealId)
            where.dealId = dealId;
        if (assignedTo)
            where.assignedTo = assignedTo;
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
    async getById(id, user) {
        const where = { id, deletedAt: null };
        if (user && user.userId) {
            const accessibleIds = await (0, permission_util_1.getAccessibleUserIds)(user.userId, this.prisma);
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
            include: {
                assignedUser: { select: { id: true, firstName: true, lastName: true } },
                createdByUser: { select: { id: true, firstName: true, lastName: true } },
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
        if (!task)
            return { success: false, message: 'Task not found' };
        return { success: true, data: { task } };
    }
    async create(dto) {
        const task = await this.prisma.task.create({
            data: {
                title: dto.title,
                description: dto.description ?? null,
                status: dto.status ?? 'PENDING',
                priority: dto.priority ?? 'MEDIUM',
                dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
                assignedTo: dto.assignedTo ?? null,
                createdBy: dto.createdBy,
                leadId: dto.leadId ?? null,
                dealId: dto.dealId ?? null,
            },
            include: {
                assignedUser: { select: { id: true, firstName: true, lastName: true } },
                createdByUser: { select: { id: true, firstName: true, lastName: true } },
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
        await this.prisma.activity.create({
            data: {
                title: 'Task created',
                description: `Task \"${task.title}\" created${task.assignedUser ? ' and assigned' : ''}.`,
                type: 'TASK_CREATED',
                icon: 'CheckCircle',
                iconColor: 'text-orange-600',
                metadata: {
                    taskId: task.id,
                    leadId: task.leadId,
                    dealId: task.dealId,
                    assignedTo: task.assignedTo,
                    priority: task.priority,
                    dueDate: task.dueDate,
                },
                userId: dto.createdBy,
                leadId: task.leadId ?? undefined,
            },
        });
        if (task.assignedTo) {
            try {
                await this.notificationsService.create({
                    userId: task.assignedTo,
                    type: client_1.NotificationType.TASK_ASSIGNED,
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
                    },
                });
            }
            catch (error) {
                console.error('Failed to send task assignment notification:', error);
            }
        }
        return { success: true, data: { task } };
    }
    async update(id, dto) {
        const existing = await this.prisma.task.findUnique({ where: { id } });
        const task = await this.prisma.task.update({
            where: { id },
            data: {
                title: dto.title,
                description: dto.description,
                status: dto.status,
                priority: dto.priority,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
                assignedTo: dto.assignedTo ?? undefined,
                leadId: dto.leadId ?? undefined,
                dealId: dto.dealId ?? undefined,
                updatedAt: new Date(),
            },
            include: {
                assignedUser: { select: { id: true, firstName: true, lastName: true } },
                createdByUser: { select: { id: true, firstName: true, lastName: true } },
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
        await this.prisma.activity.create({
            data: {
                title: 'Task updated',
                description: `Task \"${task.title}\" updated.`,
                type: 'TASK_UPDATED',
                icon: 'Edit',
                iconColor: 'text-blue-600',
                metadata: {
                    taskId: task.id,
                    status: task.status,
                    priority: task.priority,
                    dueDate: task.dueDate,
                    assignedTo: task.assignedTo,
                },
                userId: task.createdBy,
                leadId: task.leadId ?? undefined,
            },
        });
        if (task.assignedTo && task.assignedTo !== existing?.assignedTo) {
            try {
                await this.notificationsService.create({
                    userId: task.assignedTo,
                    type: client_1.NotificationType.TASK_ASSIGNED,
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
                    },
                });
            }
            catch (error) {
                console.error('Failed to send task reassignment notification:', error);
            }
        }
        return { success: true, data: { task } };
    }
    async complete(id) {
        const task = await this.prisma.task.update({
            where: { id },
            data: { status: 'COMPLETED', completedAt: new Date() },
            include: {
                assignedUser: { select: { id: true, firstName: true, lastName: true } },
                createdByUser: { select: { id: true, firstName: true, lastName: true } },
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
        await this.prisma.activity.create({
            data: {
                title: 'Task completed',
                description: `Task "${task.title}" marked completed.`,
                type: 'TASK_COMPLETED',
                icon: 'CheckCircle',
                iconColor: 'text-green-600',
                metadata: { taskId: task.id },
                userId: task.createdBy,
            },
        });
        return { success: true, data: { task } };
    }
    async remove(id) {
        await this.prisma.task.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
        return { success: true };
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map