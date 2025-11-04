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
exports.DealsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let DealsService = class DealsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list({ page = 1, limit = 10, search, }) {
        const pageNum = Math.max(1, Number(page) || 1);
        const pageSize = Math.max(1, Math.min(100, Number(limit) || 10));
        const where = { deletedAt: null, isActive: true };
        if (search && search.trim()) {
            const q = search.trim();
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { companies: { name: { contains: q, mode: 'insensitive' } } },
                { contact: { firstName: { contains: q, mode: 'insensitive' } } },
                { contact: { lastName: { contains: q, mode: 'insensitive' } } },
                { contact: { email: { contains: q, mode: 'insensitive' } } },
            ];
        }
        const [rows, total] = await Promise.all([
            this.prisma.deal.findMany({
                where,
                skip: (pageNum - 1) * pageSize,
                take: pageSize,
                orderBy: [{ value: 'desc' }, { createdAt: 'desc' }],
                include: {
                    assignedUser: { select: { id: true, firstName: true, lastName: true, email: true } },
                    contact: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
                    lead: { select: { id: true, firstName: true, lastName: true, email: true } },
                    companies: { select: { id: true, name: true } },
                },
            }),
            this.prisma.deal.count({ where }),
        ]);
        const normalized = rows.map((d) => ({
            ...d,
            value: Number(d.value ?? 0),
        }));
        const pages = Math.max(1, Math.ceil(total / pageSize));
        return {
            success: true,
            data: {
                deals: normalized,
                pagination: {
                    page: pageNum,
                    limit: pageSize,
                    total,
                    pages,
                },
            },
        };
    }
    async getById(id) {
        const deal = await this.prisma.deal.findFirst({
            where: { id, deletedAt: null },
            include: {
                assignedUser: { select: { id: true, firstName: true, lastName: true, email: true } },
                contact: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
                lead: { select: { id: true, firstName: true, lastName: true, email: true } },
                companies: { select: { id: true, name: true } },
            },
        });
        if (!deal)
            return { success: false, message: 'Deal not found' };
        const normalized = { ...deal, value: Number(deal.value ?? 0) };
        return { success: true, data: normalized };
    }
    async create(dto) {
        const deal = await this.prisma.deal.create({
            data: {
                title: dto.title,
                description: dto.description,
                value: (dto.value ?? 0),
                currency: dto.currency ?? 'USD',
                status: dto.status ?? 'DRAFT',
                probability: dto.probability ?? 0,
                expectedCloseDate: dto.expectedCloseDate
                    ? new Date(dto.expectedCloseDate)
                    : null,
                assignedTo: dto.assignedTo ?? null,
                contactId: dto.contactId ?? null,
                leadId: dto.leadId ?? null,
                companyId: dto.companyId ?? null,
            },
        });
        return {
            success: true,
            message: 'Deal created successfully',
            data: { deal },
        };
    }
    async update(id, dto) {
        const deal = await this.prisma.deal.update({
            where: { id },
            data: {
                title: dto.title,
                description: dto.description,
                value: dto.value,
                currency: dto.currency,
                status: dto.status,
                probability: dto.probability,
                expectedCloseDate: dto.expectedCloseDate
                    ? new Date(dto.expectedCloseDate)
                    : undefined,
                assignedTo: dto.assignedTo ?? undefined,
                contactId: dto.contactId ?? undefined,
                leadId: dto.leadId ?? undefined,
                companyId: dto.companyId ?? undefined,
                updatedAt: new Date(),
            },
        });
        return {
            success: true,
            message: 'Deal updated successfully',
            data: { deal },
        };
    }
    async remove(id) {
        await this.prisma.deal.delete({ where: { id } });
        return { success: true, message: 'Deal deleted successfully' };
    }
};
exports.DealsService = DealsService;
exports.DealsService = DealsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DealsService);
//# sourceMappingURL=deals.service.js.map