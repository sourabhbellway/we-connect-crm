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
exports.ActivitiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const permission_util_1 = require("../../common/utils/permission.util");
let ActivitiesService = class ActivitiesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRecent(limit = 5, user, targetUserId) {
        const where = {};
        if (user && user.userId) {
            const accessibleIds = await (0, permission_util_1.getAccessibleUserIds)(user.userId, this.prisma);
            if (accessibleIds) {
                where.OR = [
                    { userId: { in: accessibleIds } },
                    { lead: { assignedTo: { in: accessibleIds } } },
                ];
            }
            else if (targetUserId) {
                where.OR = [
                    { userId: targetUserId },
                    { lead: { assignedTo: targetUserId } },
                ];
            }
        }
        const items = await this.prisma.activity.findMany({
            where,
            take: limit,
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, data: { items } };
    }
    async getStats() {
        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        const startOfWeek = new Date(startOfToday);
        const day = startOfWeek.getDay();
        const diff = day === 0 ? 6 : day - 1;
        startOfWeek.setDate(startOfWeek.getDate() - diff);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const [totalCount, todayCount, weekCount, monthCount] = await Promise.all([
            this.prisma.activity.count(),
            this.prisma.activity.count({
                where: { createdAt: { gte: startOfToday } },
            }),
            this.prisma.activity.count({
                where: { createdAt: { gte: startOfWeek } },
            }),
            this.prisma.activity.count({
                where: { createdAt: { gte: startOfMonth } },
            }),
        ]);
        return {
            success: true,
            data: {
                totalCount,
                todayCount,
                weekCount,
                monthCount,
            },
        };
    }
    async getDeletedData({ page = 1, limit = 10, }) {
        try {
            const [users, leads, roles] = await Promise.all([
                this.prisma.user.findMany({
                    where: { deletedAt: { not: null } },
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { deletedAt: 'desc' },
                }),
                this.prisma.lead.findMany({
                    where: { deletedAt: { not: null } },
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { deletedAt: 'desc' },
                }),
                this.prisma.role.findMany({
                    where: { deletedAt: { not: null } },
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { deletedAt: 'desc' },
                }),
            ]);
            const [usersTotal, leadsTotal, rolesTotal] = await Promise.all([
                this.prisma.user.count({ where: { deletedAt: { not: null } } }),
                this.prisma.lead.count({ where: { deletedAt: { not: null } } }),
                this.prisma.role.count({ where: { deletedAt: { not: null } } }),
            ]);
            return {
                success: true,
                data: {
                    users: { records: users, total: usersTotal, pages: Math.ceil(usersTotal / limit) },
                    leads: { records: leads, total: leadsTotal, pages: Math.ceil(leadsTotal / limit) },
                    roles: { records: roles, total: rolesTotal, pages: Math.ceil(rolesTotal / limit) },
                },
            };
        }
        catch (error) {
            console.error('Error in activities.getDeletedData:', error);
            throw new common_1.HttpException({
                success: false,
                message: error?.message || 'Internal server error',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async list({ page = 1, limit = 10, type, search, }, user) {
        const where = {};
        if (type)
            where.type = type;
        if (user && user.userId) {
            const accessibleIds = await (0, permission_util_1.getAccessibleUserIds)(user.userId, this.prisma);
            if (accessibleIds) {
                where.OR = [
                    { userId: { in: accessibleIds } },
                    { lead: { assignedTo: { in: accessibleIds } } },
                ];
            }
        }
        if (search && search.trim()) {
            const q = search.trim();
            const searchConditions = [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
            ];
            if (where.OR) {
                where.AND = [
                    { OR: where.OR },
                    { OR: searchConditions }
                ];
                delete where.OR;
            }
            else {
                where.OR = searchConditions;
            }
        }
        const [items, total] = await Promise.all([
            this.prisma.activity.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.activity.count({ where }),
        ]);
        return { success: true, data: { items, total, page, limit } };
    }
    async create(dto) {
        const activity = await this.prisma.activity.create({
            data: {
                title: dto.title,
                description: dto.description,
                type: dto.type,
                icon: dto.icon ?? undefined,
                iconColor: dto.iconColor ?? undefined,
                tags: dto.tags ?? [],
                metadata: dto.metadata ?? undefined,
                userId: dto.userId ?? undefined,
                superAdminId: dto.superAdminId ?? undefined,
                leadId: dto.leadId ?? undefined,
            },
        });
        return { success: true, data: { activity } };
    }
    async getActivitiesByLeadId(leadId, { page = 1, limit = 10 } = {}) {
        const where = { leadId };
        const [items, total] = await Promise.all([
            this.prisma.activity.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            }),
            this.prisma.activity.count({ where }),
        ]);
        return { success: true, data: { items, total, page, limit } };
    }
    async getActivitiesForCalendar({ startDate, endDate, }, user) {
        try {
            let leadFilter = {};
            let userFilter = {};
            if (user && user.userId) {
                const accessibleIds = await (0, permission_util_1.getAccessibleUserIds)(user.userId, this.prisma);
                if (accessibleIds) {
                    leadFilter = { assignedTo: { in: accessibleIds } };
                    userFilter = { id: { in: accessibleIds } };
                }
            }
            const meetings = await this.prisma.leadCommunication.findMany({
                where: {
                    type: 'MEETING',
                    scheduledAt: {
                        not: null,
                        ...(startDate && endDate ? {
                            gte: startDate,
                            lte: endDate,
                        } : {}),
                    },
                    ...(Object.keys(leadFilter).length > 0 ? { lead: leadFilter } : {}),
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    lead: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
                orderBy: { scheduledAt: 'asc' },
            });
            const leadIds = meetings.map(m => m.leadId);
            const activities = await this.prisma.activity.findMany({
                where: {
                    type: 'COMMUNICATION_LOGGED',
                    ...(Object.keys(leadFilter).length > 0 ? {
                        OR: [
                            { userId: user.userId },
                            { lead: leadFilter }
                        ]
                    } : {}),
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
            const calendarActivities = [
                ...activities.map(activity => {
                    const metadata = activity.metadata;
                    return {
                        id: activity.id,
                        title: activity.title,
                        description: activity.description,
                        type: activity.type,
                        date: metadata?.scheduledAt ? new Date(metadata.scheduledAt) : null,
                        leadId: activity.leadId,
                        userId: activity.userId,
                        user: activity.user,
                        source: 'activity',
                    };
                }).filter(item => item.date),
                ...meetings.map(meeting => ({
                    id: meeting.id,
                    title: meeting.subject || 'Meeting',
                    description: meeting.content,
                    type: 'MEETING',
                    date: meeting.scheduledAt,
                    leadId: meeting.leadId,
                    userId: meeting.userId,
                    lead: meeting.lead,
                    user: meeting.user,
                    source: 'meeting',
                })),
            ].filter(item => item.date);
            return {
                success: true,
                data: {
                    activities: calendarActivities,
                    total: calendarActivities.length,
                },
            };
        }
        catch (error) {
            console.error('Error fetching calendar activities:', error);
            throw new common_1.HttpException({
                success: false,
                message: error?.message || 'Failed to fetch calendar activities',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ActivitiesService = ActivitiesService;
exports.ActivitiesService = ActivitiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActivitiesService);
//# sourceMappingURL=activities.service.js.map