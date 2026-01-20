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
exports.IndustriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let IndustriesService = class IndustriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list() {
        const industries = await this.prisma.industry.findMany({
            include: { fields: true },
            orderBy: { name: 'asc' },
        });
        return { success: true, data: { industries } };
    }
    async create(dto) {
        const industry = await this.prisma.industry.create({
            data: {
                name: dto.name,
                slug: dto.slug || dto.name.toLowerCase().replace(/\s+/g, '-'),
                isActive: dto.isActive !== undefined ? dto.isActive : true,
            },
        });
        return { success: true, data: { industry } };
    }
    async update(id, dto) {
        const updateData = { name: dto.name };
        if (dto.slug !== undefined) {
            updateData.slug = dto.slug;
        }
        if (dto.isActive !== undefined) {
            updateData.isActive = dto.isActive;
        }
        const industry = await this.prisma.industry.update({
            where: { id },
            data: updateData,
        });
        return { success: true, data: { industry } };
    }
    async remove(id) {
        await this.prisma.industry.delete({ where: { id } });
        return { success: true };
    }
    async addField(industryId, dto) {
        const field = await this.prisma.industryField.create({
            data: {
                industryId,
                name: dto.name,
                key: dto.key || dto.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                type: dto.type || 'TEXT',
                isRequired: !!dto.isRequired,
            },
        });
        return { success: true, data: { field } };
    }
    async updateField(fieldId, dto) {
        const field = await this.prisma.industryField.update({
            where: { id: fieldId },
            data: {
                name: dto.name,
                key: dto.key,
                type: dto.type,
                isRequired: !!dto.isRequired,
                isActive: dto.isActive ?? undefined,
            },
        });
        return { success: true, data: { field } };
    }
    async removeField(fieldId) {
        await this.prisma.industryField.delete({ where: { id: fieldId } });
        return { success: true };
    }
};
exports.IndustriesService = IndustriesService;
exports.IndustriesService = IndustriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IndustriesService);
//# sourceMappingURL=industries.service.js.map