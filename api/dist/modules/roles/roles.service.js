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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let RolesService = class RolesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list({ search, page = 1, limit = 10, isDeleted, }) {
        const where = {};
        if (isDeleted === true) {
            where.deletedAt = { not: null };
        }
        else if (isDeleted === false || isDeleted === undefined) {
            where.deletedAt = null;
        }
        if (search && search.trim()) {
            const q = search.trim();
            where.OR = [{ name: { contains: q, mode: 'insensitive' } }];
        }
        const [items, total] = await Promise.all([
            this.prisma.role.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    permissions: { include: { permission: true } },
                },
            }),
            this.prisma.role.count({ where }),
        ]);
        const data = items.map((r) => ({
            id: r.id,
            name: r.name,
            description: r.description,
            isActive: r.isActive,
            accessScope: r.accessScope,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            deletedAt: r.deletedAt,
            permissions: r.permissions.map((rp) => rp.permission),
        }));
        const totalPages = Math.max(1, Math.ceil(total / limit));
        return {
            success: true,
            data: {
                roles: data,
                pagination: {
                    totalItems: total,
                    currentPage: page,
                    pageSize: limit,
                    totalPages,
                },
            }
        };
    }
    async create(dto) {
        const role = await this.prisma.role.create({
            data: {
                name: dto.name,
                description: dto.description ?? null,
                accessScope: dto.accessScope,
                permissions: {
                    create: dto.permissionIds.map((pid) => ({
                        permission: { connect: { id: pid } },
                    })),
                },
            },
            include: { permissions: { include: { permission: true } } },
        });
        return {
            success: true,
            data: {
                id: role.id,
                name: role.name,
                description: role.description,
                isActive: role.isActive,
                accessScope: role.accessScope,
                permissions: role.permissions.map((rp) => rp.permission),
                createdAt: role.createdAt,
                updatedAt: role.updatedAt,
            },
        };
    }
    async update(id, dto) {
        const role = await this.prisma.role.findFirst({
            where: { id, deletedAt: null },
        });
        if (!role)
            return { success: false, message: 'Role not found' };
        const updated = await this.prisma.role.update({
            where: { id },
            data: {
                name: dto.name,
                description: dto.description ?? null,
                accessScope: dto.accessScope,
                permissions: {
                    deleteMany: {},
                    create: dto.permissionIds.map((pid) => ({
                        permission: { connect: { id: pid } },
                    })),
                },
            },
            include: { permissions: { include: { permission: true } } },
        });
        return {
            success: true,
            data: {
                id: updated.id,
                name: updated.name,
                description: updated.description,
                isActive: updated.isActive,
                accessScope: updated.accessScope,
                permissions: updated.permissions.map((rp) => rp.permission),
                createdAt: updated.createdAt,
                updatedAt: updated.updatedAt,
            },
        };
    }
    async remove(id) {
        const role = await this.prisma.role.findFirst({
            where: { id, deletedAt: null },
        });
        if (!role)
            return { success: false, message: 'Role not found' };
        await this.prisma.role.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return { success: true, message: 'Role moved to trash' };
    }
    async restore(id) {
        const role = await this.prisma.role.findFirst({
            where: { id, deletedAt: { not: null } },
        });
        if (!role)
            return { success: false, message: 'Role not found in trash' };
        await this.prisma.role.update({
            where: { id },
            data: { deletedAt: null },
        });
        return { success: true, message: 'Role restored successfully' };
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolesService);
//# sourceMappingURL=roles.service.js.map