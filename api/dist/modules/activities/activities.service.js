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
let ActivitiesService = class ActivitiesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRecent(limit = 5) {
        const items = await this.prisma.activity.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, data: { items } };
    }
    async getStats() {
        const total = await this.prisma.activity.count();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCount = await this.prisma.activity.count({
            where: {
                createdAt: {
                    gte: today,
                },
            },
        });
        return { success: true, data: { total, today: todayCount } };
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
    async list({ page = 1, limit = 10, type, }) {
        const where = {};
        if (type)
            where.type = type;
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
};
exports.ActivitiesService = ActivitiesService;
exports.ActivitiesService = ActivitiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActivitiesService);
//# sourceMappingURL=activities.service.js.map