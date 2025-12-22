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
exports.LeadSourcesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let LeadSourcesService = class LeadSourcesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateUniqueColor() {
        return ('#' +
            Math.floor(Math.random() * 16777215)
                .toString(16)
                .padStart(6, '0'));
    }
    async list() {
        const items = await this.prisma.leadSource.findMany({
            where: { isActive: true },
            orderBy: [
                { sortOrder: 'asc' },
                { createdAt: 'asc' },
            ],
        });
        return { success: true, data: items };
    }
    async create(dto) {
        const maxOrder = await this.prisma.leadSource.aggregate({
            _max: { sortOrder: true },
        });
        const nextOrder = (maxOrder._max.sortOrder ?? 0) + 1;
        let color = dto.color;
        if (!color) {
            let isUnique = false;
            while (!isUnique) {
                color = this.generateUniqueColor();
                const exists = await this.prisma.leadSource.findUnique({
                    where: { color },
                });
                if (!exists)
                    isUnique = true;
            }
        }
        const ls = await this.prisma.leadSource.create({
            data: {
                name: dto.name,
                description: dto.description ?? null,
                color: color,
                sortOrder: dto.sortOrder ?? nextOrder,
                isActive: dto.isActive ?? true,
            },
        });
        return { success: true, data: ls };
    }
    async update(id, dto) {
        const data = {
            name: dto.name,
            description: dto.description ?? null,
        };
        if (dto.color !== undefined)
            data.color = dto.color;
        if (dto.sortOrder !== undefined)
            data.sortOrder = dto.sortOrder;
        if (dto.isActive !== undefined)
            data.isActive = dto.isActive;
        try {
            const ls = await this.prisma.leadSource.update({
                where: { id },
                data,
            });
            return { success: true, data: ls };
        }
        catch (error) {
            if (error.code === 'P2002') {
                const field = error.meta?.target?.[0];
                throw new common_1.BadRequestException(`${field} must be unique`);
                if (field === 'color') {
                    return { success: false, message: 'Color must be unique. This color is already used.' };
                }
                if (field === 'name') {
                    return { success: false, message: 'Name must be unique. This name already exists.' };
                }
            }
            throw error;
        }
    }
    async remove(id) {
        await this.prisma.leadSource.delete({ where: { id } });
        return { success: true };
    }
};
exports.LeadSourcesService = LeadSourcesService;
exports.LeadSourcesService = LeadSourcesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeadSourcesService);
//# sourceMappingURL=lead-sources.service.js.map