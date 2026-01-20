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
exports.ProposalTemplatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let ProposalTemplatesService = class ProposalTemplatesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list({ page = 1, limit = 10, search, }) {
        const where = {};
        if (search && search.trim()) {
            const q = search.trim();
            where.OR = [
                { name: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.proposalTemplate.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.proposalTemplate.count({ where }),
        ]);
        return { success: true, data: { items, total, page, limit } };
    }
    async getById(id) {
        const item = await this.prisma.proposalTemplate.findUnique({
            where: { id },
        });
        if (!item)
            return { success: false, message: 'Template not found' };
        return { success: true, data: { template: item } };
    }
    async create(dto) {
        const item = await this.prisma.proposalTemplate.create({
            data: {
                name: dto.name,
                description: dto.description ?? null,
                content: dto.content,
                isActive: dto.isActive ?? true,
                isDefault: dto.isDefault ?? false,
                headerHtml: dto.headerHtml ?? null,
                footerHtml: dto.footerHtml ?? null,
                styles: dto.styles ?? undefined,
                variables: dto.variables ?? undefined,
                previewImage: dto.previewImage ?? null,
                category: dto.category ?? undefined,
            },
        });
        return { success: true, data: { template: item } };
    }
    async update(id, dto) {
        const item = await this.prisma.proposalTemplate.update({
            where: { id },
            data: {
                name: dto.name,
                description: dto.description,
                content: dto.content,
                isActive: dto.isActive,
                isDefault: dto.isDefault,
                headerHtml: dto.headerHtml,
                footerHtml: dto.footerHtml,
                styles: dto.styles,
                variables: dto.variables,
                previewImage: dto.previewImage,
                category: dto.category,
                updatedAt: new Date(),
            },
        });
        return { success: true, data: { template: item } };
    }
    async remove(id) {
        await this.prisma.proposalTemplate.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return { success: true };
    }
};
exports.ProposalTemplatesService = ProposalTemplatesService;
exports.ProposalTemplatesService = ProposalTemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProposalTemplatesService);
//# sourceMappingURL=proposal-templates.service.js.map