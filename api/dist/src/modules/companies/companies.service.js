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
exports.CompaniesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const permission_util_1 = require("../../common/utils/permission.util");
let CompaniesService = class CompaniesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list({ page = 1, limit = 10, search, }, user) {
        const where = {};
        if (user && user.userId) {
            const roleBasedWhere = await (0, permission_util_1.getRoleBasedWhereClause)(user.userId, this.prisma);
            if (Object.keys(roleBasedWhere).length > 0) {
                where.AND = [roleBasedWhere];
            }
        }
        if (search && search.trim()) {
            const q = search.trim();
            const searchConditions = [
                { name: { contains: q, mode: 'insensitive' } },
                { domain: { contains: q, mode: 'insensitive' } },
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
        const rows = await this.prisma.companies.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                assignedUser: { select: { id: true, firstName: true, lastName: true, email: true } },
                industry: true,
            },
        });
        return { success: true, data: rows };
    }
    async getById(id, user) {
        const where = { id, deletedAt: null };
        if (user && user.userId) {
            const roleBasedWhere = await (0, permission_util_1.getRoleBasedWhereClause)(user.userId, this.prisma);
            if (Object.keys(roleBasedWhere).length > 0) {
                where.AND = [roleBasedWhere];
            }
        }
        const company = await this.prisma.companies.findFirst({
            where,
            include: {
                assignedUser: { select: { id: true, firstName: true, lastName: true, email: true } },
                industry: true,
            },
        });
        if (!company)
            return { success: false, message: 'Company not found' };
        return { success: true, data: { company } };
    }
    async create(dto, userId) {
        const company = await this.prisma.companies.create({
            data: {
                name: dto.name,
                domain: dto.domain,
                slug: dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                industryId: dto.industryId ?? null,
                assignedTo: userId || null,
                createdBy: userId || null,
            },
        });
        return {
            success: true,
            message: 'Company created successfully',
            data: { company },
        };
    }
    async update(id, dto) {
        const company = await this.prisma.companies.update({
            where: { id },
            data: {
                name: dto.name,
                domain: dto.domain,
                slug: dto.slug,
                industryId: dto.industryId ?? undefined,
                updatedAt: new Date(),
            },
        });
        return {
            success: true,
            message: 'Company updated successfully',
            data: { company },
        };
    }
    async remove(id) {
        await this.prisma.companies.delete({ where: { id } });
        return { success: true, message: 'Company deleted successfully' };
    }
};
exports.CompaniesService = CompaniesService;
exports.CompaniesService = CompaniesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompaniesService);
//# sourceMappingURL=companies.service.js.map