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
    async list() {
        const items = await this.prisma.tag.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'asc' },
        });
        return { success: true, data: items };
    }
    async create(dto) {
        const tag = await this.prisma.tag.create({
            data: {
                name: dto.name,
                color: dto.color ?? '#3B82F6',
                description: dto.description ?? null,
                isActive: dto.isActive !== undefined ? dto.isActive : true,
            },
        });
        return { success: true, data: tag };
    }
    async update(id, dto) {
        const updateData = {
            name: dto.name,
        };
        if (dto.color !== undefined) {
            updateData.color = dto.color;
        }
        if (dto.description !== undefined) {
            updateData.description = dto.description ?? null;
        }
        if (dto.isActive !== undefined) {
            updateData.isActive = dto.isActive;
        }
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