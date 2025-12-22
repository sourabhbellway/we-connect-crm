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
exports.CurrenciesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let CurrenciesService = class CurrenciesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createCurrencyDto) {
        if (createCurrencyDto.isDefault) {
            return this.prisma.$transaction(async (tx) => {
                await tx.currency.updateMany({
                    where: { isDefault: true },
                    data: { isDefault: false },
                });
                return tx.currency.create({
                    data: createCurrencyDto,
                });
            });
        }
        return this.prisma.currency.create({
            data: createCurrencyDto,
        });
    }
    findAll() {
        return this.prisma.currency.findMany({
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
    }
    findOne(id) {
        return this.prisma.currency.findUnique({
            where: { id },
        });
    }
    async update(id, updateCurrencyDto) {
        if (updateCurrencyDto.isDefault) {
            return this.prisma.$transaction(async (tx) => {
                await tx.currency.updateMany({
                    where: { isDefault: true, id: { not: id } },
                    data: { isDefault: false },
                });
                return tx.currency.update({
                    where: { id },
                    data: updateCurrencyDto,
                });
            });
        }
        return this.prisma.currency.update({
            where: { id },
            data: updateCurrencyDto,
        });
    }
    remove(id) {
        return this.prisma.currency.delete({
            where: { id },
        });
    }
};
exports.CurrenciesService = CurrenciesService;
exports.CurrenciesService = CurrenciesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CurrenciesService);
//# sourceMappingURL=currencies.service.js.map