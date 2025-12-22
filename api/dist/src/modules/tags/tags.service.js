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
exports.TagsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let TagsService = class TagsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    predefinedColors = [
        '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
        '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#6366F1',
        '#64748B', '#374151', '#7C2D12', '#B91C1C', '#365314'
    ];
    async generateUniqueColor() {
        const existing = await this.prisma.tag.findMany({
            select: { color: true }
        });
        const used = existing.map((x) => x.color);
        const available = this.predefinedColors.filter((c) => !used.includes(c));
        if (available.length > 0) {
            return available[Math.floor(Math.random() * available.length)];
        }
        let color = '';
        do {
            color = '#' + Math.floor(Math.random() * 16777215)
                .toString(16)
                .padStart(6, '0');
        } while (used.includes(color));
        return color;
    }
    async list() {
        const items = await this.prisma.tag.findMany({
            orderBy: { createdAt: 'asc' },
        });
        return { success: true, data: items };
    }
    async create(dto) {
        const finalColor = dto.color || await this.generateUniqueColor();
        const exists = await this.prisma.tag.findFirst({
            where: { color: finalColor }
        });
        if (exists) {
            throw new common_1.BadRequestException('Color must be unique.');
        }
        const tag = await this.prisma.tag.create({
            data: {
                name: dto.name,
                color: finalColor,
                description: dto.description ?? null,
                isActive: dto.isActive ?? true,
            },
        });
        return { success: true, data: tag };
    }
    async update(id, dto) {
        if (dto.color) {
            const exists = await this.prisma.tag.findFirst({
                where: { color: dto.color, NOT: { id } }
            });
            if (exists) {
                throw new common_1.BadRequestException('Color must be unique.');
            }
        }
        const updateData = {
            name: dto.name,
        };
        if (dto.color !== undefined)
            updateData.color = dto.color;
        if (dto.description !== undefined)
            updateData.description = dto.description ?? null;
        if (dto.isActive !== undefined)
            updateData.isActive = dto.isActive;
        const tag = await this.prisma.tag.update({
            where: { id },
            data: updateData,
        });
        return { success: true, data: tag };
    }
    async remove(id) {
        await this.prisma.tag.delete({ where: { id } });
        return { success: true };
    }
};
exports.TagsService = TagsService;
exports.TagsService = TagsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TagsService);
//# sourceMappingURL=tags.service.js.map