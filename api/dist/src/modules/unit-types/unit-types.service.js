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
        return this.prisma.unitType.create({
            data: createUnitTypeDto,
        });
    }
    async findAll() {
        return this.prisma.unitType.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const unitType = await this.prisma.unitType.findUnique({
            where: { id },
        });
        if (!unitType) {
            throw new common_1.NotFoundException('Unit type not found');
        }
        return unitType;
    }
    async update(id, updateUnitTypeDto) {
        await this.findOne(id);
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
        return this.prisma.unitType.update({
            where: { id },
            data: updateUnitTypeDto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        const productsUsingUnitType = await this.prisma.product.findFirst({
            where: { unit: { equals: id.toString() } },
        });
        if (productsUsingUnitType) {
            throw new common_1.ConflictException('Cannot delete unit type as it is being used by products');
        }
        return this.prisma.unitType.delete({
            where: { id },
        });
    }
    async toggleActive(id) {
        const unitType = await this.findOne(id);
        return this.prisma.unitType.update({
            where: { id },
            data: { isActive: !unitType.isActive },
        });
    }
};
exports.UnitTypesService = UnitTypesService;
exports.UnitTypesService = UnitTypesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UnitTypesService);
//# sourceMappingURL=unit-types.service.js.map