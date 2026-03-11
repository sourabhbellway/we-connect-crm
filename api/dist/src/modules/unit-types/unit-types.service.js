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
exports.UnitTypesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let UnitTypesService = class UnitTypesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUnitTypeDto) {
        const existing = await this.prisma.unitType.findFirst({
            where: { name: createUnitTypeDto.name },
        });
        if (existing) {
            throw new common_1.ConflictException('Unit type with this name already exists');
        }
        const unitType = await this.prisma.unitType.create({
            data: createUnitTypeDto,
        });
        return {
            success: true,
            message: 'Unit type created successfully',
            data: { unitType },
        };
    }
    async findAll() {
        const unitTypes = await this.prisma.unitType.findMany({
            orderBy: { name: 'asc' },
        });
        return {
            success: true,
            message: 'Unit types retrieved successfully',
            data: unitTypes,
        };
    }
    async findOne(id) {
        const unitType = await this.prisma.unitType.findUnique({
            where: { id },
        });
        if (!unitType) {
            throw new common_1.NotFoundException('Unit type not found');
        }
        return {
            success: true,
            message: 'Unit type retrieved successfully',
            data: { unitType },
        };
    }
    async getUnitTypeOrThrow(id) {
        const unitType = await this.prisma.unitType.findUnique({
            where: { id },
        });
        if (!unitType) {
            throw new common_1.NotFoundException('Unit type not found');
        }
        return unitType;
    }
    async update(id, updateUnitTypeDto) {
        await this.getUnitTypeOrThrow(id);
        if (updateUnitTypeDto.name) {
            const existing = await this.prisma.unitType.findFirst({
                where: {
                    name: updateUnitTypeDto.name,
                    id: { not: id },
                },
            });
            if (existing) {
                throw new common_1.ConflictException('Unit type with this name already exists');
            }
        }
        const updatedUnitType = await this.prisma.unitType.update({
            where: { id },
            data: updateUnitTypeDto,
        });
        return {
            success: true,
            message: 'Unit type updated successfully',
            data: { unitType: updatedUnitType },
        };
    }
    async remove(id) {
        await this.getUnitTypeOrThrow(id);
        const productsUsingUnitType = await this.prisma.product.findFirst({
            where: { unit: { equals: id.toString() } },
        });
        if (productsUsingUnitType) {
            throw new common_1.ConflictException('Cannot delete unit type as it is being used by products');
        }
        await this.prisma.unitType.delete({
            where: { id },
        });
        return {
            success: true,
            message: 'Unit type deleted successfully',
        };
    }
    async toggleActive(id) {
        const unitType = await this.getUnitTypeOrThrow(id);
        const updatedUnitType = await this.prisma.unitType.update({
            where: { id },
            data: { isActive: !unitType.isActive },
        });
        return {
            success: true,
            message: 'Unit type status updated successfully',
            data: { unitType: updatedUnitType },
        };
    }
};
exports.UnitTypesService = UnitTypesService;
exports.UnitTypesService = UnitTypesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UnitTypesService);
//# sourceMappingURL=unit-types.service.js.map